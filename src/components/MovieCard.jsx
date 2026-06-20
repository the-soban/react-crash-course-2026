import React from 'react';

const GENRE_MAP = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy',
  80: 'Crime', 18: 'Drama', 10751: 'Family', 14: 'Fantasy',
  36: 'History', 27: 'Horror', 10402: 'Music', 9648: 'Mystery',
  10749: 'Romance', 878: 'Sci-Fi', 10770: 'TV Movie', 53: 'Thriller',
  10752: 'War', 37: 'Western'
};

const MovieCard = ({ movie, onClick, isModalCard, userMovies = [], onToggleMovie }) => {
  const { title, vote_average, poster_path, release_date, original_language, genre_ids } = movie;

  // Check user interaction states
  const userRecord = userMovies?.find((um) => um.movie_id === movie.id);
  const isSaved = userRecord?.is_saved === true;
  const isWatched = userRecord?.is_watched === true;
  const rating = userRecord?.rating; // 'liked', 'disliked', or null

  const handleActionClick = (e, toggleType, value = null) => {
    e.stopPropagation(); 
    if (onToggleMovie) {
      onToggleMovie(movie, toggleType, value);
    }
  };

  const genreText = genre_ids && genre_ids.length > 0 
    ? genre_ids.slice(0, 2).map(id => GENRE_MAP[id]).filter(Boolean).join(', ')
    : '';

  return (
    <div className="movie-card cursor-pointer group" onClick={() => onClick && onClick(movie)}>
      <div className="relative overflow-hidden rounded-lg">
        <img
          src={poster_path ? `https://image.tmdb.org/t/p/w500/${poster_path}` : '/no-movie.png'}
          alt={title}
          className="group-hover:scale-105 transition-transform duration-300"
        />

        {/* TOP LEFT: Bookmark and Watch Buttons */}
        <div className="absolute top-2 left-2 flex flex-col gap-2 transition-opacity duration-300">
          {/* Bookmark / Save Button */}
          <button
            onClick={(e) => handleActionClick(e, 'is_saved')}
            className={`p-2 rounded-full backdrop-blur-md transition-all shadow-lg ${
              isSaved 
                ? 'bg-[#de23ff] text-white' 
                : 'bg-black/60 text-gray-300 hover:bg-[#de23ff] hover:text-white'
            }`}
            title="Add to Watchlist"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
            </svg>
          </button>

          {/* Eye / Watched Button */}
          <button
            onClick={(e) => handleActionClick(e, 'is_watched')}
            className={`p-2 rounded-full backdrop-blur-md transition-all shadow-lg ${
              isWatched 
                ? 'bg-[#b6fb2d] text-[#030014]' 
                : 'bg-black/60 text-gray-300 hover:bg-[#b6fb2d] hover:text-[#030014]'
            }`}
            title="Mark as Watched"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
          </button>
        </div>

        {/* TOP RIGHT: Like and Dislike Buttons (ONLY rendered if isWatched is true) */}
        {isWatched && (
          <div className="absolute top-2 right-2 flex flex-col gap-2 transition-opacity duration-300 animate-fade-in">
            {/* Thumbs Up / Like */}
            <button
              onClick={(e) => handleActionClick(e, 'rating', 'liked')}
              className={`p-2 rounded-full backdrop-blur-md transition-all shadow-lg ${
                rating === 'liked'
                  ? 'bg-green-500 text-white' 
                  : 'bg-black/60 text-gray-300 hover:bg-green-500 hover:text-white'
              }`}
              title="I liked it"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10h4.764a2 2 0 011.789 2.894l-3.5 7A2 2 0 0115.263 21h-4.017c-.163 0-.326-.02-.485-.06L7 20m7-10V5a2 2 0 00-2-2h-.095c-.5 0-.905.405-.905.905 0 .714-.211 1.412-.608 2.006L7 11v9m7-10h-2M7 20H5a2 2 0 01-2-2v-6a2 2 0 012-2h2.5" />
              </svg>
            </button>

            {/* Thumbs Down / Dislike */}
            <button
              onClick={(e) => handleActionClick(e, 'rating', 'disliked')}
              className={`p-2 rounded-full backdrop-blur-md transition-all shadow-lg ${
                rating === 'disliked'
                  ? 'bg-red-500 text-white' 
                  : 'bg-black/60 text-gray-300 hover:bg-red-500 hover:text-white'
              }`}
              title="I disliked it"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14H5.236a2 2 0 01-1.789-2.894l3.5-7A2 2 0 018.736 3h4.018a2 2 0 01.485.06l3.76.94m-7 10v5a2 2 0 002 2h.096c.5 0 .905-.405.905-.904 0-.714.211-1.412.608-2.006L17 13V4m-7 10h2m5-10h2a2 2 0 012 2v6a2 2 0 01-2 2h-2.5" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Content:   */}
      <div className="mt-4">
        <h3>{title}</h3>
        <div className="content">
          <div className="rating">
            <img src="/star.svg" alt="Rating" />
            <p>{vote_average ? vote_average.toFixed(1) : 'N/A'}</p>
          </div>
          <span>•</span>
          <p className="lang">{original_language}</p>
          <span>•</span>
          <p className="year">{release_date ? release_date.split('-')[0] : 'N/A'}</p>
        </div>
        {genreText && <p className="text-sm text-gray-400 mt-1">{genreText}</p>}

        {/* --- NEW: View Details Link with Diagonal Arrow --- */}
        <div className="mt-4 flex items-center justify-between text-sm">
           <span className="text-white font-medium flex items-center gap-1 group-hover:text-[#de23ff] transition-colors">
              View Details
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-3.5 h-3.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 19.5 15-15m0 0H8.25m11.25 0v11.25" />
              </svg>
           </span>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;