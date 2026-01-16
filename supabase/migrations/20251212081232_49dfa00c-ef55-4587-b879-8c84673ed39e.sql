-- Fix function search path for update_scheduling_updated_at
CREATE OR REPLACE FUNCTION public.update_scheduling_updated_at()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Move btree_gist extension to extensions schema
DROP EXTENSION IF EXISTS btree_gist;
CREATE EXTENSION IF NOT EXISTS btree_gist SCHEMA extensions;