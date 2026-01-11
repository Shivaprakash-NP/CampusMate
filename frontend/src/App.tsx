import { useState } from 'react'
import './App.css'
import type { Schedule, Topic } from './shared/types'
import { mockSchedule } from './shared/mockData'

function App() {
 const [schedule, setSchedule] = useState<Schedule>(mockSchedule);

 const toggleStatus = (dayDate:string, topicID:string) => {
    setSchedule({
      ...schedule,
      days: schedule.days.map((day)=>
        day.date===dayDate ? {
          ...day,
          topics: day.topics.map(topic => 
            topic.id === topicID ? {...topic,completed: !topic.completed} : topic
          )
        } : day
      )
    })
 }

 return (
  <>
   <h1>{schedule.id}</h1>
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
            <button onClick={() => toggleStatus(day.date,topic.id)}>Click</button>
            </div>
          );
          
        })}
      </ul>
    </div>);
    
   })}
   </>
 
 );

}

export default App
