import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { NavLink } from "react-router-dom"
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Award, 
  Clock, 
  Target, 
  Lightbulb,
  GraduationCap,
  Building,
  Network,
  Calendar,
  CheckCircle,
  ArrowRight,
  Menu,
  X,
  Star,
  ChevronRight,
  MapPin,
  Mail,
  Phone
} from "lucide-react"
import uciaLogo from "@/assets/ucia-logo.png"
import uciaHero from "@/assets/ucia-hero.jpg"

const CountUpNumber = ({ end, duration = 2000, suffix = "" }: { end: number; duration?: number; suffix?: string }) => {
  const [count, setCount] = useState(0)
  const [hasAnimated, setHasAnimated] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasAnimated) {
          setHasAnimated(true)
          let start = 0
          const increment = end / (duration / 16)
          const timer = setInterval(() => {
            start += increment
            if (start >= end) {
              setCount(end)
              clearInterval(timer)
            } else {
              setCount(Math.floor(start))
            }
          }, 16)
        }
      },
      { threshold: 0.1 }
    )

    const element = document.getElementById(`count-${end}`)
    if (element) observer.observe(element)

    return () => observer.disconnect()
  }, [end, duration, hasAnimated])

  return <span id={`count-${end}`}>{count.toLocaleString()}{suffix}</span>
}

const ProcessStage = ({ 
  title, 
  items, 
  color, 
  index 
}: { 
  title: string
  items: string[]
  color: string
  index: number 
}) => (
  <div className={`relative p-6 rounded-2xl border-2 ${color} animate-fade-in`} style={{ animationDelay: `${index * 0.1}s` }}>
    <h3 className="font-bold text-lg mb-4 text-foreground">{title}</h3>
    <ul className="space-y-2">
      {items.map((item, idx) => (
        <li key={idx} className="flex items-start gap-2 text-sm text-muted-foreground">
          <div className="w-1 h-1 bg-current rounded-full mt-2 flex-shrink-0" />
          {item}
        </li>
      ))}
    </ul>
    {index < 6 && (
      <ChevronRight className="absolute -right-4 top-1/2 -translate-y-1/2 text-academy-blue h-6 w-6 hidden lg:block" />
    )}
  </div>
)

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    element?.scrollIntoView({ behavior: 'smooth' })
    setIsMenuOpen(false)
  }

  return (
    <>
      {/* SEO Meta Tags */}
      <div className="sr-only">
        <h1>UC Investments Academy - Building the next generation of finance leaders</h1>
        <meta name="description" content="Join 3000+ UC students across 9 campuses learning asset management and building careers in finance. Free training, mentorship, and real-world experience." />
        <meta name="keywords" content="UC Investments Academy, finance careers, asset management, UC students, investment training, mentorship" />
        <meta property="og:title" content="UC Investments Academy - Finance Career Training" />
        <meta property="og:description" content="Free asset management training for UC students. Build financial literacy and gain real-world experience managing UC's multi-billion-dollar portfolio." />
      </div>

      <div className="min-h-screen bg-background">
        {/* Navigation Header */}
        <header className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <nav className="flex items-center justify-between">
              {/* Logo */}
              <div className="flex items-center gap-3">
                <img src={uciaLogo} alt="UC Investments Academy" className="h-10 w-10" />
                <span className="text-xl font-bold text-academy-blue">UC Investments Academy</span>
              </div>

              {/* Desktop Navigation */}
              <div className="hidden md:flex items-center gap-8">
                <button onClick={() => scrollToSection('about')} className="text-foreground hover:text-academy-blue transition-colors">
                  About
                </button>
                <button onClick={() => scrollToSection('program')} className="text-foreground hover:text-academy-blue transition-colors">
                  Program
                </button>
                <button onClick={() => scrollToSection('benefits')} className="text-foreground hover:text-academy-blue transition-colors">
                  Benefits
                </button>
                <button onClick={() => scrollToSection('mentorship')} className="text-foreground hover:text-academy-blue transition-colors">
                  Mentorship
                </button>
                <button onClick={() => scrollToSection('faq')} className="text-foreground hover:text-academy-blue transition-colors">
                  FAQ
                </button>
                <button onClick={() => scrollToSection('contact')} className="text-foreground hover:text-academy-blue transition-colors">
                  Contact
                </button>
              </div>

              {/* Auth Buttons */}
              <div className="hidden md:flex items-center gap-4">
                <Button variant="ghost" asChild>
                  <NavLink to="/auth">Log in</NavLink>
                </Button>
                <Button asChild>
                  <NavLink to="/auth">Sign up</NavLink>
                </Button>
              </div>

              {/* Mobile menu button */}
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
              >
                {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>
            </nav>

            {/* Mobile Navigation */}
            {isMenuOpen && (
              <div className="md:hidden mt-4 pb-4 border-t border-border">
                <div className="flex flex-col gap-4 pt-4">
                  <button onClick={() => scrollToSection('about')} className="text-left text-foreground hover:text-academy-blue transition-colors">
                    About
                  </button>
                  <button onClick={() => scrollToSection('program')} className="text-left text-foreground hover:text-academy-blue transition-colors">
                    Program
                  </button>
                  <button onClick={() => scrollToSection('benefits')} className="text-left text-foreground hover:text-academy-blue transition-colors">
                    Benefits
                  </button>
                  <button onClick={() => scrollToSection('mentorship')} className="text-left text-foreground hover:text-academy-blue transition-colors">
                    Mentorship
                  </button>
                  <button onClick={() => scrollToSection('faq')} className="text-left text-foreground hover:text-academy-blue transition-colors">
                    FAQ
                  </button>
                  <button onClick={() => scrollToSection('contact')} className="text-left text-foreground hover:text-academy-blue transition-colors">
                    Contact
                  </button>
                  <div className="flex flex-col gap-2 pt-4 border-t border-border">
                    <Button variant="ghost" asChild>
                      <NavLink to="/auth">Log in</NavLink>
                    </Button>
                    <Button asChild>
                      <NavLink to="/auth">Sign up</NavLink>
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Hero Section */}
        <section className="relative py-20 lg:py-32 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-hero">
            <img 
              src={uciaHero} 
              alt="UC Investments Academy - Finance Education" 
              className="w-full h-full object-cover opacity-20"
              loading="eager"
            />
          </div>
          <div className="relative container mx-auto px-4 text-center text-white">
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in">
              Building the next generation of
              <span className="block text-academy-accent">finance leaders</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-white/90 animate-fade-in" style={{ animationDelay: '0.2s' }}>
              Connect UC undergrads with opportunities in the financial industry through free training, tools, and coaching.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center animate-fade-in" style={{ animationDelay: '0.4s' }}>
              <Button size="lg" className="bg-white text-academy-blue hover:bg-white/90" asChild>
                <NavLink to="/auth">
                  Apply Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </NavLink>
              </Button>
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white/30 text-white hover:bg-white/10"
                onClick={() => scrollToSection('program')}
              >
                Explore the Program
              </Button>
            </div>
          </div>
        </section>

        {/* Social Proof Stats */}
        <section className="py-16 bg-academy-grey-light">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <Card className="text-center shadow-card animate-counter">
                <CardContent className="pt-6">
                  <div className="text-3xl md:text-4xl font-bold text-academy-blue mb-2">
                    <CountUpNumber end={3000} suffix="+" />
                  </div>
                  <p className="text-muted-foreground">UC students engaged</p>
                </CardContent>
              </Card>
              <Card className="text-center shadow-card animate-counter" style={{ animationDelay: '0.1s' }}>
                <CardContent className="pt-6">
                  <div className="text-3xl md:text-4xl font-bold text-academy-blue mb-2">
                    <CountUpNumber end={9} />
                  </div>
                  <p className="text-muted-foreground">UC campuses</p>
                </CardContent>
              </Card>
              <Card className="text-center shadow-card animate-counter" style={{ animationDelay: '0.2s' }}>
                <CardContent className="pt-6">
                  <div className="text-3xl md:text-4xl font-bold text-academy-blue mb-2">
                    FREE
                  </div>
                  <p className="text-muted-foreground">Training, tools & coaching</p>
                </CardContent>
              </Card>
              <Card className="text-center shadow-card animate-counter" style={{ animationDelay: '0.3s' }}>
                <CardContent className="pt-6">
                  <div className="text-3xl md:text-4xl font-bold text-academy-blue mb-2">
                    REAL
                  </div>
                  <p className="text-muted-foreground">Investing experience</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* About Section */}
        <section id="about" className="py-20">
          <div className="container mx-auto px-4">
            <div className="grid lg:grid-cols-2 gap-12 items-center">
              <div className="animate-fade-in">
                <h2 className="text-3xl md:text-4xl font-bold mb-6 text-academy-blue">
                  What is the UC Investments Academy?
                </h2>
                <div className="space-y-4 text-lg text-muted-foreground">
                  <p>
                    Launched by UC Investments and UC Office of the President in 2022, this program prepares UC students for careers in finance and asset management. Initially starting with just 100 students at UC Merced, the program has expanded to multiple UC campuses and provides the one-stop UC destination for preparing for careers in finance.
                  </p>
                  <p>
                    The UC Investments Academy, which we created to connect UC undergrads with opportunities in the financial industry, has engaged 3000+ students across 9 UC campuses. The Academy provides free training, tools and coaching to all interested UC students.
                  </p>
                </div>
                
                {/* Timeline */}
                <div className="mt-8 bg-academy-grey-light p-6 rounded-2xl">
                  <h3 className="font-semibold text-academy-blue mb-4">Our Growth</h3>
                  <div className="flex items-center gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-academy-blue">2022</div>
                      <div className="text-sm text-muted-foreground">100 students</div>
                      <div className="text-xs text-muted-foreground">UC Merced</div>
                    </div>
                    <ArrowRight className="text-academy-blue h-5 w-5" />
                    <div className="text-center">
                      <div className="text-2xl font-bold text-academy-blue">2024</div>
                      <div className="text-sm text-muted-foreground">3000+ students</div>
                      <div className="text-xs text-muted-foreground">9 UC campuses</div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <img 
                  src="/lovable-uploads/afe88b15-8d39-4a7f-a2a8-0c78244c5ba0.png" 
                  alt="UC Investments Academy Program Flow" 
                  className="w-full rounded-2xl shadow-elevated"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Program Overview - Process Flow */}
        <section id="program" className="py-20 bg-academy-grey-light">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-academy-blue">Our Complete Program</h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                A comprehensive pathway designed to take you from awareness to career success in finance and asset management.
              </p>
            </div>

            {/* Process Flow - based on uploaded image */}
            <div className="grid lg:grid-cols-7 gap-4 mb-16">
              <ProcessStage
                title="AWARENESS"
                items={[
                  "Provide exposure to different areas of asset management",
                  "Clarify options for investment careers"
                ]}
                color="border-blue-500 bg-blue-50"
                index={0}
              />
              <ProcessStage
                title="ACCESS"
                items={[
                  "Intentional approach to create a diverse and inclusive participant base"
                ]}
                color="border-cyan-500 bg-cyan-50"
                index={1}
              />
              <ProcessStage
                title="EDUCATION"
                items={[
                  "Foundational personal finance concepts",
                  "Investment analysis and portfolio management education"
                ]}
                color="border-green-500 bg-green-50"
                index={2}
              />
              <ProcessStage
                title="TRAINING"
                items={[
                  "Practical investment analysis and experience",
                  "'Soft skills' for professional success"
                ]}
                color="border-gray-500 bg-gray-50"
                index={3}
              />
              <ProcessStage
                title="NETWORK"
                items={[
                  "Provide exposure to investment professionals within and outside UC network",
                  "Create an investment and entrepreneurship community"
                ]}
                color="border-orange-500 bg-orange-50"
                index={4}
              />
              <ProcessStage
                title="MENTORSHIP"
                items={[
                  "Mentors students can see as role models",
                  "Guidance on investing and career management"
                ]}
                color="border-blue-600 bg-blue-100"
                index={5}
              />
              <ProcessStage
                title="CAREER"
                items={[
                  "Internships",
                  "Full-time job opportunities"
                ]}
                color="border-sky-500 bg-sky-50"
                index={6}
              />
            </div>

            {/* Program Features */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="shadow-card animate-fade-in">
                <CardHeader>
                  <TrendingUp className="h-10 w-10 text-academy-blue mb-2" />
                  <CardTitle>Real-World Experience</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Build financial literacy and apply it by contributing to UC's multi-billion-dollar portfolio projects.
                  </p>
                </CardContent>
              </Card>
              <Card className="shadow-card animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <CardHeader>
                  <BookOpen className="h-10 w-10 text-academy-blue mb-2" />
                  <CardTitle>Free Training</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Free asset management training and professional development at no cost to students.
                  </p>
                </CardContent>
              </Card>
              <Card className="shadow-card animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <CardHeader>
                  <Network className="h-10 w-10 text-academy-blue mb-2" />
                  <CardTitle>Professional Network</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Connect with professionals across investments and wealth management industries.
                  </p>
                </CardContent>
              </Card>
              <Card className="shadow-card animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <CardHeader>
                  <Users className="h-10 w-10 text-academy-blue mb-2" />
                  <CardTitle>Mentorship Access</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Access mentorship and internship opportunities with industry leaders.
                  </p>
                </CardContent>
              </Card>
            </div>

            <div className="text-center mt-12">
              <p className="text-lg text-muted-foreground mb-6">
                By the end of the program, participants are motivated and equipped with foundational knowledge to pursue a career in investments.
              </p>
            </div>
          </div>
        </section>

        {/* Benefits Grid */}
        <section id="benefits" className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-academy-blue">Why Choose UC Investments Academy?</h2>
              <p className="text-xl text-muted-foreground">
                Everything you need to launch your finance career.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="shadow-card hover:shadow-elevated transition-shadow animate-fade-in">
                <CardHeader>
                  <Target className="h-10 w-10 text-academy-blue mb-2" />
                  <CardTitle>Hands-on Portfolio Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Work on real portfolio management projects managing UC's multi-billion-dollar investments.
                  </p>
                </CardContent>
              </Card>
              <Card className="shadow-card hover:shadow-elevated transition-shadow animate-fade-in" style={{ animationDelay: '0.1s' }}>
                <CardHeader>
                  <Users className="h-10 w-10 text-academy-blue mb-2" />
                  <CardTitle>Mentorship & Career Coaching</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Get paired with industry professionals for personalized guidance and career development.
                  </p>
                </CardContent>
              </Card>
              <Card className="shadow-card hover:shadow-elevated transition-shadow animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <CardHeader>
                  <Award className="h-10 w-10 text-academy-blue mb-2" />
                  <CardTitle>Resume-Ready Certifications</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Earn industry-recognized certifications and badges that strengthen your resume.
                  </p>
                </CardContent>
              </Card>
              <Card className="shadow-card hover:shadow-elevated transition-shadow animate-fade-in" style={{ animationDelay: '0.3s' }}>
                <CardHeader>
                  <Building className="h-10 w-10 text-academy-blue mb-2" />
                  <CardTitle>Industry Professional Workshops</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Learn directly from leading professionals in asset management and finance.
                  </p>
                </CardContent>
              </Card>
              <Card className="shadow-card hover:shadow-elevated transition-shadow animate-fade-in" style={{ animationDelay: '0.4s' }}>
                <CardHeader>
                  <GraduationCap className="h-10 w-10 text-academy-blue mb-2" />
                  <CardTitle>Interview Prep & Recruiting</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Get comprehensive interview preparation and recruiting insights for finance roles.
                  </p>
                </CardContent>
              </Card>
              <Card className="shadow-card hover:shadow-elevated transition-shadow animate-fade-in" style={{ animationDelay: '0.5s' }}>
                <CardHeader>
                  <Network className="h-10 w-10 text-academy-blue mb-2" />
                  <CardTitle>Alumni & Community Network</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">
                    Join a thriving community of 3000+ students and growing alumni network.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-academy-grey-light">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-academy-blue">How It Works</h2>
              <p className="text-xl text-muted-foreground">
                Your journey to a finance career in four simple steps.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="text-center animate-slide-up">
                <div className="w-20 h-20 bg-academy-blue rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  1
                </div>
                <h3 className="text-xl font-semibold mb-4 text-academy-blue">Sign Up</h3>
                <p className="text-muted-foreground">
                  Create your account and join the UC Investments Academy community.
                </p>
              </div>
              <div className="text-center animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <div className="w-20 h-20 bg-academy-blue rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  2
                </div>
                <h3 className="text-xl font-semibold mb-4 text-academy-blue">Complete Training</h3>
                <p className="text-muted-foreground">
                  Work through our comprehensive training modules and earn certifications.
                </p>
              </div>
              <div className="text-center animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <div className="w-20 h-20 bg-academy-blue rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  3
                </div>
                <h3 className="text-xl font-semibold mb-4 text-academy-blue">Join Projects & Mentorship</h3>
                <p className="text-muted-foreground">
                  Participate in real portfolio projects and connect with industry mentors.
                </p>
              </div>
              <div className="text-center animate-slide-up" style={{ animationDelay: '0.3s' }}>
                <div className="w-20 h-20 bg-academy-blue rounded-full flex items-center justify-center text-white text-2xl font-bold mx-auto mb-4">
                  4
                </div>
                <h3 className="text-xl font-semibold mb-4 text-academy-blue">Launch Your Career</h3>
                <p className="text-muted-foreground">
                  Showcase your experience and apply to internships and full-time roles.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Mid-page CTA */}
        <section className="py-16 bg-gradient-hero text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to start your finance career?</h2>
            <p className="text-xl mb-8 text-white/90">
              Join thousands of UC students building successful careers in finance.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="bg-white text-academy-blue hover:bg-white/90" asChild>
                <NavLink to="/auth">
                  Apply Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </NavLink>
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10" asChild>
                <NavLink to="/auth">
                  Sign Up Today
                </NavLink>
              </Button>
            </div>
          </div>
        </section>

        {/* Mentorship & Partners */}
        <section id="mentorship" className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-academy-blue">Mentorship & Partners</h2>
              <p className="text-xl text-muted-foreground">
                Learn from industry leaders and connect with top organizations.
              </p>
            </div>

            {/* Partner Logos Placeholder */}
            <div className="bg-academy-grey-light p-8 rounded-2xl mb-16">
              <h3 className="text-center text-lg font-semibold text-academy-blue mb-6">Our Partners</h3>
              <div className="flex flex-wrap justify-center items-center gap-8 opacity-60">
                <div className="text-2xl font-bold text-academy-blue">UC INVESTMENTS</div>
                <div className="text-xl text-muted-foreground">+ Partner Organizations</div>
              </div>
            </div>

            {/* Testimonials */}
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="shadow-card">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">
                    "The UC Investments Academy gave me the practical skills and network I needed to land my dream internship in asset management."
                  </p>
                  <div>
                    <div className="font-semibold">Sarah Chen</div>
                    <div className="text-sm text-muted-foreground">UC Berkeley, Class of 2024</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-card">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">
                    "Working on real portfolio projects with UC's investments was an incredible learning experience that set me apart from other candidates."
                  </p>
                  <div>
                    <div className="font-semibold">Marcus Rodriguez</div>
                    <div className="text-sm text-muted-foreground">UCLA, Class of 2023</div>
                  </div>
                </CardContent>
              </Card>
              <Card className="shadow-card">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current text-yellow-400" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-4">
                    "The mentorship program connected me with industry professionals who guided my career path and helped me secure a full-time offer."
                  </p>
                  <div>
                    <div className="font-semibold">Emily Park</div>
                    <div className="text-sm text-muted-foreground">UC San Diego, Class of 2024</div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="py-20 bg-academy-grey-light">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-academy-blue">Frequently Asked Questions</h2>
              <p className="text-xl text-muted-foreground">
                Everything you need to know about the UC Investments Academy.
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                <AccordionItem value="eligibility" className="bg-white shadow-card rounded-2xl border-0 px-6">
                  <AccordionTrigger className="text-left">
                    Who is eligible to join the UC Investments Academy?
                  </AccordionTrigger>
                  <AccordionContent>
                    The program is open to all UC undergraduate students across all 9 UC campuses. No prior finance experience is required - we welcome students from all majors and backgrounds.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="cost" className="bg-white shadow-card rounded-2xl border-0 px-6">
                  <AccordionTrigger className="text-left">
                    How much does the program cost?
                  </AccordionTrigger>
                  <AccordionContent>
                    The UC Investments Academy is completely free for all UC students. This includes training materials, mentorship, certifications, and access to portfolio projects.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="time" className="bg-white shadow-card rounded-2xl border-0 px-6">
                  <AccordionTrigger className="text-left">
                    What is the time commitment?
                  </AccordionTrigger>
                  <AccordionContent>
                    The program is designed to be flexible around your academic schedule. Most students spend 5-10 hours per week on training modules and projects, with additional time for mentorship meetings and workshops.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="campuses" className="bg-white shadow-card rounded-2xl border-0 px-6">
                  <AccordionTrigger className="text-left">
                    Which UC campuses participate?
                  </AccordionTrigger>
                  <AccordionContent>
                    All 9 UC campuses participate: UC Berkeley, UCLA, UC San Diego, UC Davis, UC Irvine, UC Santa Barbara, UC Santa Cruz, UC Riverside, and UC Merced.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="application" className="bg-white shadow-card rounded-2xl border-0 px-6">
                  <AccordionTrigger className="text-left">
                    How do I apply?
                  </AccordionTrigger>
                  <AccordionContent>
                    Simply click the "Apply Now" or "Sign up" button to create your account. You'll complete a brief application form and can start accessing training materials immediately upon approval.
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="contact" className="bg-white shadow-card rounded-2xl border-0 px-6">
                  <AccordionTrigger className="text-left">
                    How can I get more information?
                  </AccordionTrigger>
                  <AccordionContent>
                    For additional questions, please reach out to our team using the contact information below or email us directly. We're here to help you succeed!
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="py-16 bg-gradient-primary text-white">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-6">
              Join 3000+ UC students building careers in finance
            </h2>
            <p className="text-xl mb-8 text-white/90 max-w-2xl mx-auto">
              Participants will build financial literacy in investing and apply their knowledge through projects managing UC's multi-billion-dollar portfolio.
            </p>
            <Button size="lg" className="bg-white text-academy-blue hover:bg-white/90" asChild>
              <NavLink to="/auth">
                Sign Up Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </NavLink>
            </Button>
          </div>
        </section>

        {/* Footer */}
        <footer id="contact" className="bg-foreground text-white py-16">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <img src={uciaLogo} alt="UC Investments Academy" className="h-8 w-8" />
                  <span className="text-lg font-bold">UC Investments Academy</span>
                </div>
                <p className="text-white/70 mb-4">
                  Building the next generation of finance leaders through free, comprehensive training and real-world experience.
                </p>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Quick Links</h3>
                <div className="space-y-2">
                  <button onClick={() => scrollToSection('about')} className="block text-white/70 hover:text-white transition-colors">
                    About
                  </button>
                  <button onClick={() => scrollToSection('program')} className="block text-white/70 hover:text-white transition-colors">
                    Program
                  </button>
                  <button onClick={() => scrollToSection('benefits')} className="block text-white/70 hover:text-white transition-colors">
                    Benefits
                  </button>
                  <button onClick={() => scrollToSection('mentorship')} className="block text-white/70 hover:text-white transition-colors">
                    Mentorship
                  </button>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Support</h3>
                <div className="space-y-2">
                  <button onClick={() => scrollToSection('faq')} className="block text-white/70 hover:text-white transition-colors">
                    FAQ
                  </button>
                  <NavLink to="/contact" className="block text-white/70 hover:text-white transition-colors">
                    Contact
                  </NavLink>
                  <a href="#" className="block text-white/70 hover:text-white transition-colors">
                    Privacy Policy
                  </a>
                  <a href="#" className="block text-white/70 hover:text-white transition-colors">
                    Terms of Service
                  </a>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Contact Info</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="h-4 w-4" />
                    <span className="text-white/70">info@ucinvestments.edu</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="h-4 w-4" />
                    <span className="text-white/70">(510) 123-4567</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="h-4 w-4" />
                    <span className="text-white/70">University of California System</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-white/20 mt-12 pt-8 text-center">
              <p className="text-white/70">
                © {new Date().getFullYear()} UC Investments Academy. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}

export default LandingPage