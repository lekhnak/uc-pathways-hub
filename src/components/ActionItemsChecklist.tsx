import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { CheckCircle, ExternalLink, User, BookOpen } from "lucide-react"
import { NavLink } from "react-router-dom"

interface ActionItem {
  id: string
  title: string
  description: string
  content: React.ReactNode
  link?: string
  linkText?: string
  isInternal?: boolean
  internalRoute?: string
}

const ActionItemsChecklist = () => {
  const [completedItems, setCompletedItems] = useState<Record<string, boolean>>({})

  // Load completed items from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('ucActionItemsCompleted')
    if (saved) {
      setCompletedItems(JSON.parse(saved))
    }
  }, [])

  // Save completed items to localStorage
  const toggleItem = (itemId: string) => {
    const newCompletedItems = {
      ...completedItems,
      [itemId]: !completedItems[itemId]
    }
    setCompletedItems(newCompletedItems)
    localStorage.setItem('ucActionItemsCompleted', JSON.stringify(newCompletedItems))
  }

  const actionItems: ActionItem[] = [
    {
      id: 'slack',
      title: 'Join the Slack',
      description: 'Connect with your peers and stay updated on opportunities',
      content: (
        <div className="space-y-4">
          <p className="text-sm leading-relaxed">
            Please join the Slack channel using the following link. Communication with your peers as well as 
            announcements regarding career opportunities and guest speaker events will occur on the Slack.
          </p>
          <ul className="text-sm space-y-2 list-disc list-inside">
            <li>Career Opportunities will be posted in the <strong>#career-opps</strong> channel.</li>
            <li>Guest speaker events and other events arranged for UC Investment Academy participants will be posted in the <strong>#events</strong> channel.</li>
            <li>Major announcements and interaction amongst all UC Investment Academy participants across each of the UC campuses will occur in the <strong>#general</strong> channel.</li>
          </ul>
          <div className="rounded-lg overflow-hidden">
            <img 
              src="/lovable-uploads/55cfc2e8-db1f-42e3-94d3-76a88db3e263.png" 
              alt="Slack Interface Preview" 
              className="w-full h-auto"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
        </div>
      ),
      link: 'https://join.slack.com/t/ucinvestmentacademy/shared_invite/zt-3c8rrgsja-~clO6O8OaBWIauwd~DP8uQ',
      linkText: 'Join UC IA Slack'
    },
    {
      id: 'tts',
      title: 'Create your Training the Street Account',
      description: 'Access online courses for core financial skills',
      content: (
        <div className="space-y-4">
          <p className="text-sm leading-relaxed">
            Training the Street (TTS) provides access to online courses that must be completed during the UC Investment Academy. 
            These courses will cover core skills that can be applied to future careers in the financial services industry, including: 
            accounting, financial modeling, valuation, etc.
          </p>
          <p className="text-sm leading-relaxed">
            Please look out for an email inviting you to register for TTS courses after you have been admitted to the UC Investment Academy.
          </p>
          <div className="rounded-lg overflow-hidden">
            <img 
              src="/lovable-uploads/192d9f3d-a329-4dde-804c-a6355bdcb16f.png" 
              alt="Training the Street Course Interface" 
              className="w-full h-auto"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
        </div>
      ),
      link: 'https://login.trainingthestreet.com/a/2aeb772/login/',
      linkText: 'Access TTS Courses'
    },
    {
      id: 'forage',
      title: 'Register for UC Investments - Forage',
      description: 'Complete virtual internships with major financial firms',
      content: (
        <div className="space-y-4">
          <p className="text-sm leading-relaxed">
            Forage provides UC Investment Academy participants with access to virtual internships that you can complete 
            with major financial services firms.
          </p>
          <p className="text-sm leading-relaxed">
            Please sign up for Forage using the registration link below.
          </p>
          <div className="rounded-lg overflow-hidden">
            <img 
              src="/lovable-uploads/c8b7dc11-6ecd-47e5-abdf-4db52fc3ed96.png" 
              alt="UC Investments Academy with Forage" 
              className="w-full h-auto"
              onError={(e) => {
                e.currentTarget.style.display = 'none'
              }}
            />
          </div>
          <p className="text-sm text-muted-foreground">
            After registration, your Forage portal can be accessed by logging in at: 
            <a href="https://www.theforage.com/login" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline ml-1">
              theforage.com/login
            </a>
          </p>
        </div>
      ),
      link: 'https://www.theforage.com/landing/university-of-california-piird/uc-investments-academy-YY8h',
      linkText: 'Sign Up for Forage'
    },
    {
      id: 'profile',
      title: 'Navigate to My Profile and update your information',
      description: 'Keep your profile information up to date',
      content: (
        <div className="space-y-4">
          <p className="text-sm leading-relaxed">
            Please navigate to your profile page and ensure all your information is complete and accurate. 
            This helps us provide you with the best experience and opportunities matched to your interests.
          </p>
          <ul className="text-sm space-y-2 list-disc list-inside">
            <li>Update your contact information</li>
            <li>Add your academic background</li>
            <li>Specify your career interests</li>
            <li>Upload a professional photo</li>
          </ul>
        </div>
      ),
      isInternal: true,
      internalRoute: '/profile',
      linkText: 'Update Profile'
    },
    {
      id: 'learning',
      title: 'Start Learning',
      description: 'Begin your journey with our learning modules',
      content: (
        <div className="space-y-4">
          <p className="text-sm leading-relaxed">
            Start your UC Investment Academy journey by exploring our comprehensive learning modules. 
            These modules are designed to build your knowledge progressively from foundational concepts to advanced topics.
          </p>
          <ul className="text-sm space-y-2 list-disc list-inside">
            <li>Orientations & Foundations</li>
            <li>TTS Basic Finance Courses</li>
            <li>Industry-Specific Training</li>
            <li>Practical Applications</li>
          </ul>
        </div>
      ),
      isInternal: true,
      internalRoute: '/modules',
      linkText: 'Start Learning'
    }
  ]

  const completedCount = Object.values(completedItems).filter(Boolean).length

  return (
    <Card className="bg-white shadow-card border-academy-grey-light">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-academy-blue">
          <CheckCircle className="h-5 w-5" />
          Action Items Checklist
        </CardTitle>
        <CardDescription>
          Complete these steps to get the most out of your UC Investment Academy experience
          ({completedCount}/{actionItems.length} completed)
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {actionItems.map((item) => {
          const isCompleted = completedItems[item.id]
          
          return (
            <div 
              key={item.id} 
              className={`flex items-start gap-3 p-4 rounded-lg border transition-all ${
                isCompleted 
                  ? 'bg-green-50 border-green-200 opacity-75' 
                  : 'bg-academy-grey-light border-academy-grey-light hover:border-academy-blue-light'
              }`}
            >
              <Checkbox
                id={item.id}
                checked={isCompleted}
                onCheckedChange={() => toggleItem(item.id)}
                className="mt-0.5"
              />
              
              <div className="flex-1 min-w-0">
                <div className={`font-medium text-academy-blue ${isCompleted ? 'line-through' : ''}`}>
                  {item.title}
                </div>
                <div className={`text-sm text-academy-grey mt-1 ${isCompleted ? 'line-through' : ''}`}>
                  {item.description}
                </div>
              </div>

              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm"
                    className="border-academy-blue text-academy-blue hover:bg-academy-blue-light"
                  >
                    View Details
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle className="text-academy-blue">{item.title}</DialogTitle>
                    <DialogDescription>{item.description}</DialogDescription>
                  </DialogHeader>
                  
                  <div className="mt-4">
                    {item.content}
                  </div>

                  <div className="flex gap-3 mt-6">
                    {item.isInternal && item.internalRoute ? (
                      <Button asChild className="bg-academy-blue hover:bg-academy-blue-dark">
                        <NavLink to={item.internalRoute}>
                          {item.id === 'profile' ? <User className="mr-2 h-4 w-4" /> : <BookOpen className="mr-2 h-4 w-4" />}
                          {item.linkText}
                        </NavLink>
                      </Button>
                    ) : item.link ? (
                      <Button 
                        onClick={() => window.open(item.link, '_blank')}
                        className="bg-academy-blue hover:bg-academy-blue-dark"
                      >
                        <ExternalLink className="mr-2 h-4 w-4" />
                        {item.linkText}
                      </Button>
                    ) : null}
                    
                    <Button
                      variant="outline"
                      onClick={() => toggleItem(item.id)}
                      className={
                        isCompleted 
                          ? "border-green-500 text-green-600 hover:bg-green-50"
                          : "border-academy-blue text-academy-blue hover:bg-academy-blue-light"
                      }
                    >
                      <CheckCircle className="mr-2 h-4 w-4" />
                      {isCompleted ? 'Mark Incomplete' : 'Mark Complete'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          )
        })}
        
        {completedCount === actionItems.length && (
          <div className="text-center py-6 bg-green-50 rounded-lg border border-green-200">
            <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-2" />
            <div className="text-green-800 font-medium">Congratulations!</div>
            <div className="text-green-600 text-sm">You've completed all action items.</div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ActionItemsChecklist