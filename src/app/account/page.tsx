"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { signOut, useSession } from "next-auth/react";
import Image from "next/image";
import {
  LogOut,
  Mail,
  User,
  ChevronRight,
  Bell,
  Lock,
  Palette,
  HelpCircle,
  Shield,
} from "lucide-react";

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

  const menuItems = [
    {
      icon: Bell,
      title: "Notifications",
      description: "Manage your notification preferences",
      action: () => console.log("Notifications"),
    },
    {
      icon: Lock,
      title: "Privacy & Security",
      description: "Control your privacy settings",
      action: () => console.log("Privacy"),
    },
    {
      icon: Palette,
      title: "Appearance",
      description: "Customize your app experience",
      action: () => console.log("Appearance"),
    },
    {
      icon: HelpCircle,
      title: "Help & Support",
      description: "Get help with Reseepts",
      action: () => console.log("Help"),
    },
  ];

  return (
    <div className="flex flex-col w-full min-h-screen bg-gradient-to-br from-teal-500 via-teal-600 to-teal-700">
      {/* Hero Section with Profile */}
      <div className="relative flex flex-col w-full pt-8 pb-32 px-4">
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "radial-gradient(circle, white 1px, transparent 1px)",
              backgroundSize: "24px 24px",
            }}
          />
        </div>

        {/* Profile Card - Overlapping */}
        <Card className="relative mx-auto w-full max-w-md bg-white/95 backdrop-blur-sm shadow-2xl border-0 -mb-20 z-10">
          <CardContent className="pt-8 pb-6">
            <div className="flex flex-col items-center text-center">
              {/* Avatar with ring */}
              <div className="relative mb-4">
                <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-teal-600 rounded-full blur-xl opacity-50 animate-pulse" />
                <Image
                  src={session?.user?.image || "/default-avatar.png"}
                  alt="User Avatar"
                  width={120}
                  height={120}
                  className="relative rounded-full border-4 border-white shadow-lg"
                />
                <div className="absolute bottom-2 right-2 w-6 h-6 bg-green-500 border-4 border-white rounded-full" />
              </div>

              {/* User Info */}
              <h2 className="text-2xl font-bold text-gray-900 mb-1">
                {session?.user?.name || "User"}
              </h2>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Mail className="w-4 h-4" />
                {session?.user?.email}
              </p>

              {/* Stats */}
              <div className="flex gap-6 mt-6 pt-6 border-t border-gray-100 w-full justify-center">
                <div className="text-center">
                  <div className="text-2xl font-bold text-teal-600">42</div>
                  <div className="text-xs text-gray-500">Receipts</div>
                </div>
                <div className="w-px bg-gray-200" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-teal-600">₱5,240</div>
                  <div className="text-xs text-gray-500">This Month</div>
                </div>
                <div className="w-px bg-gray-200" />
                <div className="text-center">
                  <div className="text-2xl font-bold text-teal-600">15</div>
                  <div className="text-xs text-gray-500">Categories</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Content Section */}
      <div className="flex-1 bg-gray-50 rounded-t-3xl pt-28 px-4 pb-8">
        <div className="max-w-md mx-auto space-y-6">
          {/* Account Settings Section */}
          {/* <div>
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
              Account Settings
            </h3>
            <Card className="border-0 shadow-sm">
              <CardContent className="p-0">
                {menuItems.map((item, index) => (
                  <button
                    key={index}
                    onClick={item.action}
                    className="w-full flex items-center gap-4 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0"
                  >
                    <div className="w-10 h-10 rounded-full bg-teal-50 flex items-center justify-center">
                      <item.icon className="w-5 h-5 text-teal-600" />
                    </div>
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-900">
                        {item.title}
                      </div>
                      <div className="text-sm text-gray-500">
                        {item.description}
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400" />
                  </button>
                ))}
              </CardContent>
            </Card>
          </div> */}

          {/* Danger Zone */}
          <div>
            {/* <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 px-2">
              Danger Zone
            </h3> */}
            <Card className="border-0 shadow-sm">
              <CardContent className="p-4">
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 px-4 rounded-xl font-semibold hover:from-red-600 hover:to-red-700 transition-all duration-200 shadow-lg shadow-red-500/30 hover:shadow-xl hover:shadow-red-500/40"
                >
                  <LogOut className="w-5 h-5" />
                  Sign Out
                </button>
              </CardContent>
            </Card>
          </div>

          {/* Version Info */}
          <div className="text-center text-sm text-gray-400 pt-4">
            Reseepts v1.0.0
          </div>
        </div>
      </div>
    </div>
  );
}
