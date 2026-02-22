import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import AuthCard from "./AuthCard"
import { signupUser } from "@/api/authApi"
import { useAuth } from "@/AuthProvider"

const Signup = () => {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "" // Added name field since your DTO has it
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
    setError(null);
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);

      // 1. This call sets the HttpOnly cookie in the browser automatically
      await signupUser({
        name: form.name,
        email: form.email,
        password: form.password,
      });

      // 2. DO NOT call login(email, password) here.
      // Instead, just update your local state. 
      // If your useAuth() has a function like 'checkStatus' or 'setUser', use that.
      // If 'login' is the only way to set the state, you might need to refactor 
      // the AuthProvider to have a 'setAuthenticated(true)' method.
      
      navigate("/dashboard");
    } catch (err: any) {
      setError("Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title="Signup" onSubmit={handleSubmit}>
      <div className="flex flex-col gap-6">

        {/* Name Field (Optional but good practice since your DTO has it) */}
        <div className="grid gap-2">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="John Doe"
            required
            value={form.name}
            onChange={handleChange}
          />
        </div>

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
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            required
            value={form.password}
            onChange={handleChange}
          />
        </div>

        {/* Confirm Password */}
        <div className="grid gap-2">
          <Label htmlFor="confirmPassword">Re-enter Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            required
            value={form.confirmPassword}
            onChange={handleChange}
          />
        </div>

        {/* Error Message */}
        {error && (
          <p className="text-sm text-red-500">
            {error}
          </p>
        )}

        {/* Loading State */}
        {loading && (
          <p className="text-sm text-muted-foreground">
            Creating account...
          </p>
        )}

      </div>
    </AuthCard>
  )
}

export default Signup