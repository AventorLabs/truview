/*
  # Add Access Code Protection to AR Projects

  1. Schema Changes
    - Add `access_code` column to `ar_projects` table
    - Column will store optional access codes for link protection

  2. Security
    - Access codes are optional (nullable)
    - When present, users must enter the code to view the project
    - Codes are stored as plain text for simplicity
*/

-- Add access_code column to ar_projects table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ar_projects' AND column_name = 'access_code'
  ) THEN
    ALTER TABLE public.ar_projects ADD COLUMN access_code text;
  END IF;
END $$;

-- Create index for access code lookups
CREATE INDEX IF NOT EXISTS idx_ar_projects_access_code ON public.ar_projects(access_code);