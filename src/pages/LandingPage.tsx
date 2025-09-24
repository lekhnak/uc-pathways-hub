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
                    <CountUpNumber end={200} suffix="+" />
                  </div>
                  <p className="text-muted-foreground">Career opportunities</p>
                </CardContent>
              </Card>
              <Card className="text-center shadow-card animate-counter" style={{ animationDelay: '0.3s' }}>
                <CardContent className="pt-6">
                  <div className="text-3xl md:text-4xl font-bold text-academy-blue mb-2">
                    100%
                  </div>
                  <p className="text-muted-foreground">Free program</p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Program Overview Section */}
        <section id="about" className="py-20">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-academy-blue">
                Program Overview
              </h2>
            </div>
            
            <div className="grid lg:grid-cols-2 gap-12 items-center mb-20">
              <div className="animate-fade-in">
                <div className="space-y-6 text-lg text-muted-foreground">
                  <p>
                    The team that invests the University of California's endowment and retirement savings, UC 
                    Investments is hosting a program with your campus to help students explore a possible 
                    career in the asset management industry. This program is free to students and hopes to 
                    open doors to students who may not have known about, felt welcome in or considered such 
                    careers before. Everyone is welcome and encouraged to apply. We invite you to come see 
                    for yourselves and take advantage of this unique opportunity for you.
                  </p>
                </div>
              </div>
              <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <img 
                  src="/lovable-uploads/program-overview-new.png" 
                  alt="UC Investments Academy - Content, Community, Confidence" 
                  className="w-full max-w-md mx-auto lg:max-w-full rounded-2xl shadow-elevated object-contain"
                />
              </div>
            </div>

            {/* What is a Career in Investing Section */}
            <div className="mb-20">
              <h3 className="text-2xl md:text-3xl font-bold mb-8 text-academy-blue">
                What is a Career in Investing/Asset Management?
              </h3>
              <div className="space-y-6 text-lg text-muted-foreground">
                <p>Here are some things you may not know about careers in investing:</p>
                <ul className="space-y-4 pl-6">
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-academy-blue mt-0.5 flex-shrink-0" />
                    Your clients tend to be institutions that invest the savings for teachers, firefighters, and 
                    healthcare unions and companies, that are responsible for ensuring that their 
                    employees' retirement savings grow enough to enable them a secure retirement.
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-academy-blue mt-0.5 flex-shrink-0" />
                    Or your clients may be universities and charitable foundations that are responsible for 
                    investing their endowments (gifts from generous donors) so that they can fund 
                    scholarships and grants to support charities.
                  </li>
                  <li className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-academy-blue mt-0.5 flex-shrink-0" />
                    Investors provide capital to entrepreneurs in sectors ranging from clean energy to bio-
                    technology to software and in countries around the world.
                  </li>
                </ul>
              </div>
            </div>

            {/* Is This Program For You Section */}
            <div className="mb-20">
              <h3 className="text-2xl md:text-3xl font-bold mb-8 text-academy-blue">
                Is This Program For You?
              </h3>
              <div className="space-y-8">
                <p className="text-lg text-muted-foreground">
                  We have two customized UC Investments Academy "tracks" you can choose from for the Fall 2025. Please see outlines below:
                </p>
                
                <div className="grid md:grid-cols-2 gap-8">
                  <Card className="shadow-card">
                    <CardHeader>
                      <CardTitle className="text-academy-blue">1) Career Track</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        Geared towards technical training and education in addition to progressing through the entire program. 
                        If you are interested in a career in finance and investing this program is for you.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Time Commitment:</strong> Approx. 5-10 hrs/week for 1-2 months in Fall and Spring
                      </p>
                    </CardContent>
                  </Card>

                  <Card className="shadow-card">
                    <CardHeader>
                      <CardTitle className="text-academy-blue">2) Personal Finance Track</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        Geared more towards personal finance, awareness, access, networking and general career strategy. 
                        If you are interested in learning about investing and the industry, but are not committed to a career in finance this is for you.
                      </p>
                      <p className="text-sm text-muted-foreground">
                        <strong>Time Commitment:</strong> 1 hr/week on average in Fall and Spring
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <div className="bg-academy-grey-light p-6 rounded-2xl">
                  <h4 className="text-xl font-semibold mb-4 text-academy-blue">The program is for all UC students that are:</h4>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-academy-blue mt-0.5 flex-shrink-0" />
                      <span>Interested in learning about investing and developing their careers</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-academy-blue mt-0.5 flex-shrink-0" />
                      <span>Can commit to actively participating in the program with flexibility to work at your own pace for certain parts of the program</span>
                    </li>
                    <li className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-academy-blue mt-0.5 flex-shrink-0" />
                      <span>Have demonstrated academic achievement</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Program Details Fall 2025 */}
            <div>
              <h3 className="text-2xl md:text-3xl font-bold mb-8 text-academy-blue">
                Program Details – Fall 2025
              </h3>
              <div className="space-y-8">
                <p className="text-lg text-muted-foreground">
                  UC Investments is providing investment training, exposure, and experience that will be free 
                  for UC students. The program will consist of online classes and a series of guest speakers 
                  from diverse backgrounds currently working in the field. Included will be many insider views 
                  into the dynamic and lucrative investment arena.
                </p>

                <div className="grid md:grid-cols-2 gap-8">
                  <Card className="shadow-card">
                    <CardHeader>
                      <CardTitle className="text-academy-blue flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Investment Analysis Curriculum
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li>• Online self-study materials throughout the quarter (20 – 30 hours)</li>
                        <li>• Instructor-led Zoom training sessions on October 18th and November 1st from 9 am – 12 pm (6 hours)</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="shadow-card">
                    <CardHeader>
                      <CardTitle className="text-academy-blue flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Live Guest Speaker Sessions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li>• 2 – 3+ typically weekday evening Zoom sessions per semester (+3 hours)</li>
                        <li>• Optional access to ~20 previously recorded Zoom session library (+20 hours)</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="shadow-card">
                    <CardHeader>
                      <CardTitle className="text-academy-blue flex items-center gap-2">
                        <Building className="h-5 w-5" />
                        Virtual Work Experiences
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li>• 2+ virtual work assignments with investment firms per semester (10 – 25 hours)</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="shadow-card">
                    <CardHeader>
                      <CardTitle className="text-academy-blue flex items-center gap-2">
                        <Network className="h-5 w-5" />
                        Investment Community Access
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li>• Interact with investors and other like-minded students within the UC system</li>
                        <li>• Connect with firms interested in recruiting Academy students for career opportunities</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="shadow-card">
                    <CardHeader>
                      <CardTitle className="text-academy-blue flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" />
                        Financial Literacy Programming
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li>• Learn how to create wealth for your future with financial literacy programming (1 – 10 hours)</li>
                      </ul>
                    </CardContent>
                  </Card>

                  <Card className="shadow-card">
                    <CardHeader>
                      <CardTitle className="text-academy-blue flex items-center gap-2">
                        <Target className="h-5 w-5" />
                        Career Strategy Sessions
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2 text-sm">
                        <li>• Gain access to UC investments team members and network of professionals</li>
                        <li>• Receive advice on investment strategy to help you achieve your goals</li>
                      </ul>
                    </CardContent>
                  </Card>
                </div>
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


        {/* How It Works */}
        <section className="py-20 bg-academy-grey-light">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-6 text-academy-blue">
                {getSectionTitle('how-it-works', 'Why Choose UC Investments Academy')}
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