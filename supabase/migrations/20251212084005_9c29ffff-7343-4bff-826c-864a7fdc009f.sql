-- Add RLS policy to allow inserts on leaves table for demo purposes
CREATE POLICY "Allow insert leaves for all users"
ON public.leaves
FOR INSERT
WITH CHECK (true);

-- Also add update policy for cancelling leaves
CREATE POLICY "Allow update leaves for all users"
ON public.leaves
FOR UPDATE
USING (true)
WITH CHECK (true);