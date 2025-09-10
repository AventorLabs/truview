/*
  # Update RLS policies for admin authentication

  1. Security Changes
    - Restrict ar_projects table operations to authenticated users only
    - Restrict client_feedback read access to authenticated users only
    - Keep client feedback submission open for public (clients)
    - Keep ar_projects read access open for public (for client preview)

  2. Updated Policies
    - ar_projects: Only authenticated users can insert, update, delete
    - ar_projects: Public can still read for client previews
    - client_feedback: Only authenticated users can read feedback
    - client_feedback: Public can still insert feedback
*/

-- Drop existing policies for ar_projects
DROP POLICY IF EXISTS "Enable delete for all users" ON ar_projects;
DROP POLICY IF EXISTS "Enable insert for all users" ON ar_projects;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON ar_projects;

-- Create new admin-only policies for ar_projects
CREATE POLICY "Enable insert for authenticated users only"
  ON ar_projects
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable update for authenticated users only"
  ON ar_projects
  FOR UPDATE
  TO authenticated
  USING (auth.uid() IS NOT NULL)
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Enable delete for authenticated users only"
  ON ar_projects
  FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Keep public read access for client previews
-- (This policy already exists and should remain)

-- Drop existing policies for client_feedback
DROP POLICY IF EXISTS "Enable delete for all users" ON client_feedback;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON client_feedback;

-- Create new policies for client_feedback
CREATE POLICY "Enable read access for authenticated users only"
  ON client_feedback
  FOR SELECT
  TO authenticated
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Enable delete for authenticated users only"
  ON client_feedback
  FOR DELETE
  TO authenticated
  USING (auth.uid() IS NOT NULL);

-- Keep public insert access for client feedback submission
-- (This policy already exists and should remain)