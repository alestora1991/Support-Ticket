-- Create support_tickets table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'open',
  priority TEXT NOT NULL DEFAULT 'medium',
  category TEXT NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  assigned_to UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create ticket_comments table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.ticket_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create ticket_attachments table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.ticket_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable row level security
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ticket_attachments ENABLE ROW LEVEL SECURITY;

-- Create policies for support_tickets
DROP POLICY IF EXISTS "Users can view their own tickets" ON public.support_tickets;
CREATE POLICY "Users can view their own tickets"
  ON public.support_tickets FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can create their own tickets" ON public.support_tickets;
CREATE POLICY "Users can create their own tickets"
  ON public.support_tickets FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policies for ticket_comments
DROP POLICY IF EXISTS "Users can view comments on their tickets" ON public.ticket_comments;
CREATE POLICY "Users can view comments on their tickets"
  ON public.ticket_comments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.support_tickets
    WHERE public.support_tickets.id = ticket_id
    AND public.support_tickets.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can add comments to their tickets" ON public.ticket_comments;
CREATE POLICY "Users can add comments to their tickets"
  ON public.ticket_comments FOR INSERT
  WITH CHECK (auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM public.support_tickets
    WHERE public.support_tickets.id = ticket_id
    AND public.support_tickets.user_id = auth.uid()
  ));

-- Create policies for ticket_attachments
DROP POLICY IF EXISTS "Users can view attachments on their tickets" ON public.ticket_attachments;
CREATE POLICY "Users can view attachments on their tickets"
  ON public.ticket_attachments FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.support_tickets
    WHERE public.support_tickets.id = ticket_id
    AND public.support_tickets.user_id = auth.uid()
  ));

DROP POLICY IF EXISTS "Users can add attachments to their tickets" ON public.ticket_attachments;
CREATE POLICY "Users can add attachments to their tickets"
  ON public.ticket_attachments FOR INSERT
  WITH CHECK (auth.uid() = user_id AND EXISTS (
    SELECT 1 FROM public.support_tickets
    WHERE public.support_tickets.id = ticket_id
    AND public.support_tickets.user_id = auth.uid()
  ));

-- Enable realtime for these tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.support_tickets;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ticket_comments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ticket_attachments;
