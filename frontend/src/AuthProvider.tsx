import { createContext, useContext, useState, type ReactNode } from "react"

type AuthContextType = {
  isAuthenticated: boolean,
  login: () => void,
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)


const AuthProvider = ({children}: {children: ReactNode}) => {

  const [isAuthenticated,setIsAuthenticated] = useState(
    localStorage.getItem("isAutheticated") === "true"
  )

  const login = () => {
    setIsAuthenticated(true)
    localStorage.setItem("isAuthenticated","true")
  }

  const logout = () =>{
    setIsAuthenticated(false)
    localStorage.setItem("isAuthenticated","false")
  }

  return(
    <AuthContext.Provider value={{isAuthenticated,login,logout}}>
      {children}
    </AuthContext.Provider>
  )

}

export const useAuth = () => useContext(AuthContext);

export default AuthProvider

