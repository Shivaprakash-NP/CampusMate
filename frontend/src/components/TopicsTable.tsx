import type {Schedule, Topic} from '../shared/types'
import { OverallProgress } from './ProgressBar'

export type TopicProp = {
    topics: Topic[],
    toggleStatus: (topicId: string) => void
}

const TopicsTable = (props: TopicProp)=>{
 
    const completed= props.topics.filter((top) => top.completed===true)
    const completedno=completed.length
    const totalno=props.topics.length

    return(
        <>
            <OverallProgress percentage={100} completed={completedno} total={totalno} />
            <table className='topicTable'>
                <thead>
                <tr>
                    <th>S.no</th>
                    <th>Topic</th>
                    <th>Resources</th>
                    <th>Difficulty</th>
                    <th>Status</th>
               </tr>
                </thead>
              
                <tbody>
                     { props.topics.map((topic) => {
                        const article = topic.resource.find(r => r.type === "article")
                        const video = topic.resource.find(r => r.type === "video")

                            return (
                                <tr key={topic.id}>
                                <td>{topic.id}</td>
                                <td>{topic.title}</td>

                               
                                <td>
                                    <div>
                                        Article:{" "}
                                    {article ? (
                                        <a href={article.url}>{article.title}</a>
                                    ) : (
                                        <span>No article</span>
                                    )}
                                    </div>

                                    <div>
                                        Video:{" "}
                                    {video ? (
                                        <a href={video.url}>{video.title}</a>
                                    ) : (
                                        <span>No video</span>
                                    )}
                                    </div>
                                </td>

                                <td>{topic.difficulty}</td>

                                <td>
                                    <input type="checkbox" checked={topic.completed} onChange={() => props.toggleStatus(topic.id)}/>
                                    {topic.completed ? " Completed" : " Pending"}
                                </td>
                                </tr>
                            )
                            })}
                    
                </tbody>
               

            </table>
        </>
    )
}


export default TopicsTable

