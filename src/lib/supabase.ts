import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// The client is intentionally unavailable until the two public Supabase values
// are configured. This keeps the rest of the CV builder usable without auth.
export const supabase = url && anonKey ? createClient(url, anonKey) : null
