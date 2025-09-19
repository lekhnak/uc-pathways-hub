import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { NavLink } from "react-router-dom"
import { usePublicWebsiteContent } from "@/hooks/usePublicWebsiteContent"
import { 
  Users, 
  BookOpen, 
  TrendingUp, 
  Award, 
  Target, 
  GraduationCap,
  Building,
  Network,
  CheckCircle,
  ArrowRight,
  Menu,
  X,
  Star,
  Mail,
  MapPin
} from "lucide-react"
// Using the UC logo lockup directly
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
  </div>
)

const LandingPage = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { 
    getSectionTitle, 
    getSectionSubtitle, 
    getSectionContent, 
    getSectionImage, 
    getSectionMetadata,
    getContentBySection,
    loading: contentLoading 
  } = usePublicWebsiteContent()

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
                <img src="/lovable-uploads/d65dcac9-d2c0-458f-ac7b-ec24f7e5d7b5.png" alt="UC Investments Academy" className="h-10" />
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
                <button onClick={() => scrollToSection('faq')} className="text-foreground hover:text-academy-blue transition-colors">
                  FAQ
                </button>
                <button onClick={() => scrollToSection('contact')} className="text-foreground hover:text-academy-blue transition-colors">
                  Contact
                </button>
              </div>

              {/* Auth Buttons */}
              <div className="hidden md:flex items-center gap-4">
                <Button asChild>
                  <NavLink to="/apply">Apply Now</NavLink>
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
                  <button onClick={() => scrollToSection('faq')} className="text-left text-foreground hover:text-academy-blue transition-colors">
                    FAQ
                  </button>
                  <button onClick={() => scrollToSection('contact')} className="text-left text-foreground hover:text-academy-blue transition-colors">
                    Contact
                  </button>
                  <div className="flex flex-col gap-2 pt-4 border-t border-border">
                    <Button asChild>
                      <NavLink to="/apply">Apply Now</NavLink>
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
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 animate-fade-in text-white">
              {getSectionTitle('hero', 'UC Investments Academy')}
            </h1>
            <p className="text-2xl md:text-3xl lg:text-4xl font-semibold mb-4 text-academy-accent animate-fade-in" style={{ animationDelay: '0.1s' }}>
              {getSectionSubtitle('hero', 'Building the next generation of finance leaders')}
            </p>
            <div 
              className="text-xl md:text-2xl mb-8 max-w-3xl mx-auto text-white/90 animate-fade-in" 
              style={{ animationDelay: '0.2s' }}
              dangerouslySetInnerHTML={{ 
                __html: getSectionContent('hero', 'Connect UC undergraduate and graduate students with opportunities in the financial industry through free training, tools, and coaching.') 
              }}
            />
          </div>
        </section>

        {/* Social Proof Stats */}
        <section className="py-16 bg-academy-grey-light">
          <div className="container mx-auto px-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <Card className="text-center shadow-card animate-counter">
                <CardContent className="pt-6">
                  <div className="text-3xl md:text-4xl font-bold text-academy-blue mb-2">
                    <CountUpNumber end={4500} suffix="+" />
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
                  {getSectionTitle('about', 'What is the UC Investments Academy?')}
                </h2>
                <div 
                  className="space-y-4 text-lg text-muted-foreground"
                  dangerouslySetInnerHTML={{ 
                    __html: getSectionContent('about', `
                      <p>Launched by UC Investments and UC Office of the President in 2022, this program prepares UC students for careers in finance and asset management. Initially starting with just 100 students at UC Merced, the program has expanded to multiple UC campuses and provides the one-stop UC destination for preparing for careers in finance.</p>
                      <p>The UC Investments Academy, which we created to connect UC undergrads with opportunities in the financial industry, has engaged 3000+ students across 9 UC campuses. The Academy provides free training, tools and coaching to all interested UC students.</p>
                    `) 
                  }}
                />
              </div>
              <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <img 
                  src={getSectionImage('about', '/lovable-uploads/afe88b15-8d39-4a7f-a2a8-0c78244c5ba0.png')} 
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
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-academy-blue">
                {getSectionTitle('program', 'Our Complete Program')}
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                {getSectionSubtitle('program', 'A comprehensive pathway designed to take you from awareness to career success in finance and asset management.')}
              </p>
            </div>

            {/* UC Investments Academy Resources */}
            <div className="bg-white rounded-2xl shadow-elevated p-8 mb-16">
              <div className="text-center mb-8">
                <h3 className="text-2xl md:text-3xl font-bold text-academy-blue mb-4">
                  UC Investments Academy Resources
                </h3>
                <div className="flex justify-center mb-6">
                  <img 
                    src="/lovable-uploads/uc-resources-content.jpg" 
                    alt="UC Investments Academy Resources Overview" 
                    className="max-w-full h-auto rounded-lg shadow-card"
                  />
                </div>
                <div className="grid md:grid-cols-3 gap-6 text-left">
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-academy-blue">Training Modules</h4>
                    <p className="text-muted-foreground">Comprehensive curriculum covering investment fundamentals, financial modeling, and industry best practices.</p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-academy-blue">Career Resources</h4>
                    <p className="text-muted-foreground">Access to networking opportunities, mentorship programs, and exclusive recruitment events.</p>
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-lg font-semibold text-academy-blue">Tools & Support</h4>
                    <p className="text-muted-foreground">Professional-grade software access, resume reviews, and ongoing career coaching support.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Process Flow - Dynamic from database */}
            <div className="grid lg:grid-cols-7 gap-4 mb-16">
              {(getContentBySection('program')?.metadata?.process_stages || []).map((stage: any, index: number) => (
                <ProcessStage
                  key={stage.title}
                  title={stage.title}
                  items={stage.items}
                  color={stage.color}
                  index={index}
                />
              ))}
            </div>

            {/* Program Features - Dynamic from database */}
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {(getContentBySection('program')?.metadata?.features || []).map((feature: any, index: number) => {
                const IconComponent = {
                  TrendingUp,
                  BookOpen,
                  Network,
                  Users,
                  Target,
                  GraduationCap,
                  Building,
                  Award
                }[feature.icon] || TrendingUp;

                return (
                  <Card key={feature.title} className="shadow-card animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                    <CardHeader>
                      <IconComponent className="h-10 w-10 text-academy-blue mb-2" />
                      <CardTitle>{feature.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        {feature.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <div className="text-center mt-12">
              <p className="text-lg text-muted-foreground mb-6">
                {getSectionMetadata('program', 'closing_text', 'By the end of the program, participants are motivated and equipped with foundational knowledge to pursue a career in investments.')}
              </p>
            </div>
          </div>
        </section>

        {/* Benefits Grid */}
        <section id="benefits" className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-academy-blue">
                {getSectionTitle('benefits', 'Why Choose UC Investments Academy?')}
              </h2>
              <p className="text-xl text-muted-foreground">
                {getSectionSubtitle('benefits', 'Everything you need to launch your finance career.')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(getContentBySection('benefits')?.metadata?.benefits || []).map((benefit: any, index: number) => {
                const IconComponent = {
                  Target,
                  Users,
                  Award,
                  Building,
                  GraduationCap,
                  Network,
                  TrendingUp,
                  BookOpen
                }[benefit.icon] || Target;

                return (
                  <Card key={benefit.title} className="shadow-card hover:shadow-elevated transition-shadow animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                    <CardHeader>
                      <IconComponent className="h-10 w-10 text-academy-blue mb-2" />
                      <CardTitle>{benefit.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">
                        {benefit.description}
                      </p>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-20 bg-academy-grey-light">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-academy-blue">
                {getSectionTitle('how-it-works', 'How the Program Works')}
              </h2>
              <p className="text-xl text-muted-foreground">
                {getSectionSubtitle('how-it-works', 'The program consists of online classes and guest speakers from diverse backgrounds in the investment field.')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {(getContentBySection('how-it-works')?.metadata?.components || []).map((component: any, index: number) => {
                const IconComponent = {
                  BookOpen,
                  Users,
                  Building,
                  Network,
                  TrendingUp,
                  Target,
                  Award,
                  GraduationCap
                }[component.icon] || BookOpen;

                return (
                  <Card key={component.title} className="shadow-card animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                    <CardHeader>
                      <IconComponent className="h-10 w-10 text-academy-blue mb-2" />
                      <CardTitle>{component.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="text-muted-foreground space-y-2">
                        {component.items?.map((item: string, itemIndex: number) => (
                          <li key={itemIndex}>• {item}</li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                );
              })}
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
            <Button size="lg" className="bg-white text-academy-blue hover:bg-gray-100" asChild>
              <NavLink to="/apply">
                  Apply Now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </NavLink>
              </Button>
              <Button size="lg" variant="outline" className="border-white text-white bg-transparent hover:bg-white hover:text-academy-blue transition-colors" asChild>
                <NavLink to="/auth">
                  Login to Portal
                </NavLink>
              </Button>
            </div>
          </div>
        </section>


        {/* FAQ Section */}
        <section id="faq" className="py-20 bg-academy-grey-light">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-academy-blue">
                {getSectionTitle('faq', 'Frequently Asked Questions')}
              </h2>
              <p className="text-xl text-muted-foreground">
                {getSectionSubtitle('faq', 'Everything you need to know about the UC Investments Academy.')}
              </p>
            </div>

            <div className="max-w-3xl mx-auto">
              <Accordion type="single" collapsible className="space-y-4">
                {(getContentBySection('faq')?.metadata?.faqs || []).map((faq: any, index: number) => (
                  <AccordionItem key={index} value={`faq-${index}`} className="bg-white shadow-card rounded-2xl border-0 px-6">
                    <AccordionTrigger className="text-left">
                      {faq.question}
                    </AccordionTrigger>
                    <AccordionContent>
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
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
              Build financial literacy and gain real-world investment experience through comprehensive training and virtual work assignments.
            </p>
            <Button size="lg" className="bg-white text-academy-blue hover:bg-gray-100" asChild>
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
                  <img src="/lovable-uploads/d65dcac9-d2c0-458f-ac7b-ec24f7e5d7b5.png" alt="UC Investments Academy" className="h-8" />
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
                  <button onClick={() => scrollToSection('faq')} className="block text-white/70 hover:text-white transition-colors">
                    FAQ
                  </button>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Get Started</h3>
                <div className="space-y-2">
                  <NavLink to="/apply" className="block text-white/70 hover:text-white transition-colors">
                    Apply Now
                  </NavLink>
                  <NavLink to="/auth" className="block text-white/70 hover:text-white transition-colors">
                    Student Portal
                  </NavLink>
                  <NavLink to="/admin/auth" className="block text-white/70 hover:text-white transition-colors">
                    Admin Dashboard
                  </NavLink>
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-4">Contact</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-white/70">
                    <Mail className="h-4 w-4" />
                    <span>ucinvestments@ucop.edu</span>
                  </div>
                  <div className="flex items-center gap-2 text-white/70">
                    <MapPin className="h-4 w-4" />
                    <span>University of California</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="border-t border-white/20 mt-12 pt-8">
            </div>
          </div>
        </footer>
      </div>
    </>
  )
}

export default LandingPage