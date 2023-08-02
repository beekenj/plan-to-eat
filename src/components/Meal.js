import './Meal.css'
import DefaultImg from "../img/default_food.jpg"

// // fa fa icons
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
  faShoppingBasket,
  faPencil,
  faHeart,
} from '@fortawesome/free-solid-svg-icons'
import {
    faHeart as faHeartO,
} from '@fortawesome/free-regular-svg-icons'

export default function Meal(props) {
    return (
        <div className='container-meal'>
            <div className="day-pic" onClick={props.handleClick} >
                {props.meal.img ?
                    <img src={props.meal.img} alt={props.meal.name} /> :
                    <img src={DefaultImg} alt={props.meal.name} />
                }
            </div>
            <div style={{padding:"10px"}}>
                <div style={{marginBottom:"10px"}}>
                    {props.meal.name}
                </div>
                <div className='meal-edit'>
                    <FontAwesomeIcon icon={faPencil} />
                    <FontAwesomeIcon onClick={props.ingredientsClick} icon={faShoppingBasket} />
                    {props.meal.isFavorite ?
                        <FontAwesomeIcon onClick={props.setFavorite} icon={faHeart} /> :
                        <FontAwesomeIcon onClick={props.setFavorite} icon={faHeartO} />
                    }
                </div>
            </div>
        </div>
    )
}