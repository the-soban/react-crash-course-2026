import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

// Card component that takes a title prop and displays it
const Card = ({ title }) => {
  const [hasLiked, setHasLiked] = useState(false);

  return (
    <div className="card">
      <h2>{title}</h2>

      {/* Button to like the movie, when clicked it will set hasLiked to true. We are using the onClick function here inside the component because this state will be different for each card, so we want to manage it inside the Card component itself, not directly in the App component: */}

      <button onClick={() => setHasLiked(!hasLiked)} className="like-button">
        {hasLiked ? '❤️' : '🤍'} 
      </button>
      {/* the onclick funstions this way: set the state "hasLiked" to whatever the opposite of its current value is. So if it's currently false, it will become true, and if it's currently true, it will become false. This allows us to toggle the like status each time the button is clicked. 
      
      Similarly, there is a ternary operator inside the button instead of static text/icon, and that operator checks if hasLiked is true, then it shows Red heart (meaning its already liked), else it shows white heart (Not yet liked)  */}

    </div>
  )
}

const App = () => {

  return (
    <div className="card-container">

      {/* Using the Card component we built above to display different movie titles using the props */}
      <Card title="Dune: Part Two" /> 
      <Card title="Arrival" />
      <Card title="Interstellar" />
    </div>
  )
}

export default App
