import "./Day.css"
import DefaultImg from "../img/default_food.jpg"

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { 
    faPlus,
    faExternalLink,
    // faSave,
    faCheckSquare,
} from '@fortawesome/free-solid-svg-icons'

export default function Day(props) {
    // console.log(props.meal)
    return (
        <div className="container-day">
            <div className="top">

                <div>
                    <div className="day-pic" onClick={props.mealClick}>
                        {props.meal ?
                            props.meal.img ?
                                <img src={props.meal.img} alt={props.meal.name} /> :
                                <img src={DefaultImg} alt={props.meal.name} />
                                :
                                <div className="day-none"><FontAwesomeIcon icon={faPlus} /></div>            
                            }
                    </div>
                </div>
                <div className="day-info">
                    <div className="title">
                        {props.weekday}
                        {props.meal && 
                            <button 
                                className="button" 
                                style={{background:"#42f5a4", marginLeft:"10px", padding:"6px"}} 
                                onClick={() => props.resetOneDay(props.weekday)}
                            >
                                <FontAwesomeIcon icon={faCheckSquare} />
                            </button>}
                    </div>
                    <div className="meal">
                        <div>
                            {props.meal ? props.meal.name : "Select Meal"}
                        </div>
                        <div className="link">
                            {props.meal && props.meal.link &&
                                <form action={props.meal.link}>
                                    <button type="submit" className="button"><FontAwesomeIcon icon={faExternalLink} /></button>
                                </form>
                            }
                        </div>
                    </div>
                </div>
            </div>
            {/* <div className="bottom">
                Lunch:
            </div> */}
            <div className="bottom">
                <div>Last Week: </div><div style={{marginLeft:"10px", fontWeight:"normal"}}>{props.lastWeek ? props.lastWeek.name : "None"}</div>
            </div>
        </div>
    )
}