import { Input } from "../ui/input"
import { Label } from "../ui/label"
import AuthCard from "./AuthCard"


const Signup = ()=>{
    return(
        <>
        <AuthCard title="Signup">
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
              </div>
              <Input id="password" type="password" required />
            </div>
             <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Reenter Password</Label>
              </div>
              <Input id="password" type="password" required />
            </div>
          </div>
        </form>
            </AuthCard>
        </>
    )
}

export default Signup