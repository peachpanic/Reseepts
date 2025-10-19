 import { supabase } from '@/lib/supabase';
import { NextApiRequest } from 'next';
import { projectUpdate } from 'next/dist/build/swc/generated-native';
 
export async function GET(req: NextApiRequest) {
  //Get ID
  const { id } =  req.body;  
  //Get expenses from User
  let { data: expenses, error } = await supabase
  .from('expenses')
  .select('*').eq('user_id', id);
  //Handle error
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
  //Success
  return new Response(JSON.stringify({ expenses }), { status: 200 });
}