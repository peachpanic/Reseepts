"use client";
import { useEffect, useState } from "react";
import { signIn, signOut, useSession } from "next-auth/react";
import GoogleButton from "@/components/GoogleButton";
import { motion } from "motion/react";
import Image from "next/image";
import { LoginForm } from "@/components/login/LoginForm"; // Add this import

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
  const [showLoginForm, setShowLoginForm] = useState(true);

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
    <div className="h-screen overflow-hidden">
      <main className="h-full flex items-center bg-white">
        <div className="w-full h-full mx-auto grid grid-cols-1 md:grid-cols-2">
          {/* left - now WHITE */}
          <div className="flex flex-col items-center text-center h-full md:text-left bg-white mt-5 md:mt-0">
            {/*  top left logo */}
            <motion.div
              initial={{ y: -30, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
              className="-mb-9"
            >
              <Image
                src="/images/components/logo.svg"
                alt="Reseepts Logo"
                width={108}
                height={108}
                sizes="48px"
                className="w-64 md:w-80 h-auto"
              />
            </motion.div>

            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
              className="relative z-50"
            >
              <Image
                src="/man.png"
                alt="Man"
                width={400}
                height={400}
                sizes="(max-width: 768px) 250px, 384px"
                className="w-88 md:w-96 h-auto relative z-50"
              />
            </motion.div>

            <div className="hidden md:block text-base space-y-3 px-4 md:px-0 mt-4">
              <motion.h1
                className="text-3xl md:text-5xl font-bold"
                initial={{ x: -40, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                Welcome to{" "}
                <span className="bg-gradient-to-r from-teal-400 to-teal-600 bg-clip-text text-transparent">
                  Reseepts
                </span>
              </motion.h1>
              <p className="text-sm text-center md:text-lg opacity-90 max-w-lg text-gray-700">
                Capture receipts, track spending, and get smart insights — all
                in one place.
              </p>
            </div>
          </div>
          {/* right - now GREEN */}

          <div className="flex items-center h-full bg-gradient-to-br from-teal-500 to-teal-700 justify-center">
            {/* Slanted shape - now TEAL/GREEN on mobile */}
            <div
              className="z-40 backdrop-blur-lg p-6 md:p-8 w-full md:bg-transparent md:backdrop-blur-0 text-center md:text-left"
              style={{
                background:
                  "linear-gradient(to bottom right, rgb(20 184 166), rgb(13 148 136))",
                clipPath: "polygon(0 0, 100% 10%, 100% 100%, 0 100%)",
                WebkitClipPath: "polygon(0 0, 100% 10%, 100% 100%, 0 100%)",
                height: "50vh",
                width: "100%",
                position: "fixed",
                left: 0,
                bottom: 0,
                zIndex: 40,
              }}
            >
              {!showLoginForm ? (
                <div className=" space-y-2 pt-6 mt-6 md:pt-0">
                  <motion.h1
                    className="md:hidden text-3xl mt-6 md:mt-2 md:text-5xl font-bold text-white"
                    initial={{ x: -30, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.15 }}
                  >
                    Welcome to <span className="text-white">Reseepts</span>
                  </motion.h1>

                  <motion.p
                    className="md:hidden text-sm text-white/90 mt-3"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.25 }}
                  >
                    Capture receipts, track spending, and get smart insights
                  </motion.p>

                  <div className="flex flex-col items-center gap-4 mt-12">
                    {/* <motion.button
                      onClick={() => setShowLoginForm(true)}
                      className="cursor-pointer not-only-of-type:w-full sm:w-auto bg-white text-teal-600 px-8 py-3 rounded-xl text-lg font-semibold shadow-lg hover:shadow-xl hover:scale-105 transform transition duration-200"
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{
                        duration: 0.6,
                        ease: "easeOut",
                        delay: 0.35,
                      }}
                    >
                      Get Started
                    </motion.button> */}

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{
                        duration: 0.8,
                        ease: "easeOut",
                        delay: 0.45,
                      }}
                      className="text-center"
                    >
                      <p className="text-white font-medium">
                        Already have an account?{" "}
                        <button
                          onClick={() => setShowLoginForm(true)}
                          className="text-white font-bold underline hover:text-gray-100 transition duration-200 cursor-pointer "
                        >
                          Sign in
                        </button>
                      </p>
                    </motion.div>
                  </div>
                </div>
              ) : (
                <div className="lg:bg-white rounded-2xl py-10 px-20 md:py-8 shadow-xl">
                  <div className="flex items-center justify-center mb-6">
                    <h3 className="text-2xl font-bold text-white md:text-teal-600">
                      Sign in
                    </h3>
                  </div>

                  {/* Use the LoginForm component */}
                  <LoginForm />

                  {/* OR separator */}
                  <div className="flex items-center gap-3 my-6">
                    <span className="flex-1 h-px bg-gray-200" />
                    <span className="text-xs text-white font-medium">OR</span>
                    <span className="flex-1 h-px bg-gray-200" />
                  </div>

                  {/* Google Sign In */}
                  <div className="flex items-center justify-center">
                    <div className="m-auto">
                      <GoogleButton />
                    </div>
                  </div>

                  {/* Sign Up Link */}
                  <div className="text-center text-sm mt-6 pt-4 border-t border-gray-200">
                    <span className="text-white">Don't have an account? </span>
                    <button
                      type="button"
                      onClick={() => {
                        setShowLoginForm(false);
                      }}
                      className="text-white font-semibold transition duration-200 cursor-pointer"
                    >
                      Sign up
                    </button>
                  </div>
                </div>
              )}
            </div>
            {/* remove clip-path on md+ screens */}
            <style>{`@media (min-width: 768px) { div[style] { clip-path: none !important; -webkit-clip-path: none !important; position: static !important; height: auto !important; width: auto !important; background: transparent !important; } }`}</style>
          </div>
        </div>
      </main>
    </div>
  );
}
