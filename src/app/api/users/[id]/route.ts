import { supabase } from '@/lib/supabase';

// GET /api/users/:id - fetch user by id from URL params
export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const { id } = params;

  if (!id) {
      return new Response(JSON.stringify({ error: 'Missing user id in URL params' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('user_id', id)
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ user }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message ?? 'Unknown error' }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function POST(req: Request, { params }: { params: { id?: string } }) {
  try {
    const body = await req.json();
    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing user id in URL params' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const { full_name, email, password_hash, school_id, allowance, savings_goal } = body;

    const { data, error } = await supabase
      .from('users')
      .insert({
        user_id: id ?? undefined,
        full_name,
        email,
        password_hash,
        school_id,
        allowance,
        savings_goal
      })
      .select()
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ message: 'User created/updated successfully', data }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message ?? 'Invalid JSON' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function DELETE(req: Request, {params}: {params: {id?: string}}) {
  try {
    const { id } = params;
    if (!id) {
      return new Response(JSON.stringify({ error: 'Missing user id in URL params' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const { data, error } = await supabase
      .from('users')
      .delete()
      .eq('user_id', id)
      .single();

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ message: 'User deleted successfully', data }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (err: any) {
    return new Response(JSON.stringify({ error: err?.message ?? 'Invalid JSON' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }
}