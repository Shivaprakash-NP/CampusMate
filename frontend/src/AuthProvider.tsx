import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { checkAuth, loginUser, logoutUser, signupUser } from "./api/authApi"

type AuthContextType = {
  isAuthenticated: boolean,
  login: (email: string, password: string) => Promise<void>,
  signup: (name: string, email: string, password: string) => Promise<void>, // <-- Added signup type
  logout: () => Promise<void>,
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
  const login = async (email: string, password: string) => {
    try {
        await loginUser({email, password});
        setIsAuthenticated(true);
        return Promise.resolve();
    } catch (error) {
        console.error("Login failed");
        return Promise.reject(error);
    }
  }

  // 3. Signup Function (NEW)
  const signup = async (name: string, email: string, password: string) => {
    try {
        await signupUser({ name, email, password });
        // The backend sets the cookie, and we immediately update the React state!
        setIsAuthenticated(true); 
        return Promise.resolve();
    } catch (error) {
        console.error("Signup failed");
        return Promise.reject(error);
    }
  }

  // 4. Logout Function
  const logout = async () => {
    try {
        await logoutUser();
    } catch (error) {
        console.error("Logout API call failed", error);
    } finally {
        setIsAuthenticated(false);
    }
  }

  if(loading) return <h2>Loading...</h2>

  return(
    <AuthContext.Provider value={{isAuthenticated, login, signup, logout, loading}}>
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