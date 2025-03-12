-- Check if tables are already in the publication before adding them
DO $$
BEGIN
  -- For ticket_comments table
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'ticket_comments'
  ) THEN
    alter publication supabase_realtime add table ticket_comments;
  END IF;
  
  -- For ticket_attachments table
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables 
    WHERE pubname = 'supabase_realtime' 
    AND schemaname = 'public' 
    AND tablename = 'ticket_attachments'
  ) THEN
    alter publication supabase_realtime add table ticket_attachments;
  END IF;
END
$$;
