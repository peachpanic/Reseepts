# Frontend Usage Guide for Authentication

## Table of Contents

1. [Sign In with Credentials](#sign-in-with-credentials)
2. [Sign Up](#sign-up)
3. [Sign Out](#sign-out)
4. [Protected Pages](#protected-pages)
5. [Getting User Session](#getting-user-session)
6. [Complete Login Page Example](#complete-login-page-example)

---

## Sign In with Credentials

### Using NextAuth `signIn` function:

```typescript
"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false, // Don't redirect automatically
      });

      if (result?.error) {
        setError("Invalid email or password");
        setLoading(false);
        return;
      }

      // Success! Redirect to dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? "Signing in..." : "Sign In"}
      </button>
    </form>
  );
}
```

---

## Sign Up

### Sign Up Form Component:

```typescript
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function SignUpForm() {
  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    school_id: "",
    allowance: 0,
    savings_goal: 0,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? parseFloat(value) || 0 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Call sign up API
      const res = await fetch("/api/signUp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!data.success) {
        setError(data.error || "Sign up failed");
        setLoading(false);
        return;
      }

      // Sign up successful! Now sign in automatically
      const signInResult = await signIn("credentials", {
        email: formData.email,
        password: formData.password,
        redirect: false,
      });

      if (signInResult?.error) {
        // Sign up worked but sign in failed - redirect to login
        router.push("/login?message=Account created. Please sign in.");
        return;
      }

      // Success! Redirect to dashboard
      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="full_name" className="block text-sm font-medium">
          Full Name
        </label>
        <input
          id="full_name"
          name="full_name"
          type="text"
          value={formData.full_name}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      <div>
        <label htmlFor="email" className="block text-sm font-medium">
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium">
          Password
        </label>
        <input
          id="password"
          name="password"
          type="password"
          value={formData.password}
          onChange={handleChange}
          required
          minLength={8}
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      <div>
        <label htmlFor="school_id" className="block text-sm font-medium">
          School ID
        </label>
        <input
          id="school_id"
          name="school_id"
          type="text"
          value={formData.school_id}
          onChange={handleChange}
          required
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      <div>
        <label htmlFor="allowance" className="block text-sm font-medium">
          Monthly Allowance
        </label>
        <input
          id="allowance"
          name="allowance"
          type="number"
          value={formData.allowance}
          onChange={handleChange}
          min="0"
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      <div>
        <label htmlFor="savings_goal" className="block text-sm font-medium">
          Savings Goal
        </label>
        <input
          id="savings_goal"
          name="savings_goal"
          type="number"
          value={formData.savings_goal}
          onChange={handleChange}
          min="0"
          className="w-full px-3 py-2 border rounded-md"
        />
      </div>

      {error && <div className="text-red-500 text-sm">{error}</div>}

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? "Creating account..." : "Sign Up"}
      </button>
    </form>
  );
}
```

---

## Sign Out

```typescript
"use client";

import { signOut } from "next-auth/react";

export default function SignOutButton() {
  const handleSignOut = async () => {
    await signOut({
      callbackUrl: "/login", // Redirect to login page after sign out
    });
  };

  return (
    <button
      onClick={handleSignOut}
      className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
    >
      Sign Out
    </button>
  );
}
```

---

## Protected Pages

### Server Component (Recommended):

```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login");
  }

  return (
    <div>
      <h1>Welcome, {session.user?.name}!</h1>
      <p>Email: {session.user?.email}</p>
    </div>
  );
}
```

### Client Component:

```typescript
"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return null;
  }

  return (
    <div>
      <h1>Welcome, {session.user?.name}!</h1>
      <p>Email: {session.user?.email}</p>
    </div>
  );
}
```

---

## Getting User Session

### In Server Components:

```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export default async function ProfilePage() {
  const session = await getServerSession(authOptions);

  return (
    <div>
      <pre>{JSON.stringify(session, null, 2)}</pre>
    </div>
  );
}
```

### In Client Components:

```typescript
"use client";

import { useSession } from "next-auth/react";

export default function UserProfile() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (status === "unauthenticated") {
    return <div>Not signed in</div>;
  }

  return (
    <div>
      <h2>{session?.user?.name}</h2>
      <p>{session?.user?.email}</p>
    </div>
  );
}
```

### In API Routes:

```typescript
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // User is authenticated
  return NextResponse.json({
    message: "Protected data",
    user: session.user,
  });
}
```

---

## Complete Login Page Example

```typescript
// src/app/login/page.tsx
"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const message = searchParams.get("message");

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
        setLoading(false);
        return;
      }

      router.push("/dashboard");
      router.refresh();
    } catch (err) {
      setError("An unexpected error occurred");
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    await signIn("google", {
      callbackUrl: "/dashboard",
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>

        {message && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {message}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleCredentialsSignIn}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email" className="sr-only">
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm"
                placeholder="Password"
              />
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-gray-50 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6">
            <button
              onClick={handleGoogleSignIn}
              className="w-full flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Sign in with Google
            </button>
          </div>
        </div>

        <div className="text-center">
          <Link href="/register" className="text-blue-600 hover:text-blue-500">
            Don't have an account? Sign up
          </Link>
        </div>
      </div>
    </div>
  );
}
```

---

## Important Notes

1. **Environment Variables**: Make sure you have these in your `.env.local`:

   ```
   NEXTAUTH_URL=http://localhost:3000
   NEXTAUTH_SECRET=your-secret-here
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-key
   ```

2. **SessionProvider**: Wrap your app with `SessionProvider` in `src/app/providers.tsx`:

   ```typescript
   "use client";

   import { SessionProvider } from "next-auth/react";

   export default function Providers({
     children,
   }: {
     children: React.ReactNode;
   }) {
     return <SessionProvider>{children}</SessionProvider>;
   }
   ```

3. **Use in Layout**: Add the provider to your root layout:

   ```typescript
   import Providers from "./providers";

   export default function RootLayout({
     children,
   }: {
     children: React.ReactNode;
   }) {
     return (
       <html lang="en">
         <body>
           <Providers>{children}</Providers>
         </body>
       </html>
     );
   }
   ```

4. **Testing**: Test your authentication flow:
   - Sign up at `/register`
   - Sign in at `/login`
   - Access protected pages
   - Sign out

---

## Middleware (Optional - for route protection)

Create `middleware.ts` in your root directory:

```typescript
export { default } from "next-auth/middleware";

export const config = {
  matcher: ["/dashboard/:path*", "/calendar/:path*"], // Protected routes
};
```
