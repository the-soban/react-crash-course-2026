import React from 'react'
import { useState } from 'react'
import Search from './components/Search'

const App = () => {
  const [searchTerm, setSearchTerm] = useState('');



  return (
    <main>
      <div className="pattern" />

      <div className="wrapper">

        <header>
          <img src="./logo.png" alt="logo" className="logoImg" />
          <img src="./hero.png" alt="hero visual"/>
          <h1>
            Find <span className="text-gradient">Movies</span> You'll Love Without Any Hassle!
          </h1>
        </header>

        <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
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