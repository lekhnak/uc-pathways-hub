import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar as CalendarIcon, Clock, MapPin, Users, Video, Bell } from "lucide-react"
import { useCalendarEvents } from "@/hooks/useCalendarEvents"
import { format } from 'date-fns'

const Calendar = () => {
  const { events, loading } = useCalendarEvents()
  
  const upcomingEvents = events.filter(event => new Date(event.event_date) >= new Date())

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
            <CardTitle className="text-2xl font-bold text-academy-blue">
              {loading ? '...' : upcomingEvents.length}
            </CardTitle>
            <CardDescription>Upcoming Events</CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-white shadow-card border-academy-grey-light">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-academy-blue">
              {loading ? '...' : events.filter(event => {
                const eventDate = new Date(event.event_date)
                const now = new Date()
                return eventDate.getMonth() === now.getMonth() && 
                       eventDate.getFullYear() === now.getFullYear()
              }).length}
            </CardTitle>
            <CardDescription>This Month</CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-white shadow-card border-academy-grey-light">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-academy-blue">
              {loading ? '...' : events.length}
            </CardTitle>
            <CardDescription>Total Events</CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-white shadow-card border-academy-grey-light">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-academy-blue">
              {loading ? '...' : events.filter(event => event.speakers && event.speakers.length > 0).length}
            </CardTitle>
            <CardDescription>With Speakers</CardDescription>
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
        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="bg-white shadow-card border-academy-grey-light animate-pulse">
                <CardHeader>
                  <div className="h-6 bg-academy-grey-light rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-academy-grey-light rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-4 bg-academy-grey-light rounded w-full mb-4"></div>
                  <div className="grid grid-cols-4 gap-4">
                    {[...Array(4)].map((_, j) => (
                      <div key={j} className="h-12 bg-academy-grey-light rounded"></div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : upcomingEvents.length === 0 ? (
          <Card className="bg-white shadow-card border-academy-grey-light">
            <CardContent className="text-center py-12">
              <CalendarIcon className="h-12 w-12 mx-auto mb-4 text-academy-grey opacity-50" />
              <h3 className="text-lg font-medium text-academy-grey mb-2">No Upcoming Events</h3>
              <p className="text-academy-grey">Check back later for new events and workshops.</p>
            </CardContent>
          </Card>
        ) : (
          upcomingEvents.map((event) => (
            <Card key={event.id} className="bg-white shadow-card border-academy-grey-light hover:shadow-elevated transition-all">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <CardTitle className="text-xl text-academy-blue">{event.title}</CardTitle>
                      <Badge className={getTypeColor(event.event_type)}>{event.event_type}</Badge>
                      <Badge className={getStatusColor(event.status)}>
                        {event.status === 'filling-fast' ? 'Filling Fast' : 
                         event.status === 'open' ? 'Open' : 
                         event.status === 'full' ? 'Full' : 'Upcoming'}
                      </Badge>
                    </div>
                    <CardDescription className="text-lg font-medium text-academy-blue mb-2">
                      {event.speakers && event.speakers.length > 0 ? event.speakers.join(', ') : 'TBA'}
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
                      <p className="text-sm text-academy-grey">
                        {format(new Date(event.event_date), 'PPP')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-academy-blue" />
                    <div>
                      <p className="text-sm font-medium">Time</p>
                      <p className="text-sm text-academy-grey">
                        {event.event_time ? format(new Date(`2000-01-01T${event.event_time}`), 'p') : 'TBA'}
                      </p>
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
                      <p className="text-sm text-academy-grey">{event.location || 'TBA'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-academy-blue" />
                    <div>
                      <p className="text-sm font-medium">Status</p>
                      <p className="text-sm text-academy-grey capitalize">{event.status}</p>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-2">
                  <Button 
                    className="flex-1 bg-academy-blue hover:bg-academy-blue-dark"
                    disabled={event.status === 'full'}
                    onClick={() => {
                      if (event.signup_url) {
                        window.open(event.signup_url, '_blank');
                      }
                    }}
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
          ))
        )}
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