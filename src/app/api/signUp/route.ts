import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { supabase } from "@/lib/supabase";

// Define the validation schema with Zod
const signUpSchema = z.object({
  full_name: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  //   school_id: z.string().min(1, "School ID is required"),
  //   allowance: z.number().min(0, "Allowance must be a positive number").optional().default(0),
  //   savings_goal: z.number().min(0, "Savings goal must be a positive number").optional().default(0),
});

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const body = await request.json();

    // Validate the input using Zod
    const validationResult = signUpSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: "Validation failed",
          details: validationResult.error.format(),
        },
        { status: 400 }
      );
    }

    const { full_name, email, password } = validationResult.data;

    // Check if user already exists
    const { data: existingUser } = await supabase
      .from("users")
      .select("email")
      .eq("email", email)
      .single();

    if (existingUser) {
      return NextResponse.json(
        {
          success: false,
          error: "User with this email already exists",
        },
        { status: 409 }
      );
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert the new user into the database
    const { data: newUser, error: insertError } = await supabase
      .from("users")
      .insert([
        {
          full_name,
          email,
          password_hash: hashedPassword,
          provider: "email",
        },
      ])
      .select()
      .single();

    if (insertError) {
      console.error("Error inserting user:", insertError);
      return NextResponse.json(
        {
          success: false,
          error: "Failed to create user",
          details: insertError.message,
        },
        { status: 500 }
      );
    }

    // Return success response (without password hash)
    const { password_hash: _passwordHash, ...userWithoutPassword } = newUser;

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Sign up error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "An unexpected error occurred",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
