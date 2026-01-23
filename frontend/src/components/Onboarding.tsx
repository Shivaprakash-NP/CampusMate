import { useNavigate } from "react-router-dom"
import {Button} from "../components/ui/button"
import { useAuth } from "@/AuthProvider"
const Onboarding = () => {

    const navigate = useNavigate()
    const {isAuthenticated} = useAuth()!

    return(
        <>
            <div className="content ml-100">
            <h2>Choose between two modes</h2>
            <Button onClick={() => navigate(isAuthenticated ? "/dashboard" : "/login")}>Self paced</Button>
            <Button>Exam mode</Button>
            </div>
        </>
    )
}

export default Onboarding