import React from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Check, X, Download, ExternalLink, User, Mail, GraduationCap, MapPin, Calendar, Briefcase, Star } from 'lucide-react'
import { supabase } from '@/integrations/supabase/client'

interface Application {
  id: string
  first_name: string
  last_name: string
  email: string
  uc_campus: string
  major: string
  status: string
  submitted_at: string
  gpa: number
  student_type: string
  graduation_year?: number
  linkedin_url?: string
  current_position?: string
  current_employer?: string
  resume_file_path?: string
  transcript_file_path?: string
  consent_form_file_path?: string
  racial_identity?: string
  gender_identity?: string
  sexual_orientation?: string
  first_generation_student?: boolean
  pell_grant_eligible?: boolean
  currently_employed?: boolean
  question_1?: string
  question_2?: string
  question_3?: string
  question_4?: string
  admin_comment?: string
}

interface ApplicationModalProps {
  application: Application | null
  isOpen: boolean
  onClose: () => void
  onApprove: (applicationId: string, newStatus: 'approved', applicantName: string, email: string) => void
  onReject: (application: Application) => void
}

const ApplicationModal: React.FC<ApplicationModalProps> = ({
  application,
  isOpen,
  onClose,
  onApprove,
  onReject
}) => {
  if (!application) return null

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'approved': return 'bg-green-100 text-green-800'
      case 'rejected': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleDownload = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('application-documents')
        .download(filePath)

      if (error) throw error

      // Create download link
      const url = URL.createObjectURL(data)
      const a = document.createElement('a')
      a.href = url
      a.download = fileName
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading file:', error)
    }
  }

  const handleViewDocument = async (filePath: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('application-documents')
        .download(filePath)

      if (error) throw error

      // Create blob URL for viewing
      const url = URL.createObjectURL(data)
      window.open(url, '_blank')
      
      // Clean up the URL after a delay
      setTimeout(() => URL.revokeObjectURL(url), 1000)
    } catch (error) {
      console.error('Error viewing file:', error)
      // Fallback to public URL if download fails
      const publicUrl = `https://wotqxwqlmjcnrckfjgno.supabase.co/storage/v1/object/public/application-documents/${filePath}`
      window.open(publicUrl, '_blank')
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            <User className="h-5 w-5" />
            {application.first_name} {application.last_name}
            <Badge className={getStatusColor(application.status)}>
              {application.status}
            </Badge>
          </DialogTitle>
          <DialogDescription>
            Application submitted on {new Date(application.submitted_at).toLocaleDateString()}
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[calc(90vh-200px)]">
          <div className="space-y-6 pr-4">
            {/* Personal Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <User className="h-4 w-4" />
                Personal Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Email:</span>
                    <span>{application.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <GraduationCap className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Campus:</span>
                    <span>{application.uc_campus}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Major:</span>
                    <span>{application.major}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <Star className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">GPA:</span>
                    <span>{application.gpa}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Student Type:</span>
                    <span>{application.student_type}</span>
                  </div>
                  {application.graduation_year && (
                    <div className="flex items-center gap-2 text-sm">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">Graduation Year:</span>
                      <span>{application.graduation_year}</span>
                    </div>
                  )}
                  {application.linkedin_url && (
                    <div className="flex items-center gap-2 text-sm">
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">LinkedIn:</span>
                      <a 
                        href={application.linkedin_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline"
                      >
                        View Profile
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <Separator />

            {/* Employment Information */}
            {(application.current_position || application.current_employer || application.currently_employed !== undefined) && (
              <>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Briefcase className="h-4 w-4" />
                    Employment Information
                  </h3>
                  <div className="space-y-2">
                    {application.currently_employed !== undefined && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">Currently Employed:</span>
                        <Badge variant={application.currently_employed ? "default" : "secondary"}>
                          {application.currently_employed ? "Yes" : "No"}
                        </Badge>
                      </div>
                    )}
                    {application.current_position && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">Current Position:</span>
                        <span>{application.current_position}</span>
                      </div>
                    )}
                    {application.current_employer && (
                      <div className="flex items-center gap-2 text-sm">
                        <span className="font-medium">Current Employer:</span>
                        <span>{application.current_employer}</span>
                      </div>
                    )}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Background Information */}
            {(application.racial_identity || application.gender_identity || application.sexual_orientation || 
              application.first_generation_student !== undefined || application.pell_grant_eligible !== undefined) && (
              <>
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Background Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {application.racial_identity && (
                      <div className="space-y-1">
                        <span className="font-medium text-sm">Racial Identity:</span>
                        <p className="text-sm text-muted-foreground">{application.racial_identity}</p>
                      </div>
                    )}
                    {application.gender_identity && (
                      <div className="space-y-1">
                        <span className="font-medium text-sm">Gender Identity:</span>
                        <p className="text-sm text-muted-foreground">{application.gender_identity}</p>
                      </div>
                    )}
                    {application.sexual_orientation && (
                      <div className="space-y-1">
                        <span className="font-medium text-sm">Sexual Orientation:</span>
                        <p className="text-sm text-muted-foreground">{application.sexual_orientation}</p>
                      </div>
                    )}
                    {application.first_generation_student !== undefined && (
                      <div className="space-y-1">
                        <span className="font-medium text-sm">First Generation Student:</span>
                        <Badge variant={application.first_generation_student ? "default" : "secondary"}>
                          {application.first_generation_student ? "Yes" : "No"}
                        </Badge>
                      </div>
                    )}
                    {application.pell_grant_eligible !== undefined && (
                      <div className="space-y-1">
                        <span className="font-medium text-sm">Pell Grant Eligible:</span>
                        <Badge variant={application.pell_grant_eligible ? "default" : "secondary"}>
                          {application.pell_grant_eligible ? "Yes" : "No"}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
                <Separator />
              </>
            )}

            {/* Application Questions */}
            {(application.question_1 || application.question_2 || application.question_3 || application.question_4) && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Application Essays</h3>
                <div className="space-y-4">
                  {application.question_1 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Question 1:</h4>
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                        {application.question_1}
                      </p>
                    </div>
                  )}
                  {application.question_2 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Question 2:</h4>
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                        {application.question_2}
                      </p>
                    </div>
                  )}
                  {application.question_3 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Question 3:</h4>
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                        {application.question_3}
                      </p>
                    </div>
                  )}
                  {application.question_4 && (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm">Question 4:</h4>
                      <p className="text-sm text-muted-foreground bg-muted p-3 rounded-md">
                        {application.question_4}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Documents */}
            {(application.resume_file_path || application.transcript_file_path || application.consent_form_file_path) && (
              <>
                <Separator />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Documents</h3>
                  <div className="space-y-3">
                    {application.resume_file_path && (
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="font-medium">Resume</span>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDocument(application.resume_file_path!)}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(application.resume_file_path!, 'Resume.pdf')}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    )}
                    {application.transcript_file_path && (
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="font-medium">Transcript</span>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDocument(application.transcript_file_path!)}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(application.transcript_file_path!, 'Transcript.pdf')}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    )}
                    {application.consent_form_file_path && (
                      <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                        <span className="font-medium">Consent Form</span>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDocument(application.consent_form_file_path!)}
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDownload(application.consent_form_file_path!, 'Consent_Form.pdf')}
                          >
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        {/* Action Buttons */}
        {application.status === 'pending' && (
          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button
              variant="destructive"
              onClick={() => onReject(application)}
            >
              <X className="h-4 w-4 mr-2" />
              Reject
            </Button>
            <Button
              onClick={() => onApprove(application.id, 'approved', `${application.first_name} ${application.last_name}`, application.email)}
            >
              <Check className="h-4 w-4 mr-2" />
              Approve & Create Profile
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

export default ApplicationModal