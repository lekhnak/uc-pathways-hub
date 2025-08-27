import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Award, ExternalLink, Clock, Users, CheckCircle2, Download, FileText } from "lucide-react"
import { CertificationUpload } from "@/components/CertificationUpload"
import { useCertificationUploads } from "@/hooks/useCertificationUploads"
import { useAuth } from "@/hooks/useAuth"

const Certifications = () => {
  const { user } = useAuth()
  const { uploads, loading, fetchUploads, getProgressStats, downloadFile } = useCertificationUploads()
  const progressStats = getProgressStats()
  const forageCertifications = [
    {
      id: 1,
      title: "Bank of America Investment Banking Virtual Experience",
      provider: "Forage",
      duration: "5-6 hours",
      difficulty: "Intermediate",
      skills: ["Financial Analysis", "Client Advisory", "Communication Skills"],
      description: "Apply your analysis and communication skills to advise clients as part of our Technology, Telecom & Media Investment Banking team",
      status: "available",
      participants: "14,250+",
      rating: 5.0,
      link: "https://www.theforage.com/simulations/bank-of-america/investment-banking-bwp7"
    },
    {
      id: 2,
      title: "JPMorgan Chase Investment Banking Virtual Experience",
      provider: "Forage",
      duration: "4-5 hours",
      difficulty: "Beginner",
      skills: ["Excel Modeling", "Company Valuation", "Market Research"],
      description: "Learn the fundamentals of investment banking at JPMorgan Chase",
      status: "available",
      participants: "75,000+",
      rating: 4.7,
      link: "https://www.theforage.com/simulations/jpmorgan/investment-banking-hkyd"
    },
    {
      id: 3,
      title: "Citi Wealth Management Virtual Experience",
      provider: "Forage",
      duration: "4-5 hours",
      difficulty: "Intermediate",
      skills: ["Client Advisory", "Portfolio Management", "Risk Assessment"],
      description: "A risk-free way to experience work on the job with us at Citi. Practice your skills with example tasks and build your confidence to ace your applications.",
      status: "available",
      participants: "30,000+",
      rating: 4.8,
      link: "https://www.theforage.com/simulations/citi/wealth-za8x"
    },
    {
      id: 4,
      title: "Goldman Sachs Risk Management Virtual Experience",
      provider: "Forage",
      duration: "4-5 hours",
      difficulty: "Intermediate",
      skills: ["Risk Analysis", "Portfolio Assessment", "Risk Mitigation"],
      description: "Understand how Risk Analysts assess key risks for investment portfolios and devise mitigation strategies",
      status: "available",
      participants: "25,000+",
      rating: 4.7,
      link: "https://www.theforage.com/simulations/goldman-sachs/risk-ljdz"
    },
    {
      id: 5,
      title: "Vista Equity Partners Demystifying Private Equity",
      provider: "Forage",
      duration: "2-3 hours",
      difficulty: "Intermediate",
      skills: ["Deal Evaluation", "Financial Analysis", "Investment Insights"],
      description: "Step into the role of a PE analyst and learn how to evaluate deals, analyze financials, and communicate investment insights.",
      status: "available",
      participants: "400+",
      rating: 5.0,
      link: "https://www.theforage.com/simulations/vista-equity-partners/demystifying-private-equity-xzrs"
    },
    {
      id: 6,
      title: "PGIM Fixed Income Virtual Experience",
      provider: "Forage",
      duration: "3-4 hours",
      difficulty: "Intermediate",
      skills: ["Credit Research", "Risk Management", "Client Advisory"],
      description: "Advise our clients on their assets using our credit research and risk-management approach",
      status: "available",
      participants: "5,000+",
      rating: 4.8,
      link: "https://www.theforage.com/simulations/pgim/fixed-income-fqv9"
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'in-progress': return 'bg-academy-blue-light text-academy-blue border-academy-blue'
      case 'available': return 'bg-academy-grey-light text-academy-grey border-academy-grey'
      default: return 'bg-academy-grey-light text-academy-grey border-academy-grey'
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800'
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'Advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-academy-grey-light text-academy-grey'
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-4 text-academy-blue">Certifications</h1>
        <p className="text-academy-grey text-lg">
          Earn industry-recognized credentials through virtual work experiences and professional certifications.
        </p>
      </div>

      {/* Progress Overview */}
      <Card className="bg-gradient-subtle border-academy-blue-light shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-academy-blue">
            <Award className="h-5 w-5" />
            Your Certification Progress
          </CardTitle>
          <CardDescription>Track your professional development journey</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-academy-blue mb-2">{progressStats.completed}</div>
              <div className="text-sm text-academy-grey">Completed</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-academy-blue mb-2">{progressStats.inProgress}</div>
              <div className="text-sm text-academy-grey">In Progress</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-academy-blue mb-2">{progressStats.available}</div>
              <div className="text-sm text-academy-grey">Available</div>
            </div>
          </div>
          
          {/* Upload Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <CertificationUpload onUploadComplete={fetchUploads} />
            
            {/* Recent Uploads */}
            <Card className="bg-white shadow-card border-academy-grey-light">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-academy-blue">
                  <FileText className="h-5 w-5" />
                  Your Uploaded Certifications
                </CardTitle>
                <CardDescription>
                  {uploads.length > 0 ? `${uploads.length} certification${uploads.length !== 1 ? 's' : ''} uploaded` : 'No certifications uploaded yet'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-4 text-academy-grey">Loading...</div>
                ) : uploads.length > 0 ? (
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {uploads.slice(0, 5).map((upload) => (
                      <div key={upload.id} className="flex items-center justify-between p-3 bg-academy-grey-light/20 rounded-lg">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-academy-blue truncate">{upload.certification_name}</p>
                          <p className="text-sm text-academy-grey">
                            {new Date(upload.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadFile(upload.file_path, upload.certification_name)}
                          className="ml-2 flex-shrink-0"
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                    {uploads.length > 5 && (
                      <p className="text-sm text-academy-grey text-center">
                        +{uploads.length - 5} more certification{uploads.length - 5 !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-academy-grey mb-4" />
                    <p className="text-academy-grey mb-2">No certifications uploaded yet</p>
                    <p className="text-sm text-academy-grey">Upload your first certification to get started!</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Forage Certifications */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-academy-blue">Forage Virtual Experiences</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {forageCertifications.map((cert) => (
            <Card key={cert.id} className="bg-white shadow-card border-academy-grey-light hover:shadow-elevated transition-all">
              <CardHeader>
                <div className="flex items-start justify-between mb-2">
                  <CardTitle className="text-lg text-academy-blue flex-1">{cert.title}</CardTitle>
                  <Badge className={getStatusColor(cert.status)}>
                    {cert.status === 'completed' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                    {cert.status.charAt(0).toUpperCase() + cert.status.slice(1).replace('-', ' ')}
                  </Badge>
                </div>
                <CardDescription>{cert.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Progress Bar for In-Progress */}
                {cert.status === 'in-progress' && 'progress' in cert && (
                  <div>
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-medium">Progress</span>
                      <span className="text-sm text-academy-grey">{(cert as any).progress}%</span>
                    </div>
                    <Progress value={(cert as any).progress} className="h-2" />
                  </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-academy-grey" />
                    <span>{cert.duration}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-academy-grey" />
                    <span>{cert.participants}</span>
                  </div>
                </div>

                {/* Difficulty & Rating */}
                <div className="flex items-center justify-between">
                  <Badge className={getDifficultyColor(cert.difficulty)}>{cert.difficulty}</Badge>
                  <div className="flex items-center gap-1">
                    <div className="flex text-yellow-400">
                      {'★'.repeat(Math.floor(cert.rating))}
                    </div>
                    <span className="text-sm text-academy-grey">({cert.rating})</span>
                  </div>
                </div>

                {/* Skills */}
                <div>
                  <h4 className="font-semibold text-academy-blue mb-2">Skills You'll Learn</h4>
                  <div className="flex flex-wrap gap-2">
                    {cert.skills.map((skill) => (
                      <Badge key={skill} variant="secondary" className="bg-academy-grey-light text-academy-blue text-xs">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Action Button */}
                <Button 
                  className={`w-full ${
                    cert.status === 'completed' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : cert.status === 'in-progress'
                      ? 'bg-academy-blue hover:bg-academy-blue-dark'
                      : 'bg-academy-blue hover:bg-academy-blue-dark'
                  }`}
                  onClick={() => window.open(cert.link, '_blank')}
                >
                  {cert.status === 'completed' ? (
                    <>
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      View Certificate
                    </>
                  ) : cert.status === 'in-progress' ? (
                    'Continue Experience'
                  ) : (
                    <>
                      Start Experience
                      <ExternalLink className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Other Certifications */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-academy-blue">Additional Certifications</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="bg-white shadow-card border-academy-grey-light">
            <CardHeader>
              <CardTitle className="text-academy-blue">CFA Institute</CardTitle>
              <CardDescription>Chartered Financial Analyst certification pathway</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full border-academy-blue text-academy-blue hover:bg-academy-blue-light">
                Learn More
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-card border-academy-grey-light">
            <CardHeader>
              <CardTitle className="text-academy-blue">FRM Certification</CardTitle>
              <CardDescription>Financial Risk Manager certification</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full border-academy-blue text-academy-blue hover:bg-academy-blue-light">
                Learn More
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-card border-academy-grey-light">
            <CardHeader>
              <CardTitle className="text-academy-blue">Series 7 & 66</CardTitle>
              <CardDescription>Securities industry licensing exams</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full border-academy-blue text-academy-blue hover:bg-academy-blue-light">
                Learn More
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Certifications;
