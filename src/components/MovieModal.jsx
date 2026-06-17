import React, { useEffect, useState } from 'react';
import Spinner from './Spinner';
import MovieCard from './MovieCard';

const MovieModal = ({ movie, onClose, onMovieSelect, onGenreSelect, userMovies = [], onToggleMovie }) => {
  const [details, setDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Check user interaction states for the action buttons
  const userRecord = userMovies?.find((um) => um.movie_id === (movie.id || movie.movie_id));
  const isSaved = userRecord?.is_saved === true;
  const isWatched = userRecord?.is_watched === true;
  const rating = userRecord?.rating; // 'liked', 'disliked', or null

  // Lock scrolling on the main page when the modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  useEffect(() => {
    const fetchDetails = async () => {
      setIsLoading(true);
      try {
        const API_KEY = import.meta.env.VITE_TMDB_API_KEY;
        const movieId = movie.id || movie.movie_id;

        if (!movieId) {
          setIsLoading(false);
          return;
        }

        const response = await fetch(
          `https://api.themoviedb.org/3/movie/${movieId}?append_to_response=credits,videos,similar`,
          {
            headers: {
              accept: 'application/json',
              Authorization: `Bearer ${API_KEY}`,
            },
          }
        );
        const data = await response.json();
        setDetails(data);
      } catch (error) {
        console.error('Error fetching movie details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (movie) {
      fetchDetails();
    }
  }, [movie]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!movie) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex justify-center bg-black/80 backdrop-blur-sm overflow-y-auto p-4 sm:p-10"
      onClick={handleOverlayClick}
    >
      <div className="bg-[#141414] text-white w-full max-w-5xl rounded-2xl overflow-hidden relative my-auto shadow-2xl h-max border border-gray-800 animate-fade-in">
        {isLoading ? (
          <div className="flex justify-center items-center h-[50vh]">
            <Spinner />
          </div>
        ) : details ? (
          <>
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-50 w-10 h-10 bg-[#181818] border border-gray-600 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-colors"
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Banner Section */}
            <div className="relative w-full h-[40vh] sm:h-[60vh]">
              <img
                src={
                  details.backdrop_path
                    ? `https://image.tmdb.org/t/p/original${details.backdrop_path}`
                    : details.poster_path
                    ? `https://image.tmdb.org/t/p/w500${details.poster_path}`
                    : '/no-movie.png'
                }
                alt={details.title}
                className="w-full h-full object-cover"
              />
              {/* Gradient Overlay for seamless Netflix blend */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent" />

              {/* Title, Info, and Action Buttons Container */}
              <div className="absolute bottom-0 left-0 px-6 sm:px-10 pt-6 sm:pt-10 pb-0 sm:pb-2 w-full translate-y-2 sm:translate-y-4 flex flex-col md:flex-row md:items-end justify-between gap-6">
                
                {/* Left Side: Title and Metadata */}
                <div className="flex-1">
                  <h2 className="text-3xl sm:text-5xl font-bold mb-4 text-white shadow-sm">{details.title}</h2>
                  <div className="flex flex-wrap items-center gap-4 text-sm sm:text-base font-medium text-gray-300">
                    <span className="text-[#DE23FF] font-bold">
                      {Math.round(details.vote_average * 10)}% Match
                    </span>
                    <span>{details.release_date?.split('-')[0]}</span>
                    {details.runtime > 0 && (
                      <span>
                        {Math.floor(details.runtime / 60)}h {details.runtime % 60}m
                      </span>
                    )}
                    {/* TMDB Star Rating */}
                    <div className="flex items-center">
                      <img src="/star.svg" alt="Rating" className="w-4 h-4 object-contain" />
                      <span className="text-gray-200 font-bold">{details.vote_average ? details.vote_average.toFixed(1) : 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Right Side: Netflix-Style Action Buttons Row */}
                <div className="flex flex-row items-center gap-4 sm:gap-6 pb-1">
                  {/* Save Button */}
                  <button
                    onClick={() => onToggleMovie && onToggleMovie(movie, 'is_saved')}
                    className="flex flex-col items-center gap-2 group outline-none"
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      isSaved 
                        ? 'bg-[#de23ff]/20 border-[#de23ff] text-[#de23ff]' 
                        : 'border-gray-500 text-gray-300 group-hover:border-white group-hover:text-white group-hover:bg-white/10'
                    }`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                      </svg>
                    </div>
                    <span className={`text-[11px] sm:text-xs font-medium ${isSaved ? 'text-[#de23ff]' : 'text-gray-400 group-hover:text-gray-200'}`}>
                      {isSaved ? 'Saved' : 'My List'}
                    </span>
                  </button>

                  {/* Watched Button */}
                  <button
                    onClick={() => onToggleMovie && onToggleMovie(movie, 'is_watched')}
                    className="flex flex-col items-center gap-2 group outline-none"
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      isWatched 
                        ? 'bg-[#b6fb2d]/20 border-[#b6fb2d] text-[#b6fb2d]' 
                        : 'border-gray-500 text-gray-300 group-hover:border-white group-hover:text-white group-hover:bg-white/10'
                    }`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </div>
                    <span className={`text-[11px] sm:text-xs font-medium ${isWatched ? 'text-[#b6fb2d]' : 'text-gray-400 group-hover:text-gray-200'}`}>
                      {isWatched ? 'Watched' : 'Watch'}
                    </span>
                  </button>

                  {/* Like Button (Disabled if not watched) */}
                  <button
                    disabled={!isWatched}
                    onClick={() => onToggleMovie && onToggleMovie(movie, 'rating', 'liked')}
                    className={`flex flex-col items-center gap-2 group outline-none transition-all duration-300 ${!isWatched ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                    title={!isWatched ? "Mark as watched first to rate" : "I liked this"}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      rating === 'liked' && isWatched
                        ? 'bg-green-500/20 border-green-500 text-green-500' 
                        : 'border-gray-500 text-gray-300 group-hover:border-white group-hover:text-white group-hover:bg-white/10'
                    }`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
                      </svg>
                    </div>
                    <span className={`text-[11px] sm:text-xs font-medium ${rating === 'liked' && isWatched ? 'text-green-500' : 'text-gray-400 group-hover:text-gray-200'}`}>
                      Like
                    </span>
                  </button>

                  {/* Dislike Button (Disabled if not watched) */}
                  <button
                    disabled={!isWatched}
                    onClick={() => onToggleMovie && onToggleMovie(movie, 'rating', 'disliked')}
                    className={`flex flex-col items-center gap-2 group outline-none transition-all duration-300 ${!isWatched ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer'}`}
                    title={!isWatched ? "Mark as watched first to rate" : "Not for me"}
                  >
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                      rating === 'disliked' && isWatched
                        ? 'bg-red-500/20 border-red-500 text-red-500' 
                        : 'border-gray-500 text-gray-300 group-hover:border-white group-hover:text-white group-hover:bg-white/10'
                    }`}>
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
                      </svg>
                    </div>
                    <span className={`text-[11px] sm:text-xs font-medium ${rating === 'disliked' && isWatched ? 'text-red-500' : 'text-gray-400 group-hover:text-gray-200'}`}>
                      Dislike
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {/* Details Content Section */}
            <div className="p-6 sm:p-10 grid grid-cols-1 md:grid-cols-3 gap-8">
              {/* Left Column: Overview, Genres, Cast, and Director */}
              <div className="md:col-span-2 space-y-6">
                <p className="text-[14px] sm:text-lg text-gray-200 leading-relaxed">
                  {details.overview || 'No overview available.'}
                </p>

                {/* Genres */}
                {details.genres && details.genres.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {details.genres.map((genre) => (
                      <button 
                        key={genre.id} 
                        onClick={() => onGenreSelect && onGenreSelect(genre.id)}
                        className="px-3 py-1 bg-gray-800 rounded-full text-sm text-gray-300 hover:bg-[#de23ff] hover:text-white transition-colors cursor-pointer"
                      >
                        {genre.name}
                      </button>
                    ))}
                  </div>
                )}

                {/* Cast and Director */}
                <div className="space-y-4 pt-4 border-t border-gray-800">
                  {/* Cast */}
                  {details.credits?.cast?.length > 0 && (
                    <div>
                      <span className="text-gray-500">Cast: </span>
                      <span className="text-gray-300 text-sm">
                        {details.credits.cast.slice(0, 5).map((c, index, arr) => (
                          <React.Fragment key={c.id}>
                            <a href={`https://www.themoviedb.org/person/${c.id}`} target="_blank" rel="noopener noreferrer" className="hover:text-white hover:underline transition-colors">
                              {c.name}
                            </a>
                            {index < arr.length - 1 ? ', ' : ''}
                          </React.Fragment>
                        ))}
                      </span>
                    </div>
                  )}
                  {/* Director */}
                  {details.credits?.crew?.some((c) => c.job === 'Director') && (
                    <div>
                      <span className="text-gray-500">Director: </span>
                      {details.credits.crew
                        .filter((c) => c.job === 'Director')
                        .map((director, index, arr) => (
                          <React.Fragment key={director.id}>
                            <a href={`https://www.themoviedb.org/person/${director.id}`} target="_blank" rel="noopener noreferrer" className="text-gray-300 text-sm hover:text-white hover:underline transition-colors">
                              {director.name}
                            </a>
                            {index < arr.length - 1 ? ', ' : ''}
                          </React.Fragment>
                        ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: Watch / Search */}
              <div className="space-y-4 text-sm text-gray-400">
                {/* Streaming Sites Redirects */}
                <div className="flex flex-col gap-2 pb-2">
                  <span className="text-gray-500">Watch / Search</span>
                  {[
                    { 
                      name: 'CineHD', 
                      icon: '/cinehd.png',
                      getUrl: (q) => `https://cinehd.app/search?q=${q}`,
                      wrapperClass: 'bg-gray-700 hover:bg-gradient-to-r hover:from-[#B6FB2D] hover:to-[#2E9840]'
                    },
                    { 
                      name: 'Seeflix', 
                      icon: '/seeflix.png',
                      getUrl: (q) => `https://ww4.seeflix.to/?s=${q}`,
                      wrapperClass: 'bg-gray-700 hover:bg-[#12A291]'
                    },
                    { 
                      name: 'Filmpire', 
                      icon: '/filmpire.png',
                      getUrl: (q) => `https://filmpire.sc/search?q=${q}&mode=title`,
                      wrapperClass: 'bg-gray-700 hover:bg-gradient-to-r hover:from-[#DD6AF6] hover:to-[#440BA1]'
                    }
                  ].map((site) => {
                    const cleanedTitle = (details.title || '').replace(/[.,:;\-_'"?\\/]/g, ' ').replace(/\s+/g, ' ').trim();
                    const query = encodeURIComponent(cleanedTitle);
                    
                    return (
                      <a
                        key={site.name}
                        href={site.getUrl(query)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={`group w-full bg-clip-padding border border-transparent hover:border-0 p-[1px] hover:p-[2px] rounded-md transition-all duration-300 shadow-sm ${site.wrapperClass}`}
                      >
                        <div className="flex items-center justify-center w-full h-full bg-[#141414] text-gray-200 group-hover:text-white font-semibold py-2.5 px-4 rounded-[5px] transition-colors gap-3">
                          <img src={site.icon} alt={`${site.name} logo`} className="w-5 h-5 object-contain" />
                          <span>Search on {site.name}</span>
                        </div>
                      </a>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Trailers Section */}
            {details.videos?.results?.some((v) => v.type === 'Trailer' && v.site === 'YouTube') && (
              <div className="px-6 sm:px-10 pb-10">
                <h3 className="text-2xl font-bold mb-6">Trailer</h3>
                <div className="aspect-video w-full rounded-xl overflow-hidden bg-black">
                  <iframe
                    src={`https://www.youtube.com/embed/${details.videos.results.find((v) => v.type === 'Trailer' && v.site === 'YouTube').key}`}
                    title="Trailer"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                </div>
              </div>
            )}

            {/* More Like This Section */}
            {details.similar?.results?.length > 0 && (
              <div className="px-3 sm:px-10 pb-6 sm:pb-10 border-t border-gray-800 pt-6 sm:pt-8 mt-4">
                <h3 className="text-2xl font-bold mb-6">More Like This</h3>
                <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {details.similar.results.slice(0, 8).map((simMovie) => (
                    <MovieCard 
                      key={simMovie.id} 
                      movie={simMovie} 
                      onClick={() => onMovieSelect(simMovie)} 
                      isModalCard={true}
                      userMovies={userMovies}
                      onToggleMovie={onToggleMovie}
                    />
                  ))}
                </ul>
              </div>
            )}

            {/* TMDB Footer Link */}
            <div className="border-t border-gray-800 py-6 sm:py-8 flex justify-center mt-auto w-full">
              <a
                href={`https://www.themoviedb.org/movie/${details.id}`}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center gap-2.5 text-gray-500 hover:text-gray-200 transition-colors text-sm font-medium"
              >
                <span>View More Details on </span>
                <img
                  src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg"
                  alt="TMDB Logo"
                  className="h-3.5 opacity-50 group-hover:opacity-100 transition-opacity"
                />
              </a>
            </div>
          </>
        ) : (
          <div className="p-10 text-center text-gray-400">Failed to load movie details.</div>
        )}
      </div>
    </div>
  );
};

export default MovieModal;