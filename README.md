This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Google Calendar API Setup

This project integrates Google Calendar API with OAuth 2.0 authentication via NextAuth.js.

### Prerequisites

1. **Create a Google Cloud Project**
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one

2. **Enable Google Calendar API**
   - Navigate to **APIs & Services** > **Library**
   - Search for "Google Calendar API"
   - Click **Enable**

3. **Create OAuth 2.0 Credentials**
   - Go to **APIs & Services** > **Credentials**
   - Click **Create Credentials** > **OAuth client ID**
   - Choose **Web application**
   - Add **Authorized redirect URIs**:
     - `http://localhost:3000/api/auth/callback/google` (for development)
     - Add your production URL when deploying: `https://yourdomain.com/api/auth/callback/google`
   - Copy the **Client ID** and **Client Secret**

### Environment Variables

Create a `.env.local` file in the root directory:

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=generate-with-openssl-or-crypto
```

Generate a secure `NEXTAUTH_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Required Scopes

The app requests these Google OAuth scopes:
- `openid` - OpenID Connect
- `email` - User's email address
- `profile` - User's basic profile info
- `https://www.googleapis.com/auth/calendar.readonly` - Read-only access to Google Calendar

### Troubleshooting

**Error 400: redirect_uri_mismatch**
- Ensure the redirect URI in Google Console exactly matches: `http://localhost:3000/api/auth/callback/google`
- Check that `NEXTAUTH_URL` in `.env.local` is set correctly
- Restart the dev server after making changes

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
