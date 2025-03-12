-- Create ticket_comments table
CREATE TABLE IF NOT EXISTS public.ticket_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id UUID REFERENCES public.support_tickets(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable row-level security
ALTER TABLE public.ticket_comments ENABLE ROW LEVEL SECURITY;

-- Create policies
DROP POLICY IF EXISTS "Users can view comments on their tickets" ON public.ticket_comments;
CREATE POLICY "Users can view comments on their tickets"
  ON public.ticket_comments
  FOR SELECT
  USING (
    auth.uid() = user_id OR 
    auth.uid() IN (
      SELECT user_id FROM public.support_tickets WHERE id = ticket_id
    )
  );

DROP POLICY IF EXISTS "Users can add comments" ON public.ticket_comments;
CREATE POLICY "Users can add comments"
  ON public.ticket_comments
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own comments" ON public.ticket_comments;
CREATE POLICY "Users can update own comments"
  ON public.ticket_comments
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Enable realtime
alter publication supabase_realtime add table public.ticket_comments;
