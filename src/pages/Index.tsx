import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { BookOpen, Award, Calendar, Users, TrendingUp, MessageCircle, Clock, MapPin } from "lucide-react"
import { NavLink } from "react-router-dom"
import heroImage from "@/assets/ucia-hero.jpg"
import ActionItemsChecklist from "@/components/ActionItemsChecklist"
import { useCalendarEvents } from "@/hooks/useCalendarEvents"
import { format } from 'date-fns'

const UpcomingEventsSection = () => {
  const { events, loading } = useCalendarEvents()
  
  const upcomingEvents = events
    .filter(event => new Date(event.event_date) >= new Date())
    .slice(0, 4)

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="flex items-start gap-3 p-3 bg-academy-grey-light rounded-lg animate-pulse">
            <div className="w-12 h-12 bg-academy-grey rounded-lg"></div>
            <div className="flex-1 space-y-2">
              <div className="h-4 bg-academy-grey rounded w-3/4"></div>
              <div className="h-3 bg-academy-grey rounded w-1/2"></div>
              <div className="h-3 bg-academy-grey rounded w-1/4"></div>
            </div>
          </div>
        ))}
      </div>
    )
  }

  if (upcomingEvents.length === 0) {
    return (
      <div className="text-center py-8 text-academy-grey">
        <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>No upcoming events scheduled</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Events List */}
      <div className="lg:col-span-2 space-y-4">
        {upcomingEvents.map((event) => {
          const eventDate = new Date(event.event_date)
          const monthDay = format(eventDate, 'MMM dd')
          
          return (
            <div key={event.id} className="flex items-start gap-3 p-4 bg-academy-grey-light rounded-lg hover:shadow-card transition-shadow">
              <div className="w-16 h-16 bg-gradient-primary rounded-lg flex flex-col items-center justify-center text-white font-bold text-xs">
                <span>{format(eventDate, 'MMM')}</span>
                <span>{format(eventDate, 'dd')}</span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-academy-blue mb-1 line-clamp-1">{event.title}</h4>
                {event.speakers && event.speakers.length > 0 && (
                  <p className="text-sm text-academy-grey mb-1 line-clamp-1">
                    {event.speakers[0]}
                  </p>
                )}
                {event.description && (
                  <p className="text-xs text-academy-grey mb-2 line-clamp-2">
                    {event.description.length > 80 ? `${event.description.substring(0, 80)}...` : event.description}
                  </p>
                )}
                <div className="flex items-center gap-4 text-xs text-academy-grey">
                  {event.event_time && (
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {format(new Date(`2000-01-01T${event.event_time}`), 'h:mm a')}
                    </span>
                  )}
                  {event.location && (
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3 w-3" />
                      {event.location}
                    </span>
                  )}
                </div>
              </div>
              <Button 
                size="sm" 
                variant="outline" 
                className="border-academy-blue text-academy-blue hover:bg-academy-blue-light"
                disabled={!event.signup_url}
                onClick={() => {
                  if (event.signup_url) {
                    window.open(event.signup_url, '_blank')
                  }
                }}
              >
                {event.signup_url ? 'Register' : 'Info Only'}
              </Button>
            </div>
          )
        })}
        
        <Button variant="outline" className="w-full border-academy-blue text-academy-blue hover:bg-academy-blue-light" asChild>
          <NavLink to="/calendar">View All Events</NavLink>
        </Button>
      </div>

      {/* Mini Calendar */}
      <div className="bg-gradient-subtle border border-academy-blue-light rounded-lg p-4">
        <h3 className="font-semibold text-academy-blue mb-4 text-center">
          {format(new Date(), 'MMMM yyyy')}
        </h3>
        <div className="text-center space-y-2">
          <div className="text-3xl font-bold text-academy-blue">
            {format(new Date(), 'dd')}
          </div>
          <div className="text-sm text-academy-grey">
            {format(new Date(), 'EEEE')}
          </div>
          <div className="pt-4">
            <p className="text-xs text-academy-grey mb-2">Upcoming this month:</p>
            <p className="font-medium text-academy-blue">
              {events.filter(event => {
                const eventDate = new Date(event.event_date)
                const now = new Date()
                return eventDate.getMonth() === now.getMonth() && 
                       eventDate.getFullYear() === now.getFullYear() &&
                       eventDate >= now
              }).length} events
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

const Index = () => {
  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="relative bg-gradient-hero rounded-2xl overflow-hidden shadow-hero">
        <div className="absolute inset-0">
          <img 
            src={heroImage} 
            alt="UC Investment Academy - Professional Finance Education" 
            className="w-full h-full object-cover opacity-20"
            fetchPriority="high"
          />
        </div>
        <div className="relative p-8 md:p-12 text-white">
          <div className="flex items-center gap-6 mb-6">
            <img 
              src="/lovable-uploads/11121176-120b-4173-8562-293c5b5a5179.png" 
              alt="University of California Logo" 
              className="h-20 w-20 object-contain bg-white rounded-lg p-2"
            />
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold mb-2">
                UC Investments Academy
              </h1>
              <p className="text-lg text-white/90">
                University of California
              </p>
            </div>
          </div>
          <p className="text-xl mb-8 text-white/90 max-w-3xl">
            The UC Investments Academy educates, motivates and professionally trains students for careers in investing and finance, at no cost. Students gain practical, career-relevant training that mirrors what entry-level professionals would receive at a top investment firm.
          </p>
          <div className="flex flex-wrap gap-4">
            <Button size="lg" variant="secondary" asChild>
              <NavLink to="/modules">
                <BookOpen className="mr-2 h-5 w-5" />
                Start Learning
              </NavLink>
            </Button>
            <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20" asChild>
              <NavLink to="/pathways">
                <TrendingUp className="mr-2 h-5 w-5" />
                Explore Pathways
              </NavLink>
            </Button>
          </div>
        </div>
      </div>

      {/* Action Items Checklist */}
      <ActionItemsChecklist />

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card className="bg-white shadow-card border-academy-grey-light">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-academy-blue">12+</CardTitle>
            <CardDescription>Learning Modules</CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-white shadow-card border-academy-grey-light">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-academy-blue">5</CardTitle>
            <CardDescription>Career Pathways</CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-white shadow-card border-academy-grey-light">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-academy-blue">50+</CardTitle>
            <CardDescription>Industry Partners</CardDescription>
          </CardHeader>
        </Card>
        <Card className="bg-white shadow-card border-academy-grey-light">
          <CardHeader className="pb-2">
            <CardTitle className="text-2xl font-bold text-academy-blue">200+</CardTitle>
            <CardDescription>Alumni Network</CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* Upcoming Events - Expanded */}
      <Card className="bg-white shadow-card border-academy-grey-light">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-academy-blue">
            <Calendar className="h-5 w-5" />
            Upcoming Events
          </CardTitle>
          <CardDescription>Join expert-led sessions and workshops</CardDescription>
        </CardHeader>
        <CardContent>
          <UpcomingEventsSection />
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-white shadow-card border-academy-grey-light hover:shadow-elevated transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-academy-blue">
              <Award className="h-5 w-5" />
              Certifications
            </CardTitle>
            <CardDescription>Earn industry-recognized credentials</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full border-academy-blue text-academy-blue hover:bg-academy-blue-light" asChild>
              <NavLink to="/certifications">Explore Certifications</NavLink>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-card border-academy-grey-light hover:shadow-elevated transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-academy-blue">
              <Users className="h-5 w-5" />
              Mentorship
            </CardTitle>
            <CardDescription>Connect with industry professionals</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full border-academy-blue text-academy-blue hover:bg-academy-blue-light" asChild>
              <NavLink to="/mentorship">Find a Mentor</NavLink>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-card border-academy-grey-light hover:shadow-elevated transition-shadow cursor-pointer">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-academy-blue">
              <TrendingUp className="h-5 w-5" />
              Career Pathways
            </CardTitle>
            <CardDescription>Discover your finance career path</CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="w-full border-academy-blue text-academy-blue hover:bg-academy-blue-light" asChild>
              <NavLink to="/pathways">Explore Paths</NavLink>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Slack Integration */}
      <Card className="bg-gradient-subtle border-academy-blue-light shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-academy-blue">
            <MessageCircle className="h-5 w-5" />
            Join Our Community
          </CardTitle>
          <CardDescription>Connect with fellow students and stay updated</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              className="flex-1 bg-academy-blue hover:bg-academy-blue-dark"
              onClick={() => window.open('https://join.slack.com/t/ucinvestmentacademy/shared_invite/your-invite-link', '_blank')}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Join UC IA Slack
            </Button>
            <Button 
              variant="outline" 
              className="flex-1 border-academy-blue text-academy-blue hover:bg-academy-blue-light"
              asChild
            >
              <NavLink to="/chat">
                <Users className="mr-2 h-4 w-4" />
                Chat with Fellows
              </NavLink>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Index;