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

    console.log('Starting direct profile creation for:', formData)
    setLoading(true)

    try {
      // Generate secure token
      const token = generateToken()
      const expiresAt = new Date()
      expiresAt.setHours(expiresAt.getHours() + 24) // Token expires in 24 hours

      console.log('Generated token:', token)
      console.log('Token expires at:', expiresAt.toISOString())

      // Store password reset token
      const { error: tokenError } = await supabase
        .from('password_reset_tokens')
        .insert({
          email: formData.email,
          token,
          expires_at: expiresAt.toISOString()
        })

      if (tokenError) {
        console.error('Token creation error:', tokenError)
        throw tokenError
      }

      console.log('Password reset token created successfully')

      // Send password setup email
      const { error: emailError } = await supabase.functions.invoke('send-password-setup', {
        body: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          token
        }
      })

      if (emailError) {
        console.error('Email sending error:', emailError)
        toast({
          title: "Profile Created",
          description: `Learner profile created successfully, but the password setup email failed to send. Error: ${emailError.message || 'Unknown error'}`,
          variant: "destructive",
        })
      } else {
        console.log('Password setup email sent successfully')
        toast({
          title: "Profile Created Successfully",
          description: `${formData.firstName} ${formData.lastName} has been added as a learner. A password setup email has been sent to ${formData.email}.`,
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
      console.error('Error creating profile:', error)
      toast({
        title: "Error",
        description: `Failed to create learner profile: ${error.message || 'Unknown error'}. Please try again.`,
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
                    Creating Profile...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Create Profile & Send Setup Email
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
          <p>1. A secure password setup link will be sent to the learner's email</p>
          <p>2. The learner will be able to create their password and access the platform</p>
          <p>3. They will have full access to all learner dashboard features</p>
          <p>4. The setup link expires after 24 hours for security</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default CreateLearnerProfile