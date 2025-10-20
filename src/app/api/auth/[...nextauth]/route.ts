import NextAuth, { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
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
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("*")
            .eq("email", credentials.email)
            .single();

          if (userError) {
            console.error("Supabase user fetch error:", userError);
            throw new Error("Unknown user");
          }
          if (!userData) {
            throw new Error("User not found");
          }

          if (
            await !bcrypt.compare(credentials.password, userData.password_hash)
          ) {
            throw new Error("Invalid credentials");
          }

          // Return user object that will be stored in the JWT
          return {
            id: userData.user_id.toString(),
            email: userData.email,
            name: userData.full_name,
            schoolId: userData.school_id,
            allowance: userData.allowance,
            savingsGoal: userData.savings_goal,
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

        let userId: string;
        if (!response.data) {
          // Insert new user and get the inserted user_id
          const insertResponse = await supabase
            .from("users")
            .insert({
              email: token.email,
              full_name: token.name,
              profile_url: token.picture,
              password_hash: "",
              provider: "google",
            })
            .select("user_id")
            .single();
          userId = insertResponse.data?.user_id.toString();
        } else {
          userId = response.data.user_id.toString();
        }

        return {
          ...token,
          sub: userId,
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
      (session as any).user.id = token.sub; // Add user ID to session
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
