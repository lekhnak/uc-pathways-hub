import React, { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { X, AlertTriangle } from 'lucide-react'

interface RejectionDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
  applicantName: string
}

const RejectionDialog: React.FC<RejectionDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  applicantName
}) => {
  const [reason, setReason] = useState('')

  const handleSubmit = () => {
    if (reason.trim()) {
      onConfirm(reason.trim())
      setReason('')
      onClose()
    }
  }

  const handleClose = () => {
    setReason('')
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Reject Application
          </DialogTitle>
          <DialogDescription>
            You are about to reject {applicantName}'s application. This action will send a rejection email to the applicant.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="rejection-reason">Reason for Rejection</Label>
            <Textarea
              id="rejection-reason"
              placeholder="Please provide a reason for rejecting this application..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="resize-none"
            />
          </div>
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={handleSubmit}
            disabled={!reason.trim()}
          >
            <X className="h-4 w-4 mr-2" />
            Confirm Rejection
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default RejectionDialog