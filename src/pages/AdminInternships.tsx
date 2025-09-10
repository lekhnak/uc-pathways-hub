import { useState } from 'react';
import { Plus, Search, Filter, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useInternships } from '@/hooks/useInternships';
import { useForm } from 'react-hook-form';
import type { Database } from '@/integrations/supabase/types';

type Internship = Database['public']['Tables']['uc_internships']['Row'];
type InternshipInsert = Database['public']['Tables']['uc_internships']['Insert'];

interface InternshipFormData {
  title: string;
  company: string;
  company_logo_url?: string;
  location: string;
  position_type: string;
  is_uc_partner: boolean;
  compensation?: string;
  application_deadline?: string;
  available_positions: number;
  requirements: string[];
  description?: string;
  apply_url?: string;
  contact_email?: string;
  status: string;
}

const AdminInternships = () => {
  const { internships, loading, createInternship, updateInternship, deleteInternship } = useInternships(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingInternship, setEditingInternship] = useState<Internship | null>(null);
  const [requirementsInput, setRequirementsInput] = useState('');

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<InternshipFormData>({
    defaultValues: {
      title: '',
      company: '',
      location: '',
      position_type: 'full-time',
      is_uc_partner: true,
      available_positions: 1,
      requirements: [],
      status: 'active'
    }
  });

  const filteredInternships = internships.filter(internship => {
    const matchesSearch = internship.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         internship.company.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || internship.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'closed': return 'bg-red-100 text-red-800';
      case 'archived': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getPositionTypeColor = (type: string) => {
    switch (type) {
      case 'full-time': return 'bg-blue-100 text-blue-800';
      case 'part-time': return 'bg-purple-100 text-purple-800';
      case 'summer-program': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCreateOrUpdate = async (data: InternshipFormData) => {
    try {
      const internshipData: InternshipInsert = {
        ...data,
        requirements: requirementsInput.split(',').map(req => req.trim()).filter(req => req.length > 0),
        application_deadline: data.application_deadline || null,
        created_by: 'admin' // This would be the actual admin ID in a real app
      };

      if (editingInternship) {
        await updateInternship(editingInternship.id, internshipData);
      } else {
        await createInternship(internshipData);
      }

      setIsFormOpen(false);
      setEditingInternship(null);
      reset();
      setRequirementsInput('');
    } catch (error) {
      console.error('Error saving internship:', error);
    }
  };

  const handleEdit = (internship: Internship) => {
    setEditingInternship(internship);
    setValue('title', internship.title);
    setValue('company', internship.company);
    setValue('company_logo_url', internship.company_logo_url || '');
    setValue('location', internship.location);
    setValue('position_type', internship.position_type);
    setValue('is_uc_partner', internship.is_uc_partner);
    setValue('compensation', internship.compensation || '');
    setValue('application_deadline', internship.application_deadline || '');
    setValue('available_positions', internship.available_positions || 1);
    setValue('description', internship.description || '');
    setValue('apply_url', internship.apply_url || '');
    setValue('contact_email', internship.contact_email || '');
    setValue('status', internship.status);
    
    if (internship.requirements && Array.isArray(internship.requirements)) {
      setRequirementsInput(internship.requirements.join(', '));
    }
    
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this internship?')) {
      await deleteInternship(id);
    }
  };

  const stats = {
    total: internships.length,
    active: internships.filter(i => i.status === 'active').length,
    draft: internships.filter(i => i.status === 'draft').length,
    ucPartners: internships.filter(i => i.is_uc_partner).length
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-academy-blue">Internship Management</h1>
          <p className="text-academy-grey">Manage UC Partner internship opportunities</p>
        </div>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingInternship(null); reset(); setRequirementsInput(''); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Internship
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingInternship ? 'Edit Internship' : 'Create New Internship'}
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit(handleCreateOrUpdate)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Position Title</Label>
                  <Input {...register('title', { required: 'Title is required' })} />
                  {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
                </div>
                <div>
                  <Label htmlFor="company">Company</Label>
                  <Input {...register('company', { required: 'Company is required' })} />
                  {errors.company && <p className="text-red-500 text-sm">{errors.company.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Location</Label>
                  <Input {...register('location', { required: 'Location is required' })} />
                  {errors.location && <p className="text-red-500 text-sm">{errors.location.message}</p>}
                </div>
                <div>
                  <Label htmlFor="position_type">Position Type</Label>
                  <Select value={watch('position_type')} onValueChange={(value) => setValue('position_type', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="full-time">Full-time</SelectItem>
                      <SelectItem value="part-time">Part-time</SelectItem>
                      <SelectItem value="summer-program">Summer Program</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="compensation">Compensation</Label>
                  <Input {...register('compensation')} placeholder="e.g., $80,000 - $100,000" />
                </div>
                <div>
                  <Label htmlFor="available_positions">Available Positions</Label>
                  <Input type="number" {...register('available_positions', { min: 1 })} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="application_deadline">Application Deadline</Label>
                  <Input type="date" {...register('application_deadline')} />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={watch('status')} onValueChange={(value) => setValue('status', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="closed">Closed</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch 
                  checked={watch('is_uc_partner')} 
                  onCheckedChange={(checked) => setValue('is_uc_partner', checked)} 
                />
                <Label>UC Partner Exclusive</Label>
              </div>

              <div>
                <Label htmlFor="requirements">Requirements (comma-separated)</Label>
                <Input 
                  value={requirementsInput}
                  onChange={(e) => setRequirementsInput(e.target.value)}
                  placeholder="Bachelor's degree, Programming skills, Leadership experience"
                />
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea {...register('description')} rows={4} />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="apply_url">Application URL</Label>
                  <Input {...register('apply_url')} placeholder="https://..." />
                </div>
                <div>
                  <Label htmlFor="contact_email">Contact Email</Label>
                  <Input type="email" {...register('contact_email')} />
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsFormOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">
                  {editingInternship ? 'Update' : 'Create'} Internship
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Internships</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Draft</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-600">{stats.draft}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">UC Partners</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.ucPartners}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search internships..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="max-w-sm"
              />
            </div>
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Internships Table */}
      <Card>
        <CardContent className="pt-6">
          {loading ? (
            <div className="flex justify-center py-8">Loading internships...</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Position</TableHead>
                  <TableHead>Company</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInternships.map((internship) => (
                  <TableRow key={internship.id}>
                    <TableCell>
                      <div className="font-medium">{internship.title}</div>
                      {internship.is_uc_partner && (
                        <Badge variant="secondary" className="text-xs">UC Partner</Badge>
                      )}
                    </TableCell>
                    <TableCell>{internship.company}</TableCell>
                    <TableCell>{internship.location}</TableCell>
                    <TableCell>
                      <Badge className={getPositionTypeColor(internship.position_type)}>
                        {internship.position_type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(internship.status)}>
                        {internship.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {internship.application_deadline 
                        ? new Date(internship.application_deadline).toLocaleDateString()
                        : 'No deadline'
                      }
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEdit(internship)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDelete(internship.id)}
                            className="text-red-600"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminInternships;