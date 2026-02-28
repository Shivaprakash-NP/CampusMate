import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'

import App from './App.tsx'
import Dashboard from './components/Dashboard.tsx'
import Login from './components/auth/Login.tsx'
import Signup from './components/auth/Signup.tsx'
import Notfound from './components/Notfound.tsx'
import AuthProvider from './AuthProvider.tsx'
import ProtectedRoute from './components/routes/ProtectedRoute.tsx'
import PublicRoute from './components/routes/PublicRoute.tsx'
import Onboarding from './components/Onboarding.tsx'
import RouteRedirect from './components/routes/RouteRedirect.tsx'
import LandingPage from './components/Landing/LandingPage.tsx'
import FileUpload from './components/FileUpload.tsx' 
import Chat from './components/Chat/Chat.tsx'

const router = createBrowserRouter([
  {path: '/', element: <RouteRedirect/>},
  {path: '/landing', element: <LandingPage/>},
  {path: '/dashboard', element:<ProtectedRoute> <Dashboard/></ProtectedRoute>},
  {path: '/app', element: <ProtectedRoute> <App/></ProtectedRoute> },   
  {path: '/login', element: <PublicRoute><Login/></PublicRoute>},
  {path: '/signup', element: <PublicRoute><Signup/></PublicRoute>},
  {path: '/onboarding', element: <Onboarding/>},
  {path: '/study-plan', element: <ProtectedRoute> <FileUpload/></ProtectedRoute> },
  {path: '/chat',element:<ProtectedRoute><Chat/></ProtectedRoute>},
  {path: '*', element: <Notfound/>}
])

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router}/>
    </AuthProvider>
  </StrictMode>
)