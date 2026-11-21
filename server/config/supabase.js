import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseServiceKey &&
  supabaseUrl !== 'YOUR_SUPABASE_URL' &&
  supabaseServiceKey !== 'YOUR_SUPABASE_SERVICE_ROLE_KEY' &&
  supabaseUrl.startsWith('https://')
);

export let supabase = null;

if (isSupabaseConfigured) {
  try {
    supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false
      }
    });
    console.log('✓ Supabase client initialized with Service Role Key');
  } catch (err) {
    console.error('Failed to initialize Supabase client:', err.message);
    supabase = null;
  }
} else {
  console.log('ℹ Supabase not configured in server/.env. Using resilient local store with seed data.');
}
