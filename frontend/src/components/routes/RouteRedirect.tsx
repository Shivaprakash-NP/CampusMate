import { useAuth } from "@/AuthProvider"
import { Navigate } from "react-router-dom"

const RouteRedirect = () => {

    const {isAuthenticated} = useAuth()!

    if(isAuthenticated) {
        return <Navigate to="/dashboard" replace />
    }else{
        return <Navigate to="/landing" replace/>
    }

}

export default RouteRedirect