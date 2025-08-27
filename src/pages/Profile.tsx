import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Checkbox } from "@/components/ui/checkbox"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { User, Mail, MapPin, GraduationCap, Briefcase, Edit, Save, Award, TrendingUp, Calendar, Plus, X } from "lucide-react"
import { useState, useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/hooks/use-toast"

const Profile = () => {
  const { user } = useAuth()
  const { toast } = useToast()
  const [isEditing, setIsEditing] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [showEditConfirmation, setShowEditConfirmation] = useState(false)
  
  // Profile data state
  const [profileData, setProfileData] = useState<{
    first_name: string
    last_name: string
    email: string
    phone: string
    location: string
    major: string
    graduation_year: number | null
    gpa: number | null
    uc_campus: string
    bio: string
    linkedin_url: string
    github_url: string
    career_interests: string[]
    target_companies: Array<{
      name: string
      location: string
      priority: string
    }>
  }>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    location: '',
    major: '',
    graduation_year: null,
    gpa: null,
    uc_campus: '',
    bio: '',
    linkedin_url: '',
    github_url: '',
    career_interests: [],
    target_companies: []
  })

  // Available career interests
  const availableInterests = [
    // Corporate Finance
    'Corporate Finance', 'Investment Banking', 'Financial Planning & Analysis (FP&A)', 
    'Treasury Management', 'Corporate Development', 'Mergers & Acquisitions',
    
    // Investment Management
    'Portfolio Management', 'Research Analysis', 'Private Equity', 
    'Venture Capital', 'Hedge Funds', 'Asset Management',
    
    // Banking
    'Commercial Banking', 'Credit Analysis', 'Relationship Management', 'Loan Underwriting',
    
    // Financial Planning & Advisory
    'Wealth Management', 'Financial Planning', 'Investment Advisory', 'Retirement Planning',
    
    // Risk Management
    'Credit Risk', 'Market Risk', 'Operational Risk', 'Compliance', 'Regulatory Affairs',
    
    // Insurance
    'Underwriting', 'Claims Management', 'Actuarial Science', 'Insurance Sales',
    
    // Real Estate Finance
    'Commercial Real Estate', 'Mortgage Banking', 'REITs', 'Property Valuation',
    
    // Fintech
    'Digital Banking', 'Payment Systems', 'Cryptocurrency', 'Financial Technology',
    
    // Government Finance
    'Public Finance', 'Municipal Finance', 'Central Banking', 'Financial Regulation'
  ]

  // Fetch profile data
  useEffect(() => {
    if (user) {
      console.log('User found, fetching profile for:', user.id)
      fetchProfile()
    } else {
      console.log('No user found')
    }
  }, [user])

  const fetchProfile = async () => {
    try {
      console.log('Fetching profile for user:', user?.id)
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user?.id)
        .single()

      console.log('Profile query result:', { data, error })

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching profile:', error)
        return
      }

      if (data) {
        console.log('Profile data found:', data)
        setProfileData({
          first_name: data.first_name || '',
          last_name: data.last_name || '',
          email: user?.email || '',
          phone: data.phone || '',
          location: data.location || '',
          major: data.major || '',
          graduation_year: data.graduation_year,
          gpa: data.gpa,
          uc_campus: data.uc_campus || '',
          bio: data.bio || '',
          linkedin_url: data.linkedin_url || '',
          github_url: data.github_url || '',
          career_interests: Array.isArray(data.career_interests) ? data.career_interests : [],
          target_companies: Array.isArray(data.target_companies) 
            ? (data.target_companies as Array<{name: string, location: string, priority: string}>)
            : []
        })
      } else {
        console.log('No profile data found, will create empty profile on first edit')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveProfile = async () => {
    if (!user) return

    setSaving(true)
    try {
      const { error } = await supabase
        .from('profiles')
        .upsert({
          user_id: user.id,
          first_name: profileData.first_name,
          last_name: profileData.last_name,
          phone: profileData.phone,
          location: profileData.location,
          major: profileData.major,
          graduation_year: profileData.graduation_year,
          gpa: profileData.gpa,
          uc_campus: profileData.uc_campus,
          bio: profileData.bio,
          linkedin_url: profileData.linkedin_url,
          github_url: profileData.github_url,
          career_interests: profileData.career_interests,
          target_companies: profileData.target_companies
        })

      if (error) throw error

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Error saving profile:', error)
      toast({
        title: "Error",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      })
    } finally {
      setSaving(false)
    }
  }

  const handleEditClick = () => {
    if (isEditing) {
      // Save when clicking Done
      saveProfile()
    } else {
      // Show confirmation when clicking Edit
      setShowEditConfirmation(true)
    }
  }

  const confirmEdit = () => {
    setIsEditing(true)
    setShowEditConfirmation(false)
  }

  const cancelEdit = () => {
    setShowEditConfirmation(false)
  }

  const toggleInterest = (interest: string) => {
    const newInterests = profileData.career_interests.includes(interest)
      ? profileData.career_interests.filter(i => i !== interest)
      : [...profileData.career_interests, interest]
    
    setProfileData(prev => ({ ...prev, career_interests: newInterests }))
  }

  const addTargetCompany = () => {
    if (profileData.target_companies.length < 5) {
      const newCompanies = [...profileData.target_companies, {
        name: '',
        location: '',
        priority: 'Medium'
      }]
      setProfileData(prev => ({ ...prev, target_companies: newCompanies }))
    }
  }

  const updateTargetCompany = (index: number, field: string, value: string) => {
    const newCompanies = [...profileData.target_companies]
    newCompanies[index] = { ...newCompanies[index], [field]: value }
    setProfileData(prev => ({ ...prev, target_companies: newCompanies }))
  }

  const removeTargetCompany = (index: number) => {
    const newCompanies = profileData.target_companies.filter((_, i) => i !== index)
    setProfileData(prev => ({ ...prev, target_companies: newCompanies }))
  }

  const achievements = [
    {
      title: "Goldman Sachs Virtual Experience",
      type: "Certification",
      date: "November 2024",
      issuer: "Forage"
    },
    {
      title: "TTS Basic Finance Curriculum",
      type: "Course Completion",
      date: "October 2024",
      issuer: "UC Investment Academy"
    },
    {
      title: "Dean's List",
      type: "Academic Honor",
      date: "Spring 2024",
      issuer: "UC Berkeley"
    }
  ]

  const learningProgress = [
    { module: "Orientations & Foundations", progress: 100 },
    { module: "TTS Basic Finance", progress: 75 },
    { module: "Career Pathways", progress: 40 },
    { module: "Private Equity Deep Dive", progress: 20 }
  ]

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-red-100 text-red-800'
      case 'Medium': return 'bg-yellow-100 text-yellow-800'
      case 'Low': return 'bg-green-100 text-green-800'
      default: return 'bg-academy-grey-light text-academy-grey'
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-8">
      {/* Confirmation Dialog */}
      <Dialog open={showEditConfirmation} onOpenChange={setShowEditConfirmation}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle className="text-academy-blue">Edit Profile</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-academy-grey">
              Are you sure you want to make changes to your profile?
            </p>
          </div>
          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={cancelEdit}
              className="border-academy-grey text-academy-grey hover:bg-academy-grey-light"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmEdit}
              className="bg-academy-blue hover:bg-academy-blue-dark"
            >
              Yes, Edit Profile
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-4 text-academy-blue">My Profile</h1>
          <p className="text-academy-grey text-lg">
            Manage your personal information, career interests, and track your learning progress.
          </p>
        </div>
        <Button
          variant="outline"
          size="lg"
          onClick={handleEditClick}
          disabled={saving}
          className="border-academy-blue text-academy-blue hover:bg-academy-blue-light"
        >
          {isEditing ? (
            <>
              <Save className="h-5 w-5 mr-2" />
              {saving ? 'Saving...' : 'Done'}
            </>
          ) : (
            <>
              <Edit className="h-5 w-5 mr-2" />
              Edit Profile
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card className="bg-white shadow-card border-academy-grey-light">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-academy-blue">
                <User className="h-5 w-5" />
                Personal Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture and Basic Info */}
              <div className="flex items-start gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="/api/placeholder/100/100" />
                  <AvatarFallback className="text-xl">
                    {(profileData.first_name[0] || '?')}{(profileData.last_name[0] || '?')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-academy-blue mb-1">First Name</label>
                      {isEditing ? (
                        <Input 
                          value={profileData.first_name}
                          onChange={(e) => setProfileData(prev => ({ ...prev, first_name: e.target.value }))}
                        />
                      ) : (
                        <p className="text-academy-grey">{profileData.first_name}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-academy-blue mb-1">Last Name</label>
                      {isEditing ? (
                        <Input 
                          value={profileData.last_name}
                          onChange={(e) => setProfileData(prev => ({ ...prev, last_name: e.target.value }))}
                        />
                      ) : (
                        <p className="text-academy-grey">{profileData.last_name}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-academy-blue mb-1">UC Student Email</label>
                      <p className="text-academy-grey">{profileData.email}</p>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-academy-blue mb-1">Phone</label>
                      {isEditing ? (
                        <Input 
                          value={profileData.phone}
                          onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                        />
                      ) : (
                        <p className="text-academy-grey">{profileData.phone || 'Not provided'}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-academy-blue mb-1">Location</label>
                      {isEditing ? (
                        <Input 
                          value={profileData.location}
                          onChange={(e) => setProfileData(prev => ({ ...prev, location: e.target.value }))}
                        />
                      ) : (
                        <p className="text-academy-grey">{profileData.location || 'Not provided'}</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-academy-blue">Academic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-academy-blue mb-1">UC Campus</label>
                    {isEditing ? (
                      <Input 
                        value={profileData.uc_campus}
                        onChange={(e) => setProfileData(prev => ({ ...prev, uc_campus: e.target.value }))}
                      />
                    ) : (
                      <p className="text-academy-grey">{profileData.uc_campus || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-academy-blue mb-1">Major</label>
                    {isEditing ? (
                      <Input 
                        value={profileData.major}
                        onChange={(e) => setProfileData(prev => ({ ...prev, major: e.target.value }))}
                      />
                    ) : (
                      <p className="text-academy-grey">{profileData.major || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-academy-blue mb-1">Graduation Year</label>
                    {isEditing ? (
                      <Input 
                        type="number"
                        value={profileData.graduation_year || ''}
                        onChange={(e) => setProfileData(prev => ({ ...prev, graduation_year: parseInt(e.target.value) || null }))}
                      />
                    ) : (
                      <p className="text-academy-grey">{profileData.graduation_year || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-academy-blue mb-1">GPA</label>
                    {isEditing ? (
                      <Input 
                        type="number"
                        step="0.01"
                        value={profileData.gpa || ''}
                        onChange={(e) => setProfileData(prev => ({ ...prev, gpa: parseFloat(e.target.value) || null }))}
                      />
                    ) : (
                      <p className="text-academy-grey">{profileData.gpa || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-academy-blue mb-2">Professional Bio</label>
                {isEditing ? (
                  <Textarea 
                    value={profileData.bio}
                    onChange={(e) => setProfileData(prev => ({ ...prev, bio: e.target.value }))}
                    rows={4} 
                  />
                ) : (
                  <p className="text-academy-grey">{profileData.bio || 'No bio provided'}</p>
                )}
              </div>

              {/* Social Links */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-academy-blue">Professional Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-academy-blue mb-1">LinkedIn</label>
                    {isEditing ? (
                      <Input 
                        value={profileData.linkedin_url}
                        onChange={(e) => setProfileData(prev => ({ ...prev, linkedin_url: e.target.value }))}
                      />
                    ) : (
                      <p className="text-academy-grey">{profileData.linkedin_url || 'Not provided'}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-academy-blue mb-1">GitHub</label>
                    {isEditing ? (
                      <Input 
                        value={profileData.github_url}
                        onChange={(e) => setProfileData(prev => ({ ...prev, github_url: e.target.value }))}
                      />
                    ) : (
                      <p className="text-academy-grey">{profileData.github_url || 'Not provided'}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Remove the redundant save button section */}
            </CardContent>
          </Card>

          {/* Career Interests */}
          <Card className="bg-white shadow-card border-academy-grey-light">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-academy-blue">
                <TrendingUp className="h-5 w-5" />
                Career Interests
              </CardTitle>
              <CardDescription>Areas of finance you're most interested in</CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-64 overflow-y-auto">
                  {availableInterests.map((interest) => (
                    <div key={interest} className="flex items-center space-x-2">
                      <Checkbox
                        id={interest}
                        checked={profileData.career_interests.includes(interest)}
                        onCheckedChange={() => toggleInterest(interest)}
                      />
                      <label htmlFor={interest} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                        {interest}
                      </label>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profileData.career_interests.length > 0 ? (
                    profileData.career_interests.map((interest) => (
                      <Badge key={interest} className="bg-academy-blue-light text-academy-blue border-academy-blue">
                        {interest}
                      </Badge>
                    ))
                  ) : (
                    <p className="text-academy-grey">No interests selected</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Target Companies */}
          <Card className="bg-white shadow-card border-academy-grey-light">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-academy-blue">
                <Briefcase className="h-5 w-5" />
                Target Companies
              </CardTitle>
              <CardDescription>Companies you're interested in working for (up to 5)</CardDescription>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <div className="space-y-4">
                  {profileData.target_companies.map((company, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium text-academy-blue">Company {index + 1}</h4>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeTargetCompany(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        <div>
                          <label className="block text-sm font-medium text-academy-blue mb-1">Company Name</label>
                          <Input
                            value={company.name}
                            onChange={(e) => updateTargetCompany(index, 'name', e.target.value)}
                            placeholder="e.g., Goldman Sachs"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-academy-blue mb-1">Location</label>
                          <Input
                            value={company.location}
                            onChange={(e) => updateTargetCompany(index, 'location', e.target.value)}
                            placeholder="e.g., New York, NY"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-academy-blue mb-1">Priority</label>
                        <Select
                          value={company.priority}
                          onValueChange={(value) => updateTargetCompany(index, 'priority', value)}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="High">High</SelectItem>
                            <SelectItem value="Medium">Medium</SelectItem>
                            <SelectItem value="Low">Low</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ))}
                  
                  {profileData.target_companies.length < 5 && (
                    <Button
                      variant="outline"
                      onClick={addTargetCompany}
                      className="w-full border-dashed border-academy-blue text-academy-blue hover:bg-academy-blue-light"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      Add Company ({profileData.target_companies.length}/5)
                    </Button>
                  )}
                </div>
              ) : (
                <div className="space-y-3">
                  {profileData.target_companies.length > 0 ? (
                    profileData.target_companies.map((company, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-academy-grey-light rounded-lg">
                        <div className="flex-1">
                          <h4 className="font-semibold text-academy-blue">{company.name}</h4>
                          <p className="text-sm text-academy-grey">{company.location}</p>
                        </div>
                        <Badge className={getPriorityColor(company.priority)}>
                          {company.priority}
                        </Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-academy-grey">No target companies added</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Progress and Achievements */}
        <div className="space-y-6">
          {/* Learning Progress */}
          <Card className="bg-white shadow-card border-academy-grey-light">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-academy-blue">
                <GraduationCap className="h-5 w-5" />
                Learning Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {learningProgress.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium text-academy-blue">{item.module}</span>
                    <span className="text-sm text-academy-grey">{item.progress}%</span>
                  </div>
                  <Progress value={item.progress} className="h-2" />
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Achievements */}
          <Card className="bg-white shadow-card border-academy-grey-light">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-academy-blue">
                <Award className="h-5 w-5" />
                Achievements
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {achievements.map((achievement, index) => (
                <div key={index} className="flex items-start gap-3 p-3 bg-academy-grey-light rounded-lg">
                  <div className="w-10 h-10 bg-academy-blue rounded-lg flex items-center justify-center">
                    <Award className="h-5 w-5 text-white" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-academy-blue">{achievement.title}</h4>
                    <p className="text-sm text-academy-grey">{achievement.type}</p>
                    <p className="text-xs text-academy-grey">{achievement.issuer} • {achievement.date}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="bg-gradient-subtle border-academy-blue-light shadow-card">
            <CardHeader>
              <CardTitle className="text-academy-blue">Quick Stats</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-academy-grey">Modules Completed</span>
                <span className="font-semibold text-academy-blue">3/12</span>
              </div>
              <div className="flex justify-between">
                <span className="text-academy-grey">Certifications Earned</span>
                <span className="font-semibold text-academy-blue">2</span>
              </div>
              <div className="flex justify-between">
                <span className="text-academy-grey">Events Attended</span>
                <span className="font-semibold text-academy-blue">8</span>
              </div>
              <div className="flex justify-between">
                <span className="text-academy-grey">Mentorship Sessions</span>
                <span className="font-semibold text-academy-blue">5</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;