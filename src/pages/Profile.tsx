import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { User, Mail, MapPin, GraduationCap, Briefcase, Edit, Save, Award, TrendingUp, Calendar } from "lucide-react"
import { useState } from "react"

const Profile = () => {
  const [isEditing, setIsEditing] = useState(false)

  const profileData = {
    name: "John Doe",
    email: "john.doe@university.edu",
    phone: "+1 (555) 123-4567",
    location: "Berkeley, CA",
    university: "UC Berkeley",
    major: "Economics & Business Administration",
    graduationYear: "2025",
    gpa: "3.85",
    bio: "Passionate finance student with strong analytical skills and internship experience in investment research. Seeking opportunities in investment banking and private equity.",
    linkedin: "linkedin.com/in/johndoe",
    github: "github.com/johndoe"
  }

  const interests = [
    "Investment Banking",
    "Private Equity", 
    "Mergers & Acquisitions",
    "Financial Modeling",
    "Equity Research",
    "Credit Analysis"
  ]

  const targetCompanies = [
    { name: "Goldman Sachs", interest: "Investment Banking", priority: "High" },
    { name: "KKR & Co.", interest: "Private Equity", priority: "High" },
    { name: "J.P. Morgan", interest: "Investment Banking", priority: "Medium" },
    { name: "BlackRock", interest: "Asset Management", priority: "Medium" },
    { name: "Apollo Global", interest: "Credit", priority: "Low" }
  ]

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

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-4 text-academy-blue">My Profile</h1>
        <p className="text-academy-grey text-lg">
          Manage your personal information, career interests, and track your learning progress.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Profile Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card className="bg-white shadow-card border-academy-grey-light">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2 text-academy-blue">
                  <User className="h-5 w-5" />
                  Personal Information
                </CardTitle>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(!isEditing)}
                  className="border-academy-blue text-academy-blue hover:bg-academy-blue-light"
                >
                  {isEditing ? (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Save
                    </>
                  ) : (
                    <>
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Profile Picture and Basic Info */}
              <div className="flex items-start gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src="/api/placeholder/100/100" />
                  <AvatarFallback className="text-xl">JD</AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-academy-blue mb-1">Full Name</label>
                      {isEditing ? (
                        <Input defaultValue={profileData.name} />
                      ) : (
                        <p className="text-academy-grey">{profileData.name}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-academy-blue mb-1">Email</label>
                      {isEditing ? (
                        <Input defaultValue={profileData.email} />
                      ) : (
                        <p className="text-academy-grey">{profileData.email}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-academy-blue mb-1">Phone</label>
                      {isEditing ? (
                        <Input defaultValue={profileData.phone} />
                      ) : (
                        <p className="text-academy-grey">{profileData.phone}</p>
                      )}
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-academy-blue mb-1">Location</label>
                      {isEditing ? (
                        <Input defaultValue={profileData.location} />
                      ) : (
                        <p className="text-academy-grey">{profileData.location}</p>
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
                    <label className="block text-sm font-medium text-academy-blue mb-1">University</label>
                    {isEditing ? (
                      <Input defaultValue={profileData.university} />
                    ) : (
                      <p className="text-academy-grey">{profileData.university}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-academy-blue mb-1">Major</label>
                    {isEditing ? (
                      <Input defaultValue={profileData.major} />
                    ) : (
                      <p className="text-academy-grey">{profileData.major}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-academy-blue mb-1">Graduation Year</label>
                    {isEditing ? (
                      <Input defaultValue={profileData.graduationYear} />
                    ) : (
                      <p className="text-academy-grey">{profileData.graduationYear}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-academy-blue mb-1">GPA</label>
                    {isEditing ? (
                      <Input defaultValue={profileData.gpa} />
                    ) : (
                      <p className="text-academy-grey">{profileData.gpa}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div>
                <label className="block text-sm font-medium text-academy-blue mb-2">Professional Bio</label>
                {isEditing ? (
                  <Textarea defaultValue={profileData.bio} rows={4} />
                ) : (
                  <p className="text-academy-grey">{profileData.bio}</p>
                )}
              </div>

              {/* Social Links */}
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-academy-blue">Professional Links</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-academy-blue mb-1">LinkedIn</label>
                    {isEditing ? (
                      <Input defaultValue={profileData.linkedin} />
                    ) : (
                      <p className="text-academy-grey">{profileData.linkedin}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-academy-blue mb-1">GitHub</label>
                    {isEditing ? (
                      <Input defaultValue={profileData.github} />
                    ) : (
                      <p className="text-academy-grey">{profileData.github}</p>
                    )}
                  </div>
                </div>
              </div>
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
              <div className="flex flex-wrap gap-2 mb-4">
                {interests.map((interest) => (
                  <Badge key={interest} className="bg-academy-blue-light text-academy-blue border-academy-blue">
                    {interest}
                  </Badge>
                ))}
              </div>
              <Button variant="outline" className="border-academy-blue text-academy-blue hover:bg-academy-blue-light">
                Edit Interests
              </Button>
            </CardContent>
          </Card>

          {/* Target Companies */}
          <Card className="bg-white shadow-card border-academy-grey-light">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-academy-blue">
                <Briefcase className="h-5 w-5" />
                Target Companies
              </CardTitle>
              <CardDescription>Companies you're interested in working for</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {targetCompanies.map((company, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-academy-grey-light rounded-lg">
                    <div className="flex-1">
                      <h4 className="font-semibold text-academy-blue">{company.name}</h4>
                      <p className="text-sm text-academy-grey">{company.interest}</p>
                    </div>
                    <Badge className={getPriorityColor(company.priority)}>
                      {company.priority}
                    </Badge>
                  </div>
                ))}
              </div>
              <Button variant="outline" className="w-full mt-4 border-academy-blue text-academy-blue hover:bg-academy-blue-light">
                Manage Companies
              </Button>
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