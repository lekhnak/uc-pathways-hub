import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type Internship = Database['public']['Tables']['uc_internships']['Row'];
type InternshipInsert = Database['public']['Tables']['uc_internships']['Insert'];
type InternshipUpdate = Database['public']['Tables']['uc_internships']['Update'];

export const useInternships = (adminView = false) => {
  const [internships, setInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchInternships = async () => {
    try {
      setLoading(true);
      let query = supabase.from('uc_internships').select('*');
      
      // For public view, only show active internships
      if (!adminView) {
        query = query.eq('status', 'active');
      }
      
      const { data, error } = await query.order('created_at', { ascending: false });
      
      if (error) throw error;
      setInternships(data || []);
    } catch (error: any) {
      console.error('Error fetching internships:', error);
      toast({
        title: "Error",
        description: "Failed to load internships",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const createInternship = async (internship: InternshipInsert) => {
    try {
      const { data, error } = await supabase
        .from('uc_internships')
        .insert(internship)
        .select()
        .single();

      if (error) throw error;
      
      setInternships(prev => [data, ...prev]);
      toast({
        title: "Success",
        description: "Internship created successfully",
      });
      
      return data;
    } catch (error: any) {
      console.error('Error creating internship:', error);
      toast({
        title: "Error",
        description: "Failed to create internship",
        variant: "destructive",
      });
      throw error;
    }
  };

  const updateInternship = async (id: string, updates: InternshipUpdate) => {
    try {
      const { data, error } = await supabase
        .from('uc_internships')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      
      setInternships(prev => prev.map(internship => 
        internship.id === id ? data : internship
      ));
      
      toast({
        title: "Success",
        description: "Internship updated successfully",
      });
      
      return data;
    } catch (error: any) {
      console.error('Error updating internship:', error);
      toast({
        title: "Error",
        description: "Failed to update internship",
        variant: "destructive",
      });
      throw error;
    }
  };

  const deleteInternship = async (id: string) => {
    try {
      const { error } = await supabase
        .from('uc_internships')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      setInternships(prev => prev.filter(internship => internship.id !== id));
      toast({
        title: "Success",
        description: "Internship deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting internship:', error);
      toast({
        title: "Error",
        description: "Failed to delete internship",
        variant: "destructive",
      });
      throw error;
    }
  };

  useEffect(() => {
    fetchInternships();
  }, [adminView]);

  // Set up real-time subscription
  useEffect(() => {
    const channel = supabase
      .channel('uc_internships_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'uc_internships'
        },
        () => {
          fetchInternships();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [adminView]);

  return {
    internships,
    loading,
    createInternship,
    updateInternship,
    deleteInternship,
    refetch: fetchInternships
  };
};