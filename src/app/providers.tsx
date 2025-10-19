"use client";
import { SessionProvider } from "next-auth/react";
import { ReactNode } from "react";
import QueryProvider from "../components/Provider/QueryProvider";

export default function Providers({ children }: { children: ReactNode }) {
  return (
    <QueryProvider>
      <SessionProvider>{children}</SessionProvider>
    </QueryProvider>
  );
}
