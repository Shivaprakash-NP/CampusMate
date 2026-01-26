import { useAuth } from "@/AuthProvider"
import { use, type ReactNode } from "react"
import { Navigate } from "react-router-dom"

const PublicRoute = ({children}:{children:ReactNode})=>{

    const {isAuthenticated} = useAuth()!
    if(isAuthenticated) return(
        <Navigate to={'/dashboard'}/>
    )

    return <>{children}</>

}

export default PublicRoute