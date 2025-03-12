-- Create a storage bucket for ticket attachments
INSERT INTO storage.buckets (id, name, public)
VALUES ('ticket-attachments', 'ticket-attachments', true);

-- Set up public access policy for the bucket
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'ticket-attachments');
CREATE POLICY "Authenticated users can upload" ON storage.objects FOR INSERT USING (bucket_id = 'ticket-attachments' AND auth.role() = 'authenticated');
