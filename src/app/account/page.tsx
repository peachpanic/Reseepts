"use client";

import { signOut } from "next-auth/react";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";

type UserData = {
  full_name: string;
  email: string;
  allowance: number;
  savings_goal: string;
};

export default function AccountPage() {
  const { data: session, status } = useSession();

  if (status === "unauthenticated") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-500 to-teal-700">
        <div className="text-white text-xl">
          Please sign in to view your account.
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col w-full h-full bg-teal-600">
      {/* Top Section - with relative positioning and extra padding for card */}
      <div className="relative flex flex-col w-full py-8 px-4 pb-20 text-white">
        <div className="w-full">My Account</div>
        <div className="font-bold text-2xl">{session?.user?.name}</div>

        {/* Card positioned absolutely to overlap */}
        <Card className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 flex flex-col bg-teal-700 w-[90%] shadow-lg border-0">
          <CardHeader className="text-white">
            <CardTitle>Account Summary</CardTitle>
            <h1 className="font-bold text-3xl">₱123</h1>{" "}
            {/* Monthly Allowance */}
            <CardDescription className="text-gray-200">
              Monthly Allowance
            </CardDescription>
          </CardHeader>
        </Card>
      </div>

      {/* White Section - with top padding to account for overlapping card */}
      <div className="flex flex-col w-full h-full bg-white rounded-t-2xl pt-16">
        <div className="flex flex-col w-full h-full p-4">
          {session ? (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Full Name
                </label>
                <p className="mt-1 text-lg text-gray-900">
                  {session?.user?.name}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Email
                </label>
                <p className="mt-1 text-lg text-gray-900">
                  {session?.user?.email}
                </p>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => signOut()}
                  className="w-full bg-red-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-red-600 transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center text-gray-500">
              No user data available.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
