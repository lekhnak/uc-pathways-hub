import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Eye, EyeOff, Lock, Mail, Shield, Check, X } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'
import { useNavigate } from 'react-router-dom'

const ChangePassword = () => {
  const [formData, setFormData] = useState({
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const navigate = useNavigate()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  // Password validation
  const passwordValidation = {
    length: formData.newPassword.length >= 8,
    number: /\d/.test(formData.newPassword),
    special: /[!@#$%^&*(),.?":{}|<>]/.test(formData.newPassword),
    match: formData.newPassword === formData.confirmPassword && formData.confirmPassword !== ''
  }

  const isPasswordValid = Object.values(passwordValidation).every(Boolean)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.email.trim() || !formData.currentPassword.trim() || !formData.newPassword.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    if (!isPasswordValid) {
      toast({
        title: "Invalid Password",
        description: "Please ensure your new password meets all requirements.",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      // First verify the current credentials by attempting to sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.currentPassword
      })

      if (signInError) {
        throw new Error('Invalid email or current password')
      }

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: formData.newPassword
      })

      if (updateError) {
        throw updateError
      }

      toast({
        title: "Password Changed Successfully",
        description: "Your password has been updated. You can now use your new password to log in.",
        duration: 5000,
      })

      // Redirect to main dashboard after successful password change
      navigate('/')

    } catch (error: any) {
      console.error('Error changing password:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to change password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Change Password</h1>
          <p className="text-muted-foreground mt-2">
            Enter your temporary password and create a new secure password
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Password Update
            </CardTitle>
            <CardDescription>
              Use your temporary credentials to set up a new password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email Address
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="currentPassword" className="flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Current/Temporary Password
                </Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type={showPasswords.current ? "text" : "password"}
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    placeholder="Enter your temporary password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('current')}
                  >
                    {showPasswords.current ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="newPassword">New Password</Label>
                <div className="relative">
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type={showPasswords.new ? "text" : "password"}
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    placeholder="Enter your new password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('new')}
                  >
                    {showPasswords.new ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative">
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showPasswords.confirm ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm your new password"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => togglePasswordVisibility('confirm')}
                  >
                    {showPasswords.confirm ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {formData.newPassword && (
                <div className="space-y-2">
                  <Label className="text-sm font-medium">Password Requirements</Label>
                  <div className="space-y-1">
                    {[
                      { key: 'length', text: 'At least 8 characters', valid: passwordValidation.length },
                      { key: 'number', text: 'Contains a number', valid: passwordValidation.number },
                      { key: 'special', text: 'Contains a special character', valid: passwordValidation.special },
                      { key: 'match', text: 'Passwords match', valid: passwordValidation.match }
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
                disabled={loading || !isPasswordValid}
                className="w-full"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Changing Password...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Change Password
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                After changing your password, you'll be redirected to the dashboard
              </p>
              <p className="text-xs text-muted-foreground">
                Having trouble? Contact support for assistance
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default ChangePassword