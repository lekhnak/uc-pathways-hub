import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { FileText, Download, Search, Award, Users, Calendar } from "lucide-react"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"

interface CertificationUpload {
  id: string
  certification_name: string
  file_path: string
  file_size: number
  mime_type: string
  created_at: string
  user_id: string
  profiles?: {
    first_name?: string
    last_name?: string
  }
}

const AdminCertifications = () => {
  const [uploads, setUploads] = useState<CertificationUpload[]>([])
  const [filteredUploads, setFilteredUploads] = useState<CertificationUpload[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  const fetchUploads = async () => {
    try {
      const { data, error } = await supabase
        .from('certification_uploads')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      
      // Fetch profile data separately for each unique user_id
      const userIds = [...new Set(data?.map(upload => upload.user_id) || [])]
      const profilesData = await Promise.all(
        userIds.map(async (userId) => {
          const { data: profile } = await supabase
            .from('profiles')
            .select('first_name, last_name')
            .eq('user_id', userId)
            .single()
          return { userId, profile }
        })
      )

      // Create a profiles map
      const profilesMap = profilesData.reduce((acc, { userId, profile }) => {
        acc[userId] = profile
        return acc
      }, {} as Record<string, any>)

      // Enhance uploads with profile data
      const enhancedUploads = (data || []).map(upload => ({
        ...upload,
        profiles: profilesMap[upload.user_id] || null
      }))

      setUploads(enhancedUploads)
      setFilteredUploads(enhancedUploads)
    } catch (error) {
      console.error('Error fetching uploads:', error)
      toast.error("Failed to load certification uploads")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUploads()
  }, [])

  useEffect(() => {
    const filtered = uploads.filter(upload => {
      const studentName = `${upload.profiles?.first_name || ''} ${upload.profiles?.last_name || ''}`.toLowerCase()
      const certName = upload.certification_name.toLowerCase()
      const search = searchTerm.toLowerCase()
      
      return studentName.includes(search) || certName.includes(search)
    })
    setFilteredUploads(filtered)
  }, [searchTerm, uploads])

  const downloadFile = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('certification-files')
        .download(filePath)

      if (error) throw error

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
      toast.error("Failed to download file")
    }
  }

  const formatFileSize = (bytes: number) => {
    const mb = bytes / (1024 * 1024)
    return `${mb.toFixed(2)} MB`
  }

  const getFileTypeColor = (mimeType: string) => {
    if (mimeType.includes('pdf')) return 'bg-red-100 text-red-800'
    if (mimeType.includes('image')) return 'bg-blue-100 text-blue-800'
    if (mimeType.includes('document')) return 'bg-green-100 text-green-800'
    return 'bg-gray-100 text-gray-800'
  }

  const uniqueStudents = new Set(uploads.map(u => u.user_id)).size
  const totalFiles = uploads.length
  const totalSize = uploads.reduce((acc, u) => acc + u.file_size, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-4 text-academy-blue">Certification Uploads</h1>
        <p className="text-academy-grey text-lg">
          Monitor and manage all student certification uploads
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-academy-grey">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-academy-blue" />
              <span className="text-2xl font-bold text-academy-blue">{uniqueStudents}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-academy-grey">Total Certifications</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Award className="h-4 w-4 text-academy-blue" />
              <span className="text-2xl font-bold text-academy-blue">{totalFiles}</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-academy-grey">Storage Used</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-academy-blue" />
              <span className="text-2xl font-bold text-academy-blue">{formatFileSize(totalSize)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-academy-blue">
            <Search className="h-5 w-5" />
            Search & Filter
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Input
              placeholder="Search by student name or certification..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1"
            />
          </div>
        </CardContent>
      </Card>

      {/* Uploads Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-academy-blue">All Certification Uploads</CardTitle>
          <CardDescription>
            {filteredUploads.length} of {totalFiles} certifications shown
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-academy-grey">Loading...</div>
          ) : filteredUploads.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Student</TableHead>
                    <TableHead>Certification</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Size</TableHead>
                    <TableHead>Upload Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredUploads.map((upload) => (
                    <TableRow key={upload.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium text-academy-blue">
                            {upload.profiles?.first_name && upload.profiles?.last_name
                              ? `${upload.profiles.first_name} ${upload.profiles.last_name}`
                              : 'Unknown Student'}
                          </p>
                          <p className="text-sm text-academy-grey">{upload.user_id.slice(0, 8)}...</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{upload.certification_name}</p>
                      </TableCell>
                      <TableCell>
                        <Badge className={getFileTypeColor(upload.mime_type)}>
                          {upload.mime_type.split('/')[1].toUpperCase()}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatFileSize(upload.file_size)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-academy-grey" />
                          {new Date(upload.created_at).toLocaleDateString()}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => downloadFile(upload.file_path, upload.certification_name)}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8">
              <FileText className="mx-auto h-12 w-12 text-academy-grey mb-4" />
              <p className="text-academy-grey mb-2">
                {searchTerm ? 'No certifications match your search' : 'No certifications uploaded yet'}
              </p>
              {searchTerm && (
                <Button variant="outline" onClick={() => setSearchTerm("")}>
                  Clear Search
                </Button>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default AdminCertifications