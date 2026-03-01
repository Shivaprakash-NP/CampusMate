import type React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
} from "@/components/ui/card"
import { Loader2 } from "lucide-react"; // Shadcn usually uses Lucide icons

export type AuthCardProps = {
  title: string;
  subtitle: string;
  children: React.ReactNode;
  onSubmit: (e: React.FormEvent) => void;
  buttonText: string;
  loading?: boolean;
  footerText: string;
  footerLinkText: string;
  footerLinkHref: string;
}

const AuthCard = ({ 
  title, 
  subtitle, 
  children, 
  onSubmit, 
  buttonText,
  loading = false,
  footerText,
  footerLinkText,
  footerLinkHref
}: AuthCardProps) => {
  return (
    // Modern deep background with a subtle blue top-center glow
    <div className="min-h-screen flex items-center justify-center bg-[#0b1220] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(56,189,248,0.15),rgba(255,255,255,0))] p-4">
      
      <Card className="w-full max-w-[400px] border-white/10 bg-[#0f172a]/80 backdrop-blur-xl shadow-2xl text-white">
        <form onSubmit={onSubmit}>
          <CardHeader className="space-y-1 pb-6">
            <CardTitle className="text-2xl font-bold tracking-tight text-white">
              {title}
            </CardTitle>
            <CardDescription className="text-white/60">
              {subtitle}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {children}
          </CardContent>

          <CardFooter className="flex flex-col gap-4 mt-2">
            <Button 
              type="submit" 
              disabled={loading}
              className="w-full bg-[#38bdf8] hover:bg-[#38bdf8]/90 text-slate-950 font-semibold transition-all"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Please wait..." : buttonText}
            </Button>

            <div className="text-sm text-center text-white/50">
              {footerText}{" "}
              <Link 
                to={footerLinkHref} 
                className="text-[#38bdf8] hover:text-[#38bdf8]/80 hover:underline transition-colors font-medium"
              >
                {footerLinkText}
              </Link>
            </div>
          </CardFooter>
        </form>
      </Card>
      
    </div>
  )
}

export default AuthCard