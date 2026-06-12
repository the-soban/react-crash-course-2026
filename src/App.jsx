import React from 'react'
import { useState, useEffect } from 'react'
import Search from './components/Search'
import Spinner from './components/Spinner';

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
  const [isLoading, setIsLoading] = useState(false);

  const fetchMovies = async () => {
    setIsLoading(true);
    setErrorMessage('');
    
    try {
      const endpoint = `${API_BASE_URL}/discover/movie?sort_by=popularity.desc`;

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

    } catch (error){
      console.error(`Error fetching movies: ${error}`);
      setErrorMessage(`Failed to load movies. Please try again later.`);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchMovies();
  }, []);



  return (
    <main>
      <div className="pattern" />

      <div className="wrapper">

        <header>
          <img src="./logo.png" alt="logo" className="logoImg h-[54px]" />
          <img src="./hero.png" alt="hero visual"/>
          <h1>
            Find <span className="text-gradient">Movies</span> You'll Love!
          </h1>
        <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
        </header>

        <section className="all-movies">
          <h2 className="mt-[32px]">All Movies</h2>

          {isLoading ? (
            // <p className="text-white">Loading movies...</p>
            <Spinner />
          ) : errorMessage ? (
            <p className="text-red-500">{errorMessage}</p>
          ) : (
            <ul>
              {movieList.map((movie) => {
                return(
                  <p className="text-white">{movie.title}</p>
                )
              })}
            </ul>
          )}

          {/* {errorMessage && <p className="text-red-500">{errorMessage}</p>} */}
        </section>

        <p>{errorMessage}</p>


        <div className="search-results-wrapper">
          {searchTerm ? <span className="search-results-span">Search results for: </span> : null}
          <h1 className="text-white">{searchTerm}</h1>
        </div>

      </div>

      {/* <h1 className="text-3xl font-bold underline">Hello world!</h1> */}
    </main>
  )
}

export default App