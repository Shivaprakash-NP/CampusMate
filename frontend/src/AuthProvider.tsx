import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { checkAuth, loginUser, logoutUser } from "./api/authApi"

type AuthContextType = {
  isAuthenticated: boolean,
  login: (email:string, password:string) => Promise<void>,
  logout: () => Promise<void>, // Updated return type
  loading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

const AuthProvider = ({children}: {children: ReactNode}) => {

  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  // 1. Check if user is already logged in
  useEffect(() => {
    const verifyUser = async () => {
        try {
            await checkAuth(); 
            setIsAuthenticated(true);
        } catch (error) {
            setIsAuthenticated(false);
        } finally {
            setLoading(false);
        }
    };
    verifyUser();
  }, [])

  // 2. Login Function
  const login = async (email:string, password:string) => {
    try {
        await loginUser({email, password});
        setIsAuthenticated(true);
        return Promise.resolve();
    } catch (error) {
        console.error("Login failed");
        return Promise.reject(error);
    }
  }

  // 3. Logout Function (FIXED)
  const logout = async () => {
    try {
        await logoutUser();
    } catch (error) {
        // Even if the server gives 500 or 401, we just log it
        console.error("Logout API call failed", error);
    } finally {
        // We ALWAYS clear the local state to kick the user out
        setIsAuthenticated(false);
    }
  }

  if(loading) return <h2>Loading...</h2>

  return(
    <AuthContext.Provider value={{isAuthenticated, login, logout, loading}}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
   const context = useContext(AuthContext)
   if (!context) throw new Error("useAuth must be used inside AuthProvider")
   return context
}

export default AuthProvider