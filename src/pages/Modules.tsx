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
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800 border-green-200'
      case 'in-progress': return 'bg-academy-blue-light text-academy-blue border-academy-blue'
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
          <Card key={module.id} className="bg-white shadow-card border-academy-grey-light hover:shadow-elevated transition-all">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <CardTitle className="text-xl text-academy-blue">{module.title}</CardTitle>
                    <Badge className={getStatusColor(module.status)}>
                      {getStatusIcon(module.status)}
                      <span className="ml-1 capitalize">{module.status === 'in-progress' ? 'In Progress' : module.status}</span>
                    </Badge>
                  </div>
                  <CardDescription className="text-base">{module.description}</CardDescription>
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