import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import AuthCard from "./AuthCard"
import { useAuth } from "@/AuthProvider" // Pull directly from AuthProvider now

const Signup = (name: string, email: string, password: string) => {
  const navigate = useNavigate()

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    name: "" 
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
    
    // ADD THIS VALIDATION
    if (!form.name || !form.email || !form.password || !form.confirmPassword) {
        setError("Please fill out all fields.");
        return;
    }
  
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    try {
      setLoading(true);
      await Signup(form.name, form.email, form.password);
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

        {error && (
          <p className="text-sm text-red-500">
            {error}
          </p>
        )}

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