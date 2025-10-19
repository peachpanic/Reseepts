 import { supabase } from '@/lib/supabase';
import { NextApiRequest } from 'next';
import { projectUpdate } from 'next/dist/build/swc/generated-native';
 
export async function GET(req: NextApiRequest) {
  //Get ID
  const { id } =  req.body;  
  //Get user data from User
  let { data: user, error } = await supabase
  .from('users')
  .select('*').eq('user_id', id);
  //Handle error
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
  //Success
  return new Response(JSON.stringify({ user }), { status: 200 });
}

export async function POST(req: NextApiRequest) {
    //
    const { full_name, email, password_hash, school_id, allowance, savings_goal } = await req.body();
    const { data, error } = await supabase
      .from('users')
      .insert({
        full_name,
        email,
        password_hash,
        school_id,
        allowance,
        savings_goal
      });
  
    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500 });
    }
  
    return new Response(JSON.stringify({ message: 'User created successfully', data }), { status: 200 });
  }