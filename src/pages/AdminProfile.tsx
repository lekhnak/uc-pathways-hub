import React, { useState, useEffect } from 'react'
import { useAdminAuth } from '@/hooks/useAdminAuth'
import { supabase } from '@/integrations/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useToast } from '@/hooks/use-toast'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { UserCog, Mail, User, Save, Key, Plus, Shield, Eye, EyeOff } from 'lucide-react'

interface AdminForm {
  username: string
  full_name: string
  email: string
  password: string
}

const AdminProfile = () => {
  const { adminUser, signOut } = useAdminAuth()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    full_name: '',
    bio: '',
  })

  // Password change states
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false)
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  })
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  })
  const [passwordLoading, setPasswordLoading] = useState(false)

  // Admin creation states
  const [isAddAdminOpen, setIsAddAdminOpen] = useState(false)
  const [adminFormData, setAdminFormData] = useState<AdminForm>({
    username: '',
    full_name: '',
    email: '',
    password: ''
  })
  const [adminSubmitLoading, setAdminSubmitLoading] = useState(false)

  useEffect(() => {
    if (adminUser) {
      setFormData({
        username: adminUser.username || '',
        email: adminUser.email || '',
        full_name: adminUser.full_name || '',
        bio: '',
      })
    }
  }, [adminUser])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!adminUser) return

    setLoading(true)
    try {
      // Use edge function to update profile (bypasses RLS)
      const { data, error } = await supabase.functions.invoke('update-admin-profile', {
        body: {
          adminId: adminUser.id,
          email: formData.email,
          full_name: formData.full_name
        }
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error('Failed to update profile');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to update profile');
      }

      console.log('Profile updated successfully');

      // Update the admin user in localStorage
      const updatedAdminUser = {
        ...adminUser,
        email: formData.email,
        full_name: formData.full_name
      }
      
      localStorage.setItem('admin_user', JSON.stringify(updatedAdminUser))

      toast({
        title: "Profile updated",
        description: "Your profile has been successfully updated.",
      })

      // Reload to reflect changes
      setTimeout(() => {
        window.location.reload()
      }, 1000)
    } catch (error: any) {
      console.error('Error updating profile:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!adminUser) return

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      })
      return
    }

    if (passwordData.newPassword.length < 8) {
      toast({
        title: "Error",
        description: "Password must be at least 8 characters long",
        variant: "destructive",
      })
      return
    }

    setPasswordLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('change-admin-password', {
        body: {
          adminId: adminUser.id,
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        }
      });

      if (error) {
        console.error('Password change error:', error);
        throw new Error('Failed to change password');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to change password');
      }

      toast({
        title: "Password updated",
        description: "Your password has been successfully changed.",
      })

      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
      setIsChangePasswordOpen(false)
    } catch (error: any) {
      console.error('Error changing password:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to change password",
        variant: "destructive",
      })
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleCreateAdmin = async (e: React.FormEvent) => {
    e.preventDefault()
    setAdminSubmitLoading(true)

    try {
      const { data, error } = await supabase.functions.invoke('create-admin-user', {
        body: {
          username: adminFormData.username,
          full_name: adminFormData.full_name,
          email: adminFormData.email,
          password: adminFormData.password
        }
      });

      if (error) {
        console.error('Create admin error:', error);
        throw new Error('Failed to create administrator');
      }

      if (!data?.success) {
        throw new Error(data?.error || 'Failed to create administrator');
      }

      // Send invitation email
      try {
        await supabase.functions.invoke('send-admin-invite', {
          body: {
            email: adminFormData.email,
            full_name: adminFormData.full_name,
            username: adminFormData.username,
            tempPassword: adminFormData.password
          }
        })
      } catch (emailError) {
        console.warn('Failed to send invitation email:', emailError)
      }

      toast({
        title: "Administrator Created",
        description: `${adminFormData.full_name} has been added as an administrator and invitation sent.`,
      })

      setAdminFormData({ username: '', full_name: '', email: '', password: '' })
      setIsAddAdminOpen(false)
    } catch (error: any) {
      console.error('Error creating admin:', error)
      toast({
        title: "Error",
        description: error.message || "Failed to create administrator",
        variant: "destructive",
      })
    } finally {
      setAdminSubmitLoading(false)
    }
  }

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    setAdminFormData({ ...adminFormData, password })
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Profile</h1>
        <p className="text-muted-foreground">
          Manage your admin account settings and information
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Profile Information */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5" />
              <CardTitle>Profile Information</CardTitle>
            </div>
            <CardDescription>
              Update your personal information and preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  disabled
                  className="bg-muted"
                />
                <p className="text-xs text-muted-foreground">
                  Username cannot be changed
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="full_name">Full Name</Label>
                <Input
                  id="full_name"
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  placeholder="Enter your full name"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email address"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  placeholder="Tell us about yourself..."
                  rows={4}
                />
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                <Save className="w-4 h-4 mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Account Security */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5" />
              <CardTitle>Change Password</CardTitle>
            </div>
            <CardDescription>
              Update your account password
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Dialog open={isChangePasswordOpen} onOpenChange={setIsChangePasswordOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="w-full">
                  <Key className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                </DialogHeader>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div>
                    <Label htmlFor="current_password">Current Password</Label>
                    <div className="relative">
                      <Input
                        id="current_password"
                        type={showPasswords.current ? "text" : "password"}
                        value={passwordData.currentPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPasswords(prev => ({ ...prev, current: !prev.current }))}
                      >
                        {showPasswords.current ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="new_password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="new_password"
                        type={showPasswords.new ? "text" : "password"}
                        value={passwordData.newPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                        required
                        minLength={8}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPasswords(prev => ({ ...prev, new: !prev.new }))}
                      >
                        {showPasswords.new ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Password must be at least 8 characters long
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="confirm_password">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        id="confirm_password"
                        type={showPasswords.confirm ? "text" : "password"}
                        value={passwordData.confirmPassword}
                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                        required
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPasswords(prev => ({ ...prev, confirm: !prev.confirm }))}
                      >
                        {showPasswords.confirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsChangePasswordOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={passwordLoading}>
                      {passwordLoading ? 'Changing...' : 'Change Password'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      {/* Admin Management */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            <CardTitle>Admin Management</CardTitle>
          </div>
          <CardDescription>
            Create new administrator accounts
          </CardDescription>
        </CardHeader>
          <CardContent>
            <Dialog open={isAddAdminOpen} onOpenChange={setIsAddAdminOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Create New Admin
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Create New Administrator</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateAdmin} className="space-y-4">
                  <div>
                    <Label htmlFor="admin_full_name">Full Name *</Label>
                    <Input
                      id="admin_full_name"
                      value={adminFormData.full_name}
                      onChange={(e) => setAdminFormData({ ...adminFormData, full_name: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="admin_username">Username *</Label>
                    <Input
                      id="admin_username"
                      value={adminFormData.username}
                      onChange={(e) => setAdminFormData({ ...adminFormData, username: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="admin_email">Email *</Label>
                    <Input
                      id="admin_email"
                      type="email"
                      value={adminFormData.email}
                      onChange={(e) => setAdminFormData({ ...adminFormData, email: e.target.value })}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="admin_password">Password *</Label>
                    <div className="flex gap-2">
                      <Input
                        id="admin_password"
                        type="text"
                        value={adminFormData.password}
                        onChange={(e) => setAdminFormData({ ...adminFormData, password: e.target.value })}
                        required
                      />
                      <Button type="button" variant="outline" onClick={generatePassword}>
                        Generate
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-4">
                    <Button type="button" variant="outline" onClick={() => setIsAddAdminOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit" disabled={adminSubmitLoading}>
                      {adminSubmitLoading ? 'Creating...' : 'Create Administrator'}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
    </div>
  )
}

export default AdminProfile