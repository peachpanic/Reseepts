"use client";
import { useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";

type EventItem = {
  id?: string;
  summary?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
};

export default function Home() {
  const { data: session, status } = useSession();
  const [events, setEvents] = useState<EventItem[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (status === "authenticated") {
        setError(null);
        const res = await fetch("/api/calendar/events");
        if (!res.ok) {
          const j = await res.json().catch(() => ({}));
          setError(j.error || `Failed with ${res.status}`);
          setEvents(null);
          return;
        }
        const items = (await res.json()) as EventItem[];
        setEvents(items);
      } else {
        setEvents(null);
      }
    };
    load();
  }, [status]);

  return (
    <div className="min-h-screen p-8 flex flex-col gap-6">
      <header className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Google Calendar Demo</h1>
        {status === "authenticated" ? (
          <div className="flex items-center gap-3">
            <span className="text-sm">{session?.user?.email}</span>
            <button
              className="rounded border px-3 py-1 text-sm"
              onClick={() => signOut()}
            >
              Sign out
            </button>
          </div>
        ) : (
          <button
            className="rounded border px-3 py-1 text-sm"
            onClick={() => signIn("google")}
          >
            Sign in with Google
          </button>
        )}
      </header>

      {status === "loading" && <p>Loading session…</p>}
      {error && <p className="text-red-600">Error: {error}</p>}

      {status === "authenticated" && (
        <section>
          <h2 className="font-medium mb-2">Upcoming events</h2>
          {events === null ? (
            <p>Loading events…</p>
          ) : events.length === 0 ? (
            <p>No upcoming events found.</p>
          ) : (
            <ul className="space-y-2">
              {events.map((e) => {
                const start = e.start?.dateTime || e.start?.date;
                return (
                  <li key={e.id} className="rounded border p-3">
                    <div className="font-medium">
                      {e.summary || "(no title)"}
                    </div>
                    <div className="text-sm text-gray-600">{start}</div>
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}
