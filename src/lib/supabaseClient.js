import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || supabaseUrl === 'https://placeholder-url.supabase.co') {
  console.warn('Supabase URL is not configured. Please check your .env file.');
}

if (!supabaseAnonKey || supabaseAnonKey === 'placeholder-anon-key') {
  console.warn('Supabase Anon Key is not configured. Please check your .env file.');
}

export const supabase = createClient(
  supabaseUrl || 'https://placeholder-url.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key'
);
