/* <h1>{schedule.id}</h1>
   {schedule.days.map((day)=>{
    return (
    <div key={day.date}>
      <p>{day.date}</p>
      <ul>
        {day.topics.map((topic)=>{
          return (
            <div key={topic.id}>
            <li>{topic.title}</li>
            <p>{topic.completed ? "Completed" : "Not Completed"}</p>
            <button onClick={() => toggleStatusSchedule(day.date,topic.id)}>Click</button>
            </div>
          );
          
        })}
      </ul>
    </div>);
    
   })}
*/