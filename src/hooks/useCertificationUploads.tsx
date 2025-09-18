import { useState, useEffect } from "react"
import { supabase } from "@/integrations/supabase/client"
import { useAuth } from "@/hooks/useAuth"

interface CertificationUpload {
  id: string
  certification_name: string
  file_path: string
  file_size: number
  mime_type: string
  created_at: string
  updated_at: string
}

export const useCertificationUploads = () => {
  const { user } = useAuth()
  const [uploads, setUploads] = useState<CertificationUpload[]>([])
  const [loading, setLoading] = useState(true)

  const fetchUploads = async () => {
    if (!user) {
      setUploads([])
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('certification_uploads')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setUploads(data || [])
    } catch (error) {
      console.error('Error fetching uploads:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUploads()
  }, [user])

  // Calculate progress stats
  const getProgressStats = () => {
    const totalAvailable = 14 // 6 Forage + 8 additional certifications
    const completed = uploads.length
    const inProgress = Math.max(0, Math.min(2, totalAvailable - completed)) // Simulate some in-progress
    const available = Math.max(0, totalAvailable - completed - inProgress)

    return {
      completed,
      inProgress,
      available,
      total: totalAvailable
    }
  }

  const downloadFile = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('certification-files')
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

  return {
    uploads,
    loading,
    fetchUploads,
    getProgressStats,
    downloadFile
  }
}