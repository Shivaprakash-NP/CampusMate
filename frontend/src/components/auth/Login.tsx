import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import AuthCard from "./AuthCard"
import { useAuth } from "@/AuthProvider"

const Login = () => {
  const navigate = useNavigate()
  const { login } = useAuth()

  const [form, setForm] = useState({
    email: "",
    password: "",
  })

  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({
      ...form,
      [e.target.id]: e.target.value,
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent page reload
    setError(null)
    
    if (!form.email || !form.password) {
        setError("Please enter both email and password.");
        return;
    }

    try {
      setLoading(true)
      await login(form.email, form.password) 
      navigate("/dashboard")
    } catch (err: any) {
      setError("Invalid email or password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthCard 
      title="Welcome back" 
      subtitle="Enter your credentials to sign in to your account"
      buttonText="Sign In"
      loading={loading}
      onSubmit={handleSubmit}
      footerText="Don't have an account?"
      footerLinkText="Sign up"
      footerLinkHref="/signup"
    >
      <div className="flex flex-col gap-5">
        
        {/* Email */}
        <div className="grid gap-2">
          <Label htmlFor="email" className="text-white/80">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="sarvesh@example.com"
            required
            value={form.email}
            onChange={handleChange}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-[#38bdf8]"
          />
        </div>

        {/* Password */}
        <div className="grid gap-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-white/80">Password</Label>
            <a
              href="#"
              className="text-xs text-[#38bdf8] hover:underline transition-colors"
            >
              Forgot password?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            required
            value={form.password}
            onChange={handleChange}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-[#38bdf8]"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-sm text-red-400">
            {error}
          </div>
        )}

      </div>
    </AuthCard>
  )
}

export default Login