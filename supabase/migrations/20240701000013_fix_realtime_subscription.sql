-- Check if the publication exists
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime') THEN
    CREATE PUBLICATION supabase_realtime;
  END IF;
END
$$;

-- Check if tables are already in the publication before adding them
DO $$
BEGIN
  -- For support_tickets table
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'support_tickets'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.support_tickets;
  END IF;
  
  -- For ticket_comments table
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'ticket_comments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.ticket_comments;
  END IF;
  
  -- For ticket_attachments table
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'ticket_attachments'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE public.ticket_attachments;
  END IF;
END
$$;
