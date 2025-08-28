import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { PlayCircle, BookOpen, Clock, CheckCircle2, Lock } from "lucide-react"

const Modules = () => {
  const modules = [
    {
      id: 1,
      title: "Orientations & Foundations",
      description: "Essential foundation for your finance career journey",
      progress: 75,
      status: "in-progress",
      totalVideos: 4,
      completedVideos: 3,
      estimatedTime: "2 hours",
      videos: [
        { id: 1, title: "UCIA Introduction", duration: "15 min", completed: true },
        { id: 2, title: "Career Exploration – Sell-Side", duration: "25 min", completed: true },
        { id: 3, title: "Career Exploration – Buy-Side", duration: "30 min", completed: true },
        { id: 4, title: "UCIA Orientation Conclusion", duration: "20 min", completed: false }
      ]
    },
    {
      id: 2,
      title: "TTS Basic Finance Curriculum",
      description: "Core financial concepts and principles",
      progress: 30,
      status: "in-progress",
      totalVideos: 8,
      completedVideos: 2,
      estimatedTime: "4 hours",
      videos: [
        { id: 1, title: "Financial Statements Overview", duration: "35 min", completed: true },
        { id: 2, title: "Time Value of Money", duration: "40 min", completed: true },
        { id: 3, title: "Valuation Fundamentals", duration: "45 min", completed: false },
        { id: 4, title: "Financial Modeling Basics", duration: "50 min", completed: false },
      ]
    },
    {
      id: 3,
      title: "Career Pathways in Finance",
      description: "Explore different finance career options with expert insights",
      progress: 0,
      status: "locked",
      totalVideos: 6,
      completedVideos: 0,
      estimatedTime: "3 hours",
      videos: [
        { id: 1, title: "Investment Banking Overview", duration: "30 min", completed: false },
        { id: 2, title: "Private Equity Fundamentals", duration: "35 min", completed: false },
        { id: 3, title: "Asset Management Career Path", duration: "25 min", completed: false },
      ]
    },
    {
      id: 4,
      title: "Personal Finance & Investing (COWL 52)",
      description: "Optional 5-credit course with Professor Patricia Kelly - Enhance your personal finance knowledge",
      progress: 0,
      status: "available",
      totalVideos: 1,
      completedVideos: 0,
      estimatedTime: "5 min",
      isOptional: true,
      videos: [
        { id: 1, title: "Course Overview & Enrollment", duration: "5 min", completed: false },
      ]
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'in-progress': return 'bg-academy-blue-light text-academy-blue border-academy-blue'
      case 'available': return 'bg-purple-100 text-purple-800 border-purple-200'
      case 'locked': return 'bg-academy-grey-light text-academy-grey border-academy-grey'
      default: return 'bg-academy-grey-light text-academy-grey border-academy-grey'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-4 w-4" />
      case 'in-progress': return <PlayCircle className="h-4 w-4" />
      case 'locked': return <Lock className="h-4 w-4" />
      default: return <BookOpen className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-4 text-academy-blue">Learning Modules</h1>
        <p className="text-academy-grey text-lg">
          Structured learning paths to build your finance expertise step by step.
        </p>
      </div>

      {/* Overall Progress */}
      <Card className="bg-gradient-subtle border-academy-blue-light shadow-card">
        <CardHeader>
          <CardTitle className="text-academy-blue">Your Overall Progress</CardTitle>
          <CardDescription>Complete modules to unlock advanced content</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between mb-2">
            <span className="text-sm font-medium">3 of 12 modules completed</span>
            <span className="text-sm text-academy-grey">25%</span>
          </div>
          <Progress value={25} className="h-3" />
        </CardContent>
      </Card>

      {/* Modules Grid */}
      <div className="space-y-6">
        {modules.map((module) => (
          <Card key={module.id} className={`bg-white shadow-card border-academy-grey-light hover:shadow-elevated transition-all ${(module as any).isOptional ? 'border-l-4 border-l-purple-500' : ''}`}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-xl text-academy-blue">{module.title}</CardTitle>
                    <Badge className={getStatusColor(module.status)}>
                      {getStatusIcon(module.status)}
                      <span className="ml-1 capitalize">
                        {module.status === 'in-progress' ? 'In Progress' : 
                         module.status === 'available' ? 'Optional' : module.status}
                      </span>
                    </Badge>
                    {(module as any).isOptional && (
                      <Badge variant="outline" className="border-purple-200 text-purple-700">
                        5 Credits
                      </Badge>
                    )}
                  </div>
                   <CardDescription className="text-base">{module.description}</CardDescription>
                   
                   {module.id === 2 && (
                     <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                       <p className="text-sm text-blue-800 mb-3">
                         <strong>Access Training The Street Platform:</strong>
                       </p>
                       <div className="flex flex-col gap-2">
                         <a 
                           href="https://portal.trainingthestreet.com/s/course-registration?CourseId=701S600000EXe8H&CourseCode=01E4A4" 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="text-blue-600 hover:text-blue-800 underline text-sm font-medium"
                         >
                           📝 Register for TTS Course
                         </a>
                         <a 
                           href="https://tts.mrooms3.net/course/view.php?id=3780" 
                           target="_blank" 
                           rel="noopener noreferrer"
                           className="text-blue-600 hover:text-blue-800 underline text-sm font-medium"
                         >
                           🔐 Sign In to TTS Platform
                         </a>
                       </div>
                     </div>
                   )}
                   
                   {module.id === 4 && (
                    <div className="mt-4 p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <p className="text-sm text-purple-800 mb-3">
                        <strong>About COWL 52:</strong> If you are interested in learning more about Personal Finance 
                        and would like to take a class for credit that may fit into your schedule better, you can sign up for 
                        the COWL 52 Personal Finance & Investing (5 credits) taught by Professor Patricia Kelly.
                      </p>
                      <p className="text-sm text-purple-700 mb-3">
                        Please note that this is optional for the Academy, but something we wanted to make you aware of. 
                        The class tends to sell out (there are already +225 enrollments). Let us know if you want to sign up 
                        and are not a UCSC student and we can get you a permission code for a limited time.
                      </p>
                      <div className="flex flex-col gap-2">
                        <a 
                          href="https://www.youtube.com/watch?v=49lyaV2q2eA" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:text-purple-800 underline text-sm font-medium"
                        >
                          🎥 Watch Course Overview Video
                        </a>
                        <a 
                          href="https://uconline.edu/search/view?offering_id=111765&home_campus_id=3527&home_campus=3527&term_year=2-2025&subject_area=6&host_campus=&instructor_name=&with_preview=&approvals=&dow=&start_time=&end_time=&page_number=NaN&items_per_page=10" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:text-purple-800 underline text-sm font-medium"
                        >
                          📚 Enrollment Information (Spring 2025)
                        </a>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 mt-3 text-sm text-academy-grey">
                    <span className="flex items-center gap-1">
                      <PlayCircle className="h-4 w-4" />
                      {module.completedVideos}/{module.totalVideos} videos
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {module.estimatedTime}
                    </span>
                  </div>
                </div>
              </div>
              
              {module.status !== 'locked' && (
                <div className="mt-4">
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Module Progress</span>
                    <span className="text-sm text-academy-grey">{module.progress}%</span>
                  </div>
                  <Progress value={module.progress} className="h-2" />
                </div>
              )}
            </CardHeader>

            <CardContent>
              {module.status === 'locked' ? (
                <div className="text-center py-6">
                  <Lock className="h-12 w-12 text-academy-grey mx-auto mb-3" />
                  <p className="text-academy-grey">Complete previous modules to unlock this content</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <h4 className="font-semibold text-academy-blue mb-3">Module Content:</h4>
                  {module.videos.map((video) => (
                    <div key={video.id} className="flex items-center justify-between p-3 bg-academy-grey-light rounded-lg">
                      <div className="flex items-center gap-3">
                        {video.completed ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <PlayCircle className="h-5 w-5 text-academy-blue" />
                        )}
                        <div>
                          <p className="font-medium text-academy-blue">{video.title}</p>
                          <p className="text-sm text-academy-grey">{video.duration}</p>
                        </div>
                      </div>
                      {video.completed ? (
                        <Badge className="bg-green-100 text-green-800 border-green-200">
                          <CheckCircle2 className="h-3 w-3 mr-1" />
                          Completed
                        </Badge>
                      ) : (
                        <Button size="sm" className="bg-academy-blue hover:bg-academy-blue-dark">
                          {module.status === 'in-progress' && module.videos.findIndex(v => !v.completed) === video.id - 1 ? 'Continue' : 'Watch'}
                        </Button>
                      )}
                    </div>
                  ))}
                  
                  <div className="pt-4 border-t border-academy-grey-light">
                    <Button 
                      className="w-full bg-academy-blue hover:bg-academy-blue-dark" 
                      disabled={module.status === 'locked'}
                    >
                      {module.status === 'completed' ? 'Review Module' : 
                       module.status === 'in-progress' ? 'Continue Module' : 
                       'Start Module'}
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Coming Soon */}
      <Card className="bg-gradient-subtle border-dashed border-2 border-academy-grey">
        <CardContent className="text-center py-12">
          <BookOpen className="h-16 w-16 text-academy-grey mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-academy-grey mb-2">More Modules Coming Soon</h3>
          <p className="text-academy-grey">
            We're constantly adding new content. Advanced modules in derivatives, risk management, and more are in development.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Modules;