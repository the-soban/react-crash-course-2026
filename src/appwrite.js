import { Client, Databases, ID, Query, Account, Storage, OAuthProvider } from "appwrite";

const PROJECT_ID = import.meta.env.VITE_APPWRITE_PROJECT_ID;
const DATABASE_ID = import.meta.env.VITE_APPWRITE_DATABASE_ID;
const COLLECTION_ID = import.meta.env.VITE_APPWRITE_COLLECTION_ID; // Trending collection
const PROFILES_COLLECTION_ID = import.meta.env.VITE_APPWRITE_PROFILES_COLLECTION_ID;
const USERMOVIES_COLLECTION_ID = import.meta.env.VITE_APPWRITE_USERMOVIES_COLLECTION_ID;
const AVATARS_BUCKET_ID = import.meta.env.VITE_APPWRITE_AVATARS_BUCKET_ID;

const client = new Client()
    .setEndpoint(import.meta.env.VITE_APPWRITE_ENDPOINT)
    .setProject(PROJECT_ID);

const database = new Databases(client);
export const account = new Account(client);
export const storage = new Storage(client);

// ==========================================
// 1. AUTHENTICATION & PROFILES
// ==========================================

export const loginWithGoogle = () => {
    // This will redirect to Google, then back to your app
    account.createOAuth2Session(OAuthProvider.Google, window.location.origin, window.location.origin);
}

export const registerUser = async (email, password, displayName, avatarFile = null) => {
    try {
        // 1. Create the auth account
        const userAccount = await account.create(ID.unique(), email, password, displayName);
        
        // 2. LOG THEM IN IMMEDIATELY (This fixes the permission error!)
        await account.createEmailPasswordSession(email, password);
        
        let avatarUrl = '/default-avatar.png'; // Make sure you have a default-avatar.png in your public folder
        
        // 3. Upload custom avatar if provided (Now they have permission to do this)
        if (avatarFile) {
            const uploadedFile = await storage.createFile(AVATARS_BUCKET_ID, ID.unique(), avatarFile);
            avatarUrl = storage.getFileView(AVATARS_BUCKET_ID, uploadedFile.$id).toString();
        }

        // 4. Create the Profile document to store the extra info (Now they have permission to do this)
        await database.createDocument(DATABASE_ID, PROFILES_COLLECTION_ID, ID.unique(), {
            user_id: userAccount.$id,
            display_name: displayName,
            avatar_url: avatarUrl
        });

        return userAccount;
    } catch (error) {
        console.error("Registration error:", error);
        throw error;
    }
}

export const loginWithEmail = async (email, password) => {
    try {
        return await account.createEmailPasswordSession(email, password);
    } catch (error) {
        console.error("Login error:", error);
        throw error;
    }
}

export const logoutUser = async () => {
    try {
        return await account.deleteSession('current');
    } catch (error) {
        console.error("Logout error:", error);
    }
}

export const getCurrentUserProfile = async () => {
    try {
        // Get the currently logged-in auth user
        const currentAccount = await account.get();
        
        // Fetch their extended profile from the Profiles collection
        const profileDocs = await database.listDocuments(DATABASE_ID, PROFILES_COLLECTION_ID, [
            Query.equal('user_id', currentAccount.$id)
        ]);

        if (profileDocs.documents.length > 0) {
            return { ...currentAccount, profile: profileDocs.documents[0] };
        }
        return currentAccount;
    } catch (error) {
        // Not logged in, or error
        return null;
    }
}

// ==========================================
// 2. USER MOVIE TRACKING
// ==========================================

export const toggleUserMovie = async (userId, movie, toggleType, value = null) => {
    try {
        // Query if the record exists
        const existingDocs = await database.listDocuments(
            import.meta.env.VITE_APPWRITE_DATABASE_ID, 
            import.meta.env.VITE_APPWRITE_USERMOVIES_COLLECTION_ID, 
            [
                Query.equal('user_id', userId),
                Query.equal('movie_id', movie.id)
            ]
        );

        const movieDetails = JSON.stringify({
            title: movie.title,
            poster_path: movie.poster_path,
            vote_average: movie.vote_average,
            release_date: movie.release_date,
            original_language: movie.original_language,
            genre_ids: movie.genre_ids
        });

        if (existingDocs.documents.length > 0) {
            const doc = existingDocs.documents[0];
            const updatedData = { movie_details: movieDetails };
            
            if (toggleType === 'rating') {
                // If they click the same rating twice, it toggles it off (sets to null)
                updatedData.rating = doc.rating === value ? null : value;
            } else {
                // Otherwise, flip the true/false boolean for Save/Watch
                updatedData[toggleType] = !doc[toggleType]; 
            }

            return await database.updateDocument(
                import.meta.env.VITE_APPWRITE_DATABASE_ID, 
                import.meta.env.VITE_APPWRITE_USERMOVIES_COLLECTION_ID, 
                doc.$id, 
                updatedData
            );
        } else {
            // Create a completely new record
            const newData = {
                user_id: userId,
                movie_id: movie.id,
                is_saved: toggleType === 'is_saved',
                is_watched: toggleType === 'is_watched',
                rating: toggleType === 'rating' ? value : null,
                movie_details: movieDetails
            };
            return await database.createDocument(
                import.meta.env.VITE_APPWRITE_DATABASE_ID, 
                import.meta.env.VITE_APPWRITE_USERMOVIES_COLLECTION_ID, 
                ID.unique(), 
                newData
            );
        }
    } catch (error) {
        console.error("Error toggling user movie:", error);
        throw error;
    }
}

export const getUserMovies = async (userId) => {
    try {
        const result = await database.listDocuments(DATABASE_ID, USERMOVIES_COLLECTION_ID, [
            Query.equal('user_id', userId),
            Query.limit(100) // Adjust if they have massive lists
        ]);
        return result.documents;
    } catch (error) {
        console.error("Error fetching user movies:", error);
        return [];
    }
}

// ==========================================
// 3. EXISTING TRENDING LOGIC
// ==========================================

export const updateSearchCount = async (searchTerm, movie) => {
    try {
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.equal('searchTerm', searchTerm),
        ]);

        if (result.documents.length > 0) {
            const doc = result.documents[0];
            await database.updateDocument(DATABASE_ID, COLLECTION_ID, doc.$id, {
                count: doc.count + 1,
            });
        } else {
            await database.createDocument(DATABASE_ID, COLLECTION_ID, ID.unique(), {
                searchTerm,
                count: 1,
                movie_id: movie.id,
                poster_url: `https://image.tmdb.org/t/p/w500${movie.poster_path}`,
            });
        }
    } catch (error) {
        console.error(error);
    }
}

export const getTrendingMovies = async () => {
    try {
        const result = await database.listDocuments(DATABASE_ID, COLLECTION_ID, [
            Query.limit(5),
            Query.orderDesc('count'),
        ]);
        return result.documents;
    } catch (error) {
        console.error(error);
    }
}

// ==========================================
// 4. ACCOUNT MANAGEMENT
// ==========================================

export const updateUserProfile = async (userId, newName, avatarFile = null) => {
    try {
        // 1. Update the base Auth account name
        await account.updateName(newName);

        let updateData = { display_name: newName };

        // 2. Upload new avatar if provided
        if (avatarFile) {
            const uploadedFile = await storage.createFile(
                import.meta.env.VITE_APPWRITE_AVATARS_BUCKET_ID, 
                ID.unique(), 
                avatarFile
            );
            updateData.avatar_url = storage.getFileView(
                import.meta.env.VITE_APPWRITE_AVATARS_BUCKET_ID, 
                uploadedFile.$id
            ).toString();
        }

        // 3. Check if the user already has a Profile document
        const existingProfile = await database.listDocuments(
            import.meta.env.VITE_APPWRITE_DATABASE_ID, 
            import.meta.env.VITE_APPWRITE_PROFILES_COLLECTION_ID, 
            [Query.equal('user_id', userId)]
        );

        if (existingProfile.documents.length > 0) {
            // Document exists -> UPDATE IT
            return await database.updateDocument(
                import.meta.env.VITE_APPWRITE_DATABASE_ID, 
                import.meta.env.VITE_APPWRITE_PROFILES_COLLECTION_ID, 
                existingProfile.documents[0].$id, 
                updateData
            );
        } else {
            // Document doesn't exist (Google user) -> CREATE IT
            updateData.user_id = userId;
            if (!updateData.avatar_url) updateData.avatar_url = '/default-avatar.png';
            
            return await database.createDocument(
                import.meta.env.VITE_APPWRITE_DATABASE_ID, 
                import.meta.env.VITE_APPWRITE_PROFILES_COLLECTION_ID, 
                ID.unique(), 
                updateData
            );
        }
    } catch (error) {
        console.error("Error updating profile:", error);
        throw error;
    }
};

export const updateUserPassword = async (newPassword, oldPassword) => {
    try {
        return await account.updatePassword(newPassword, oldPassword);
    } catch (error) {
        console.error("Error updating password:", error);
        throw error;
    }
};