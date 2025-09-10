/*
  # Fix RLS policies for project deletion

  1. Policy Updates
    - Update ar_projects DELETE policy to allow all users (matching INSERT policy)
    - Add DELETE policy for client_feedback table to allow all users
  
  2. Security Changes
    - Both tables will allow DELETE operations for all users
    - This matches the existing INSERT permissions pattern
    - Maintains consistency with the current application design

  3. Changes Made
    - Drop existing restrictive DELETE policy on ar_projects
    - Create new permissive DELETE policy on ar_projects
    - Add new DELETE policy on client_feedback table
*/

-- Drop the existing restrictive DELETE policy on ar_projects
DROP POLICY IF EXISTS "Enable delete for authenticated users" ON ar_projects;

-- Create a new permissive DELETE policy on ar_projects (matching the INSERT policy pattern)
CREATE POLICY "Enable delete for all users"
  ON ar_projects
  FOR DELETE
  TO public
  USING (true);

-- Add DELETE policy for client_feedback table (currently missing)
CREATE POLICY "Enable delete for all users"
  ON client_feedback
  FOR DELETE
  TO public
  USING (true);