import { useState, useEffect } from "react"
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
import { GraduationCap, Mail, Lock, User, AlertCircle } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"
import uciaLogo from "@/assets/ucia-logo.png"

interface SignInFormData {
  email: string
  password: string
}

interface ApplicationFormData {
  firstName: string
  lastName: string
  email: string
  ucCampus: string
  studentType: string
  major: string
  gpa: string
  question1: string
  question2: string
  question3: string
  question4: string
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

const Auth = () => {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const navigate = useNavigate()
  const { toast } = useToast()

  const signInForm = useForm<SignInFormData>()
  const applicationForm = useForm<ApplicationFormData>()

  useEffect(() => {
    // Check if user is already logged in
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        navigate("/")
      }
    }
    checkUser()
  }, [navigate])

  const handleSignIn = async (data: SignInFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: data.email,
        password: data.password,
      })

      if (error) {
        setError(error.message)
      } else {
        toast({
          title: "Welcome back!",
          description: "You have successfully signed in.",
        })
        navigate("/")
      }
    } catch (err) {
      setError("An unexpected error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleApplicationSubmit = async (data: ApplicationFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await (supabase as any)
        .from('applications')
        .insert({
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          uc_campus: data.ucCampus,
          student_type: data.studentType,
          major: data.major,
          gpa: parseFloat(data.gpa),
          question_1: data.question1,
          question_2: data.question2,
          question_3: data.question3,
          question_4: data.question4,
        })

      if (error) {
        setError(error.message)
      } else {
        toast({
          title: "Application Submitted!",
          description: "Your application has been submitted for review. You will receive an email once your application is processed.",
          duration: 5000,
        })
        applicationForm.reset()
      }
    } catch (err) {
      setError("An unexpected error occurred while submitting your application")
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
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email address"
                        {...applicationForm.register("email", { required: true })}
                      />
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