export const models = [
  { id: 'gemini-pro', name: 'Gemini 2.5 Pro', provider: 'google', endpoint: 'gemini-2.0-flash-exp', color: '#4285f4' },
  { id: 'cerebras', name: 'Cerebras Llama', provider: 'cerebras', endpoint: 'llama3.3-70b', color: '#8b5cf6' },
  { id: 'groq', name: 'Groq Llama', provider: 'groq', endpoint: 'llama-3.3-70b-versatile', color: '#ec4899' },
  { id: 'deepseek', name: 'DeepSeek V3', provider: 'deepseek', endpoint: 'deepseek-chat', color: '#10b981' }
];

export const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || '';
export const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
export const ADMIN_EMAIL = import.meta.env.VITE_ADMIN_EMAIL || '';
export const INVITE_CODE = import.meta.env.VITE_INVITE_CODE || '';
