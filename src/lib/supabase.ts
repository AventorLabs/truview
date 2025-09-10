import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export type Database = {
  public: {
    Tables: {
      ar_projects: {
        Row: {
          id: string;
          product_name: string;
          glb_url: string;
          usdz_url: string | null;
          thumbnail_url: string;
          notes: string | null;
          share_link_id: string;
          status: string;
          access_code: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_name: string;
          glb_url: string;
          usdz_url?: string | null;
          thumbnail_url: string;
          notes?: string | null;
          share_link_id: string;
          status?: string;
          access_code?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_name?: string;
          glb_url?: string;
          usdz_url?: string | null;
          thumbnail_url?: string;
          notes?: string | null;
          share_link_id?: string;
          status?: string;
          access_code?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      client_feedback: {
        Row: {
          id: string;
          ar_project_id: string;
          feedback_type: string;
          comment: string | null;
          submitted_at: string;
        };
        Insert: {
          id?: string;
          ar_project_id: string;
          feedback_type: string;
          comment?: string | null;
          submitted_at?: string;
        };
        Update: {
          id?: string;
          ar_project_id?: string;
          feedback_type?: string;
          comment?: string | null;
          submitted_at?: string;
        };
      };
    };
  };
};