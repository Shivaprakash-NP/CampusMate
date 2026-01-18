import { Children, createContext, StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, createBrowserRouter, RouterProvider } from 'react-router-dom'
import './index.css'
import App from './App.tsx'
import Dashboard from './components/Dashboard.tsx'
import Login from './components/auth/Login.tsx'
import Signup from './components/auth/Signup.tsx'
import Notfound from './components/Notfound.tsx'
import AuthProvider from './AuthProvider.tsx'
import ProtectedRoute from './components/ProtectedRoute.tsx'
import PublicRoute from './components/PublicRoute.tsx'

const router = createBrowserRouter([
  {path: '/',element: <App/>},
  {path: '/dashboard', element: <ProtectedRoute><Dashboard/></ProtectedRoute>},
  {path: '/login',element: <PublicRoute><Login/></PublicRoute>},
  {path: '/signup', element: <PublicRoute><Signup/></PublicRoute>},
  {path: '*',element: <Notfound/>}
])


createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <RouterProvider router={router}/>
    </AuthProvider>
    
  </StrictMode>
)
