"use client";

import {
  Card,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";

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
        <div className="w-full "></div>
        {/* <div className="font-bold text-2xl">{session?.user?.name}</div> */}

        {/* Card positioned absolutely to overlap */}
        <Card className="absolute left-1/2 -translate-x-1/2 bg-transparent bottom-0 translate-y-1/2 flex flex-col w-[90%]  border-0 shadow-none">
          <CardHeader className="text-white justify-center flex flex-col items-center">
            <Image
              src={session?.user?.image || ""}
              alt="User Avatar"
              width={50}
              height={50}
              className="rounded-full mb-2 border-4 border-teal-700 size-40"
            />
          </CardHeader>
        </Card>
      </div>

      {/* White Section - with top padding to account for overlapping card */}
      <div className="flex flex-col w-full h-full bg-white rounded-t-2xl pt-16">
        <div className="flex flex-col w-full h-full p-4">
          {session ? (
            <div className="space-y-4">
              <div>
                <h4 className="text-teal-500">{session?.user?.name}</h4>
                <p className="text-teal-500 text-sm">{session?.user?.email}</p>
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
