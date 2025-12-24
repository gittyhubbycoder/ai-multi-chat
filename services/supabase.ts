// FIX: Add a triple-slash directive to include Vite's client types, which defines `import.meta.env` for TypeScript.
/// <reference types="vite/client" />

import { createClient } from '@supabase/supabase-js';

// IMPORTANT: These are now read from your .env.local file for local development
// and from Vercel's environment variables when deployed.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Supabase URL and Anon Key must be provided in environment variables.");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);