import './Meal.css'
import DefaultImg from "../img/default_food.jpg"

// // fa fa icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faShoppingBasket,
  faPencil
} from '@fortawesome/free-solid-svg-icons'

export default function Meal(props) {
    return (
        <div className='container-meal'>
            <div className="day-pic" onClick={props.handleClick} >
                {props.meal.img ?
                    <img src={props.meal.img} alt={props.meal.name} /> :
                    <img src={DefaultImg} alt={props.meal.name} />
                }
            </div>
            <div style={{padding:"10px", width:"85%"}}>
                <div style={{marginBottom:"10px"}}>
                    {props.meal.name}
                </div>
                <div className='meal-edit'>
                    <FontAwesomeIcon icon={faPencil} />
                    <FontAwesomeIcon onClick={props.ingredientsClick} icon={faShoppingBasket} />
                </div>
            </div>
        </div>
    )
}