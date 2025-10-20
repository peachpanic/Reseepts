import { createClient } from "@supabase/supabase-js";
import { NextRequest, NextResponse } from "next/server";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || "",
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""
);

// GET all categories or specific category
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (id) {
      const { data, error } = await supabase
        .from("categories")
        .select("*")
        .eq("category_id", id)
        .single();

      if (error) throw error;
      return NextResponse.json(data);
    }

    const { data, error } = await supabase
      .from("categories")
      .select("*")
      .order("category_name", { ascending: true });

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error("GET categories error:", error);
    return NextResponse.json(
      { error: "Failed to fetch categories" },
      { status: 500 }
    );
  }
}

// POST create new category
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category_name, icon, user_id } = body;

    if (!category_name || !icon) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("categories")
      .insert([{ category_name, icon, user_id }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data, { status: 201 });
  } catch (error) {
    console.error("POST categories error:", error);
    return NextResponse.json(
      { error: "Failed to create category" },
      { status: 500 }
    );
  }
}

// PUT update category
export async function PUT(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url);
    const id = pathname.split("/").pop();

    if (!id) {
      return NextResponse.json({ error: "Missing category ID" }, { status: 400 });
    }

    const body = await request.json();
    const { category_name, icon } = body;

    const { data, error } = await supabase
      .from("categories")
      .update({ category_name, icon })
      .eq("category_id", id)
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json(data);
  } catch (error) {
    console.error("PUT categories error:", error);
    return NextResponse.json(
      { error: "Failed to update category" },
      { status: 500 }
    );
  }
}

// DELETE category
export async function DELETE(request: NextRequest) {
  try {
    const { pathname } = new URL(request.url);
    const id = pathname.split("/").pop();

    if (!id) {
      return NextResponse.json({ error: "Missing category ID" }, { status: 400 });
    }

    const { error } = await supabase
      .from("categories")
      .delete()
      .eq("category_id", id);

    if (error) throw error;
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE categories error:", error);
    return NextResponse.json(
      { error: "Failed to delete category" },
      { status: 500 }
    );
  }
}
