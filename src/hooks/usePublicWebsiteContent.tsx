import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface PublicWebsiteContent {
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

export const usePublicWebsiteContent = () => {
  const [content, setContent] = useState<PublicWebsiteContent[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchContent = async () => {
    try {
      const { data, error } = await supabase
        .from('website_content')
        .select('*')
        .order('section_id');

      if (error) {
        console.error('Error fetching website content:', error);
        return;
      }
      
      setContent(data || []);
    } catch (error) {
      console.error('Error fetching website content:', error);
    } finally {
      setLoading(false);
    }
  };

  const getContentBySection = (sectionId: string) => {
    return content.find(item => item.section_id === sectionId);
  };

  const getSectionTitle = (sectionId: string, fallback = '') => {
    const sectionContent = getContentBySection(sectionId);
    return sectionContent?.title || fallback;
  };

  const getSectionSubtitle = (sectionId: string, fallback = '') => {
    const sectionContent = getContentBySection(sectionId);
    return sectionContent?.subtitle || fallback;
  };

  const getSectionContent = (sectionId: string, fallback = '') => {
    const sectionContent = getContentBySection(sectionId);
    return sectionContent?.content || fallback;
  };

  const getSectionImage = (sectionId: string, fallback = '') => {
    const sectionContent = getContentBySection(sectionId);
    return sectionContent?.image_url || fallback;
  };

  const getSectionMetadata = (sectionId: string, key: string, fallback = '') => {
    const sectionContent = getContentBySection(sectionId);
    return sectionContent?.metadata?.[key] || fallback;
  };

  useEffect(() => {
    fetchContent();

    // Set up real-time subscription for live updates
    const channel = supabase
      .channel('public-website-content-changes')
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
    getContentBySection,
    getSectionTitle,
    getSectionSubtitle,
    getSectionContent,
    getSectionImage,
    getSectionMetadata,
    refetch: fetchContent
  };
};