
-- Add last_settings JSONB column to clients table
ALTER TABLE public.clients ADD COLUMN last_settings jsonb DEFAULT null;
