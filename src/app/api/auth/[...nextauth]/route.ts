import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";

import { google } from "googleapis";
import { supabase } from "@/lib/supabase";

async function refreshAccessToken(token: any) {
  try {
    const client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );

    client.setCredentials({ refresh_token: token.refresh_token });

    // refreshAccessToken is deprecated in types but still functional; alternative is to use getAccessToken
    const { credentials } = await client.refreshAccessToken();

    return {
      ...token,
      access_token: credentials.access_token,
      expires_at: credentials.expiry_date
        ? Math.floor(credentials.expiry_date)
        : Date.now() +
          (credentials.expires_in
            ? credentials.expires_in * 1000
            : 55 * 60 * 1000),
      refresh_token: credentials.refresh_token ?? token.refresh_token,
    };
  } catch (error) {
    console.error("Error refreshing access token", error);
    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}

// TODO: add email & pass sign-in provider

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          // Request offline access to receive refresh_token
          access_type: "offline",
          prompt: "consent",
          response_type: "code",
          scope: [
            "openid",
            "email",
            "profile",
            "https://www.googleapis.com/auth/calendar.readonly",
          ].join(" "),
        },
      },
    }),
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email", placeholder: "your@email.com" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Email and password are required");
        }

        try {
          // Call your sign-in API
          const res = await fetch(`${process.env.NEXTAUTH_URL}/api/signIn`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              email: credentials.email,
              password: credentials.password,
            }),
          });

          const data = await res.json();

          if (!res.ok || !data.success) {
            throw new Error(data.error || "Invalid credentials");
          }

          // Return user object that will be stored in the JWT
          return {
            id: data.user.user_id.toString(),
            email: data.user.email,
            name: data.user.full_name,
            schoolId: data.user.school_id,
            allowance: data.user.allowance,
            savingsGoal: data.user.savings_goal,
          };
        } catch (error) {
          console.error("Authorization error:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  callbacks: {
    async jwt({ token, account, profile }) {
      // Initial sign in
      if (account) {
        const response = await supabase
          .from("users")
          .select("*")
          .eq("email", token.email)
          .single();

        if (!response.data) {
          await supabase.from("users").insert({
            email: token.email,
            full_name: token.name,
            profile_url: token.picture,
            password_hash: "",
            provider: "google",
          });
        }

        return {
          ...token,
          access_token: account.access_token,
          refresh_token: account.refresh_token,
          expires_at: account.expires_at
            ? account.expires_at * 1000
            : Date.now() + 55 * 60 * 1000, // fallback ~55min
          provider: account.provider,
        } as any;
      }

      // Return previous token if the access token has not expired yet
      if (token.expires_at && Date.now() < (token.expires_at as number)) {
        return token;
      }

      // Access token has expired, try to update it
      if (token.refresh_token) {
        return await refreshAccessToken(token);
      }

      return token;
    },
    async session({ session, token }) {
      (session as any).accessToken = token.access_token;
      (session as any).error = token.error;
      return session;
    },
  },
  pages: {
    // You can customize sign in page later if desired
  },
  // For Next.js App Router, set a secret for JWT encryption
  secret: process.env.NEXTAUTH_SECRET,
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
