import { useAuth } from "@/AuthProvider"
import { mockSchedule, mockTopic } from "@/shared/mockData";
import type { Schedule, Topic } from "@/shared/types";
import { useState } from "react";
import TopicsTable from "./TopicsTable";

const Dashboard = () => {
     const [topics,setTopics] = useState<Topic[]>(mockTopic);

     const toggleStatusTopic = (topicId: string)=> {
        setTopics((prevTopics: Topic[]) => 
          prevTopics.map((topic: Topic) => 
            topic.id===topicId ? {...topic,completed: !topic.completed} : topic
          )
        )
     }  
    const {logout} = useAuth()!

    return (
        <>
            <h1>Dashboard</h1>

            <button onClick={()=> logout()}>Logout</button>
            <br />
            <TopicsTable topics={topics} toggleStatus={toggleStatusTopic}/> 
        </>
        
    )
}

export default Dashboard