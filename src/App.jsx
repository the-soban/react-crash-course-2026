import React from 'react'
import { useState, useEffect } from 'react'
import { useDebounce } from 'react-use'
import Search from './components/Search'
import Spinner from './components/Spinner';
import MovieCard from './components/MovieCard';
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

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [movieList, setMovieList] = useState([]);
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  useDebounce(() => setDebouncedSearchTerm(searchTerm), 500, [searchTerm]);

  const fetchMovies = async (query = '') => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const endpoint = query
        ? `${API_BASE_URL}/search/movie?query=${encodeURIComponent(query)}`
        : `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

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

      setMovieList (data.results || []);

      if (query && data.results.length > 0){
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
    fetchMovies(debouncedSearchTerm);
  }, [debouncedSearchTerm]);

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
            <h2>Trending Movies</h2>

            <ul>
              {trendingMovies.map((movie, index) => {
                return(
                  <li key={movie.$id}>
                    <p>{index + 1}</p>
                    <img src={movie.poster_url} alt={movie.searchTerm} />
                    {/* <p>{movie.searchTerm}</p> */}
                  </li>
                )
              })}
              
            </ul>

          </section>
        )}

        <section className="all-movies">
          <h2>All Movies</h2>

          {isLoading ? (
            // <p className="text-white">Loading movies...</p>
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) => {
                return(
                  <MovieCard key={movie.id} movie={movie} />
                )
              })}
            </ul>
          )}

          {/* {errorMessage && <p className="text-red-500">{errorMessage}</p>} */}
        </section>

        <p>{errorMessage}</p>

      </div>

      {/* <h1 className="text-3xl font-bold underline">Hello world!</h1> */}
    </main>
  )
}

export default App