import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Lock, AlertCircle } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"
import uciaLogo from "@/assets/ucia-logo.png"

interface SignInFormData {
  email: string
  password: string
}

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { toast } = useToast()
  const { setUser } = useAuth()

  const signInForm = useForm<SignInFormData>()

  useEffect(() => {
    // Check if user is already logged in via localStorage
    const userData = localStorage.getItem('user')
    if (userData) {
      navigate("/")
    }
  }, [navigate])

  const handleSignIn = async (data: SignInFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      // Use profile-login edge function for authentication
      const { data: result, error: functionError } = await supabase.functions.invoke('profile-login', {
        body: {
          email: data.email,
          password: data.password
        }
      })

      if (functionError || result?.error) {
        throw new Error(result?.error || functionError?.message || 'Sign in failed')
      }

      // Store user data in localStorage for session management
      localStorage.setItem('user', JSON.stringify(result.user))
      
      // Update the auth context immediately
      setUser(result.user)
      
      toast({
        title: "Welcome back!",
        description: "You have successfully signed in.",
      })
      navigate("/")
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div 
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-academy-blue via-academy-blue-dark to-academy-blue-darker px-4 sm:px-6 lg:px-8"
      style={{
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
      }}
    >
      <div className="w-full max-w-md">
        {/* Logo and branding */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img 
              src={uciaLogo}
              alt="UC Investments Academy Logo" 
              className="h-12 w-12 object-contain"
            />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">UC Investments Academy</h1>
          <p className="text-white/90 text-lg">Building the next generation of finance leaders</p>
        </div>

        <Card className="bg-white/95 backdrop-blur-sm shadow-hero border-0">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-3xl text-academy-blue">Welcome</CardTitle>
            <CardDescription className="text-lg">Sign in to access your learner dashboard</CardDescription>
          </CardHeader>
          
          <CardContent>
            {error && (
              <Alert className="mb-6 border-red-200 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-700">{error}</AlertDescription>
              </Alert>
            )}

            <form onSubmit={signInForm.handleSubmit(handleSignIn)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="signin-email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-academy-grey" />
                  <Input
                    id="signin-email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    {...signInForm.register("email", { required: true })}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signin-password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-academy-grey" />
                  <Input
                    id="signin-password"
                    type="password"
                    placeholder="Enter your password"
                    className="pl-10"
                    {...signInForm.register("password", { required: true })}
                  />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full bg-academy-blue hover:bg-academy-blue-dark text-white"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>

              <div className="text-center mt-4">
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-sm text-academy-blue hover:text-academy-blue-dark underline"
                >
                  Setup your password here
                </button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Auth