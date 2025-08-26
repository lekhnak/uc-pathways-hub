import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { MapPin, Calendar, DollarSign, Building, Users } from "lucide-react"

const UCPartners = () => {
  const partnerPostings = [
    {
      id: 1,
      title: "Investment Banking Analyst Program",
      company: "Goldman Sachs",
      location: "Los Angeles, CA",
      type: "Full-time",
      salary: "$175,000 + bonus",
      deadline: "March 15, 2024",
      description: "Exclusive opportunity for UC students. Join our Investment Banking Division with accelerated progression track for top performers.",
      requirements: ["UC undergraduate degree", "GPA 3.5+", "Finance/Economics/Business background"],
      posted: "1 day ago",
      slots: "5 positions"
    },
    {
      id: 2,
      title: "Private Equity Summer Associate",
      company: "Blackstone",
      location: "San Francisco, CA",
      type: "Summer Program",
      salary: "$95,000 (10 weeks)",
      deadline: "February 28, 2024",
      description: "Partnership program with UC system. Direct pathway to full-time offer for exceptional candidates.",
      requirements: ["UC graduate student", "Prior finance experience", "Strong analytical skills"],
      posted: "3 days ago",
      slots: "3 positions"
    },
    {
      id: 3,
      title: "Venture Capital Analyst",
      company: "Andreessen Horowitz",
      location: "Menlo Park, CA",
      type: "Full-time",
      salary: "$160,000 + equity",
      deadline: "April 1, 2024",
      description: "Special UC alumni referral program. Work with cutting-edge startups and technology companies.",
      requirements: ["UC degree preferred", "Tech/startup interest", "Entrepreneurial mindset"],
      posted: "5 days ago",
      slots: "2 positions"
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Summer Program': return 'bg-green-100 text-green-800'
      case 'Full-time': return 'bg-blue-100 text-blue-800'
      case 'Part-time': return 'bg-purple-100 text-purple-800'
      default: return 'bg-academy-grey-light text-academy-grey'
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-4 text-academy-blue">UC Partner Opportunities</h1>
        <p className="text-academy-grey text-lg">
          Exclusive opportunities for UC students through our industry partnerships.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white shadow-card border-academy-grey-light">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-academy-blue">15</CardTitle>
            <CardDescription>Active Partners</CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-white shadow-card border-academy-grey-light">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-academy-blue">47</CardTitle>
            <CardDescription>Open Positions</CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-white shadow-card border-academy-grey-light">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-academy-blue">89%</CardTitle>
            <CardDescription>Placement Rate</CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-white shadow-card border-academy-grey-light">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-academy-blue">$165K</CardTitle>
            <CardDescription>Avg. Starting Salary</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Partner Postings */}
      <div className="space-y-6">
        {partnerPostings.map((posting) => (
          <Card key={posting.id} className="bg-white shadow-card border-academy-grey-light hover:shadow-elevated transition-all">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-xl text-academy-blue">{posting.title}</CardTitle>
                    <Badge className={getTypeColor(posting.type)}>{posting.type}</Badge>
                    <Badge variant="outline" className="border-academy-blue text-academy-blue">
                      UC Partner
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 text-academy-grey mb-3">
                    <span className="font-semibold text-academy-blue text-lg flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      {posting.company}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-4 w-4" />
                      {posting.location}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-4 w-4" />
                      {posting.slots}
                    </span>
                  </div>
                  <CardDescription className="text-base">{posting.description}</CardDescription>
                </div>
                <div className="text-right">
                  <p className="text-sm text-academy-grey">Posted {posting.posted}</p>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-academy-grey-light rounded-lg">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-academy-blue" />
                  <div>
                    <p className="text-sm font-medium">Compensation</p>
                    <p className="text-sm text-academy-grey">{posting.salary}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-academy-blue" />
                  <div>
                    <p className="text-sm font-medium">Application Deadline</p>
                    <p className="text-sm text-academy-grey">{posting.deadline}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-academy-blue" />
                  <div>
                    <p className="text-sm font-medium">Available Slots</p>
                    <p className="text-sm text-academy-grey">{posting.slots}</p>
                  </div>
                </div>
              </div>

              {/* Requirements */}
              <div>
                <h4 className="font-semibold text-academy-blue mb-2">Requirements</h4>
                <div className="flex flex-wrap gap-2">
                  {posting.requirements.map((req) => (
                    <Badge key={req} variant="secondary" className="bg-white border border-academy-grey-light text-academy-blue">
                      {req}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button className="flex-1 bg-academy-blue hover:bg-academy-blue-dark">
                  Apply Through UC Portal
                </Button>
                <Button variant="outline" className="border-academy-blue text-academy-blue hover:bg-academy-blue-light">
                  Contact Advisor
                </Button>
                <Button variant="outline" className="border-academy-blue text-academy-blue hover:bg-academy-blue-light">
                  Learn More
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Admin Notice */}
      <Card className="bg-academy-blue-light border-academy-blue">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="font-semibold text-academy-blue mb-2">For Career Services Admin</h3>
            <p className="text-academy-grey mb-4">
              These postings are managed through the UC Career Services portal. Contact admin to add new partner opportunities.
            </p>
            <Button variant="outline" className="border-academy-blue text-academy-blue hover:bg-white">
              Admin Portal
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UCPartners;