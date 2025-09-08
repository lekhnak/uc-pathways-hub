import { Button } from "@/components/ui/button"
import { NavLink } from "react-router-dom"
import { ArrowLeft } from "lucide-react"

const Apply = () => {
  return (
    <>
      {/* SEO Meta Tags */}
      <div className="sr-only">
        <h1>Apply to UC Investments Academy - Finance Career Training Application</h1>
        <meta name="description" content="Apply to join UC Investments Academy and start your finance career journey. Free training for UC students across all 9 campuses." />
        <meta name="keywords" content="UC Investments Academy application, finance training, UC students, investment careers" />
        <meta property="og:title" content="Apply to UC Investments Academy" />
        <meta property="og:description" content="Join 3000+ UC students building careers in finance. Apply now for free training and mentorship." />
      </div>

      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-background/95 backdrop-blur border-b border-border">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src="/lovable-uploads/d65dcac9-d2c0-458f-ac7b-ec24f7e5d7b5.png" alt="UC Investments Academy" className="h-10" />
              </div>
              <Button variant="outline" asChild>
                <NavLink to="/landing" className="flex items-center gap-2">
                  <ArrowLeft className="h-4 w-4" />
                  Back to Home
                </NavLink>
              </Button>
            </div>
          </div>
        </header>

        {/* Application Section */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-8">
                <h1 className="text-3xl md:text-4xl font-bold mb-4 text-academy-blue">
                  Apply to UC Investments Academy
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                  Join 3000+ UC students building careers in finance. Complete the application below to get started with free training and mentorship.
                </p>
              </div>

              {/* Google Form Embed */}
              <div className="bg-white rounded-2xl shadow-card overflow-hidden">
                <iframe 
                  src="https://docs.google.com/forms/d/e/1FAIpQLSf6OdpZcSN2cIZiGtvpJrG6r4aT2D6iPsz0bCi35IhWg49BRQ/viewform?embedded=true"
                  width="100%" 
                  height="800"
                  frameBorder="0" 
                  marginHeight={0} 
                  marginWidth={0}
                  className="w-full"
                  title="UC Investments Academy Application Form"
                >
                  Loading…
                </iframe>
              </div>

              {/* Return Navigation */}
              <div className="text-center mt-8">
                <Button asChild>
                  <NavLink to="/landing" className="flex items-center gap-2 mx-auto">
                    <ArrowLeft className="h-4 w-4" />
                    Return to Homepage
                  </NavLink>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default Apply