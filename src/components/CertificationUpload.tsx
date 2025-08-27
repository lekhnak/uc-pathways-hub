import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Upload, FileText, X, CheckCircle2 } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/useAuth"
import { toast } from "sonner"

interface CertificationUploadProps {
  onUploadComplete: () => void
}

export const CertificationUpload = ({ onUploadComplete }: CertificationUploadProps) => {
  const { user } = useAuth()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [certificationName, setCertificationName] = useState("")
  const [isUploading, setIsUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  const handleFileSelect = (file: File) => {
    // Validate file type (PDFs, images, documents)
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    
    if (!allowedTypes.includes(file.type)) {
      toast.error("Please upload a valid file (PDF, JPG, PNG, DOC, DOCX)")
      return
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB limit
      toast.error("File size must be less than 10MB")
      return
    }

    setSelectedFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length > 0) {
      handleFileSelect(files[0])
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleUpload = async () => {
    if (!selectedFile || !certificationName.trim() || !user) {
      toast.error("Please select a file and enter certification name")
      return
    }

    setIsUploading(true)

    try {
      // Upload file to storage
      const fileExt = selectedFile.name.split('.').pop()
      const fileName = `${user.id}/${Date.now()}.${fileExt}`
      
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('certification-files')
        .upload(fileName, selectedFile)

      if (uploadError) throw uploadError

      // Save upload record to database
      const { error: dbError } = await supabase
        .from('certification_uploads')
        .insert({
          user_id: user.id,
          certification_name: certificationName.trim(),
          file_path: uploadData.path,
          file_size: selectedFile.size,
          mime_type: selectedFile.type
        })

      if (dbError) throw dbError

      toast.success("Certification uploaded successfully!")
      setSelectedFile(null)
      setCertificationName("")
      onUploadComplete()
    } catch (error) {
      console.error('Upload error:', error)
      toast.error("Failed to upload certification. Please try again.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <Card className="bg-white shadow-card border-academy-blue-light">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-academy-blue">
          <Upload className="h-5 w-5" />
          Upload Certification
        </CardTitle>
        <CardDescription>
          Upload your completed certification documents to track your progress
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Certification Name Input */}
        <div className="space-y-2">
          <Label htmlFor="certificationName">Certification Name</Label>
          <Input
            id="certificationName"
            placeholder="e.g., JPMorgan Chase Investment Banking Certificate"
            value={certificationName}
            onChange={(e) => setCertificationName(e.target.value)}
          />
        </div>

        {/* File Drop Zone */}
        <div
          className={`border-2 border-dashed rounded-lg p-6 transition-all ${
            dragOver
              ? 'border-academy-blue bg-academy-blue-light/20'
              : selectedFile
              ? 'border-green-300 bg-green-50'
              : 'border-academy-grey-light bg-background hover:border-academy-blue'
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          {selectedFile ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="h-8 w-8 text-green-600" />
                <div>
                  <p className="font-medium text-green-800">{selectedFile.name}</p>
                  <p className="text-sm text-green-600">
                    {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedFile(null)}
                className="text-red-600 border-red-300 hover:bg-red-50"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <div className="text-center">
              <Upload className="mx-auto h-12 w-12 text-academy-grey mb-4" />
              <p className="text-academy-grey mb-2">
                Drag and drop your file here, or{' '}
                <label className="text-academy-blue cursor-pointer hover:underline">
                  browse
                  <input
                    type="file"
                    className="hidden"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) handleFileSelect(file)
                    }}
                  />
                </label>
              </p>
              <p className="text-sm text-academy-grey">
                PDF, JPG, PNG, DOC, DOCX (max 10MB)
              </p>
            </div>
          )}
        </div>

        {/* Upload Button */}
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || !certificationName.trim() || isUploading}
          className="w-full bg-academy-blue hover:bg-academy-blue-dark"
        >
          {isUploading ? (
            "Uploading..."
          ) : (
            <>
              <CheckCircle2 className="mr-2 h-4 w-4" />
              Upload Certification
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  )
}