import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Users, MessageCircle, Calendar, Star, Search, Filter, MapPin, Briefcase, AlertTriangle } from "lucide-react"

const Mentorship = () => {
  const mentors = [
    {
      id: 1,
      name: "Sarah Johnson",
      role: "Managing Director",
      company: "Goldman Sachs",
      location: "New York, NY",
      experience: "12 years",
      expertise: ["Investment Banking", "M&A", "Capital Markets"],
      bio: "Leading M&A transactions in the technology sector. Passionate about helping students break into investment banking.",
      rating: 4.9,
      sessions: 45,
      responseTime: "< 24 hours",
      availability: "Available",
      image: "/api/placeholder/100/100"
    },
    {
      id: 2,
      name: "Michael Chen",
      role: "Vice President",
      company: "KKR & Co.",
      location: "San Francisco, CA",
      experience: "8 years",
      expertise: ["Private Equity", "Growth Capital", "Due Diligence"],
      bio: "Focused on growth equity investments in healthcare and fintech. Former investment banker with experience at Barclays.",
      rating: 4.8,
      sessions: 32,
      responseTime: "< 48 hours",
      availability: "Busy",
      image: "/api/placeholder/100/100"
    },
    {
      id: 3,
      name: "Emily Rodriguez",
      role: "Portfolio Manager",
      company: "BlackRock",
      location: "Boston, MA",
      experience: "10 years",
      expertise: ["Asset Management", "Fixed Income", "ESG Investing"],
      bio: "Managing institutional fixed income portfolios. CFA charterholder with expertise in sustainable investing strategies.",
      rating: 4.9,
      sessions: 28,
      responseTime: "< 24 hours",
      availability: "Available",
      image: "/api/placeholder/100/100"
    },
    {
      id: 4,
      name: "David Park",
      role: "Senior Associate",
      company: "Apollo Global Management",
      location: "Chicago, IL",
      experience: "6 years",
      expertise: ["Credit Analysis", "Direct Lending", "Restructuring"],
      bio: "Specializing in middle-market credit investments and distressed situations. Happy to help students explore credit careers.",
      rating: 4.7,
      sessions: 19,
      responseTime: "< 72 hours",
      availability: "Available",
      image: "/api/placeholder/100/100"
    }
  ]

  const getAvailabilityColor = (availability: string) => {
    switch (availability) {
      case 'Available': return 'bg-green-100 text-green-800'
      case 'Busy': return 'bg-yellow-100 text-yellow-800'
      case 'Unavailable': return 'bg-red-100 text-red-800'
      default: return 'bg-academy-grey-light text-academy-grey'
    }
  }

  return (
    <div className="space-y-8">
      {/* Development Warning */}
      <Alert className="border-yellow-200 bg-yellow-50">
        <AlertTriangle className="h-4 w-4 text-yellow-600" />
        <AlertDescription className="text-yellow-800">
          <strong>Still in Development:</strong> The Mentorship program is currently being set up. 
          We're onboarding mentors and building the matching system. Available soon!
        </AlertDescription>
      </Alert>

      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-4 text-academy-blue">Mentorship Program</h1>
        <p className="text-academy-grey text-lg">
          Connect with experienced finance professionals for career guidance, industry insights, and networking opportunities.
        </p>
      </div>

      {/* Program Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white shadow-card border-academy-grey-light">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-academy-blue">150+</CardTitle>
            <CardDescription>Active Mentors</CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-white shadow-card border-academy-grey-light">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-academy-blue">500+</CardTitle>
            <CardDescription>Mentoring Sessions</CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-white shadow-card border-academy-grey-light">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-academy-blue">4.8</CardTitle>
            <CardDescription>Average Rating</CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-white shadow-card border-academy-grey-light">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-academy-blue">24hr</CardTitle>
            <CardDescription>Avg Response Time</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="bg-white shadow-card border-academy-grey-light">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-academy-grey" />
              <Input 
                placeholder="Search mentors by name, company, or expertise..." 
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <select className="px-4 py-2 border border-academy-grey-light rounded-md focus:ring-2 focus:ring-academy-blue">
                <option>All Industries</option>
                <option>Investment Banking</option>
                <option>Private Equity</option>
                <option>Asset Management</option>
                <option>Credit</option>
              </select>
              <select className="px-4 py-2 border border-academy-grey-light rounded-md focus:ring-2 focus:ring-academy-blue">
                <option>All Locations</option>
                <option>New York</option>
                <option>San Francisco</option>
                <option>Chicago</option>
                <option>Boston</option>
              </select>
              <Button variant="outline" className="border-academy-blue text-academy-blue hover:bg-academy-blue-light">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Your Mentorship */}
      <Card className="bg-gradient-subtle border-academy-blue-light shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-academy-blue">
            <Users className="h-5 w-5" />
            Your Active Mentorships
          </CardTitle>
          <CardDescription>Current mentoring relationships and upcoming sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 bg-white rounded-lg border border-academy-grey-light">
              <Avatar className="h-12 w-12">
                <AvatarImage src="/api/placeholder/100/100" />
                <AvatarFallback>SJ</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h4 className="font-semibold text-academy-blue">Sarah Johnson</h4>
                <p className="text-sm text-academy-grey">Goldman Sachs • Investment Banking</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-medium text-academy-blue">Next Session</p>
                <p className="text-sm text-academy-grey">Dec 20, 2:00 PM</p>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" className="border-academy-blue text-academy-blue hover:bg-academy-blue-light">
                  <MessageCircle className="h-4 w-4 mr-1" />
                  Message
                </Button>
                <Button size="sm" className="bg-academy-blue hover:bg-academy-blue-dark">
                  <Calendar className="h-4 w-4 mr-1" />
                  Schedule
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Mentors */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-academy-blue">Find a Mentor</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {mentors.map((mentor) => (
            <Card key={mentor.id} className="bg-white shadow-card border-academy-grey-light hover:shadow-elevated transition-all">
              <CardHeader>
                <div className="flex items-start gap-4">
                  <Avatar className="h-16 w-16">
                    <AvatarImage src={mentor.image} />
                    <AvatarFallback>{mentor.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <CardTitle className="text-lg text-academy-blue">{mentor.name}</CardTitle>
                      <Badge className={getAvailabilityColor(mentor.availability)}>
                        {mentor.availability}
                      </Badge>
                    </div>
                    <CardDescription className="text-base mb-2">
                      {mentor.role} at {mentor.company}
                    </CardDescription>
                    <div className="flex items-center gap-4 text-sm text-academy-grey">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3 w-3" />
                        {mentor.location}
                      </span>
                      <span className="flex items-center gap-1">
                        <Briefcase className="h-3 w-3" />
                        {mentor.experience}
                      </span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Bio */}
                <p className="text-academy-grey text-sm">{mentor.bio}</p>

                {/* Expertise */}
                <div>
                  <h4 className="font-semibold text-academy-blue mb-2">Expertise</h4>
                  <div className="flex flex-wrap gap-2">
                    {mentor.expertise.map((skill) => (
                      <Badge key={skill} variant="secondary" className="bg-academy-grey-light text-academy-blue">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-4 p-3 bg-academy-grey-light rounded-lg">
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-1 mb-1">
                      <Star className="h-4 w-4 text-yellow-500 fill-current" />
                      <span className="font-semibold text-academy-blue">{mentor.rating}</span>
                    </div>
                    <p className="text-xs text-academy-grey">Rating</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-academy-blue">{mentor.sessions}</p>
                    <p className="text-xs text-academy-grey">Sessions</p>
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-academy-blue text-xs">{mentor.responseTime}</p>
                    <p className="text-xs text-academy-grey">Response</p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button 
                    className="flex-1 bg-academy-blue hover:bg-academy-blue-dark"
                    disabled={mentor.availability === 'Unavailable'}
                  >
                    Request Mentorship
                  </Button>
                  <Button variant="outline" className="border-academy-blue text-academy-blue hover:bg-academy-blue-light">
                    View Profile
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Request Form */}
      <Card className="bg-white shadow-card border-academy-grey-light">
        <CardHeader>
          <CardTitle className="text-academy-blue">Can't find the right mentor?</CardTitle>
          <CardDescription>Submit a request and we'll help match you with someone from our network</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-academy-blue mb-2">Preferred Industry</label>
              <select className="w-full p-2 border border-academy-grey-light rounded-md focus:ring-2 focus:ring-academy-blue">
                <option>Investment Banking</option>
                <option>Private Equity</option>
                <option>Asset Management</option>
                <option>Credit/Fixed Income</option>
                <option>Real Estate</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-academy-blue mb-2">Career Level</label>
              <select className="w-full p-2 border border-academy-grey-light rounded-md focus:ring-2 focus:ring-academy-blue">
                <option>Analyst</option>
                <option>Associate</option>
                <option>Vice President</option>
                <option>Director</option>
                <option>Managing Director</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-academy-blue mb-2">What are you looking for help with?</label>
            <Textarea 
              placeholder="e.g., Breaking into investment banking, preparing for interviews, understanding private equity..."
              rows={3}
            />
          </div>
          <Button className="w-full bg-academy-blue hover:bg-academy-blue-dark">
            Submit Mentor Request
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Mentorship;