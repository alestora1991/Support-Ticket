-- Create the ticket-attachments bucket if it doesn't exist
INSERT INTO storage.buckets (id, name, public)
SELECT 'ticket-attachments', 'ticket-attachments', true
WHERE NOT EXISTS (SELECT 1 FROM storage.buckets WHERE id = 'ticket-attachments');

-- Enable RLS on objects table
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create policy for SELECT
DROP POLICY IF EXISTS "Public ticket attachments access" ON storage.objects;
CREATE POLICY "Public ticket attachments access"
ON storage.objects FOR SELECT
USING (bucket_id = 'ticket-attachments');

-- Create policy for INSERT with WITH CHECK
DROP POLICY IF EXISTS "Users can upload ticket attachments" ON storage.objects;
CREATE POLICY "Users can upload ticket attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'ticket-attachments');
