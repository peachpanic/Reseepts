 import { supabase } from '@/lib/supabase';
import { NextApiRequest } from 'next';
import { projectUpdate } from 'next/dist/build/swc/generated-native';
 
export async function GET(req: NextApiRequest) {
  //Get user data from User
  let { data: users, error } = await supabase
  .from('users')
  .select('*');
  //Handle error
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
  //Success
  return new Response(JSON.stringify({ users }), { status: 200 });
}