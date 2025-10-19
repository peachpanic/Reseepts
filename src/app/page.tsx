"use client";
import { useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import GoogleButton from "@/components/GoogleButton";
import { motion } from "motion/react";
import Image from "next/image";

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
  const [showLoginForm, setShowLoginForm] = useState(false);

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
    <div className="min-h-screen flex flex-col">
      {/* Hero - two column on desktop */}
      <main className="flex-1 flex items-center">
        <div className="w-full max-w-6xl mx-auto p-6 md:p-12 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* LEFT: man + headline/motto */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left gap-6">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="w-56 h-56 md:w-96 md:h-96 flex items-center justify-center mx-auto md:mx-0"
            >
              <Image
                src="/man.png"
                alt="man"
                className="object-contain"
                width={384}
                height={384}
              />
            </motion.div>

            <div className="text-[#1B5C58] space-y-3 px-4 md:px-0">
              <h1 className="text-3xl md:text-5xl font-bold">
                Welcome to Reseepts
              </h1>
              <p className="text-sm md:text-lg opacity-90 max-w-lg">
                Capture receipts, track spending, and get smart insights — all
                in one place.
              </p>
            </div>
          </div>

          {/* RIGHT: CTA + login form */}
          <div className="flex items-center justify-center">
            <div className="w-full max-w-md bg-white bg-opacity-10 backdrop-blur-lg rounded-xl p-6 md:p-8 text-center md:text-left">
              {!showLoginForm ? (
                <div className="space-y-5">
                  <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
                    <button
                      onClick={() => setShowLoginForm(true)}
                      className="w-full sm:w-auto border border-white/30 text-white px-6 py-3 rounded-xl text-md hover:bg-white/5"
                    >
                      Already have an account? Sign in
                    </button>
                  </div>

                  <div className="mt-4 flex items-center justify-center">
                    <GoogleButton />
                  </div>
                </div>
              ) : (
                // Simple login form
                <div className="text-white">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-semibold">Sign in</h3>
                    <button
                      onClick={() => setShowLoginForm(false)}
                      className="text-sm underline"
                    >
                      Close
                    </button>
                  </div>

                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      // hook into your auth flow here
                      const form = e.currentTarget as HTMLFormElement & {
                        email?: HTMLInputElement;
                        password?: HTMLInputElement;
                      };
                      const email = (
                        form.elements.namedItem("email") as HTMLInputElement
                      )?.value;
                      const password = (
                        form.elements.namedItem("password") as HTMLInputElement
                      )?.value;
                      // Basic signIn call (adjust provider/credentials as needed)
                      signIn("credentials", { email, password });
                    }}
                    className="mt-4 space-y-4"
                  >
                    <div>
                      <label className="sr-only">Email</label>
                      <input
                        name="email"
                        type="email"
                        required
                        placeholder="Email"
                        className="w-full px-4 py-3 rounded-lg"
                      />
                    </div>
                    <div>
                      <label className="sr-only">Password</label>
                      <input
                        name="password"
                        type="password"
                        required
                        placeholder="Password"
                        className="w-full px-4 py-3 rounded-lg"
                      />
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        type="submit"
                        className="bg-white text-[#3E7C78] px-6 py-2 rounded-md font-semibold"
                      >
                        Sign in
                      </button>
                      <button
                        type="button"
                        onClick={() => signIn("google")}
                        className="border border-white/30 text-white px-4 py-2 rounded-md"
                      >
                        Sign in with Google
                      </button>
                    </div>
                  </form>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Secondary content: calendar/events when signed in */}
      {/* <div className="p-6">
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
      </div> */}
    </div>
  );
}
