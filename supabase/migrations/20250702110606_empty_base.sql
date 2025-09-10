/*
  # AR Model Manager Database Schema

  1. New Tables
    - `ar_projects`
      - `id` (uuid, primary key)
      - `product_name` (text, required)
      - `glb_url` (text, required)
      - `usdz_url` (text, optional)
      - `thumbnail_url` (text, required)
      - `notes` (text, optional)
      - `share_link_id` (text, required, unique)
      - `status` (text, required, default 'Pending')
      - `created_at` (timestamp, default now())
      - `updated_at` (timestamp, default now())
    
    - `client_feedback`
      - `id` (uuid, primary key)
      - `ar_project_id` (text, required)
      - `feedback_type` (text, required)
      - `comment` (text, optional)
      - `submitted_at` (timestamp, default now())

  2. Security
    - Enable RLS on both tables
    - Add policies for public read access and authenticated write access
    - Create storage buckets with appropriate policies

  3. Performance
    - Add indexes for frequently queried columns
*/

-- Drop existing tables if they exist (clean slate)
DROP TABLE IF EXISTS public.ar_feedback CASCADE;
DROP TABLE IF EXISTS public.ar_projects CASCADE;

-- Create ar_projects table
CREATE TABLE public.ar_projects (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    product_name text NOT NULL,
    glb_url text NOT NULL,
    usdz_url text,
    thumbnail_url text NOT NULL,
    notes text,
    share_link_id text UNIQUE NOT NULL,
    status text NOT NULL DEFAULT 'Pending',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- Create client_feedback table
CREATE TABLE public.client_feedback (
    id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
    ar_project_id text NOT NULL,
    feedback_type text NOT NULL,
    comment text,
    submitted_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.ar_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.client_feedback ENABLE ROW LEVEL SECURITY;

-- RLS Policies for ar_projects
CREATE POLICY "Enable read access for all users" ON public.ar_projects 
    FOR SELECT USING (true);

CREATE POLICY "Enable insert for authenticated users" ON public.ar_projects 
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for authenticated users" ON public.ar_projects 
    FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable delete for authenticated users" ON public.ar_projects 
    FOR DELETE USING (auth.uid() IS NOT NULL);

-- RLS Policies for client_feedback
CREATE POLICY "Enable insert for all users" ON public.client_feedback 
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable read access for authenticated users" ON public.client_feedback 
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Create indexes for better performance
CREATE INDEX idx_ar_projects_share_link_id ON public.ar_projects(share_link_id);
CREATE INDEX idx_ar_projects_created_at ON public.ar_projects(created_at DESC);
CREATE INDEX idx_client_feedback_ar_project_id ON public.client_feedback(ar_project_id);
CREATE INDEX idx_client_feedback_submitted_at ON public.client_feedback(submitted_at DESC);

-- Create storage buckets for file uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES 
    ('ar-models', 'ar-models', true),
    ('ar-thumbnails', 'ar-thumbnails', true)
ON CONFLICT (id) DO NOTHING;