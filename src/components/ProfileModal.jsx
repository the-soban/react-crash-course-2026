import React, { useState, useRef, useEffect } from 'react';
import { updateUserProfile, updateUserPassword } from '../appwrite';
import MovieCard from './MovieCard';
import Spinner from './Spinner';

const ProfileModal = ({ currentUser, onClose, userMovies, onToggleMovie, onProfileUpdate, onMovieSelect, initialTab = 'settings' }) => {
  const [activeTab, setActiveTab] = useState(initialTab); // 'settings', 'saved', 'watched', 'liked', 'disliked'
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });

  // Settings States
  const [displayName, setDisplayName] = useState(currentUser?.profile?.display_name || currentUser?.name || '');
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(currentUser?.profile?.avatar_url || null);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const fileInputRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => document.body.style.overflow = 'unset';
  }, []);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        setMessage({ type: 'error', text: 'Image must be less than 2MB' });
        return;
      }
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await updateUserProfile(currentUser.$id, displayName, avatarFile);
      setMessage({ type: 'success', text: 'Profile updated successfully!' });
      onProfileUpdate(); 
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to update profile.' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setMessage({ type: '', text: '' });

    try {
      await updateUserPassword(newPassword, oldPassword);
      setMessage({ type: 'success', text: 'Password updated successfully!' });
      setOldPassword('');
      setNewPassword('');
    } catch (error) {
      setMessage({ type: 'error', text: error.message || 'Failed to update password.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and reconstruct movies for the lists
  const savedMovies = userMovies
    .filter(um => um.is_saved)
    .map(um => ({ id: um.movie_id, ...JSON.parse(um.movie_details) }));

  const watchedMovies = userMovies
    .filter(um => um.is_watched)
    .map(um => ({ id: um.movie_id, ...JSON.parse(um.movie_details) }));

  const likedMovies = userMovies
    .filter(um => um.rating === 'liked')
    .map(um => ({ id: um.movie_id, ...JSON.parse(um.movie_details) }));

  const dislikedMovies = userMovies
    .filter(um => um.rating === 'disliked')
    .map(um => ({ id: um.movie_id, ...JSON.parse(um.movie_details) }));

  return (
    <div 
      className="fixed inset-0 z-[100] flex justify-center items-center bg-black/80 backdrop-blur-sm p-4 sm:p-10"
      onClick={handleOverlayClick}
    >
      <div className="bg-[#0f0d23] border border-gray-800 w-full max-w-6xl rounded-2xl overflow-hidden flex flex-col md:flex-row shadow-2xl h-[85vh] animate-fade-in relative">
        
        {/* Close Button - Now with text-white explicitly set! */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-50 w-10 h-10 bg-[#181818] border border-gray-600 rounded-full flex items-center justify-center text-white hover:bg-white hover:text-black transition-colors"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Sidebar */}
        <div className="w-full md:w-64 bg-[#030014] border-b md:border-b-0 md:border-r border-gray-800 p-6 flex flex-col shrink-0">
          <div className="flex items-center gap-4 mb-8">
            <img 
              src={currentUser?.profile?.avatar_url || '/no-movie.png'} 
              alt="Profile" 
              className="w-12 h-12 rounded-full object-cover border-2 border-[#de23ff]"
            />
            <div className="overflow-hidden">
              <p className="text-white font-bold truncate">{currentUser?.profile?.display_name || currentUser?.name}</p>
              <p className="text-xs text-gray-400 truncate">{currentUser?.email}</p>
            </div>
          </div>

          {/* Navigation - custom-scrollbar added here for mobile side-scrolling */}
          <nav className="flex md:flex-col gap-2 overflow-x-auto custom-scrollbar pb-3 md:pb-0">
            <button 
              onClick={() => setActiveTab('settings')}
              className={`px-4 py-3 rounded-lg text-left whitespace-nowrap font-medium transition-colors ${activeTab === 'settings' ? 'bg-[#de23ff] text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
            >
              Account Settings
            </button>
            <button 
              onClick={() => setActiveTab('saved')}
              className={`px-4 py-3 rounded-lg text-left whitespace-nowrap font-medium transition-colors ${activeTab === 'saved' ? 'bg-[#de23ff] text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
            >
              My List ({savedMovies.length})
            </button>
            <button 
              onClick={() => setActiveTab('watched')}
              className={`px-4 py-3 rounded-lg text-left whitespace-nowrap font-medium transition-colors ${activeTab === 'watched' ? 'bg-[#de23ff] text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
            >
              Watched ({watchedMovies.length})
            </button>
            
            {/* Always Visible Sub-tabs */}
            <div className="flex md:flex-col gap-2 md:gap-1 md:ml-4 md:border-l-2 border-gray-800 md:pl-2">
              <button 
                onClick={() => setActiveTab('liked')}
                className={`px-4 md:px-3 py-3 md:py-2 rounded-lg text-left whitespace-nowrap md:text-sm font-medium transition-colors ${activeTab === 'liked' ? 'bg-green-500/20 text-green-400' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
              >
                Liked ({likedMovies.length})
              </button>
              <button 
                onClick={() => setActiveTab('disliked')}
                className={`px-4 md:px-3 py-3 md:py-2 rounded-lg text-left whitespace-nowrap md:text-sm font-medium transition-colors ${activeTab === 'disliked' ? 'bg-red-500/20 text-red-400' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}
              >
                Not for me ({dislikedMovies.length})
              </button>
            </div>
          </nav>
        </div>

        {/* Main Content Area - custom-scrollbar added here! */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 relative">
          
          {message.text && (
            <div className={`mb-6 p-4 rounded-lg text-sm border ${message.type === 'error' ? 'bg-red-500/10 border-red-500/50 text-red-500' : 'bg-green-500/10 border-green-500/50 text-green-400'}`}>
              {message.text}
            </div>
          )}

          {/* TAB: SETTINGS */}
          {activeTab === 'settings' && (
            <div className="max-w-xl animate-fade-in">
              <h2 className="text-3xl font-bold text-white mb-8">Account Settings</h2>
              
              <form onSubmit={handleUpdateProfile} className="space-y-6 mb-10 pb-10 border-b border-gray-800">
                <h3 className="text-xl font-semibold text-white">Public Profile</h3>
                
                {/* Display Name Input */}
                <div>
                  <label className="text-gray-300 text-sm mb-1 block">Display Name</label>
                  <input 
                    type="text" value={displayName} onChange={(e) => setDisplayName(e.target.value)}
                    className="w-full bg-[#cecefb]/5 border border-transparent focus:border-[#a8b5db]/30 rounded-lg px-4 py-3 text-white outline-none transition-colors"
                  />
                </div>

                {/* Avatar Selection Area */}
                <div className="pt-2">
                  <label className="text-gray-300 text-sm mb-2 block">Change Avatar</label>
                  
                  <div className="relative mb-5 flex items-center">
                    {/* Left Gradient & Arrow */}
                    <div className="absolute top-0 left-0 bottom-0 w-12 bg-gradient-to-r from-[#0f0d23] to-transparent pointer-events-none flex items-center justify-start z-10">
                      <button 
                        type="button" 
                        onClick={(e) => {
                          e.preventDefault();
                          e.currentTarget.parentElement.nextElementSibling.scrollBy({ left: -150, behavior: 'smooth' });
                        }} 
                        className="pointer-events-auto outline-none text-gray-400 hover:text-white transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                      </button>
                    </div>

                    {/* Pre-made Avatars Array (Added py-3 to stop clipping) */}
                    <div className="flex gap-3 overflow-x-auto py-3 px-1 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none] w-full">
                      {[
                        '/avatars/avatar-01.png', '/avatars/avatar-02.png', '/avatars/avatar-03.png', 
                        '/avatars/avatar-04.png', '/avatars/avatar-05.png', '/avatars/avatar-06.png',
                        '/avatars/avatar-07.png', '/avatars/avatar-08.png', '/avatars/avatar-09.png',
                        '/avatars/avatar-10.png', '/avatars/avatar-11.png', '/avatars/avatar-12.png'
                      ].map((url, idx) => (
                        <img 
                          key={idx} src={url} alt={`Avatar ${idx}`} 
                          onClick={() => {
                            setAvatarFile(null);
                            setAvatarPreview(url);
                          }}
                          className={`w-16 h-16 rounded-full object-cover cursor-pointer transition-all shrink-0 border-2 ${avatarPreview === url ? 'border-[#de23ff] scale-105 shadow-[0_0_10px_rgba(222,35,255,0.5)]' : 'border-transparent hover:border-gray-500'}`}
                        />
                      ))}
                    </div>

                    {/* Right Gradient & Arrow */}
                    <div className="absolute top-0 right-0 bottom-0 w-12 bg-gradient-to-l from-[#0f0d23] to-transparent pointer-events-none flex items-center justify-end z-10">
                      <button 
                        type="button" 
                        onClick={(e) => {
                          e.preventDefault();
                          e.currentTarget.parentElement.previousElementSibling.scrollBy({ left: 150, behavior: 'smooth' });
                        }} 
                        className="pointer-events-auto outline-none text-gray-400 hover:text-white transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div 
                      className="w-20 h-20 rounded-full border-2 border-gray-700 bg-[#030014] overflow-hidden cursor-pointer flex items-center justify-center hover:border-[#de23ff] transition-colors relative group shrink-0"
                      onClick={() => fileInputRef.current?.click()}
                    >
                      {avatarPreview ? (
                        <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-gray-500 text-sm">Upload</span>
                      )}
                      <div className="absolute inset-0 bg-black/60 hidden group-hover:flex items-center justify-center">
                        <span className="text-xs font-semibold text-white">Upload</span>
                      </div>
                    </div>
                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
                    <p className="text-sm text-gray-500">Click to upload a custom image from your device (Max 2MB).</p>
                  </div>
                </div>

                <button 
                  type="submit" disabled={isLoading}
                  className="bg-gray-800 text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center min-w-[140px]"
                >
                  {isLoading ? <Spinner /> : 'Save Profile'}
                </button>
              </form>

              <form onSubmit={handleUpdatePassword} className="space-y-6">
                <h3 className="text-xl font-semibold text-white">Change Password</h3>
                <p className="text-sm text-gray-400 mb-4">Note: If you log in via Google, you do not have a password to change.</p>
                <div>
                  <label className="text-gray-300 text-sm mb-1 block">Current Password</label>
                  <input 
                    type="password" required minLength={8}
                    value={oldPassword} onChange={(e) => setOldPassword(e.target.value)}
                    className="w-full bg-[#cecefb]/5 border border-transparent focus:border-[#a8b5db]/30 rounded-lg px-4 py-3 text-white outline-none transition-colors"
                  />
                </div>
                <div>
                  <label className="text-gray-300 text-sm mb-1 block">New Password</label>
                  <input 
                    type="password" required minLength={8}
                    value={newPassword} onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full bg-[#cecefb]/5 border border-transparent focus:border-[#a8b5db]/30 rounded-lg px-4 py-3 text-white outline-none transition-colors"
                  />
                </div>
                <button 
                  type="submit" disabled={isLoading}
                  className="bg-gray-800 text-white font-semibold py-2.5 px-6 rounded-lg hover:bg-gray-700 transition-colors flex items-center justify-center min-w-[140px]"
                >
                  {isLoading ? <Spinner /> : 'Update Password'}
                </button>
              </form>
            </div>
          )}

          {/* TAB: SAVED MOVIES */}
          {activeTab === 'saved' && (
            <div className="animate-fade-in">
              <h2 className="text-3xl font-bold text-white mb-8">My List</h2>
              {savedMovies.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {savedMovies.map(movie => (
                    <MovieCard 
                      key={movie.id} 
                      movie={movie} 
                      userMovies={userMovies} 
                      onToggleMovie={onToggleMovie} 
                      onClick={() => onMovieSelect(movie)} 
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">You haven't added any movies to your list yet.</p>
              )}
            </div>
          )}

          {/* TAB: WATCHED MOVIES */}
          {activeTab === 'watched' && (
            <div className="animate-fade-in">
              <h2 className="text-3xl font-bold text-white mb-8">Watched Movies</h2>
              {watchedMovies.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {watchedMovies.map(movie => (
                    <MovieCard 
                      key={movie.id} 
                      movie={movie} 
                      userMovies={userMovies} 
                      onToggleMovie={onToggleMovie} 
                      onClick={() => onMovieSelect(movie)} 
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">You haven't marked any movies as watched yet.</p>
              )}
            </div>
          )}

          {/* TAB: LIKED MOVIES */}
          {activeTab === 'liked' && (
            <div className="animate-fade-in">
              <h2 className="text-3xl font-bold text-white mb-8">Movies You Liked</h2>
              {likedMovies.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {likedMovies.map(movie => (
                    <MovieCard 
                      key={movie.id} 
                      movie={movie} 
                      userMovies={userMovies} 
                      onToggleMovie={onToggleMovie} 
                      onClick={() => onMovieSelect(movie)} 
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">You haven't liked any movies yet.</p>
              )}
            </div>
          )}

          {/* TAB: DISLIKED MOVIES */}
          {activeTab === 'disliked' && (
            <div className="animate-fade-in">
              <h2 className="text-3xl font-bold text-white mb-8">Not For Me</h2>
              {dislikedMovies.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                  {dislikedMovies.map(movie => (
                    <MovieCard 
                      key={movie.id} 
                      movie={movie} 
                      userMovies={userMovies} 
                      onToggleMovie={onToggleMovie} 
                      onClick={() => onMovieSelect(movie)} 
                    />
                  ))}
                </div>
              ) : (
                <p className="text-gray-400">You haven't marked any movies as disliked yet.</p>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default ProfileModal;