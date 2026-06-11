import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import heroImg from './assets/hero.png'
import './App.css'

// Card component that takes a title prop and displays it
const Card = ({ title }) => {
  const [clickCount, setClickCount] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);

  // this is a useEffect hook that runs every time there is a change in the component i,e; the component re-renders. It logs a message to the console indicating whether the movie has been liked or unliked based on the current state of hasLiked. The useEffect hook is used here to perform a side effect (logging to the console) whenever the component updates, which happens when the user clicks the like button and changes the hasLiked state.
  useEffect(() => {
    console.log(`${title} has been ${hasLiked ? 'liked' : 'unliked'}`);
  }, [hasLiked]); 
  // the dependency array for this useEffect includes hasLiked, which means that the effect will run whenever this value changes. This ensures that the console log will reflect the current like status of the movie whenever it is updated.

  useEffect(() => {
    console.log(`Card has been rendered.`);
  }, []);
  // this type of useEffect with an empty dependency array runs only once when the component is first mounted, and in this case it logs a message to the console indicating that the card has been rendered. This is useful for tracking when the component is initially loaded into the DOM.

  // Conditional rendering:


  return (
    <div className="card" onClick = {() => setClickCount(clickCount + 1)}>
      <h2>{title}</h2>

      {/* using the clickCount state to keep track of how many times the card has been clicked. The onClick event handler is set on the div with the class "card", and it increments the clickCount by 1 each time the card is clicked. If clickCount is 0, it will display nothing (null) instead of showing 0, but if it is greater than 0, it will display the value of clickCount. This keeps the UI cleaner when there have been no clicks yet. This is done using a logical OR operator (||), just like a ternary operator, but it checks if clickCount is truthy (greater than 0) unlike a ternary operator that checks for a specific condition (if-else): */}
      <h4>{clickCount || null}</h4>

      {/* Button to like the movie, when clicked it will set hasLiked to true. We are using the onClick function here inside the component because this state will be different for each card, so we want to manage it inside the Card component itself, not directly in the App component: */}

      <button onClick={() => setHasLiked(!hasLiked)} className="like-button">
        {hasLiked ? '❤️' : '🤍'} 
      </button>
      {/* the onclick funstions this way: set the state "hasLiked" to whatever the opposite of its current value is. So if it's currently false, it will become true, and if it's currently true, it will become false. This allows us to toggle the like status each time the button is clicked. 
      
      Similarly, there is a ternary operator inside the button instead of static text/icon, and that operator checks if hasLiked is true, then it shows Red heart (meaning its already liked), else it shows white heart (Not yet liked)  */}

    </div>
  )
}

const AppPractice = () => {

  return (
    <div className="card-container">
      <h2>Hello there</h2>

      {/* Using the Card component we built above to display different movie titles using the props */}
      <Card title="Dune: Part Two" /> 
      <Card title="Arrival" />
      <Card title="Interstellar" />
    </div>
  )
}

export default AppPractice
