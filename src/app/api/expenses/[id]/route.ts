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

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const expense_id = params.id;
  const { amount, description, category_id, payment_method, source, emotion_tag, expense_date } = await req.json();

  const { data, error } = await supabase
    .from('expenses')
    .update({
      amount,
      description,
      category_id,
      payment_method,
      source,
      emotion_tag,
      expense_date
    })
    .eq('expense_id', expense_id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ message: 'Expense updated successfully', data }), { status: 200 });
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const expense_id = params.id;

  const { data, error } = await supabase
    .from('expenses')
    .delete()
    .eq('expense_id', expense_id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ message: 'Expense deleted successfully', data }), { status: 200 });
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const expense_id = params.id;
  const { amount, description, category_id, payment_method, source, emotion_tag, expense_date } = await req.json();

  const { data, error } = await supabase
    .from('expenses')
    .update({
      amount,
      description,
      category_id,
      payment_method,
      expense_date
    })
    .eq('expense_id', expense_id);

  if (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  return new Response(JSON.stringify({ message: 'Expense updated successfully', data }), { status: 200 });
}