import { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app"
import { 
  getDatabase, 
  ref, 
  onValue, 
  // push, 
  // set, 
  // remove 
} from "firebase/database"

import './App.css';

import Day from './components/Day';

// // put this stuff in component!
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
// import { faTimesCircle } from '@fortawesome/free-solid-svg-icons'

const appSettings = {
  databaseURL: "https://realtime-database-aef6c-default-rtdb.firebaseio.com/"
}

const app = initializeApp(appSettings)
const database = getDatabase(app)
const shoppingListInDB = ref(database, "homeToCart")
const mealPlanInDB = ref(database, "mealPlan")

function App() {
  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const today = new Date()

  const weekStartingToday = Array(7).fill().map((_, idx) => today.getDay()+idx < 7 ? weekdays[today.getDay()+idx] : weekdays[today.getDay()+idx-7])

  const [shoppingList, setShoppingList] = useState([])
  // const [shoppingObj, setShoppingObj] = useState({})
  const [planObj, setPlanObj] = useState({})

  useEffect(() => {
    onValue(shoppingListInDB, function(snapshot) {
      if (snapshot.exists()) {
        let shoppingListArray = Object.entries(snapshot.val())  
        setShoppingList(shoppingListArray)
        // setShoppingObj(snapshot.val())
      } else {
        // alert("Failed to fetch db snapshot")
      }
    })
    onValue(mealPlanInDB, function(snapshot) {
      if (snapshot.exists()) {
        setPlanObj(snapshot.val())
      } else {
        // alert("Failed to fetch db snapshot")
      }
    })
  }, [])

  // console.log(planObj["Monday"])

  return (
    <div className="App">
      {weekStartingToday.map((elem, idx) => <Day key={idx} weekday={elem} meal={planObj[elem]} />)}
    </div>
  );
}

export default App;
