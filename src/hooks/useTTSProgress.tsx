import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface TTSProgress {
  id: string;
  course_id: string;
  course_name: string;
  progress_percentage: number;
  completion_status: string;
  last_accessed_at: string | null;
  completed_at: string | null;
}

export const useTTSProgress = () => {
  const [progress, setProgress] = useState<TTSProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProgress = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        setProgress([]);
        return;
      }

      const { data, error } = await supabase
        .from('tts_progress')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      setProgress(data || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching TTS progress:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch progress');
      setProgress([]);
    } finally {
      setLoading(false);
    }
  };

  const updateProgress = async (courseId: string, courseName: string, updates: Partial<Omit<TTSProgress, 'id' | 'course_id' | 'course_name'>>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { error } = await supabase
        .from('tts_progress')
        .upsert({
          user_id: user.id,
          course_id: courseId,
          course_name: courseName,
          ...updates,
        }, {
          onConflict: 'user_id,course_id'
        });

      if (error) throw error;

      // Refresh progress data
      await fetchProgress();
      return true;
    } catch (error) {
      console.error('Error updating TTS progress:', error);
      return false;
    }
  };

  const getProgressForCourse = (courseId: string): TTSProgress | null => {
    return progress.find(p => p.course_id === courseId) || null;
  };

  const getOverallProgress = () => {
    if (progress.length === 0) return { completed: 0, total: 0, percentage: 0 };
    
    const completed = progress.filter(p => p.completion_status === 'completed').length;
    const total = progress.length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return { completed, total, percentage };
  };

  useEffect(() => {
    fetchProgress();

    // Set up real-time subscription for progress updates
    const channel = supabase
      .channel('tts-progress-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'tts_progress'
        },
        () => {
          fetchProgress();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    progress,
    loading,
    error,
    fetchProgress,
    updateProgress,
    getProgressForCourse,
    getOverallProgress,
  };
};

export default useTTSProgress;