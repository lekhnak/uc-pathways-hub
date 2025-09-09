import React, { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useForm } from "react-hook-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { GraduationCap, Mail, Lock, User, AlertCircle, FileUp, ExternalLink, Eye, EyeOff, Shield, Check, X } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/hooks/useAuth"
import uciaLogo from "@/assets/ucia-logo.png"

interface SignInFormData {
  email: string
  password: string
}

interface ChangePasswordFormData {
  email: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

interface ApplicationFormData {
  firstName: string
  lastName: string
  email: string
  preferredEmail: string
  ucCampus: string
  studentType: string
  major: string
  gpa: string
  graduationYear: string
  linkedinUrl: string
  firstGenerationStudent: boolean
  pellGrantEligible: boolean
  currentlyEmployed: boolean
  currentPosition?: string
  currentEmployer?: string
  racialIdentity?: string
  genderIdentity?: string
  sexualOrientation?: string
  question1: string
  question2: string
  question3: string
  question4: string
  resumeFile: FileList
  transcriptFile: FileList
  consentFormFile: FileList
}

const ucCampuses = [
  "UC Berkeley",
  "UC Los Angeles",
  "UC San Diego",
  "UC San Francisco",
  "UC Santa Barbara",
  "UC Irvine",
  "UC Davis",
  "UC Santa Cruz",
  "UC Riverside",
  "UC Merced"
]

const gpaOptions = []
for (let i = 0; i <= 4.0; i += 0.1) {
  gpaOptions.push(i.toFixed(1))
}

const currentYear = new Date().getFullYear()
const graduationYears = []
for (let i = currentYear; i <= currentYear + 10; i++) {
  graduationYears.push(i.toString())
}

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [currentlyEmployed, setCurrentlyEmployed] = useState(false)
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const navigate = useNavigate()
  const { toast } = useToast()
  const { setUser } = useAuth()

  const signInForm = useForm<SignInFormData>()
  const applicationForm = useForm<ApplicationFormData>()
  const changePasswordForm = useForm<ChangePasswordFormData>()

  useEffect(() => {
    // Check if user is already logged in via localStorage
    const userData = localStorage.getItem('user')
    if (userData) {
      navigate("/dashboard")
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
      navigate("/dashboard")
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const validateUCEmail = (email: string): boolean => {
    if (!email) return false
    
    // Check if email ends with .edu
    if (!email.endsWith('.edu')) {
      return false
    }
    
    // UC campus domains
    const ucDomains = [
      'berkeley.edu',
      'ucla.edu', 
      'ucsd.edu',
      'ucsf.edu',
      'ucsb.edu',
      'uci.edu',
      'ucdavis.edu',
      'ucsc.edu',
      'ucr.edu',
      'ucmerced.edu'
    ]
    
    // Check if email is from a UC campus
    return ucDomains.some(domain => email.endsWith(`@${domain}`) || email.includes(`@student.${domain}`) || email.includes(`@mail.${domain}`))
  }

  const validateLinkedInUrl = async (url: string): Promise<boolean> => {
    if (!url) return false
    
    // Basic LinkedIn URL format validation
    const linkedinPattern = /^https?:\/\/(www\.)?linkedin\.com\/in\/[a-zA-Z0-9-]+\/?$/
    if (!linkedinPattern.test(url)) {
      return false
    }

    try {
      // Simple fetch to check if URL is accessible
      const response = await fetch(url, { method: 'HEAD', mode: 'no-cors' })
      return true // If no error thrown, URL is likely accessible
    } catch {
      // For no-cors mode, we can't actually check the response
      // so we'll assume it's valid if the format is correct
      return true
    }
  }

  const uploadFile = async (file: File, folder: string): Promise<string> => {
    const fileExt = file.name.split('.').pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${folder}/${fileName}`

    const { data, error } = await supabase.storage
      .from('application-documents')
      .upload(filePath, file)

    if (error) {
      throw new Error(`Failed to upload ${folder}: ${error.message}`)
    }

    return filePath
  }

  const handleApplicationSubmit = async (data: ApplicationFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      // Validate required files
      if (!data.resumeFile?.[0] || !data.transcriptFile?.[0] || !data.consentFormFile?.[0]) {
        setError("Please upload all required documents (resume, transcript, and signed consent form)")
        return
      }

      // Validate UC email
      if (!validateUCEmail(data.email)) {
        setError("Please use a valid UC campus student email address (.edu domain)")
        return
      }

      // Validate preferred email if provided
      if (data.preferredEmail && !data.preferredEmail.includes('@')) {
        setError("Please provide a valid preferred email address")
        return
      }

      // Validate file types
      const resumeFile = data.resumeFile[0]
      const transcriptFile = data.transcriptFile[0]
      const consentFile = data.consentFormFile[0]

      if (resumeFile.type !== 'application/pdf') {
        setError("Resume must be a PDF file")
        return
      }
      if (transcriptFile.type !== 'application/pdf') {
        setError("Transcript must be a PDF file")
        return
      }
      if (consentFile.type !== 'application/pdf') {
        setError("Consent form must be a PDF file")
        return
      }

      // Validate LinkedIn URL
      const linkedinValid = await validateLinkedInUrl(data.linkedinUrl)
      if (!linkedinValid) {
        setError("Please provide a valid LinkedIn profile URL (e.g., https://www.linkedin.com/in/yourname)")
        return
      }

      // Upload files
      const resumePath = await uploadFile(resumeFile, 'resumes')
      const transcriptPath = await uploadFile(transcriptFile, 'transcripts')
      const consentPath = await uploadFile(consentFile, 'consent-forms')

      const { data: insertData, error } = await (supabase as any)
        .from('applications')
        .insert({
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          preferred_email: data.preferredEmail || null,
          uc_campus: data.ucCampus,
          student_type: data.studentType,
          major: data.major,
          gpa: parseFloat(data.gpa),
          graduation_year: parseInt(data.graduationYear),
          linkedin_url: data.linkedinUrl,
          first_generation_student: data.firstGenerationStudent,
          pell_grant_eligible: data.pellGrantEligible,
          currently_employed: data.currentlyEmployed,
          current_position: data.currentlyEmployed ? data.currentPosition : null,
          current_employer: data.currentlyEmployed ? data.currentEmployer : null,
          racial_identity: data.racialIdentity || null,
          gender_identity: data.genderIdentity || null,
          sexual_orientation: data.sexualOrientation || null,
          resume_file_path: resumePath,
          transcript_file_path: transcriptPath,
          consent_form_file_path: consentPath,
          question_1: data.question1,
          question_2: data.question2,
          question_3: data.question3,
          question_4: data.question4,
        })
        

      if (error) {
        setError(error.message)
        return
      }

      // Send confirmation email
      try {
        await supabase.functions.invoke('gmail-send-application-confirmation', {
          body: {
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.preferredEmail || data.email,
            program: data.ucCampus
          }
        })
        console.log('Confirmation email sent successfully')
      } catch (emailError) {
        console.error('Failed to send confirmation email:', emailError)
        // Don't fail the application submission if email fails
      }

      toast({
        title: "Application Submitted!",
        description: "Your application has been submitted for review. You will receive a confirmation email shortly.",
        duration: 5000,
      })
      applicationForm.reset()
      setCurrentlyEmployed(false)
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred while submitting your application")
    } finally {
      setIsLoading(false)
    }
  }

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }))
  }

  const handleChangePassword = async (data: ChangePasswordFormData) => {
    setIsLoading(true)
    setError(null)
    
    if (!data.email.trim() || !data.currentPassword.trim() || !data.newPassword.trim()) {
      setError("Please fill in all required fields.")
      setIsLoading(false)
      return
    }

    // Password validation
    const passwordValidation = {
      length: data.newPassword.length >= 8,
      number: /\d/.test(data.newPassword),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(data.newPassword),
      match: data.newPassword === data.confirmPassword && data.confirmPassword !== ''
    }

    const isPasswordValid = Object.values(passwordValidation).every(Boolean)

    if (!isPasswordValid) {
      setError("Please ensure your new password meets all requirements.")
      setIsLoading(false)
      return
    }

    try {
      // First verify the current credentials by attempting to sign in
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.currentPassword
      })

      if (signInError) {
        throw new Error('Invalid email or current password')
      }

      // Update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: data.newPassword
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
      navigate('/dashboard')

    } catch (error: any) {
      console.error('Error changing password:', error)
      setError(error.message || "Failed to change password. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-hero flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-card">
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
            <CardDescription className="text-lg">Access your account or apply to join the Academy</CardDescription>
          </CardHeader>
          
          <CardContent>
            <div className="w-full">{/* Removed tabs, keeping only sign in */}</div>

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
