import React, { useEffect, useState } from 'react';
import Spinner from './Spinner';
import MovieCard from './MovieCard';

// 1. Notice we added userMovies and onToggleMovie to the top line so this file can receive them
const MovieModal = ({ movie, onClose, onMovieSelect, onGenreSelect, userMovies, onToggleMovie }) => {
  const [details, setDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

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
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-50 w-10 h-10 bg-[#181818] border border-gray-600 rounded-full flex items-center justify-center hover:bg-white hover:text-black transition-colors"
              aria-label="Close modal"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

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
              <div className="absolute inset-0 bg-gradient-to-t from-[#141414] via-[#141414]/40 to-transparent" />

              <div className="absolute bottom-0 left-0 px-6 sm:px-10 pt-6 sm:pt-10 pb-0 sm:pb-2 w-full translate-y-2 sm:translate-y-4">
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
                </div>
              </div>
            </div>

            <div className="p-6 sm:p-10 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="md:col-span-2 space-y-6">
                <p className="text-[14px] sm:text-lg text-gray-200 leading-relaxed">
                  {details.overview || 'No overview available.'}
                </p>

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

                <div className="space-y-4 pt-4 border-t border-gray-800">
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

              <div className="space-y-4 text-sm text-gray-400">
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

            {details.similar?.results?.length > 0 && (
              <div className="px-3 sm:px-10 pb-6 sm:pb-10 border-t border-gray-800 pt-6 sm:pt-8 mt-4">
                <h3 className="text-2xl font-bold mb-6">More Like This</h3>
                <ul className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {/* 2. Notice here we are passing the new props straight into the MovieCard */}
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