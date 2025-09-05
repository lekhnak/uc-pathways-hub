import React, { useEffect, useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { Shield, Plus, Edit, Trash2, Users, AlertTriangle, Mail } from 'lucide-react'
import { useAdminAuth } from '@/hooks/useAdminAuth'

interface AdminUser {
  id: string
  username: string
  email?: string
  full_name?: string
  created_at: string
}

interface AdminForm {
  username: string
  full_name: string
  email: string
  password: string
}

const AdminManagement = () => {
  const [admins, setAdmins] = useState<AdminUser[]>([])
  const [loading, setLoading] = useState(true)
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingAdmin, setEditingAdmin] = useState<AdminUser | null>(null)
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [formData, setFormData] = useState<AdminForm>({
    username: '',
    full_name: '',
    email: '',
    password: ''
  })
  const { toast } = useToast()
  const { adminUser } = useAdminAuth()

  // Check if current admin is super admin (first admin user or specific role)
  const isSuperAdmin = adminUser?.username === 'admin' // You can modify this logic as needed

  useEffect(() => {
    if (isSuperAdmin) {
      fetchAdmins()
    } else {
      setLoading(false)
    }
  }, [isSuperAdmin])

  const fetchAdmins = async () => {
    try {
      const { data, error } = await supabase
        .from('admin_users')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setAdmins(data || [])
    } catch (error) {
      console.error('Error fetching admins:', error)
      toast({
        title: "Error",
        description: "Failed to fetch administrators",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitLoading(true)

    try {
      // Hash the password (in production, this should be done server-side)
      const bcrypt = await import('bcrypt')
      const hashedPassword = await bcrypt.hash(formData.password, 10)

      const { data, error } = await supabase
        .from('admin_users')
        .insert({
          username: formData.username,
          full_name: formData.full_name,
          email: formData.email,
          password_hash: hashedPassword
        })
        .select()

      if (error) throw error

      // Send invitation email
      try {
        await supabase.functions.invoke('send-admin-invite', {
          body: {
            email: formData.email,
            full_name: formData.full_name,
            username: formData.username,
            tempPassword: formData.password
          }
        })
      } catch (emailError) {
        console.warn('Failed to send invitation email:', emailError)
        // Don't fail the entire operation if email fails
      }

      toast({
        title: "Administrator Created",
        description: `${formData.full_name} has been added as an administrator and invitation sent.`,
      })

      setFormData({ username: '', full_name: '', email: '', password: '' })
      setIsAddDialogOpen(false)
      fetchAdmins()
    } catch (error: any) {
      console.error('Error creating admin:', error)
      toast({
        title: "Error",
        description: `Failed to create administrator: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleEdit = (admin: AdminUser) => {
    setEditingAdmin(admin)
    setFormData({
      username: admin.username,
      full_name: admin.full_name || '',
      email: admin.email || '',
      password: ''
    })
    setIsEditDialogOpen(true)
  }

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingAdmin) return

    setSubmitLoading(true)

    try {
      const updateData: any = {
        username: formData.username,
        full_name: formData.full_name,
        email: formData.email
      }

      // Only update password if provided
      if (formData.password) {
        const bcrypt = await import('bcrypt')
        updateData.password_hash = await bcrypt.hash(formData.password, 10)
      }

      const { error } = await supabase
        .from('admin_users')
        .update(updateData)
        .eq('id', editingAdmin.id)

      if (error) throw error

      toast({
        title: "Administrator Updated",
        description: `${formData.full_name} has been updated successfully.`,
      })

      setIsEditDialogOpen(false)
      setEditingAdmin(null)
      fetchAdmins()
    } catch (error: any) {
      console.error('Error updating admin:', error)
      toast({
        title: "Error",
        description: `Failed to update administrator: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setSubmitLoading(false)
    }
  }

  const handleDelete = async (admin: AdminUser) => {
    if (admin.username === 'admin') {
      toast({
        title: "Cannot Delete",
        description: "The primary admin account cannot be deleted.",
        variant: "destructive",
      })
      return
    }

    setDeleteLoading(admin.id)

    try {
      const { error } = await supabase
        .from('admin_users')
        .delete()
        .eq('id', admin.id)

      if (error) throw error

      toast({
        title: "Administrator Removed",
        description: `${admin.full_name || admin.username} has been removed.`,
      })

      fetchAdmins()
    } catch (error: any) {
      console.error('Error deleting admin:', error)
      toast({
        title: "Error",
        description: `Failed to remove administrator: ${error.message}`,
        variant: "destructive",
      })
    } finally {
      setDeleteLoading(null)
    }
  }

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setFormData({ ...formData, password })
  }

  if (!isSuperAdmin) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Access Restricted</h2>
            <p className="text-muted-foreground">
              Only Super Administrators can access the Admin Management section.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-muted rounded w-64 animate-pulse"></div>
        <Card>
          <CardContent className="p-6">
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-muted rounded animate-pulse"></div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Management</h1>
          <p className="text-muted-foreground">
            Manage administrator accounts and permissions
          </p>
        </div>
        
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Administrator
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Add New Administrator</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="full_name">Full Name *</Label>
                <Input
                  id="full_name"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="username">Username *</Label>
                <Input
                  id="username"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="password">Temporary Password *</Label>
                <div className="flex gap-2">
                  <Input
                    id="password"
                    type="text"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                  <Button type="button" variant="outline" onClick={generatePassword}>
                    Generate
                  </Button>
                </div>
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={submitLoading}>
                  {submitLoading ? 'Creating...' : 'Create Administrator'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Administrators</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{admins.length}</div>
        </CardContent>
      </Card>

      {/* Admins Table */}
      <Card>
        <CardHeader>
          <CardTitle>Administrators</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Full Name</TableHead>
                <TableHead>Username</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {admins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell className="font-medium">{admin.full_name || '-'}</TableCell>
                  <TableCell>{admin.username}</TableCell>
                  <TableCell>{admin.email || '-'}</TableCell>
                  <TableCell>{new Date(admin.created_at).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEdit(admin)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {admin.username !== 'admin' && (
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="destructive"
                              size="sm"
                              disabled={deleteLoading === admin.id}
                            >
                              {deleteLoading === admin.id ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle className="flex items-center gap-2">
                                <AlertTriangle className="h-5 w-5 text-destructive" />
                                Remove Administrator
                              </AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to remove <strong>{admin.full_name || admin.username}</strong> as an administrator?
                                This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(admin)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Remove
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Administrator</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleUpdate} className="space-y-4">
            <div>
              <Label htmlFor="edit_full_name">Full Name *</Label>
              <Input
                id="edit_full_name"
                value={formData.full_name}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit_username">Username *</Label>
              <Input
                id="edit_username"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit_email">Email *</Label>
              <Input
                id="edit_email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="edit_password">New Password (leave blank to keep current)</Label>
              <div className="flex gap-2">
                <Input
                  id="edit_password"
                  type="text"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                />
                <Button type="button" variant="outline" onClick={generatePassword}>
                  Generate
                </Button>
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={submitLoading}>
                {submitLoading ? 'Updating...' : 'Update Administrator'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminManagement