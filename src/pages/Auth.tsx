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
            email: data.email,
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
      navigate('/')

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
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="apply">Apply Now</TabsTrigger>
              </TabsList>

              {error && (
                <Alert className="mb-6 border-red-200 bg-red-50">
                  <AlertCircle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-700">{error}</AlertDescription>
                </Alert>
              )}

              <TabsContent value="signin">
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
              </TabsContent>


              <TabsContent value="apply">
                <form onSubmit={applicationForm.handleSubmit(handleApplicationSubmit)} className="space-y-6">
                  {/* Personal Information */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-academy-blue">Personal Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="firstName">First Name *</Label>
                        <Input
                          id="firstName"
                          placeholder="Enter your first name"
                          {...applicationForm.register("firstName", { required: true })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="lastName">Last Name *</Label>
                        <Input
                          id="lastName"
                          placeholder="Enter your last name"
                          {...applicationForm.register("lastName", { required: true })}
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">UC Student Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your UC student email (.edu)"
                        {...applicationForm.register("email", { required: true })}
                      />
                      <p className="text-xs text-academy-grey">Must be a valid UC campus student email address ending in .edu</p>
                    </div>
                  </div>

                  {/* Academic Information */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-academy-blue">Academic Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="ucCampus">UC Campus *</Label>
                        <Select onValueChange={(value) => applicationForm.setValue("ucCampus", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your UC campus" />
                          </SelectTrigger>
                          <SelectContent>
                            {ucCampuses.map((campus) => (
                              <SelectItem key={campus} value={campus}>
                                {campus}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="studentType">Student Type *</Label>
                        <Select onValueChange={(value) => applicationForm.setValue("studentType", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select student type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="undergraduate">Undergraduate</SelectItem>
                            <SelectItem value="graduate">Graduate Studies</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="major">Major *</Label>
                        <Input
                          id="major"
                          placeholder="Enter your major"
                          {...applicationForm.register("major", { required: true })}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="gpa">GPA *</Label>
                        <Select onValueChange={(value) => applicationForm.setValue("gpa", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select your GPA" />
                          </SelectTrigger>
                          <SelectContent className="max-h-60">
                            {gpaOptions.reverse().map((gpa) => (
                              <SelectItem key={gpa} value={gpa}>
                                {gpa}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="graduationYear">Expected Graduation Year *</Label>
                        <Select onValueChange={(value) => applicationForm.setValue("graduationYear", value)}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select graduation year" />
                          </SelectTrigger>
                          <SelectContent>
                            {graduationYears.map((year) => (
                              <SelectItem key={year} value={year}>
                                {year}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="linkedinUrl">LinkedIn Profile URL *</Label>
                      <Input
                        id="linkedinUrl"
                        type="url"
                        placeholder="https://www.linkedin.com/in/yourname"
                        {...applicationForm.register("linkedinUrl", { required: true })}
                      />
                      <p className="text-xs text-academy-grey">Please ensure your LinkedIn profile is public and accessible.</p>
                    </div>
                  </div>

                  {/* Document Uploads */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-academy-blue">Required Documents</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="resumeFile">Resume (PDF only) *</Label>
                        <div className="relative">
                          <Input
                            id="resumeFile"
                            type="file"
                            accept=".pdf"
                            {...applicationForm.register("resumeFile", { required: true })}
                            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-academy-blue file:text-white hover:file:bg-academy-blue-dark"
                          />
                          <FileUp className="absolute right-3 top-3 h-4 w-4 text-academy-grey pointer-events-none" />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="transcriptFile">Unofficial Transcript (PDF only) *</Label>
                        <div className="relative">
                          <Input
                            id="transcriptFile"
                            type="file"
                            accept=".pdf"
                            {...applicationForm.register("transcriptFile", { required: true })}
                            className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-academy-blue file:text-white hover:file:bg-academy-blue-dark"
                          />
                          <FileUp className="absolute right-3 top-3 h-4 w-4 text-academy-grey pointer-events-none" />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="consentFormFile">Signed Consent Form (PDF only) *</Label>
                      <div className="mb-2">
                        <a 
                          href="#" 
                          className="text-academy-blue hover:text-academy-blue-dark underline inline-flex items-center gap-1"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Download Consent Form <ExternalLink className="h-3 w-3" />
                        </a>
                        <p className="text-xs text-academy-grey mt-1">Please download, fill out, sign, and upload the consent form.</p>
                      </div>
                      <div className="relative">
                        <Input
                          id="consentFormFile"
                          type="file"
                          accept=".pdf"
                          {...applicationForm.register("consentFormFile", { required: true })}
                          className="file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-academy-blue file:text-white hover:file:bg-academy-blue-dark"
                        />
                        <FileUp className="absolute right-3 top-3 h-4 w-4 text-academy-grey pointer-events-none" />
                      </div>
                    </div>
                  </div>

                  {/* Background Information */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-academy-blue">Background Information</h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>Are you a first-generation college student? *</Label>
                        <Select onValueChange={(value) => applicationForm.setValue("firstGenerationStudent", value === "true")}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Yes or No" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Yes</SelectItem>
                            <SelectItem value="false">No</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-academy-grey">First-generation means neither parent completed a 4-year college degree.</p>
                      </div>

                      <div className="space-y-2">
                        <Label>Are you Pell Grant eligible? *</Label>
                        <Select onValueChange={(value) => applicationForm.setValue("pellGrantEligible", value === "true")}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Yes or No" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Yes</SelectItem>
                            <SelectItem value="false">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Are you currently employed? *</Label>
                        <Select onValueChange={(value) => {
                          const employed = value === "true"
                          setCurrentlyEmployed(employed)
                          applicationForm.setValue("currentlyEmployed", employed)
                        }}>
                          <SelectTrigger>
                            <SelectValue placeholder="Select Yes or No" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="true">Yes</SelectItem>
                            <SelectItem value="false">No</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {currentlyEmployed && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 p-4 bg-academy-blue-light/10 rounded-lg border border-academy-blue/20">
                          <div className="space-y-2">
                            <Label htmlFor="currentPosition">Current Position *</Label>
                            <Input
                              id="currentPosition"
                              placeholder="Your job title"
                              {...applicationForm.register("currentPosition", { required: currentlyEmployed })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="currentEmployer">Current Employer *</Label>
                            <Input
                              id="currentEmployer"
                              placeholder="Company name"
                              {...applicationForm.register("currentEmployer", { required: currentlyEmployed })}
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Optional Demographic Information */}
                    <div className="space-y-4 p-4 bg-academy-blue-light/5 rounded-lg border border-academy-blue/15">
                      <div className="mb-3">
                        <h4 className="text-lg font-medium text-academy-blue">Optional Demographic Information</h4>
                        <p className="text-sm text-academy-grey mt-1">
                          The following fields are optional and help us understand our applicant diversity. You may skip any or all of these questions.
                        </p>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-1 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="racialIdentity">Racial Identity (Optional)</Label>
                          <Input
                            id="racialIdentity"
                            placeholder="e.g., Asian, Black/African American, Hispanic/Latino, White, etc."
                            {...applicationForm.register("racialIdentity")}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="genderIdentity">Gender Identity (Optional)</Label>
                          <Input
                            id="genderIdentity"
                            placeholder="e.g., Woman, Man, Non-binary, etc."
                            {...applicationForm.register("genderIdentity")}
                          />
                        </div>

                        <div className="space-y-2">
                          <Label htmlFor="sexualOrientation">Sexual Orientation (Optional)</Label>
                          <Input
                            id="sexualOrientation"
                            placeholder="e.g., Straight, Gay, Lesbian, Bisexual, etc."
                            {...applicationForm.register("sexualOrientation")}
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Essay Questions */}
                  <div className="space-y-4">
                    <h3 className="text-xl font-semibold text-academy-blue">Essay Questions</h3>
                    <p className="text-sm text-academy-grey">Please answer the following questions thoughtfully. Each response should be 200-500 words.</p>
                    
                    <div className="space-y-2">
                      <Label htmlFor="question1">1. Why are you pursuing a career in finance? *</Label>
                      <Textarea
                        id="question1"
                        placeholder="Share your motivation and passion for finance..."
                        className="min-h-[120px]"
                        {...applicationForm.register("question1", { required: true })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="question2">2. Tell me about a time where you had to serve as a leader. *</Label>
                      <Textarea
                        id="question2"
                        placeholder="Describe a specific leadership experience..."
                        className="min-h-[120px]"
                        {...applicationForm.register("question2", { required: true })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="question3">3. What are your career goals? *</Label>
                      <Textarea
                        id="question3"
                        placeholder="Outline your short-term and long-term career aspirations..."
                        className="min-h-[120px]"
                        {...applicationForm.register("question3", { required: true })}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="question4">4. What would you bring to the UC Investments Academy community as a participant? *</Label>
                      <Textarea
                        id="question4"
                        placeholder="Describe your unique contributions and what you hope to add to the community..."
                        className="min-h-[120px]"
                        {...applicationForm.register("question4", { required: true })}
                      />
                    </div>
                  </div>

                  <Button 
                    type="submit" 
                    className="w-full bg-academy-accent hover:bg-academy-accent-dark text-white font-semibold py-3 text-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? "Submitting Application..." : "Submit Application"}
                  </Button>

                  <div className="mt-6 p-4 bg-academy-blue-light/10 rounded-lg border border-academy-blue/20">
                    <p className="text-sm text-academy-blue text-center">
                      <GraduationCap className="inline h-4 w-4 mr-2" />
                      After submitting your application, our admissions team will review it and contact you within 5-7 business days regarding the next steps.
                    </p>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Auth