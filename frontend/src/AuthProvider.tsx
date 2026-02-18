import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { checkAuth } from "./api/authApi"
import axiosInstance from "./api/axios"
import { LoaderCircle } from "lucide-react"

type AuthContextType = {
  isAuthenticated: boolean,
  login: () => void,
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)


const AuthProvider = ({children}: {children: ReactNode}) => {

  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)


  useEffect(()=>{
    checkAuth()
      .then(()=> setIsAuthenticated(true))
      .catch(() => setIsAuthenticated(false))
      .finally(() => setLoading(false))
  },[])

  const login = () => {
    setIsAuthenticated(true)
  }

  const logout = async () => {
    await axiosInstance.post("/auth/logout")
    setIsAuthenticated(false)
  }

 if(loading) return <><h2>LOADING...</h2></>

  return(
    <AuthContext.Provider value={{isAuthenticated,login,logout}}>
      {children}
    </AuthContext.Provider>
  )

}

export const useAuth = () =>{
   const context = useContext(AuthContext)

  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider")
  }

  return context
}

export default AuthProvider

