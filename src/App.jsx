import React from 'react'
import { useState, useEffect, useRef } from 'react'
import { useDebounce } from 'react-use'
import Search from './components/Search'
import Spinner from './components/Spinner';
import MovieCard from './components/MovieCard';
import MovieModal from './components/MovieModal';
import { getTrendingMovies, updateSearchCount } from './appwrite';

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
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}&page=${pageNum}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc&page=${pageNum}${genreId ? `&with_genres=${genreId}` : ''}`;

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

      if (pageNum === 1) {
        setMovieList(data.results || []);
      } else {
        setMovieList((prev) => [...prev, ...(data.results || [])]);
      }
      
      setTotalPages(data.total_pages || 1);

      if (query && data.results.length > 0 && pageNum === 1){
        await updateSearchCount(query, data.results[0]);
      }
      // updateSearchCount();

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

  const loadMore = () => {
    if (page < totalPages) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchMovies(debouncedSearchTerm, nextPage, selectedGenre);
    }
  };

  useEffect(() => {
    loadTrendingMovies();
  }, []);

console.log(trendingMovies);

  return (
    <main>
      <div className="pattern" />

      <div className="wrapper">

        <header>
          <img src="./logo.png" alt="logo" className="logoImg h-[54px]" />
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
            // <p className="text-white">Loading movies...</p>
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <>
              <ul>
                {movieList.map((movie, index) => {
                  return(
                    <MovieCard key={`${movie.id}-${index}`} movie={movie} onClick={(m) => setSelectedMovie(m)} />
                  )
                })}
              </ul>

              {isLoading && page > 1 && (
                <div className="mt-8 flex justify-center">
                  <Spinner />
                </div>
              )}

              {!isLoading && page < totalPages && (
                <div className="mt-8 flex justify-center">
                  <button onClick={loadMore} className="bg-transparent border border-gray-600 text-gray-300 hover:text-white hover:border-white font-semibold py-3 px-8 rounded-lg transition-colors duration-300 shadow-sm">
                    Load More
                  </button>
                </div>
              )}
            </>
          )}

          {/* {errorMessage && <p className="text-red-500">{errorMessage}</p>} */}
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
        />
      )}

      {/* <h1 className="text-3xl font-bold underline">Hello world!</h1> */}
    </main>
  )
}

export default App