-- Enable realtime for applications table
ALTER TABLE public.applications REPLICA IDENTITY FULL;

-- Add the applications table to the realtime publication
-- This allows real-time updates to be broadcast to connected clients
SELECT pg_create_publication_for_all_tables('supabase_realtime');

-- If the publication already exists, add the table to it
DO $$
BEGIN
  -- Check if publication exists and add table
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.applications;
  END IF;
END $$;