import "./Day.css"

export default function Day(props) {
    return (
        <div className="container">
            <div>
                <div className="day-pic">
                    <img src="https://usmenuguide.com/wp-content/uploads/2019/07/GondolierItalianEateryboulder4.jpg" />
                </div>
            </div>
            <div className="day-info">
                {[props.weekday, ": ", props.meal]}
            </div>
        </div>
    )
}