import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import AuthCard from "./AuthCard"
import { loginUser } from "@/api/authApi"
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

  const handleSubmit = async () => {
    setError(null)
    
    // ADD THIS VALIDATION
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
    <AuthCard title="Login" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-6">

        {/* Email */}
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="sarvesh@gmail.com"
            required
            value={form.email}
            onChange={handleChange}
          />
        </div>

        {/* Password */}
        <div className="grid gap-2">
          <div className="flex items-center">
            <Label htmlFor="password">Password</Label>
            <a
              href="#"
              className="ml-auto text-sm underline-offset-4 hover:underline"
            >
              Forgot password?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            required
            value={form.password}
            onChange={handleChange}
          />
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-sm text-red-500">
            {error}
          </p>
        )}

        {/* Loading */}
        {loading && (
          <p className="text-sm text-muted-foreground">
            Logging in...
          </p>
        )}

      </div>
    </AuthCard>
  )
}

export default Login
