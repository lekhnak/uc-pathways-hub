import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface WebsiteContent {
  id: string;
  section_id: string;
  title?: string;
  subtitle?: string;
  content?: string;
  image_url?: string;
  metadata?: any;
  created_at: string;
  updated_at: string;
}

export const useWebsiteContent = () => {
  const [content, setContent] = useState<WebsiteContent[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('website_content')
        .select('*')
        .order('section_id');

      if (error) throw error;
      setContent(data || []);
    } catch (error) {
      console.error('Error fetching website content:', error);
      toast({
        title: "Error",
        description: "Failed to fetch website content",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateContent = async (sectionId: string, updates: Partial<WebsiteContent>) => {
    try {
      const { data, error } = await supabase
        .from('website_content')
        .update(updates)
        .eq('section_id', sectionId)
        .select()
        .single();

      if (error) throw error;

      setContent(prev => prev.map(item => 
        item.section_id === sectionId ? { ...item, ...data } : item
      ));

      toast({
        title: "Success",
        description: "Content updated successfully",
      });

      return data;
    } catch (error) {
      console.error('Error updating content:', error);
      toast({
        title: "Error",
        description: "Failed to update content",
        variant: "destructive",
      });
      throw error;
    }
  };

  const uploadImage = async (file: File, section: string) => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${section}-${Date.now()}.${fileExt}`;
      const filePath = fileName;

      const { error: uploadError } = await supabase.storage
        .from('website-images')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('website-images')
        .getPublicUrl(filePath);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      });
      throw error;
    }
  };

  const getContentBySection = (sectionId: string) => {
    return content.find(item => item.section_id === sectionId);
  };

  useEffect(() => {
    fetchContent();

    // Set up real-time subscription
    const channel = supabase
      .channel('website-content-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'website_content'
        },
        () => {
          fetchContent();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    content,
    loading,
    updateContent,
    uploadImage,
    getContentBySection,
    refetch: fetchContent
  };
};