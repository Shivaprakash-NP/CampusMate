import { useState } from 'react'
import './App.css'
import type { Schedule, Topic } from './shared/types'
import { mockSchedule, mockTopic } from './shared/mockData'
import TopicsTable from './components/TopicsTable.tsx';
import Login from './components/auth/Login.tsx';
import Signup from './components/auth/Signup.tsx';

function App() {
 const [schedule, setSchedule] = useState<Schedule>(mockSchedule);
 const [topics,setTopics] = useState<Topic[]>(mockTopic);

 const toggleStatusSchedule = (dayDate:string, topicID:string) => {
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


 const toggleStatusTopic = (topicId: string)=> {
    setTopics((prevTopics: Topic[]) => 
      prevTopics.map((topic: Topic) => 
        topic.id===topicId ? {...topic,completed: !topic.completed} : topic
      )
    )
 }  

 return (
  <>
   <Login></Login>   
   <Signup></Signup>
   <br />
   <br />
   <br />
   <TopicsTable topics={topics} toggleStatus={toggleStatusTopic}/> 
   </>
 
 );

}

export default App
