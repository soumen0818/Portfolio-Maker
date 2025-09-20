-- Add new columns to users table for domain, location, and profile photo
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS domain TEXT,
ADD COLUMN IF NOT EXISTS location TEXT,
ADD COLUMN IF NOT EXISTS profile_photo TEXT;