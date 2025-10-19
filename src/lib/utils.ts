import { createClient } from "@supabase/supabase-js";

const isDev = process.env.VERCEL_ENV === "development";
// const supabaseUrl = isDev ? process.env.DEVELOPMENT_NEXT_PUBLIC_SUPABASE_URL! : process.env.NEXT_PUBLIC_SUPABASE_URL!
// const supabaseKey = isDev ? process.env.DEVELOPME    NT_NEXT_PUBLIC_SUPABASE_ANON_KEY! : process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseUrl =
  process.env.NEXT_PUBLIC_SUPABASE_URL! || "https://test.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY! || "test";
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
