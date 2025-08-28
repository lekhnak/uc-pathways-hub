import React, { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { UserPlus, Mail, User, Send } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'

const CreateLearnerProfile = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  })
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const generateToken = () => {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }

  const generateTempPassword = () => {
    const chars = 'ABCDEFGHJKMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
    let result = ''
    for (let i = 0; i < 12; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      })
      return
    }

    console.log('Starting learner account creation for:', formData)
    setLoading(true)

    try {
      // Generate temporary password
      const tempPassword = generateTempPassword()
      const tempUsername = formData.email // Use email as username
      
      console.log('Generated temporary credentials for:', formData.email)

      // Create user account with temporary password
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: tempPassword,
        options: {
          data: {
            first_name: formData.firstName,
            last_name: formData.lastName
          },
          emailRedirectTo: `https://preview--uc-pathways-hub.lovable.app/auth`
        }
      })

      if (authError) {
        console.error('User creation error:', authError)
        throw authError
      }

      console.log('User account created successfully')

      // Create profile record with temporary password
      const { error: profileError } = await supabase
        .from('profiles')
        .insert({
          user_id: authData.user?.id,
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email,
          temp_password: tempPassword,
          is_temp_password_used: false,
        })

      if (profileError) {
        console.error('Profile creation error:', profileError)
        throw new Error('Account created but failed to create profile')
      }

      console.log('Profile created successfully')

      // Send approval email with temporary credentials
      const { error: emailError } = await supabase.functions.invoke('gmail-send-application-approval', {
        body: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          tempUsername: tempUsername,
          tempPassword: tempPassword,
          program: 'UC Investment Academy'
        }
      })

      if (emailError) {
        console.error('Email sending error:', emailError)
        toast({
          title: "Account Created",
          description: `Learner account created successfully, but the approval email failed to send. Error: ${emailError.message || 'Unknown error'}. Please provide the temporary credentials manually.`,
          variant: "destructive",
        })
      } else {
        console.log('Approval email sent successfully')
        toast({
          title: "Account Created Successfully",
          description: `${formData.firstName} ${formData.lastName} has been added as a learner. An approval email with login credentials has been sent to ${formData.email}.`,
          duration: 5000,
        })
      }

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: ''
      })

    } catch (error: any) {
      console.error('Error creating learner account:', error)
      toast({
        title: "Error",
        description: `Failed to create learner account: ${error.message || 'Unknown error'}. Please try again.`,
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Learner Profile</h1>
        <p className="text-muted-foreground">
          Add a new learner directly to the platform without going through the application process
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserPlus className="h-5 w-5" />
            New Learner Information
          </CardTitle>
          <CardDescription>
            Enter the basic information for the new learner. They will receive an email to set up their password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  First Name *
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Enter first name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Last Name *
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address *
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email address"
                required
              />
            </div>

            <div className="pt-4">
            <Button type="submit" disabled={loading} className="w-full md:w-auto">
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Create Account & Send Email
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-sm font-medium">What happens next?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>1. A user account will be created with a temporary password</p>
          <p>2. An approval email with login credentials will be sent to the learner</p>
          <p>3. The learner can use the "Forgot Password" link on the sign-in page to reset their password</p>
          <p>4. They will then have full access to all learner dashboard features</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default CreateLearnerProfile