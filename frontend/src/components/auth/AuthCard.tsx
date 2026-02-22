import type React from "react";
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
  CardTitle,
} from "@/components/ui/card"
export type AuthCardProps = {
  title: string
  children: React.ReactNode
  onSubmit: () => void
}

const AuthCard = ({ title, children, onSubmit }: AuthCardProps) => {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-sm">
        <CardHeader>
          <CardTitle>{title}</CardTitle>
        </CardHeader>

        <CardContent>
          {children}
        </CardContent>

        <CardFooter className="flex-col gap-2">
          <Button type="button" onClick={onSubmit}  className="w-full">
            {title}
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}

export default AuthCard
