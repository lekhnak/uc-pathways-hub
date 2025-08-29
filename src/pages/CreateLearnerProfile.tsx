import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { User, Mail, FileText, CheckCircle, Clock } from 'lucide-react';

const CreateLearnerProfile = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { adminUser } = useAdminAuth();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.firstName || !formData.lastName || !formData.email) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Check if current user is admin using the admin auth system
      if (!adminUser) {
        throw new Error('You must be logged in as an admin to create applications');
      }

      // Check if email already exists in applications
      const { data: existingApplication, error: applicationError } = await supabase
        .from('applications')
        .select('email')
        .eq('email', formData.email.toLowerCase())
        .single();

      if (applicationError && applicationError.code !== 'PGRST116') { // PGRST116 is "no rows returned"
        console.error('Error checking existing application:', applicationError);
        throw new Error('Failed to check existing applications');
      }

      if (existingApplication) {
        throw new Error('An application with this email already exists');
      }

      // Create application record
      const { error: insertError } = await supabase
        .from('applications')
        .insert({
          first_name: formData.firstName,
          last_name: formData.lastName,
          email: formData.email.toLowerCase(),
          status: 'pending',
          created_by_admin: true,
          // Optional fields will be null and can be filled later
          uc_campus: null,
          student_type: null,
          major: null,
          question_1: null,
          question_2: null,
          question_3: null,
          question_4: null,
          gpa: null
        });

      if (insertError) {
        console.error('Application insertion error:', insertError);
        throw new Error('Failed to create application: ' + insertError.message);
      }

      toast({
        title: "Success!",
        description: "Application created successfully and is now pending review. You can manage it from the Applications page.",
        variant: "default",
      });

      // Reset form
      setFormData({
        firstName: '',
        lastName: '',
        email: ''
      });

    } catch (error: any) {
      console.error('Error creating application:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Create New Application</h1>
        <p className="text-muted-foreground">
          Create a new application for review with basic learner information
        </p>
      </div>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Application Information
          </CardTitle>
          <CardDescription>
            Enter the basic information for the new application. It will be created with pending status for review.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  First Name *
                </Label>
                <Input
                  id="firstName"
                  name="firstName"
                  type="text"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  placeholder="Enter first name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="lastName" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Last Name *
                </Label>
                <Input
                  id="lastName"
                  name="lastName"
                  type="text"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  placeholder="Enter last name"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address *
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="Enter email address"
                required
              />
            </div>

            <div className="pt-4">
              <Button type="submit" disabled={isLoading} className="w-full md:w-auto">
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating Application...
                  </>
                ) : (
                  <>
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Create Application
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card className="max-w-2xl">
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Clock className="h-4 w-4" />
            What happens next?
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>1. A new application will be created with "pending" status</p>
          <p>2. You can view it in the Applications page with all other applications</p>
          <p>3. From there you can:</p>
          <ul className="list-disc list-inside ml-4 space-y-1">
            <li>View detailed information</li>
            <li>Approve the application (creates user profile and sends credentials)</li>
            <li>Reject the application if needed</li>
            <li>Send approval emails after creating the profile</li>
          </ul>
          <p>4. The application can be managed alongside regular student applications</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateLearnerProfile;