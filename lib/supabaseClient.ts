
import { createClient } from '@supabase/supabase-js';

// Helper to safely get environment variables
const getEnv = (key: string): string => {
  try {
    // @ts-ignore
    return (typeof process !== 'undefined' && process.env && process.env[key]) || '';
  } catch {
    return '';
  }
};

const supabaseUrl = getEnv('SUPABASE_URL');
const supabaseAnonKey = getEnv('SUPABASE_ANON_KEY');

export const isSupabaseConfigured = !!(supabaseUrl && supabaseUrl.startsWith('http'));

// Only initialize if we have a valid-looking URL to prevent "supabaseUrl is required" error
export const supabase = isSupabaseConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null as any;

if (!isSupabaseConfigured) {
  console.error("Supabase configuration is missing. Please set SUPABASE_URL and SUPABASE_ANON_KEY in your environment variables.");
}
