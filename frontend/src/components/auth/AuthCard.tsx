import type React from "react";
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
  CardTitle,
} from "@/components/ui/card"
import { useAuth } from "@/AuthProvider";

export type AuthCardProps = {
    title: string,
    children: React.ReactNode
}

const AuthCard = ({title, children}: AuthCardProps)=>{
  const {login} = useAuth()!
    return (
        <>
        <Card className="w-full max-w-sm">
            <CardHeader>
                <CardTitle>{title}</CardTitle>
            </CardHeader>
            <CardContent>
                {children}
            </CardContent>
             <CardFooter className="flex-col gap-2">
        <Button type="submit" onClick={()=> login()} className="w-full">
          {title}
        </Button>
        <Button variant="outline" className="w-full">
          {title} with Google
        </Button>
      </CardFooter>
        </Card>
        </>
    )
}
export default AuthCard