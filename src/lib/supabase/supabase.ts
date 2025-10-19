import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
export const supabase = createClient(supabaseUrl, supabaseKey, {
  global: {
    headers: {
      "Accept-Encoding": "gzip, deflate, br",
    },
  },
  db: {
    schema: "public",
  },
  auth: {
    persistSession: false, // Disable session persistence for server-side use
  },
  realtime: {
    params: {
      eventsPerSecond: 10,
    },
  },
});
