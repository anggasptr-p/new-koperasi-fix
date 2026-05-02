import { createClient } from '@supabase/supabase-js';

// Narik kunci rahasia dari file .env.local tadi
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Nyalain mesin penghubung
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
