import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { BookOpen, Award, Calendar, Users, TrendingUp, Play } from "lucide-react"
import { NavLink } from "react-router-dom"
import heroImage from "@/assets/ucia-hero.jpg"

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
          />
        </div>
        <div className="relative p-8 md:p-12 text-white">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Welcome to UC Investment Academy
          </h1>
          <p className="text-xl mb-8 text-white/90 max-w-2xl">
            Master the world of investment banking, private equity, and finance through our comprehensive curriculum and expert mentorship.
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

      {/* Learning Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-white shadow-card border-academy-grey-light">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-academy-blue">
              <BookOpen className="h-5 w-5" />
              Your Learning Progress
            </CardTitle>
            <CardDescription>Continue where you left off</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">Orientations & Foundations</span>
                <span className="text-sm text-academy-grey">75%</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>
            <div>
              <div className="flex justify-between mb-2">
                <span className="text-sm font-medium">TTS Basic Finance</span>
                <span className="text-sm text-academy-grey">30%</span>
              </div>
              <Progress value={30} className="h-2" />
            </div>
            <Button className="w-full bg-academy-blue hover:bg-academy-blue-dark" asChild>
              <NavLink to="/modules">
                <Play className="mr-2 h-4 w-4" />
                Continue Learning
              </NavLink>
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white shadow-card border-academy-grey-light">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-academy-blue">
              <Calendar className="h-5 w-5" />
              Upcoming Events
            </CardTitle>
            <CardDescription>Don't miss these sessions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-academy-grey-light rounded-lg">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">
                Dec<br/>15
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-academy-blue">Private Equity Deep Dive</h4>
                <p className="text-sm text-academy-grey">Speaker: John Smith, KKR</p>
                <p className="text-xs text-academy-grey">2:00 PM - 3:30 PM</p>
              </div>
            </div>
            <div className="flex items-start gap-3 p-3 bg-academy-grey-light rounded-lg">
              <div className="w-12 h-12 bg-gradient-primary rounded-lg flex items-center justify-center text-white font-bold text-sm">
                Dec<br/>18
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-academy-blue">Resume Workshop</h4>
                <p className="text-sm text-academy-grey">Career Services Team</p>
                <p className="text-xs text-academy-grey">6:00 PM - 7:00 PM</p>
              </div>
            </div>
            <Button variant="outline" className="w-full border-academy-blue text-academy-blue hover:bg-academy-blue-light" asChild>
              <NavLink to="/calendar">View All Events</NavLink>
            </Button>
          </CardContent>
        </Card>
      </div>

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
    </div>
  );
};

export default Index;