import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Briefcase, MapPin, Calendar, DollarSign, Search, Filter } from "lucide-react"

const Internships = () => {
  const internships = [
    {
      id: 1,
      title: "Investment Banking Summer Analyst",
      company: "Goldman Sachs",
      location: "New York, NY",
      type: "Summer Internship",
      duration: "10 weeks",
      compensation: "$85,000 (prorated)",
      deadline: "January 15, 2024",
      description: "Join our Investment Banking Division for a comprehensive summer experience covering M&A, capital markets, and client advisory.",
      requirements: ["Junior or Senior standing", "Finance/Economics major preferred", "Strong analytical skills", "Excel proficiency"],
      posted: "2 days ago"
    },
    {
      id: 2,
      title: "Private Equity Intern",
      company: "KKR & Co.",
      location: "San Francisco, CA",
      type: "Summer Internship",
      duration: "12 weeks",
      compensation: "$90,000 (prorated)",
      deadline: "February 1, 2024",
      description: "Work directly with investment professionals on deal sourcing, due diligence, and portfolio company monitoring.",
      requirements: ["Rising senior", "GPA 3.7+", "Previous finance experience", "Strong communication skills"],
      posted: "1 week ago"
    },
    {
      id: 3,
      title: "Real Estate Finance Analyst",
      company: "Blackstone",
      location: "Boston, MA",
      type: "Summer Internship",
      duration: "10 weeks",
      compensation: "$80,000 (prorated)",
      deadline: "January 30, 2024",
      description: "Support the real estate investment team with financial modeling, market analysis, and investment presentations.",
      requirements: ["Finance/Real Estate major", "Financial modeling experience", "Detail-oriented", "Team player"],
      posted: "3 days ago"
    },
    {
      id: 4,
      title: "Credit Research Intern",
      company: "Apollo Global Management",
      location: "Chicago, IL",
      type: "Summer Internship",
      duration: "11 weeks",
      compensation: "$82,000 (prorated)",
      deadline: "February 15, 2024",
      description: "Analyze credit opportunities, prepare investment memos, and support portfolio management activities.",
      requirements: ["Economics/Finance background", "Strong writing skills", "Credit analysis knowledge", "Python/R preferred"],
      posted: "5 days ago"
    },
    {
      id: 5,
      title: "Equity Research Associate",
      company: "Citadel Securities",
      location: "Remote (US)",
      type: "Part-time",
      duration: "6 months",
      compensation: "$40/hour",
      deadline: "Rolling basis",
      description: "Conduct equity research and analysis to support trading and investment decisions.",
      requirements: ["Strong academic record", "Financial modeling skills", "Bloomberg experience", "Quantitative background"],
      posted: "1 day ago"
    },
    {
      id: 6,
      title: "Fixed Income Analyst Intern",
      company: "PIMCO",
      location: "Newport Beach, CA",
      type: "Summer Internship",
      duration: "10 weeks",
      compensation: "$88,000 (prorated)",
      deadline: "January 20, 2024",
      description: "Support fixed income portfolio management and research across various asset classes.",
      requirements: ["Graduate student preferred", "Fixed income knowledge", "Risk management understanding", "CFA progress preferred"],
      posted: "4 days ago"
    }
  ]

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Summer Internship': return 'bg-green-100 text-green-800'
      case 'Part-time': return 'bg-blue-100 text-blue-800'
      case 'Full-time': return 'bg-purple-100 text-purple-800'
      default: return 'bg-academy-grey-light text-academy-grey'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-4 text-academy-blue">Internship Opportunities</h1>
        <p className="text-academy-grey text-lg">
          Discover internships and entry-level opportunities at top financial institutions.
        </p>
      </div>

      {/* Search and Filters */}
      <Card className="bg-white shadow-card border-academy-grey-light">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-academy-grey" />
              <Input 
                placeholder="Search by company, title, or location..." 
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Location" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Locations</SelectItem>
                  <SelectItem value="ny">New York</SelectItem>
                  <SelectItem value="sf">San Francisco</SelectItem>
                  <SelectItem value="chicago">Chicago</SelectItem>
                  <SelectItem value="boston">Boston</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                </SelectContent>
              </Select>
              <Select>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="summer">Summer Internship</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="full-time">Full-time</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline" className="border-academy-blue text-academy-blue hover:bg-academy-blue-light">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white shadow-card border-academy-grey-light">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-academy-blue">247</CardTitle>
            <CardDescription>Active Listings</CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-white shadow-card border-academy-grey-light">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-academy-blue">89</CardTitle>
            <CardDescription>New This Week</CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-white shadow-card border-academy-grey-light">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-academy-blue">$85K</CardTitle>
            <CardDescription>Avg. Compensation</CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-white shadow-card border-academy-grey-light">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-academy-blue">156</CardTitle>
            <CardDescription>Partner Companies</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Internship Listings */}
      <div className="space-y-6">
        {internships.map((internship) => (
          <Card key={internship.id} className="bg-white shadow-card border-academy-grey-light hover:shadow-elevated transition-all">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-xl text-academy-blue">{internship.title}</CardTitle>
                    <Badge className={getTypeColor(internship.type)}>{internship.type}</Badge>
                  </div>
                  <div className="flex items-center gap-4 text-academy-grey mb-3">
                    <span className="font-semibold text-academy-blue text-lg">{internship.company}</span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {internship.location}
                    </span>
                  </div>
                  <CardDescription className="text-base">{internship.description}</CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-sm text-academy-grey">Posted {internship.posted}</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-academy-grey-light rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-academy-blue" />
                  <div>
                    <p className="text-sm font-medium">Duration</p>
                    <p className="text-sm text-academy-grey">{internship.duration}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-academy-blue" />
                  <div>
                    <p className="text-sm font-medium">Compensation</p>
                    <p className="text-sm text-academy-grey">{internship.compensation}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Briefcase className="h-4 w-4 text-academy-blue" />
                  <div>
                    <p className="text-sm font-medium">Deadline</p>
                    <p className="text-sm text-academy-grey">{internship.deadline}</p>
                  </div>
                </div>
              </div>

              {/* Requirements */}
              <div>
                <h4 className="font-semibold text-academy-blue mb-2">Requirements</h4>
                <div className="flex flex-wrap gap-2">
                  {internship.requirements.map((req) => (
                    <Badge key={req} variant="secondary" className="bg-white border border-academy-grey-light text-academy-blue">
                      {req}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button className="flex-1 bg-academy-blue hover:bg-academy-blue-dark">
                  Apply Now
                </Button>
                <Button variant="outline" className="border-academy-blue text-academy-blue hover:bg-academy-blue-light">
                  Save
                </Button>
                <Button variant="outline" className="border-academy-blue text-academy-blue hover:bg-academy-blue-light">
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Load More */}
      <div className="text-center">
        <Button variant="outline" size="lg" className="border-academy-blue text-academy-blue hover:bg-academy-blue-light">
          Load More Opportunities
        </Button>
      </div>
    </div>
  );
};

export default Internships;