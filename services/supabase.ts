import { createClient } from '@supabase/supabase-js';

// FIX: Manually define types for Vite environment variables as a workaround for project configuration issues.
// This resolves "Cannot find type definition file for 'vite/client'" and errors on `import.meta.env`.
declare global {
  interface ImportMeta {
    readonly env: {
      readonly VITE_SUPABASE_URL: string;
      readonly VITE_SUPABASE_ANON_KEY: string;
    };
  }
}

// IMPORTANT: These are now read from your .env.local file for local development
// and from Vercel's environment variables when deployed.
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error("Supabase URL and Anon Key must be provided in environment variables.");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
