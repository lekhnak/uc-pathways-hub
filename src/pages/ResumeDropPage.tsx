import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Upload, FileText, Download, Eye, CheckCircle2, Clock, AlertCircle } from "lucide-react"

const ResumeDropPage = () => {
  const submissions = [
    {
      id: 1,
      fileName: "Resume_JohnDoe_IB.pdf",
      submittedDate: "Dec 10, 2024",
      status: "reviewed",
      feedback: "Strong technical skills section. Consider adding more quantitative achievements in experience section.",
      reviewer: "Sarah Johnson, Career Services",
      score: 8.5
    },
    {
      id: 2,
      fileName: "CoverLetter_Goldman.pdf",
      submittedDate: "Dec 8, 2024",
      status: "pending",
      feedback: null,
      reviewer: null,
      score: null
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reviewed': return 'bg-green-100 text-green-800'
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'in-review': return 'bg-blue-100 text-blue-800'
      default: return 'bg-academy-grey-light text-academy-grey'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'reviewed': return <CheckCircle2 className="h-4 w-4" />
      case 'pending': return <Clock className="h-4 w-4" />
      case 'in-review': return <AlertCircle className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-4 text-academy-blue">Resume Drop</h1>
        <p className="text-academy-grey text-lg">
          Get personalized feedback on your resume and cover letters from career services and industry professionals.
        </p>
      </div>

      {/* Upload Section */}
      <Card className="bg-gradient-subtle border-academy-blue-light shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-academy-blue">
            <Upload className="h-5 w-5" />
            Submit Your Documents
          </CardTitle>
          <CardDescription>Upload your resume, cover letter, or other career documents for review</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* File Upload Area */}
          <div className="border-2 border-dashed border-academy-blue rounded-lg p-8 text-center hover:border-academy-blue-dark transition-colors">
            <Upload className="h-12 w-12 text-academy-blue mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-academy-blue mb-2">Drop files here or click to browse</h3>
            <p className="text-academy-grey mb-4">Supported formats: PDF, DOC, DOCX (Max 10MB)</p>
            <Button className="bg-academy-blue hover:bg-academy-blue-dark">
              Choose Files
            </Button>
          </div>

          {/* Submission Form */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-academy-blue mb-2">Document Type</label>
              <select className="w-full p-2 border border-academy-grey-light rounded-md focus:ring-2 focus:ring-academy-blue focus:border-transparent">
                <option>Resume</option>
                <option>Cover Letter</option>
                <option>LinkedIn Profile</option>
                <option>Personal Statement</option>
                <option>Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-academy-blue mb-2">Target Role/Industry</label>
              <Input placeholder="e.g., Investment Banking, Private Equity" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-academy-blue mb-2">Additional Notes (Optional)</label>
            <Textarea 
              placeholder="Any specific areas you'd like feedback on or questions you have..."
              rows={3}
            />
          </div>

          <div className="flex gap-4">
            <Button className="flex-1 bg-academy-blue hover:bg-academy-blue-dark">
              Submit for Review
            </Button>
            <Button variant="outline" className="border-academy-blue text-academy-blue hover:bg-academy-blue-light">
              Save Draft
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Review Guidelines */}
      <Card className="bg-white shadow-card border-academy-grey-light">
        <CardHeader>
          <CardTitle className="text-academy-blue">Review Process</CardTitle>
          <CardDescription>What to expect when you submit your documents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-academy-blue rounded-full flex items-center justify-center text-white mx-auto mb-3">
                1
              </div>
              <h4 className="font-semibold text-academy-blue mb-2">Submit Documents</h4>
              <p className="text-sm text-academy-grey">Upload your resume, cover letter, or other materials</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-academy-blue rounded-full flex items-center justify-center text-white mx-auto mb-3">
                2
              </div>
              <h4 className="font-semibold text-academy-blue mb-2">Expert Review</h4>
              <p className="text-sm text-academy-grey">Career services team and industry professionals review</p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-academy-blue rounded-full flex items-center justify-center text-white mx-auto mb-3">
                3
              </div>
              <h4 className="font-semibold text-academy-blue mb-2">Receive Feedback</h4>
              <p className="text-sm text-academy-grey">Get detailed feedback and improvement suggestions</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Previous Submissions */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-academy-blue">Your Submissions</h2>
        
        {submissions.length > 0 ? (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <Card key={submission.id} className="bg-white shadow-card border-academy-grey-light">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 bg-academy-grey-light rounded-lg flex items-center justify-center">
                        <FileText className="h-6 w-6 text-academy-blue" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-academy-blue mb-1">{submission.fileName}</h3>
                        <p className="text-sm text-academy-grey">Submitted on {submission.submittedDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Badge className={getStatusColor(submission.status)}>
                        {getStatusIcon(submission.status)}
                        <span className="ml-1 capitalize">{submission.status}</span>
                      </Badge>
                      {submission.score && (
                        <div className="text-right">
                          <div className="text-lg font-bold text-academy-blue">{submission.score}/10</div>
                          <div className="text-xs text-academy-grey">Score</div>
                        </div>
                      )}
                    </div>
                  </div>

                  {submission.feedback && (
                    <div className="bg-academy-grey-light p-4 rounded-lg mb-4">
                      <h4 className="font-semibold text-academy-blue mb-2">Feedback</h4>
                      <p className="text-academy-grey mb-2">{submission.feedback}</p>
                      <p className="text-sm text-academy-blue font-medium">— {submission.reviewer}</p>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button size="sm" variant="outline" className="border-academy-blue text-academy-blue hover:bg-academy-blue-light">
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button size="sm" variant="outline" className="border-academy-blue text-academy-blue hover:bg-academy-blue-light">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    {submission.status === 'reviewed' && (
                      <Button size="sm" className="bg-academy-blue hover:bg-academy-blue-dark">
                        Resubmit Updated Version
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-white shadow-card border-academy-grey-light">
            <CardContent className="text-center py-12">
              <FileText className="h-16 w-16 text-academy-grey mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-academy-grey mb-2">No submissions yet</h3>
              <p className="text-academy-grey mb-6">
                Upload your first document to get started with personalized feedback.
              </p>
              <Button className="bg-academy-blue hover:bg-academy-blue-dark">
                Submit Your First Document
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Resources */}
      <Card className="bg-white shadow-card border-academy-grey-light">
        <CardHeader>
          <CardTitle className="text-academy-blue">Resume Resources</CardTitle>
          <CardDescription>Additional resources to help you create outstanding documents</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-academy-grey-light rounded-lg">
              <h4 className="font-semibold text-academy-blue mb-2">Resume Templates</h4>
              <p className="text-sm text-academy-grey mb-3">Industry-specific templates for finance roles</p>
              <Button size="sm" variant="outline" className="border-academy-blue text-academy-blue hover:bg-academy-blue-light">
                Download Templates
              </Button>
            </div>
            <div className="p-4 bg-academy-grey-light rounded-lg">
              <h4 className="font-semibold text-academy-blue mb-2">Writing Guide</h4>
              <p className="text-sm text-academy-grey mb-3">Best practices for finance resumes and cover letters</p>
              <Button size="sm" variant="outline" className="border-academy-blue text-academy-blue hover:bg-academy-blue-light">
                Read Guide
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ResumeDropPage;