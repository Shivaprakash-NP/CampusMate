import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import AuthCard from "./AuthCard"
import { useAuth } from "@/AuthProvider" 

const Signup = () => {
  const navigate = useNavigate()
  const { signup } = useAuth()!

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
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
      await signup(form.name, form.email, form.password);
      navigate("/dashboard");
    } catch (err: any) {
      setError("Signup failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard 
      title="Create an account" 
      subtitle="Join CampusMate to start organizing your studies"
      buttonText="Sign Up"
      loading={loading}
      onSubmit={handleSubmit}
      footerText="Already have an account?"
      footerLinkText="Sign in"
      footerLinkHref="/login"
    >
      <div className="flex flex-col gap-5">

        <div className="grid gap-2">
          <Label htmlFor="name" className="text-white/80">Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="Sarvesh"
            required
            value={form.name}
            onChange={handleChange}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-[#38bdf8]"
          />
        </div>

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

        <div className="grid gap-2">
          <Label htmlFor="password" className="text-white/80">Password</Label>
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

        <div className="grid gap-2">
          <Label htmlFor="confirmPassword" className="text-white/80">Re-enter Password</Label>
          <Input
            id="confirmPassword"
            type="password"
            placeholder="••••••••"
            required
            value={form.confirmPassword}
            onChange={handleChange}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-[#38bdf8]"
          />
        </div>

        {error && (
          <div className="p-3 rounded-md bg-red-500/10 border border-red-500/20 text-sm text-red-400">
            {error}
          </div>
        )}

      </div>
    </AuthCard>
  )
}

export default Signup