import { useState, useEffect } from 'react';

// firebase stuff
import { initializeApp } from "firebase/app"
import { 
  getDatabase, 
  ref, 
  onValue, 
  push, 
  set, 
  remove,
} from "firebase/database"
// import { 
//   getAuth,
//   connectAuthEmulator,
//   signInWithEmailAndPassword,
// } from "firebase/auth"

import './App.css';

import Day from './components/Day';
import Meal from './components/Meal';

// // fa fa icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faPlus,
  faArrowLeft,
  faCartPlus,
  faCutlery,
  faCalendar,
  faTimes,
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

// const auth = getAuth(app)

function App() {
  const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
  const DAY = 86400000
  const today = new Date()

  
  const [currentDay, setCurrentDay] = useState(JSON.parse(localStorage.getItem("currentDay")) || new Date().setHours(0,0,0,0))

  // console.log(new Date(currentDay).getDay())
  // console.log(weekdays.slice(new Date(Number(localStorage.getItem("currentDay"))).getDay(), today.getDay()))
  // localStorage.setItem("currentDay", JSON.stringify(currentDay))

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
  const [section, setSection] = useState("calendar")
  const [searchIngredients, setSearchIngredients] = useState('')

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
    const weekdays = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]
    const today = new Date()
    if (new Date() >= new Date(Number(localStorage.getItem("currentDay"))+DAY)) {
      
      weekdays
      .slice(new Date(Number(localStorage.getItem("currentDay"))).getDay(), today.getDay())
      .forEach(day => set(ref(database, `mealPlan/${day}`), "none"))
      
      setCurrentDay(new Date().setHours(0,0,0,0))
      localStorage.setItem("currentDay", JSON.stringify(currentDay))
    }
  }, [currentDay])

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

  function removePlan(day) {
    set(ref(database, `mealPlan/${day}`), "none")
    setDaySelect(null)
  }

  // clear inputs on enter key
  function searchEnter(event) {
    if (event.key === "Enter") {
      event.target.blur()
    }
  }

  // Get unique keys from ingredients of selected meals
  const keys = Array
    .from(new Set(Object.values(planObj)
    .filter(elem => elem !== "none")
    .map(elem => Object.keys(mealsObj).length > 0 && mealsObj[elem].ingredients)
    .map(elem => Object.keys(elem)).flat()
    .filter(elem => elem !== "placeHolder")))
  
  // get associated items and place in array of [key, value] pairs 
  const items = keys.map(elem => shoppingObj[elem])
  const addToShoppingListItems = keys.map((key, idx) => [key, items[idx]])

  const condition = new RegExp(searchIngredients.toLowerCase())

  // console.log(shoppingList)

  // console.log(mealsObj)
  // console.log(mealsObj[planObj[daySelect]])

  return (
    <>
    <div className="App">
      <div style={{height:"25px"}} />
      {!daySelect && section === "calendar" &&
        weekStartingToday.map((elem, idx) => <Day key={idx} weekday={elem} meal={mealsObj[planObj[elem]]} mealClick={() => setDaySelect(elem)} />)
      }
      {!daySelect && section === "cart" &&
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
            {/* <button className='add-button' onClick={() => setMealAdd(true)}><FontAwesomeIcon icon={faPlus} /></button> */}
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
      {section === "meals" && !mealSelect && !mealAdd &&
        <div>
          <div className='meal-list'>
            <button className='add-button' onClick={() => setMealAdd(true)}><FontAwesomeIcon icon={faPlus} /></button>
            {mealsList.map(elem => 
              <Meal 
                key={elem[0]} 
                meal={elem[1]} 
                handleClick={() => console.log("todo?")} 
                ingredientsClick={() => setMealSelect(elem[0])} 
              />)}
          </div>
        </div>
      }
      {section === "meals" && mealAdd &&
        <>
          <input 
            type='text' 
            className='add-input'
            value={newMeal.name} 
            placeholder='Name'
            onChange={e => setNewMeal(prev => 
              {
                return {...prev, "name":e.target.value}
              })}
          />
          <input 
            type='text' 
            className='add-input'
            value={newMeal.link} 
            placeholder='Recipe Link'
            onChange={e => setNewMeal(prev => 
              {
                return {...prev, "link":e.target.value}
              })}
          />
          <input 
            type='text' 
            className='add-input'
            value={newMeal.img} 
            placeholder='Image'
            onChange={e => setNewMeal(prev => 
              {
                return {...prev, "img":e.target.value}
              })}
          />
          <button className='new-button' onClick={addNew}>Submit</button>
          <button className='new-button' onClick={() => setMealAdd(false)}>Cancel</button>
        </>
      }
      {/* Ingredients menu */}
      {section === "meals" && mealSelect &&
        shoppingList
          .filter(item => condition.test(item[1].name.toLowerCase()))
          .map(item => 
            <ListItem
              key={item[0]}
              id={item[0]}
              item={item[1]}
              handleChange={e => ingredientsCheck(e.target.checked, item[0])}
              // checked={mealsObj[mealSelect].ingredients[item[0]]}
              checked={item[0] in mealsObj[mealSelect].ingredients}
          />)
      }
    </div>
    {/* Top bar */}
    <div className="navbar-group">
      {!daySelect && !mealSelect &&
        <div>
          <button className='button' style={{color: section === "calendar" ? "lightblue" : "white"}} onClick={() => setSection("calendar")}><FontAwesomeIcon icon={faCalendar} /></button>
          <button className='button' style={{color: section === "cart" ? "lightblue" : "white"}} onClick={() => setSection("cart")}><FontAwesomeIcon icon={faCartPlus} /></button>
          <button className='button' style={{color: section === "meals" ? "lightblue" : "white"}} onClick={() => setSection("meals")}><FontAwesomeIcon icon={faCutlery} /></button>
        </div>
      }
      {daySelect && 
        !mealAdd && 
        !mealSelect &&
        <>
          <button className='button' onClick={() => setDaySelect(null)} >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <button className='button'>
            {daySelect} : {mealsObj[planObj[daySelect]] ? mealsObj[planObj[daySelect]].name : "Select Meal"}
          </button>
          <button className='button' onClick={() => removePlan(daySelect)} >
            <FontAwesomeIcon icon={faTimes} />
          </button>
        </>
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
      {/* Ingredients menu top bar */}
      {section === "meals" && mealSelect &&
        <>
        <div>
          <button className='button' onClick={() => setMealSelect(null)} >
            <FontAwesomeIcon icon={faArrowLeft} />
          </button>
          <input
            type='text'
            className='searchbar'
            value={searchIngredients}
            onChange={e => setSearchIngredients(e.target.value)}
            onKeyDown={searchEnter}
          />
        </div>
        <button className='button' style={{color:"white", }}>{mealsObj[mealSelect].name}</button>
        </>
      }
    </div>
    </>
  );
}

export default App;
