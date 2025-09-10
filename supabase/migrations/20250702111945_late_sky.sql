/*
  # Update RLS policy for anonymous uploads

  1. Changes
    - Update INSERT policy on `ar_projects` table to allow anonymous users
    - This enables the upload form to work without requiring user authentication

  2. Security
    - Maintains existing RLS policies for other operations
    - Only affects INSERT operations to allow public uploads
*/

-- Drop the existing INSERT policy
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON ar_projects;

-- Create new INSERT policy that allows anonymous users
CREATE POLICY "Enable insert for all users"
  ON ar_projects
  FOR INSERT
  TO public
  WITH CHECK (true);