import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar as CalendarIcon, Clock, MapPin, Users, Video, Bell } from "lucide-react"

const Calendar = () => {
  const upcomingEvents = [
    {
      id: 1,
      title: "Private Equity Deep Dive",
      speaker: "John Smith, Managing Director at KKR",
      date: "December 15, 2024",
      time: "2:00 PM - 3:30 PM EST",
      type: "Masterclass",
      location: "Virtual",
      description: "Learn about PE deal sourcing, due diligence processes, and value creation strategies from a seasoned professional.",
      attendees: 156,
      capacity: 200,
      status: "open"
    },
    {
      id: 2,
      title: "Resume & Cover Letter Workshop",
      speaker: "Career Services Team",
      date: "December 18, 2024",
      time: "6:00 PM - 7:00 PM EST",
      type: "Workshop",
      location: "Hybrid",
      description: "Get personalized feedback on your resume and learn how to craft compelling cover letters for finance roles.",
      attendees: 89,
      capacity: 100,
      status: "filling-fast"
    },
    {
      id: 3,
      title: "Fixed Income Market Outlook 2025",
      speaker: "Sarah Johnson, Portfolio Manager at PIMCO",
      date: "December 20, 2024",
      time: "12:00 PM - 1:00 PM EST",
      type: "Webinar",
      location: "Virtual",
      description: "Insights into the fixed income market trends and opportunities for the coming year.",
      attendees: 234,
      capacity: 300,
      status: "open"
    },
    {
      id: 4,
      title: "Networking Happy Hour",
      speaker: "UC Investment Academy Alumni",
      date: "December 22, 2024",
      time: "7:00 PM - 9:00 PM EST",
      type: "Networking",
      location: "New York, NY",
      description: "Network with alumni working at top finance firms. Light refreshments provided.",
      attendees: 67,
      capacity: 80,
      status: "open"
    },
    {
      id: 5,
      title: "Real Estate Investment Fundamentals",
      speaker: "Michael Chen, VP at Brookfield Properties",
      date: "January 8, 2025",
      time: "3:00 PM - 4:30 PM EST",
      type: "Lecture",
      location: "Virtual",
      description: "Explore real estate investment strategies, market analysis, and property valuation techniques.",
      attendees: 0,
      capacity: 250,
      status: "upcoming"
    },
    {
      id: 6,
      title: "Mock Interview Day",
      speaker: "Industry Professionals Panel",
      date: "January 12, 2025",
      time: "9:00 AM - 5:00 PM EST",
      type: "Workshop",
      location: "Boston, MA",
      description: "Practice your interview skills with professionals from leading investment banks and asset management firms.",
      attendees: 45,
      capacity: 50,
      status: "filling-fast"
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open': return 'bg-green-100 text-green-800'
      case 'filling-fast': return 'bg-yellow-100 text-yellow-800'
      case 'full': return 'bg-red-100 text-red-800'
      case 'upcoming': return 'bg-academy-blue-light text-academy-blue'
      default: return 'bg-academy-grey-light text-academy-grey'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Masterclass': return 'bg-purple-100 text-purple-800'
      case 'Workshop': return 'bg-blue-100 text-blue-800'
      case 'Webinar': return 'bg-green-100 text-green-800'
      case 'Networking': return 'bg-orange-100 text-orange-800'
      case 'Lecture': return 'bg-indigo-100 text-indigo-800'
      default: return 'bg-academy-grey-light text-academy-grey'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-4 text-academy-blue">Events Calendar</h1>
        <p className="text-academy-grey text-lg">
          Join expert-led sessions, workshops, and networking events to advance your finance career.
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white shadow-card border-academy-grey-light">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-academy-blue">24</CardTitle>
            <CardDescription>Upcoming Events</CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-white shadow-card border-academy-grey-light">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-academy-blue">8</CardTitle>
            <CardDescription>This Month</CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-white shadow-card border-academy-grey-light">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-academy-blue">156</CardTitle>
            <CardDescription>Avg. Attendance</CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-white shadow-card border-academy-grey-light">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-academy-blue">32</CardTitle>
            <CardDescription>Expert Speakers</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Filter/View Options */}
      <Card className="bg-gradient-subtle border-academy-blue-light shadow-card">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="border-academy-blue text-academy-blue bg-white">
              All Events
            </Button>
            <Button variant="ghost" className="text-academy-grey hover:text-academy-blue">
              Masterclasses
            </Button>
            <Button variant="ghost" className="text-academy-grey hover:text-academy-blue">
              Workshops
            </Button>
            <Button variant="ghost" className="text-academy-grey hover:text-academy-blue">
              Networking
            </Button>
            <Button variant="ghost" className="text-academy-grey hover:text-academy-blue">
              Virtual Only
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Upcoming Events */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-academy-blue">Upcoming Events</h2>
        {upcomingEvents.map((event) => (
          <Card key={event.id} className="bg-white shadow-card border-academy-grey-light hover:shadow-elevated transition-all">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-xl text-academy-blue">{event.title}</CardTitle>
                    <Badge className={getTypeColor(event.type)}>{event.type}</Badge>
                    <Badge className={getStatusColor(event.status)}>
                      {event.status === 'filling-fast' ? 'Filling Fast' : 
                       event.status === 'open' ? 'Open' : 
                       event.status === 'full' ? 'Full' : 'Upcoming'}
                    </Badge>
                  </div>
                  <CardDescription className="text-lg font-medium text-academy-blue mb-2">
                    {event.speaker}
                  </CardDescription>
                  <CardDescription className="text-base">{event.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {/* Event Details */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 p-4 bg-academy-grey-light rounded-lg">
                <div className="flex items-center gap-2">
                  <CalendarIcon className="h-4 w-4 text-academy-blue" />
                  <div>
                    <p className="text-sm font-medium">Date</p>
                    <p className="text-sm text-academy-grey">{event.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-academy-blue" />
                  <div>
                    <p className="text-sm font-medium">Time</p>
                    <p className="text-sm text-academy-grey">{event.time}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {event.location === 'Virtual' ? (
                    <Video className="h-4 w-4 text-academy-blue" />
                  ) : (
                    <MapPin className="h-4 w-4 text-academy-blue" />
                  )}
                  <div>
                    <p className="text-sm font-medium">Location</p>
                    <p className="text-sm text-academy-grey">{event.location}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-academy-blue" />
                  <div>
                    <p className="text-sm font-medium">Attendance</p>
                    <p className="text-sm text-academy-grey">{event.attendees}/{event.capacity}</p>
                  </div>
                </div>
              </div>

              {/* Attendance Progress */}
              {event.attendees > 0 && (
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Registration</span>
                    <span className="text-sm text-academy-grey">
                      {Math.round((event.attendees / event.capacity) * 100)}% full
                    </span>
                  </div>
                  <div className="w-full bg-academy-grey-light rounded-full h-2">
                    <div 
                      className="bg-academy-blue h-2 rounded-full transition-all" 
                      style={{ width: `${(event.attendees / event.capacity) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <Button 
                  className="flex-1 bg-academy-blue hover:bg-academy-blue-dark"
                  disabled={event.status === 'full'}
                >
                  {event.status === 'full' ? 'Event Full' : 'Register Now'}
                </Button>
                <Button variant="outline" className="border-academy-blue text-academy-blue hover:bg-academy-blue-light">
                  <Bell className="h-4 w-4 mr-2" />
                  Remind Me
                </Button>
                <Button variant="outline" className="border-academy-blue text-academy-blue hover:bg-academy-blue-light">
                  Share
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Calendar Integration */}
      <Card className="bg-gradient-subtle border-academy-blue-light shadow-card">
        <CardHeader>
          <CardTitle className="text-academy-blue">Stay Updated</CardTitle>
          <CardDescription>Never miss an important event</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <Button variant="outline" className="border-academy-blue text-academy-blue hover:bg-academy-blue-light">
            Add to Google Calendar
          </Button>
          <Button variant="outline" className="border-academy-blue text-academy-blue hover:bg-academy-blue-light">
            Add to Outlook
          </Button>
          <Button variant="outline" className="border-academy-blue text-academy-blue hover:bg-academy-blue-light">
            Subscribe to iCal
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default Calendar;