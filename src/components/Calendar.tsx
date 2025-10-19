"use client";

import { useSession, signIn, signOut } from "next-auth/react";
import { useState, useEffect } from "react";

export default function Calendar() {
  const { data: session } = useSession();
  const [events, setEvents] = useState([]);

  useEffect(() => {
    if (session) {
      fetchEvents();
    }
  }, [session]);

  const fetchEvents = async () => {
    const response = await fetch("/api/calendar/events");
    const data = await response.json();
    setEvents(data);
  };

  if (!session) {
    return (
      <button onClick={() => signIn("google")}>Sign in with Google</button>
    );
  }

  return (
    <div>
      // Your Calendar Events
      <button onClick={() => signOut()}>Sign out</button>
      {events.map((event: any) => (
        <div>
          {event.summary}
          {event.start?.dateTime || event.start?.date}
        </div>
      ))}
    </div>
  );
}
