/*
  # Update AR Projects and Client Feedback Schema

  1. New Tables
    - Update `ar_projects` table structure if needed
    - Update `client_feedback` table structure if needed
  
  2. Security
    - Enable RLS on both tables
    - Add policies for public read access and authenticated user management
    - Add storage policies for public access
  
  3. Performance
    - Add indexes for frequently queried columns
    - Add storage buckets for file uploads
*/

-- Update ar_projects table structure (add missing columns if they don't exist)
DO $$
BEGIN
  -- Add latest_feedback column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ar_projects' AND column_name = 'latest_feedback'
  ) THEN
    ALTER TABLE public.ar_projects ADD COLUMN latest_feedback text;
  END IF;
END $$;

-- Ensure ar_projects has RLS enabled
ALTER TABLE public.ar_projects ENABLE ROW LEVEL SECURITY;

-- Ensure client_feedback has RLS enabled  
ALTER TABLE public.client_feedback ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DO $$
BEGIN
  -- Drop and recreate ar_projects policies
  DROP POLICY IF EXISTS "Enable read access for all users" ON public.ar_projects;
  DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.ar_projects;
  DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.ar_projects;
  DROP POLICY IF EXISTS "Enable delete for authenticated users" ON public.ar_projects;
  
  -- Drop and recreate client_feedback policies
  DROP POLICY IF EXISTS "Enable insert for all users" ON public.client_feedback;
  DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.client_feedback;
END $$;

-- Create RLS Policies for ar_projects
CREATE POLICY "Enable read access for all users" ON public.ar_projects 
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.ar_projects 
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for authenticated users" ON public.ar_projects 
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable delete for authenticated users" ON public.ar_projects 
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create RLS Policies for client_feedback
CREATE POLICY "Enable insert for all users" ON public.client_feedback 
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for authenticated users" ON public.client_feedback 
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_ar_projects_share_link_id ON public.ar_projects(share_link_id);
CREATE INDEX IF NOT EXISTS idx_ar_projects_created_at ON public.ar_projects(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_client_feedback_ar_project_id ON public.client_feedback(ar_project_id);
CREATE INDEX IF NOT EXISTS idx_client_feedback_submitted_at ON public.client_feedback(submitted_at DESC);

-- Create storage buckets for file uploads (only if they don't exist)
INSERT INTO storage.buckets (id, name, public) 
VALUES 
    ('ar-models', 'ar-models', true),
    ('ar-thumbnails', 'ar-thumbnails', true)
ON CONFLICT (id) DO NOTHING;

-- Drop existing storage policies if they exist and recreate them
DO $$
BEGIN
  DROP POLICY IF EXISTS "Public read access" ON storage.objects;
  DROP POLICY IF EXISTS "Public upload access" ON storage.objects;
END $$;

-- Allow public read
CREATE POLICY "Public read access"
ON storage.objects
FOR SELECT
USING (true);

-- Allow public upload
CREATE POLICY "Public upload access"
ON storage.objects
FOR INSERT
WITH CHECK (true);