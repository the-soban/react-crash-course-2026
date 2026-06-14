import React from 'react'

const GENRE_MAP = {
  28: 'Action',
  12: 'Adventure',
  16: 'Animation',
  35: 'Comedy',
  80: 'Crime',
  99: 'Documentary',
  18: 'Drama',
  10751: 'Family',
  14: 'Fantasy',
  36: 'History',
  27: 'Horror',
  10402: 'Music',
  9648: 'Mystery',
  10749: 'Romance',
  878: 'Sci-Fi',
  10770: 'TV Movie',
  53: 'Thriller',
  10752: 'War',
  37: 'Western'
};

const MovieCard = ({ movie, onClick, isModalCard = false }) => {
  const {
      title, vote_average, release_date, poster_path, genre_ids, genres
  } = movie;

  const primaryGenreId = genre_ids ? genre_ids[0] : null;
  const primaryGenre = primaryGenreId && GENRE_MAP[primaryGenreId] ? GENRE_MAP[primaryGenreId] : (genres && genres.length > 0 ? genres[0].name : 'N/A');

  return (
    <div className={`movie-card cursor-pointer ${isModalCard ? 'max-sm:!p-2' : ''}`} onClick={() => onClick && onClick(movie)}>
        <img src={poster_path ? `https://image.tmdb.org/t/p/w500/${poster_path}` : '/no-movie.png'} alt="{title}" />

        <div className={`mt-4 ${isModalCard ? 'max-sm:mt-2 max-sm:px-2 max-sm:pb-2' : ''}`}>
            <h3 className={`text-white ${isModalCard ? 'max-sm:text-[14px]' : ''}`}>{title}</h3>

            {isModalCard ? (
                <div className="flex flex-col mt-2 gap-1.5">
                    <div className="rating">
                        <img src="./star.svg" alt="star icon" />
                        <p className="max-sm:text-[14px]">{vote_average ? vote_average.toFixed(1) : 'No rating yet.'}</p>
                    </div>
                    <div className="flex items-center gap-2 text-[#a8b5db] max-sm:text-[14px]">
                        <p className="year">{release_date ? release_date.split('-')[0] : 'Not available'}</p>
                        <span>•</span>
                        <p className="lang">{primaryGenre}</p>
                    </div>
                </div>
            ) : (
                <div className="content">
                    <div className="rating">
                        <img src="./star.svg" alt="star icon" />

                        <p>{vote_average ? vote_average.toFixed(1) : 'No rating yet.'}</p>

                    </div>

                    <span>•</span>

                    <p className="year">{release_date ? release_date.split('-')[0] : 'Not available'}</p>

                    <span>•</span>

                    <p className="lang">{primaryGenre}</p>
                </div>
            )}
        </div>
    </div>
  )
}

export default MovieCard