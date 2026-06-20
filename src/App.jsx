import React from 'react'
import { useState, useEffect, useRef } from 'react'
import { useDebounce } from 'react-use'
import Search from './components/Search'
import Spinner from './components/Spinner';
import MovieCard from './components/MovieCard';
import MovieModal from './components/MovieModal';
import { getTrendingMovies, updateSearchCount, getCurrentUserProfile, logoutUser, getUserMovies, toggleUserMovie } from './appwrite';
import AuthModal from './components/AuthModal';
import ProfileModal from './components/ProfileModal';
import ResetPasswordModal from './components/ResetPasswordModal';

const API_BASE_URL = 'https://api.themoviedb.org/3';

const APIK_KEY = import.meta.env.VITE_TMDB_API_KEY;

const API_OPTIONS = {
  method: 'GET',
  headers: {
    accept: 'application/json',
    Authorization: `Bearer ${APIK_KEY}`,
  }
}

const GENRES = [
  { id: '', name: 'All' },
  { id: 28, name: 'Action' },
  { id: 12, name: 'Adventure' },
  { id: 16, name: 'Animation' },
  { id: 35, name: 'Comedy' },
  { id: 80, name: 'Crime' },
  { id: 18, name: 'Drama' },
  { id: 10751, name: 'Family' },
  { id: 14, name: 'Fantasy' },
  { id: 36, name: 'History' },
  { id: 27, name: 'Horror' },
  { id: 10402, name: 'Music' },
  { id: 9648, name: 'Mystery' },
  { id: 10749, name: 'Romance' },
  { id: 878, name: 'Sci-Fi' },
  { id: 10770, name: 'TV Movie' },
  { id: 53, name: 'Thriller' },
  { id: 10752, name: 'War' },
  { id: 37, name: 'Western' }
];

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [movieList, setMovieList] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedMovie, setSelectedMovie] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedGenre, setSelectedGenre] = useState('');

  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [initialProfileTab, setInitialProfileTab] = useState('settings');
  const [userMovies, setUserMovies] = useState([]); // Holds the user's tracked movies

  const [isNavVisible, setIsNavVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const [recoveryData, setRecoveryData] = useState(null);


  useEffect(() => {
    const checkUser = async () => {
      const user = await getCurrentUserProfile();
      if (user) {
        setCurrentUser(user);
        // Fetch their tracked movies and save to state
        const movies = await getUserMovies(user.$id);
        setUserMovies(movies || []);
      }
    };
    checkUser();
  }, []);

  const scrollContainerRef = useRef(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(true);

  const trendingScrollRef = useRef(null);
  const [showTrendingLeft, setShowTrendingLeft] = useState(false);
  const [showTrendingRight, setShowTrendingRight] = useState(true);

  const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const handleTrendingScroll = () => {
    if (trendingScrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = trendingScrollRef.current;
      setShowTrendingLeft(scrollLeft > 0);
      setShowTrendingRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    setCurrentUser(null);
    setIsDropdownOpen(false);
  };

  const handleToggleMovie = async (movie, toggleType, value = null) => {
    if (!currentUser) {
      setIsAuthModalOpen(true); // Prompt them to log in if they try to save without an account
      return;
    }
    try {
      await toggleUserMovie(currentUser.$id, movie, toggleType, value);
      // Refresh the list immediately so the UI updates
      const updatedMovies = await getUserMovies(currentUser.$id);
      setUserMovies(updatedMovies || []);
    } catch (error) {
      console.error("Failed to update movie status:", error);
    }
  };

  useEffect(() => {
    const onResize = () => {
      handleScroll();
      handleTrendingScroll();
    };
    handleScroll();
    handleTrendingScroll();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Check for Password Recovery URL parameters
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const userId = urlParams.get('userId');
    const secret = urlParams.get('secret');

    if (userId && secret) {
      setRecoveryData({ userId, secret });
      // Clean the URL so it looks normal again
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollTrending = (direction) => {
    if (trendingScrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      trendingScrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    handleTrendingScroll();
  }, [trendingMovies]);

  // --- NAVBAR SCROLL LOGIC ---
  useEffect(() => {
    const handleWindowScroll = () => {
      const currentScrollY = window.scrollY;
      
      // If scrolling down AND past the 100px mark, hide it. Otherwise, show it.
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsNavVisible(false);
      } else {
        setIsNavVisible(true);
      }
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleWindowScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleWindowScroll);
  }, [lastScrollY]);

  useDebounce(() => {
    setDebouncedSearchTerm(searchTerm);
    if (searchTerm !== '') {
      setSelectedGenre(''); // Reset genre tab to "All" if user starts searching
    }
  }, 500, [searchTerm]);

  const fetchMovies = async (query = '', pageNum = 1, genreId = '') => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      // 1. Get today's exact date in YYYY-MM-DD format so TMDB knows what "today" is
      const today = new Date().toISOString().split('T')[0];

      // 2. Update the endpoint to use our new sorting and filtering rules
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=${pageNum}`
        : `${API_BASE_URL}/discover/movie?sort_by=primary_release_date.desc&primary_release_date.lte=${today}&vote_count.gte=50&page=${pageNum}${genreId ? `&with_genres=${genreId}` : ''}`;

      const response = await fetch(endpoint, API_OPTIONS);

      if (!response.ok) {
        throw new Error(`Failed to fetch movies`);
      }

      const data = await response.json();

      if (data.Response === 'False') {
        setErrorMessage(data.Error || 'Failed to fetch movies');
        setMovieList([]);
        return;
      }

      // if (pageNum === 1) {
      //   setMovieList(data.results || []);
      // } else {
      //   setMovieList((prev) => [...prev, ...(data.results || [])]);
      // }
      setMovieList(data.results || []);
      
      setTotalPages(data.total_pages || 1);

      if (query && data.results.length > 0 && pageNum === 1){
        await updateSearchCount(query, data.results[0]);
      }

    } catch (error){
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage(`Failed to load movies. Please try again later.`);
    } finally {
      setIsLoading(false);
    }
  }

  const loadTrendingMovies = async () => {
    try{
      const movies = await getTrendingMovies();
      setTrendingMovies(movies);

    } catch (error){
      console.error(`Error fetching trending movies: ${error}`);
      setErrorMessage(`Failed to load trending movies. Please try again later.`);
    }
  }

  useEffect(() => {
    setPage(1);
    fetchMovies(debouncedSearchTerm, 1, selectedGenre);
  }, [debouncedSearchTerm, selectedGenre]);

  const handleTabClick = (genreId) => {
    setSelectedGenre(genreId);
    if (searchTerm) {
      setSearchTerm('');
      setDebouncedSearchTerm(''); // Clear debounce immediately to prevent flashing old search results
    }
  };

  // const loadMore = () => {
  //   if (page < totalPages) {
  //     const nextPage = page + 1;
  //     setPage(nextPage);
  //     fetchMovies(debouncedSearchTerm, nextPage, selectedGenre);
  //   }
  // };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
      fetchMovies(debouncedSearchTerm, newPage, selectedGenre);
      // Instantly scroll the user back to the top of the movies section!
      document.querySelector('.all-movies')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    if (totalPages <= 5) {
      // If 5 or fewer pages, just show them all
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      // If we are near the beginning
      if (page <= 3) {
        pages.push(1, 2, 3, 4, '...', totalPages);
      } 
      // If we are near the end
      else if (page >= totalPages - 2) {
        pages.push(1, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } 
      // If we are somewhere in the middle
      else {
        pages.push(1, '...', page - 1, page, page + 1, '...', totalPages);
      }
    }
    return pages;
  };

  useEffect(() => {
    loadTrendingMovies();
  }, []);

console.log(trendingMovies);

  return (
    <main>
      <div className="pattern" />

      {/* --- NEW FLOATING NAVBAR --- */}
      <nav 
        className={`fixed top-0 left-0 w-full z-50 pb-6 transition-transform duration-300 ${
          isNavVisible ? 'translate-y-0' : '-translate-y-full'
        }`}
      >
        {/* The progressive blur background layer we made in CSS */}
        <div className="progressive-nav"></div>

        {/* Navbar Content: Logo Left, Links & Profile Right */}
        <div className="max-w-7xl mx-auto px-5 sm:px-10 pt-4 sm:pt-6 flex justify-between items-center relative z-10">
          
          <img 
            src="./logo.png" 
            alt="logo" 
            className="h-[30px] sm:h-[40px] object-contain cursor-pointer drop-shadow-md hover:scale-105 transition-transform" 
            onClick={() => window.scrollTo({top: 0, behavior: 'smooth'})}
          />

          {/* Right Side Container: Nav Links + Profile Button */}
          <div className="flex items-center gap-4 sm:gap-8">
            
            {/* DESKTOP NAV LINKS (Hidden on Mobile) */}
            {currentUser && (
              <div className="hidden sm:flex items-center gap-6 text-sm font-semibold">
                <button 
                  onClick={() => { setInitialProfileTab('saved'); setIsProfileModalOpen(true); }}
                  className="text-gray-300 text-sm font-normal cursor-pointer hover:text-white transition-colors"
                >
                  My List
                </button>
                <button 
                  onClick={() => { setInitialProfileTab('watched'); setIsProfileModalOpen(true); }}
                  className="text-gray-300 text-sm font-normal cursor-pointer hover:text-white transition-colors"
                >
                  Watched
                </button>
              </div>
            )}

            {/* User Profile / Login Button */}
            <div>
              {currentUser ? (
                <div className="relative">
                  <button 
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="flex items-center gap-2 sm:gap-3 hover:opacity-80 transition-opacity bg-[#0f0d23]/80 backdrop-blur-sm border border-gray-800 rounded-full pl-3 sm:pl-2 pr-3 sm:pr-4 py-1"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400 block sm:hidden" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M10 6a2 2 0 110-4 2 2 0 010 4zM10 12a2 2 0 110-4 2 2 0 010 4zM10 18a2 2 0 110-4 2 2 0 010 4z" />
                    </svg>
                    <img 
                      src={currentUser.profile?.avatar_url || '/no-movie.png'} 
                      alt="Profile" 
                      className="w-8 h-8 rounded-full object-cover border border-[#de23ff]"
                    />
                    <span className="text-sm font-semibold text-white hidden sm:block">
                      {currentUser.profile?.display_name || currentUser.name || 'My Profile'}
                    </span>
                  </button>

                  {/* Dropdown Menu */}
                  <div 
                    className={`absolute right-0 mt-2 w-48 bg-[#0f0d23] border border-gray-800 rounded-xl shadow-2xl py-2 flex flex-col overflow-hidden z-50 origin-top-right transition-all duration-200 ease-out ${
                      isDropdownOpen 
                        ? 'opacity-100 scale-100 visible pointer-events-auto' 
                        : 'opacity-0 scale-95 invisible pointer-events-none'
                    }`}
                  >
                    <button 
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setInitialProfileTab('settings');
                        setIsProfileModalOpen(true);
                      }}
                      className="text-left px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                    >
                      Account Settings
                    </button>

                    {/* MOBILE ONLY NAV LINKS (Hidden on Desktop) */}
                    <button 
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setInitialProfileTab('saved');
                        setIsProfileModalOpen(true);
                      }}
                      className="block sm:hidden text-left px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                    >
                      My List
                    </button>
                    <button 
                      onClick={() => {
                        setIsDropdownOpen(false);
                        setInitialProfileTab('watched');
                        setIsProfileModalOpen(true);
                      }}
                      className="block sm:hidden text-left px-4 py-3 text-sm text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
                    >
                      Watched Movies
                    </button>

                    <div className="h-px w-full bg-gray-800 my-1"></div>
                    <button 
                      onClick={handleLogout}
                      className="text-left px-4 py-3 text-sm text-red-400 hover:bg-gray-800 hover:text-red-300 transition-colors"
                    >
                      Log Out
                    </button>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={() => setIsAuthModalOpen(true)}
                  className="bg-[#0f0d23]/80 backdrop-blur-sm border border-[#de23ff] text-[#cecefb] hover:bg-[#de23ff] hover:text-white font-semibold py-2 px-6 rounded-full transition-colors text-sm shadow-[0_0_15px_rgba(222,35,255,0.2)] hover:shadow-[0_0_20px_rgba(222,35,255,0.4)]"
                >
                  Sign In
                </button>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* --- RESTRUCTURED WRAPPER --- */}
      <div className="wrapper pt-24 sm:pt-32">
        
        {/* The Hero Content Area */}
        <header className="flex flex-col items-center gap-0">
          <img src="./hero.png" alt="hero visual" className="heroImg" />
          <h1>
            Find <span className="text-gradient">Movies</span> You'll Love!
          </h1>
          <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        <div className="search-results-wrapper">
          {searchTerm ? <span className="search-results-span">Search results for: </span> : null}
          <h4 className="text-white">{searchTerm}</h4>
        </div>

        {trendingMovies.length > 0 && (
          <section className="trending">
            <h2 className="relative z-20">Trending Movies</h2>

            <div className="relative mb-6">
              {/* Left Fade Gradient & Arrow */}
              {showTrendingLeft && (
                <div className="absolute top-0 left-0 bottom-0 w-24 bg-gradient-to-r from-[#030014] to-transparent pointer-events-none flex items-center justify-start z-10">
                  <button onClick={() => scrollTrending('left')} className="pointer-events-auto outline-none h-full px-2 sm:px-4 flex items-center justify-center" aria-label="Scroll left">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                </div>
              )}

              <ul 
                ref={trendingScrollRef}
                onScroll={handleTrendingScroll}
                className="overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
              >
                {trendingMovies.map((movie, index) => {
                  return(
                    <li key={movie.$id} onClick={() => setSelectedMovie(movie)} className="cursor-pointer">
                      <p>{index + 1}</p>
                      <img src={movie.poster_url} alt={movie.searchTerm} />
                    </li>
                  )
                })}
              </ul>

              {/* Right Fade Gradient & Arrow */}
              {showTrendingRight && (
                <div className="absolute top-0 right-0 bottom-0 w-24 bg-gradient-to-r from-transparent to-[#030014] pointer-events-none flex items-center justify-end z-10">
                  <button onClick={() => scrollTrending('right')} className="pointer-events-auto outline-none h-full px-2 sm:px-4 flex items-center justify-center" aria-label="Scroll right">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </div>

          </section>
        )}

        <section className="all-movies">
          <h2>All Movies</h2>

          {/* Genre Tabs */}
          <div className="relative mb-6">
            {/* Left Fade Gradient & Arrow */}
            {showLeftArrow && (
              <div className="absolute top-0 left-0 bottom-4 w-24 bg-gradient-to-r from-[#030014] to-transparent pointer-events-none flex items-center justify-start z-10">
                <button onClick={() => scroll('left')} className="pointer-events-auto outline-none h-full px-2 sm:px-4 flex items-center justify-center" aria-label="Scroll left">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
              </div>
            )}

            <div 
              ref={scrollContainerRef}
              onScroll={handleScroll}
              className="flex gap-4 overflow-x-auto whitespace-nowrap pb-4 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]"
            >
              {GENRES.map((genre) => (
                <button
                  key={genre.name}
                  onClick={() => handleTabClick(genre.id)}
                  className={`px-4 py-2 rounded-full font-medium text-sm transition-colors shadow-sm border border-gray-800 ${
                    selectedGenre === genre.id
                      ? 'bg-[#de23ff] text-white'
                      : 'bg-[#030014] text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  {genre.name}
                </button>
              ))}
            </div>
            
            {/* Fade Gradient & Right Arrow */}
            {showRightArrow && (
              <div className="absolute top-0 right-0 bottom-4 w-24 bg-gradient-to-r from-transparent to-[#030014] pointer-events-none flex items-center justify-end z-10">
                <button onClick={() => scroll('right')} className="pointer-events-auto outline-none h-full px-2 sm:px-4 flex items-center justify-center" aria-label="Scroll right">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400 hover:text-white transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          {isLoading && page === 1 ? (
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <>
              <ul>
                {movieList.map((movie, index) => {
                  return(
                    <MovieCard
                      key={`${movie.id}-${index}`}
                      movie={movie}
                      onClick={(m) => setSelectedMovie(m)}
                      userMovies={userMovies}
                      onToggleMovie={handleToggleMovie}
                    />
                  )
                })}
              </ul>

              {isLoading && page > 1 && (
                <div className="mt-8 flex justify-center">
                  <Spinner />
                </div>
              )}

              {/* NEW PAGINATION BAR */}
              {!isLoading && totalPages > 1 && (
                <div className="mt-12 flex flex-wrap justify-center items-center gap-2 sm:gap-3">
                  {/* Previous Button (Circular) */}
                  <button
                    disabled={page === 1}
                    onClick={() => handlePageChange(page - 1)}
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-transparent border border-gray-600 text-gray-300 hover:text-white hover:border-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Previous Page"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>

                  {/* Dynamic Page Numbers (Circular & Ellipsis) */}
                  <div className="flex gap-1 sm:gap-2 items-center">
                    {getPageNumbers().map((num, index) => (
                      num === '...' ? (
                        <span key={`ellipsis-${index}`} className="w-8 h-10 sm:w-10 flex items-center justify-center text-gray-400 font-medium">
                          ...
                        </span>
                      ) : (
                        <button
                          key={num}
                          onClick={() => handlePageChange(num)}
                          className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center font-medium transition-colors ${
                            page === num
                              ? 'bg-[#de23ff] text-white shadow-lg shadow-[#de23ff]/30 border border-[#de23ff]'
                              : 'bg-transparent border border-gray-800 text-gray-400 hover:bg-gray-800 hover:text-white'
                          }`}
                        >
                          {num}
                        </button>
                      )
                    ))}
                  </div>

                  {/* Next Button (Circular) */}
                  <button
                    disabled={page === totalPages}
                    onClick={() => handlePageChange(page + 1)}
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full flex items-center justify-center bg-transparent border border-gray-600 text-gray-300 hover:text-white hover:border-white transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                    aria-label="Next Page"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              )}
            </>
          )}
        </section>

        <p>{errorMessage}</p>

      </div>

      {selectedMovie && (
        <MovieModal 
          movie={selectedMovie} 
          onClose={() => setSelectedMovie(null)} 
          onMovieSelect={(movie) => setSelectedMovie(movie)} 
          onGenreSelect={(genreId) => {
            handleTabClick(genreId);
            setSelectedMovie(null);
            document.querySelector('.all-movies')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }}
          userMovies={userMovies}                 
          onToggleMovie={handleToggleMovie}        
        />
      )}

      {/* --- NEW MODALS --- */}
      {isAuthModalOpen && (
        <AuthModal 
          onClose={() => setIsAuthModalOpen(false)} 
          onLoginSuccess={async () => {
            const user = await getCurrentUserProfile();
            setCurrentUser(user);
          }}
        />
      )}

      {/* Profile Modal */}
      {isProfileModalOpen && currentUser && (
        <ProfileModal 
          currentUser={currentUser}
          userMovies={userMovies}
          onClose={() => setIsProfileModalOpen(false)}
          onToggleMovie={handleToggleMovie}
          onMovieSelect={(movie) => {
            setSelectedMovie(movie);
            setIsProfileModalOpen(false);
          }}
          onProfileUpdate={async () => {
            const updatedUser = await getCurrentUserProfile();
            setCurrentUser(updatedUser);
          }}
          initialTab={initialProfileTab} /* NEW PROP ADDED HERE */
        />
      )}

      {/* Password Recovery Modal */}
      {recoveryData && (
        <ResetPasswordModal 
          userId={recoveryData.userId} 
          secret={recoveryData.secret} 
          onClose={() => {
            setRecoveryData(null);
            setIsAuthModalOpen(true); // Pop open the login window for them
          }} 
        />
      )}

    </main>
  )
}

export default App
