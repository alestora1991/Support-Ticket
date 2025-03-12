-- Create ticket_attachments table
CREATE TABLE IF NOT EXISTS public.ticket_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable row-level security
ALTER TABLE public.ticket_attachments ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view attachments on their tickets" ON public.ticket_attachments;
CREATE POLICY "Users can view attachments on their tickets"
  ON public.ticket_attachments
  FOR SELECT
  USING (
    auth.uid() = user_id OR 
    auth.uid() IN (
      SELECT user_id FROM public.support_tickets WHERE id = ticket_id
    )
  );

DROP POLICY IF EXISTS "Users can add attachments" ON public.ticket_attachments;
CREATE POLICY "Users can add attachments"
  ON public.ticket_attachments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Enable realtime
alter publication supabase_realtime add table public.ticket_attachments;
