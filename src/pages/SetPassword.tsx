import React, { useState, useEffect } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Eye, EyeOff, Check, X, Lock } from 'lucide-react'

const SetPassword = () => {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { toast } = useToast()
  
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [validatingToken, setValidatingToken] = useState(true)
  const [tokenValid, setTokenValid] = useState(false)
  const [email, setEmail] = useState('')

  const token = searchParams.get('token')

  // Password validation rules
  const hasMinLength = password.length >= 8
  const hasNumber = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  const passwordsMatch = password === confirmPassword && password.length > 0

  const passwordStrength = [hasMinLength, hasNumber, hasSpecialChar].filter(Boolean).length
  const getStrengthColor = () => {
    if (passwordStrength === 0) return 'bg-gray-200'
    if (passwordStrength === 1) return 'bg-red-500'
    if (passwordStrength === 2) return 'bg-orange-500'
    return 'bg-green-500'
  }

  const getStrengthText = () => {
    if (passwordStrength === 0) return 'Enter password'
    if (passwordStrength === 1) return 'Weak'
    if (passwordStrength === 2) return 'Good'
    return 'Strong'
  }

  useEffect(() => {
    validateToken()
  }, [token])

  const validateToken = async () => {
    if (!token) {
      toast({
        title: "Invalid Link",
        description: "No token provided. Please use the link from your email.",
        variant: "destructive",
      })
      setValidatingToken(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('password_reset_tokens')
        .select('email, expires_at, used')
        .eq('token', token)
        .single()

      if (error || !data) {
        toast({
          title: "Invalid Token",
          description: "This link is invalid or has expired.",
          variant: "destructive",
        })
        setValidatingToken(false)
        return
      }

      if (data.used) {
        toast({
          title: "Link Already Used",
          description: "This password setup link has already been used.",
          variant: "destructive",
        })
        setValidatingToken(false)
        return
      }

      if (new Date(data.expires_at) < new Date()) {
        toast({
          title: "Link Expired",
          description: "This password setup link has expired. Please contact an administrator.",
          variant: "destructive",
        })
        setValidatingToken(false)
        return
      }

      setEmail(data.email)
      setTokenValid(true)
    } catch (error) {
      console.error('Token validation error:', error)
      toast({
        title: "Error",
        description: "Unable to validate the token. Please try again.",
        variant: "destructive",
      })
    } finally {
      setValidatingToken(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!hasMinLength || !hasNumber || !hasSpecialChar || !passwordsMatch) {
      toast({
        title: "Invalid Password",
        description: "Please ensure your password meets all requirements and passwords match.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // Sign up the user with the email and new password
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        }
      })

      if (signUpError) throw signUpError

      // Mark token as used
      const { error: tokenError } = await supabase
        .from('password_reset_tokens')
        .update({ used: true })
        .eq('token', token)

      if (tokenError) {
        console.error('Token update error:', tokenError)
      }

      // Auto-login the user
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (signInError) {
        console.error('Auto sign-in error:', signInError)
        toast({
          title: "Password Set Successfully",
          description: "Your password has been set. Please sign in with your credentials.",
        })
        navigate('/auth')
        return
      }

      toast({
        title: "Welcome!",
        description: "Your password has been set and you're now logged in.",
      })
      
      navigate('/')
    } catch (error: any) {
      console.error('Password setup error:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to set password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  if (validatingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-[400px]">
          <CardContent className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Validating your link...</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!tokenValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-[400px]">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Invalid Link</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              This password setup link is invalid, expired, or has already been used.
            </p>
            <Button onClick={() => navigate('/')} variant="outline">
              Return to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-[450px]">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-primary/10 rounded-full w-fit">
            <Lock className="h-6 w-6 text-primary" />
          </div>
          <CardTitle>Set Your Password</CardTitle>
          <CardDescription>
            Create a secure password for your UC Investment Academy account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                disabled
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">New Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your new password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              
              {password && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
                        style={{ width: `${(passwordStrength / 3) * 100}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium">{getStrengthText()}</span>
                  </div>
                  
                  <div className="space-y-1 text-sm">
                    <div className={`flex items-center gap-2 ${hasMinLength ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {hasMinLength ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      At least 8 characters
                    </div>
                    <div className={`flex items-center gap-2 ${hasNumber ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {hasNumber ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      At least one number
                    </div>
                    <div className={`flex items-center gap-2 ${hasSpecialChar ? 'text-green-600' : 'text-muted-foreground'}`}>
                      {hasSpecialChar ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                      At least one special character
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Confirm your new password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
              
              {confirmPassword && (
                <div className={`flex items-center gap-2 text-sm ${passwordsMatch ? 'text-green-600' : 'text-destructive'}`}>
                  {passwordsMatch ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  Passwords match
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={loading || !hasMinLength || !hasNumber || !hasSpecialChar || !passwordsMatch}
            >
              {loading ? "Setting Password..." : "Set Password & Sign In"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

export default SetPassword