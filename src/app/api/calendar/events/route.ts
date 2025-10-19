import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { google } from "googleapis";
import { NextRequest } from "next/server";

export async function GET(_req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session || !(session as any).accessToken) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "content-type": "application/json" },
    });
  }

  try {
    const auth = new google.auth.OAuth2();
    auth.setCredentials({ access_token: (session as any).accessToken });
    const calendar = google.calendar({ version: "v3", auth });

    const now = new Date();
    const res = await calendar.events.list({
      calendarId: "primary",
      timeMin: now.toISOString(),
      maxResults: 10,
      singleEvents: true,
      orderBy: "startTime",
    });

    return new Response(JSON.stringify(res.data.items ?? []), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (e: any) {
    console.error("Calendar list error", e);
    return new Response(JSON.stringify({ error: e?.message || "Unknown error" }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
}
