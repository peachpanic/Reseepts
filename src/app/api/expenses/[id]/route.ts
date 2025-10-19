import { supabase } from '@/lib/supabase';
import { NextRequest } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  // Get ID from route params
  const expense_id = params.id;
  // Get expenses from User
  let { data: expenses, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('expense_id', expense_id);
  // Handle error
  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }
  // Success
  return new Response(JSON.stringify({ expenses }), { status: 200 });
}