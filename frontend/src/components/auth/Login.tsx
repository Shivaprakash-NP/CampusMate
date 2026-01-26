import AuthCard from "./AuthCard"
import { Label } from "../ui/label"
import { Input } from "../ui/input"

const Login = () => {
    return (
        <>
        
          <AuthCard title="Login">
                 <form>
          <div className="flex flex-col gap-6">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="sarvesh@gmail.com"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <a
                  href="#"
                  className="ml-auto inline-block text-sm underline-offset-4 hover:underline"
                >
                  Forgot your password?
                </a>
              </div>
              <Input id="password" type="password" required />
            </div>
          </div>
        </form>
            </AuthCard>
            
        </>
    )
}

export default Login