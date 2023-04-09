import { useState, useEffect } from 'react';
import { initializeApp } from "firebase/app"
import { 
  getDatabase, 
  ref, 
  onValue, 
  push, 
  set, 
  remove,
} from "firebase/database"

import './App.css';

import Day from './components/Day';
import Meal from './components/Meal';

// // fa fa icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faPlus,
  faArrowLeft,
  faCartPlus,
} from '@fortawesome/free-solid-svg-icons'
import ListItem from './components/ListItem';

const appSettings = {
  databaseURL: "https://realtime-database-aef6c-default-rtdb.firebaseio.com/"
}

const app = initializeApp(appSettings)
const database = getDatabase(app)
const shoppingListInDB = ref(database, "homeToCart")
const mealPlanInDB = ref(database, "mealPlan")
const mealsInDB = ref(database, "meals")

function App() {
  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const today = new Date()

  const weekStartingToday = Array(7).fill().map((_, idx) => today.getDay()+idx < 7 ? weekdays[today.getDay()+idx] : weekdays[today.getDay()+idx-7])

  const [shoppingList, setShoppingList] = useState([])
  const [shoppingObj, setShoppingObj] = useState({})
  const [planObj, setPlanObj] = useState({})
  const [mealsObj, setMealsObj] = useState({})
  const [mealsList, setMealsList] = useState({})
  const [daySelect, setDaySelect] = useState(null)
  const [mealAdd, setMealAdd] = useState(false)
  const [newMeal, setNewMeal] = useState({
    name:'',
    link:'',
    img:'',
  })
  const [mealSelect, setMealSelect] = useState(null)
  const [cart, setCart] = useState(false)

  useEffect(() => {
    onValue(shoppingListInDB, function(snapshot) {
      if (snapshot.exists()) {
        let shoppingListArray = Object.entries(snapshot.val())  
        setShoppingList(shoppingListArray)
        setShoppingObj(snapshot.val())
      } 
    })
    onValue(mealPlanInDB, function(snapshot) {
      if (snapshot.exists()) {
        setPlanObj(snapshot.val())
      } 
    })
    onValue(mealsInDB, function(snapshot) {
      if (snapshot.exists()) {
        let mealsListArray = Object.entries(snapshot.val())  
        setMealsList(mealsListArray)
        setMealsObj(snapshot.val())
      } 
    })
  }, [])

  function addNew() {
    push(mealsInDB, newMeal)
    .then((snap) => set(ref(database, `meals/${snap.key}/ingredients/placeHolder`), true))
    setMealAdd(false)
    setNewMeal({
      name:'',
      link:'',
      img:'',
    })
  }

  function selectMeal(id) {
    set(ref(database, "mealPlan/" + daySelect), id)
    setDaySelect(null)
  }

  function ingredientsCheck(checked, id) {
    if (checked) {
      // set(ref(database, `meals/${mealSelect}/ingredients/${id}`), checked ? true : false)
      set(ref(database, `meals/${mealSelect}/ingredients/${id}`), true)
    } else {
      remove(ref(database, `meals/${mealSelect}/ingredients/${id}`))
    }
  }

  // Check item change event
  function handleChangeHome(event) {
    const {id, checked} = event.target
    const item = shoppingObj[id]
    set(ref(database, "homeToCart/" + id), {
      ...item,
      "inCart" : checked ? true : false,
    })
  }

  // Get unique keys from ingredients of selected meals
  const keys = Array
    .from(new Set(Object.values(planObj)
    .map(elem => Object.keys(mealsObj).length > 0 && mealsObj[elem].ingredients)
    .map(elem => Object.keys(elem)).flat()
    .filter(elem => elem !== "placeHolder")))
  
  // get associated items and plance in array of [key, value] pairs 
  const items = keys.map(elem => shoppingObj[elem])
  const addToShoppingListItems = keys.map((key, idx) => [key, items[idx]])

  return (
    <>
    <div className="App">
      <div style={{height:"25px"}} />
      {!daySelect && !cart &&
        weekStartingToday.map((elem, idx) => <Day key={idx} weekday={elem} meal={mealsObj[planObj[elem]]} mealClick={() => setDaySelect(elem)} />)
      }
      {!daySelect && cart &&
        addToShoppingListItems.map(item => 
          <ListItem
            key={item[0]}
            id={item[0]}
            item={item[1]}
            handleChange={handleChangeHome}
            checked={item[1].inCart}
          />
        )
      }
      {daySelect && 
        !mealAdd && !mealSelect &&
        <div>
          <div className='meal-list'>
            {mealsList.map(elem => 
              <Meal 
                key={elem[0]} 
                meal={elem[1]} 
                handleClick={() => selectMeal(elem[0])} 
                ingredientsClick={() => setMealSelect(elem[0])} 
              />)}
            <button className='add-button' onClick={() => setMealAdd(true)}><FontAwesomeIcon icon={faPlus} /></button>
          </div>
        </div>
      }
      {daySelect && mealSelect &&
        shoppingList.map(item => 
          <ListItem
            key={item[0]}
            id={item[0]}
            item={item[1]}
            handleChange={e => ingredientsCheck(e.target.checked, item[0])}
            // checked={mealsObj[mealSelect].ingredients[item[0]]}
            checked={item[0] in mealsObj[mealSelect].ingredients}
          />)
      }
      {daySelect && mealAdd &&
        <>
          <input 
            type='text' 
            value={newMeal.name} 
            placeholder='Name'
            onChange={e => setNewMeal(prev => 
              {
                return {...prev, "name":e.target.value}
              })}
          />
          <input 
            type='text' 
            value={newMeal.link} 
            placeholder='Recipe Link'
            onChange={e => setNewMeal(prev => 
              {
                return {...prev, "link":e.target.value}
              })}
          />
          <input 
            type='text' 
            value={newMeal.img} 
            placeholder='Image'
            onChange={e => setNewMeal(prev => 
              {
                return {...prev, "img":e.target.value}
              })}
          />
          <button onClick={addNew}>Submit</button>
        </>
      }
    </div>
    {/* Top bar */}
    <div className="navbar-group">
      {!daySelect &&
        <button className='button' style={{color: cart ? "lightblue" : "white"}} onClick={() => setCart(prev => !prev)}><FontAwesomeIcon icon={faCartPlus} /></button>
      }
      {daySelect && 
        !mealAdd && 
        !mealSelect &&
        <button className='button' onClick={() => setDaySelect(null)} >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
      }
      {daySelect && 
        !mealAdd && 
        mealSelect &&
        <>
        <button className='button' onClick={() => setMealSelect(null)} >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
        <div style={{color:"white", }}>{mealsObj[mealSelect].name}</div>
        </>
      }
      {daySelect && mealAdd &&
        <button className='button' onClick={() => setMealAdd(false)} >
          <FontAwesomeIcon icon={faArrowLeft} />
        </button>
      }
      
    </div>
    </>
  );
}

export default App;