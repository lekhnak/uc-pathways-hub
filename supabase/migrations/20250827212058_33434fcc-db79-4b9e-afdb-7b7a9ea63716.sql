-- Enable realtime for applications table
ALTER TABLE public.applications REPLICA IDENTITY FULL;

-- Add the applications table to the realtime publication
-- Check if the supabase_realtime publication exists, if not create it
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime FOR ALL TABLES;
  END IF;
  
  -- Add the applications table to the publication
  ALTER PUBLICATION supabase_realtime ADD TABLE public.applications;
EXCEPTION
  WHEN duplicate_object THEN
    -- Table is already in the publication, ignore the error
    NULL;
END $$;