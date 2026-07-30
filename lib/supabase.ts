import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://ocxfnhxesfokmhgysdnx.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9jeGZuaHhlc2Zva21oZ3lzZG54Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUyNzk1NDIsImV4cCI6MjEwMDg1NTU0Mn0.2_E1nUC2-Co_O25PhL7Px5hhXmBlfow0UPe8m4pIgsI";

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
