import React, { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, Lock, ArrowLeft, Eye, EyeOff, Shield, Check, X } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import uciaLogo from "@/assets/ucia-logo.png"

interface ForgotPasswordFormData {
  email: string
  tempPassword: string
  newPassword: string
  confirmPassword: string
}

const ForgotPassword = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    temp: false,
    new: false,
    confirm: false
  })
  const navigate = useNavigate()
  const { toast } = useToast()

  const form = useForm<ForgotPasswordFormData>()

  const togglePasswordVisibility = (field: 'temp' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const handleSubmit = async (data: ForgotPasswordFormData) => {
    setIsLoading(true)
    setError(null)

    // Validation
    if (!data.email.trim() || !data.tempPassword.trim() || !data.newPassword.trim() || !data.confirmPassword.trim()) {
      setError("Please fill in all fields.")
      setIsLoading(false)
      return
    }

    if (data.newPassword !== data.confirmPassword) {
      setError("Passwords do not match.")
      setIsLoading(false)
      return
    }

    // Password strength validation
    const passwordRequirements = {
      length: data.newPassword.length >= 8,
      number: /\d/.test(data.newPassword),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(data.newPassword),
      uppercase: /[A-Z]/.test(data.newPassword)
    }

    const isPasswordStrong = Object.values(passwordRequirements).every(Boolean)
    if (!isPasswordStrong) {
      setError("Password must meet all security requirements.")
      setIsLoading(false)
      return
    }

    try {
      // Call forgot password edge function
      const { data: result, error: functionError } = await supabase.functions.invoke('forgot-password', {
        body: {
          email: data.email,
          tempPassword: data.tempPassword,
          newPassword: data.newPassword
        }
      })

      if (functionError || result?.error) {
        throw new Error(result?.error || functionError?.message || 'Password reset failed')
      }

      setSuccess(true)
      toast({
        title: "Password Reset Successful",
        description: "Your password has been updated. Redirecting to sign in...",
        duration: 3000,
      })

      // Redirect to sign in after 3 seconds
      setTimeout(() => {
        navigate('/auth')
      }, 3000)

    } catch (error: any) {
      console.error('Password reset error:', error)
      setError(error.message || "An unexpected error occurred. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-6">
        <div className="w-full max-w-md">
          <Card className="bg-white/95 backdrop-blur-sm shadow-hero border-0">
            <CardHeader className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle className="text-2xl text-green-700">Password Updated!</CardTitle>
              <CardDescription>
                Your password has been successfully changed. You will be redirected to the sign-in page in a few seconds.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-card">
            <img 
              src={uciaLogo}
              alt="UC Investments Academy Logo" 
              className="h-12 w-12 object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Reset Your Password</h1>
          <p className="text-white/90">Use your temporary password to set up a new secure password</p>
        </div>

        <Card className="bg-white/95 backdrop-blur-sm shadow-hero border-0">
          <CardHeader className="text-center pb-4">
            <Shield className="h-8 w-8 text-academy-blue mx-auto mb-2" />
            <CardTitle className="text-2xl text-academy-blue">Forgot Password</CardTitle>
            <CardDescription>Enter your email and temporary password to create a new password</CardDescription>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
              {error && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-academy-grey" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    className="pl-10"
                    {...form.register("email", { required: true })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="tempPassword">Current/Temp Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-academy-grey" />
                  <Input
                    id="tempPassword"
                    type={showPasswords.temp ? "text" : "password"}
                    placeholder="Enter your temporary password"
                    className="pl-10 pr-10"
                    {...form.register("tempPassword", { required: true })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('temp')}
                  >
                    {showPasswords.temp ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
                <p className="text-xs text-academy-grey">This was provided in your acceptance email</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-academy-grey" />
                  <Input
                    id="newPassword"
                    type={showPasswords.new ? "text" : "password"}
                    placeholder="Enter your new password"
                    className="pl-10 pr-10"
                    {...form.register("newPassword", { required: true })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('new')}
                  >
                    {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-academy-grey" />
                  <Input
                    id="confirmPassword"
                    type={showPasswords.confirm ? "text" : "password"}
                    placeholder="Confirm your new password"
                    className="pl-10 pr-10"
                    {...form.register("confirmPassword", { required: true })}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('confirm')}
                  >
                    {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>

              {form.watch("newPassword") && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Password Requirements</Label>
                  <div className="space-y-1">
                    {[
                      { key: 'length', text: 'At least 8 characters', valid: form.watch("newPassword")?.length >= 8 },
                      { key: 'number', text: 'Contains a number', valid: /\d/.test(form.watch("newPassword") || '') },
                      { key: 'special', text: 'Contains a special character', valid: /[!@#$%^&*(),.?":{}|<>]/.test(form.watch("newPassword") || '') },
                      { key: 'uppercase', text: 'Contains an uppercase letter', valid: /[A-Z]/.test(form.watch("newPassword") || '') },
                      { key: 'match', text: 'Passwords match', valid: form.watch("newPassword") === form.watch("confirmPassword") && form.watch("confirmPassword") !== '' }
                    ].map(({ key, text, valid }) => (
                      <div key={key} className="flex items-center gap-2 text-sm">
                        {valid ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <X className="h-3 w-3 text-red-500" />
                        )}
                        <span className={valid ? "text-green-700" : "text-red-700"}>
                          {text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button 
                type="submit" 
                className="w-full bg-academy-blue hover:bg-academy-blue-dark text-white"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Updating Password...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Reset Password
                  </>
                )}
              </Button>

              <div className="text-center">
                <Link 
                  to="/auth" 
                  className="inline-flex items-center text-sm text-academy-blue hover:text-academy-blue-dark"
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  Back to Sign In
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ForgotPassword