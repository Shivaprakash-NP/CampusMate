import { useAuth } from "@/AuthProvider"

const Dashboard = () => {

    const {logout} = useAuth()!

    return (
        <>
            <h1>Dashboard</h1>
            <button onClick={()=> logout()}>Logout</button>
        </>
        
    )
}

export default Dashboard