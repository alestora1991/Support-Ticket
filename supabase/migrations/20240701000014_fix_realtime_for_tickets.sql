-- Ensure realtime is enabled for the support_tickets table
BEGIN;
  -- Drop the table from the publication if it exists to avoid errors
  DO $$
  BEGIN
    IF EXISTS (
      SELECT 1 FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' 
      AND schemaname = 'public' 
      AND tablename = 'support_tickets'
    ) THEN
      ALTER PUBLICATION supabase_realtime DROP TABLE public.support_tickets;
    END IF;
  END
  $$;
  
  -- Add the table to the publication
  ALTER PUBLICATION supabase_realtime ADD TABLE public.support_tickets;
  
  -- Enable row level security for the table
  ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
  
  -- Create a policy that allows all operations for authenticated users
  DROP POLICY IF EXISTS "Enable all operations for authenticated users" ON public.support_tickets;
  CREATE POLICY "Enable all operations for authenticated users" 
    ON public.support_tickets 
    FOR ALL 
    TO authenticated 
    USING (true) 
    WITH CHECK (true);
COMMIT;