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
    <div className="min-h-screen flex h-full flex-col">
      <main className="flex h-full items-center bg-gradient-to-br from-teal-500 to-teal-700">
        <div className="w-full h-full mx-auto grid grid-cols-1 md:grid-cols-2 items-center">
          {/* left */}
          <div className="flex flex-col justify-center items-center text-center h-full md:text-left md:bg-[#EEF8F7] rounded-tr-2xl rounded-br-2xl">
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className=""
            >
              {/* <svg
                width="200"
                height="200"
                viewBox="0 0 200 200"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                {" "}
                <g clip-path="url(#clip0_103_21)">
                  {" "}
                  <path
                    d="M71.5579 16.3347C84.3365 -5.4449 115.825 -5.44489 128.603 16.3347L129.067 17.1257C134.963 27.1733 145.709 33.378 157.358 33.4596L158.276 33.466C183.527 33.6428 199.271 60.9123 186.798 82.8687L186.345 83.6661C180.591 93.7953 180.591 106.205 186.345 116.334L186.798 117.131C199.271 139.088 183.527 166.357 158.276 166.534L157.358 166.54C145.709 166.622 134.963 172.827 129.067 182.874L128.603 183.665C115.825 205.445 84.3365 205.445 71.5579 183.665L71.0938 182.874C65.1986 172.827 54.4517 166.622 42.8027 166.54L41.8856 166.534C16.6346 166.357 0.890585 139.088 13.3629 117.131L13.8159 116.334C19.5698 106.205 19.5698 93.7953 13.8159 83.6661L13.3629 82.8687C0.890585 60.9123 16.6346 33.6428 41.8856 33.466L42.8027 33.4596C54.4518 33.378 65.1986 27.1733 71.0938 17.1257L71.5579 16.3347Z"
                    fill="url(#paint0_linear_103_21)"
                  />{" "}
                </g>{" "}
                <defs>
                  {" "}
                  <linearGradient
                    id="paint0_linear_103_21"
                    x1="100.081"
                    y1="0"
                    x2="100.081"
                    y2="200"
                    gradientUnits="userSpaceOnUse"
                  >
                    {" "}
                    <stop stop-color="#EEF8F7" />{" "}
                    <stop offset="1" stop-color="#F8FBFE" />{" "}
                  </linearGradient>{" "}
                  <clipPath id="clip0_103_21">
                    {" "}
                    <rect width="200" height="200" fill="white" />{" "}
                  </clipPath>{" "}
                </defs>{" "}
              </svg> */}
              <Image
                src="/man.png"
                alt="Man"
                width={400}
                height={400}
                className="mb-4"
              />
            </motion.div>

            <div className="text-base space-y-3 px-4 md:px-0">
              <h1 className="text-3xl md:text-5xl font-bold">
                Welcome to{" "}
                <span className="bg-gradient-to-r from-teal-400 to-teal-600 bg-clip-text text-transparent">
                  Reseepts
                </span>
              </h1>
              <p className="text-sm text-center md:text-lg opacity-90 max-w-lg">
                Capture receipts, track spending, and get smart insights — all
                in one place.
              </p>
            </div>
          </div>
          {/* right */}

          <div className="flex items-center justify-center">
            <div className="fixed left-1/2 bottom-6 z-40 w-[92%] max-w-md transform -translate-x-1/2 bg-white bg-opacity-90 backdrop-blur-lg rounded-xl p-6 md:p-8 md:static md:left-auto md:bottom-auto md:translate-x-0 md:w-full md:max-w-md md:bg-transparent md:backdrop-blur-0 text-center md:text-left">
              {!showLoginForm ? (
                <div className="space-y-2">
                  <div className="flex md:flex-col sm:flex-row items-center gap-4 mt-4">
                    <div className="flex flex-row">
                      <button
                        onClick={() => setShowLoginForm(true)}
                        className="w-full sm:w-auto bg-white text-[#3E7C78] px-8 py-3 rounded-xl text-lg font-semibold shadow-lg hover:scale-105 transform transition"
                      >
                        Create account
                      </button>
                    </div>

                    <div className="flex flex-row">
                      <button
                        onClick={() => setShowLoginForm(true)}
                        className="w-full sm:w-auto border border-white/30 text-base px-6 py-3 rounded-xl text-md hover:bg-white/5"
                      >
                        Already have an account? Sign in
                      </button>
                    </div>
                  </div>

                  <div className="mt-4 flex items-center justify-center">
                    <GoogleButton />
                  </div>
                </div>
              ) : (
                // Simple login form (clean UI)
                <div className="text-base">
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
                        className="w-full px-4 py-3 rounded-lg bg-white text-black placeholder-gray-500"
                      />
                    </div>
                    <div>
                      <label className="sr-only">Password</label>
                      <input
                        name="password"
                        type="password"
                        required
                        placeholder="Password"
                        className="w-full px-4 py-3 rounded-lg bg-white text-black placeholder-gray-500"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3">
                      <button
                        type="submit"
                        className="w-full sm:w-auto bg-white text-[#3E7C78] px-6 py-2 rounded-md font-semibold"
                      >
                        Sign in
                      </button>
                    </div>

                    {/* OR separator */}
                    <div className="flex items-center gap-3 my-2">
                      <span className="flex-1 h-px bg-white/30" />
                      <span className="text-xs text-white/80">OR</span>
                      <span className="flex-1 h-px bg-white/30" />
                    </div>

                    <div className="flex items-center justify-center">
                      <button
                        type="button"
                        onClick={() => signIn("google")}
                        className="w-full sm:w-auto border border-white/30 text-base px-4 py-2 rounded-md bg-white/95 text-black"
                      >
                        Continue with Google
                      </button>
                    </div>

                    <div className="text-center text-sm mt-2">
                      <span className="text-white/80">Don’t have an account? </span>
                      <button
                        type="button"
                        onClick={() => {
                          setShowLoginForm(false);
                          // you can navigate to signup page or toggle a signup state
                        }}
                        className="underline text-white"
                      >
                        Sign up
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
