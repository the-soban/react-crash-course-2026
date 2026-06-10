import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

const MovieName = ({ title }) => {
  return (
    <div className="App">
      <h5>{title}</h5>
    </div>
  )
}

const App = () => {
  return (
    <div>
    <h2>React Crash Course 2026</h2>

    <MovieName title="Dune: Part Two" />
    <MovieName title="Arrival" />
    <MovieName title="Interstellar" />
    
    </div>
  )
}

export default App
