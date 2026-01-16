-- Allow anonymous users to create held appointments (for development/demo booking flow)
CREATE POLICY "Anyone can create held appointments"
ON public.appointments
FOR INSERT
WITH CHECK (status = 'held');

-- Allow anyone to update held appointments (to convert to booked)
CREATE POLICY "Anyone can update held appointments"
ON public.appointments
FOR UPDATE
USING (status = 'held' OR status = 'booked');