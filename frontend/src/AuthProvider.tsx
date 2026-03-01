import { createContext, useContext, useEffect, useState, type ReactNode } from "react"
import { checkAuth, loginUser, logoutUser, signupUser } from "./api/authApi"

// 1. Update the Type to include the new fields
type AuthContextType = {
  isAuthenticated: boolean,
  login: (email: string, password: string) => Promise<void>,
  signup: (
    name: string, 
    email: string, 
    password: string, 
    extra: { year: string; branch: string; college: string } // Added extra details
  ) => Promise<void>, 
  logout: () => Promise<void>,
  loading: boolean
}

const AuthContext = createContext<AuthContextType | null>(null)

const AuthProvider = ({children}: {children: ReactNode}) => {

  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

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

  // 2. Updated Signup Function to pass extra fields to the API
  const signup = async (
    name: string, 
    email: string, 
    password: string, 
    extra: { year: string; branch: string; college: string }
  ) => {
    try {
        // We spread the 'extra' object so all fields go to your signupUser API call
        await signupUser({ 
          name, 
          email, 
          password, 
          ...extra 
        });
        
        setIsAuthenticated(true); 
        return Promise.resolve();
    } catch (error) {
        console.error("Signup failed", error);
        return Promise.reject(error);
    }
  }

  const logout = async () => {
    try {
        await logoutUser();
    } catch (error) {
        console.error("Logout API call failed", error);
    } finally {
        setIsAuthenticated(false);
    }
  }

  if(loading) return (
    <div className="min-h-screen bg-[#0b1220] flex items-center justify-center text-white">
      <h2 className="text-xl font-medium animate-pulse">Loading...</h2>
    </div>
  )

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