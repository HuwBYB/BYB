// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Don't crash the whole app if vars are missing; export null and warn instead
export const supabase = (url && key) ? createClient(url, key) : null;

if (!url || !key) {
  // This shows in the browser console so we know what's wrong
  console.warn('[BYB] Supabase env vars missing. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in Vercel → Project → Settings → Environment Variables.');
}
