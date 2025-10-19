"use client";

import { ChartPie, House, User, WalletMinimal } from "lucide-react";
import { useSession } from "next-auth/react";
import Link from "next/link";
import React from "react";

interface NavRoutes {
  icon: React.RefAttributes<SVGSVGElement> | typeof React.Children;
  route: string;
}

const BottomNav = () => {
  const navRoutes: NavRoutes[] = [
    { icon: <House />, route: "/home" },
    { icon: <ChartPie />, route: "/insight" },
    { icon: <WalletMinimal />, route: "/expenses" },
    { icon: <User />, route: "/account" },
  ];

  const { data: session, status } = useSession();

  if (status !== "authenticated") {
    return null;
  }

  return (
    <div className="grid grid-cols-4 items-center sticky bg-white py-1 bottom-0 left-0 right-0 w-full rounded-t-md shadow-2xl">
      {navRoutes.map((navRoute) => (
        <Link href={navRoute.route} key={navRoute.route}>
          <div className="flex flex-col justify-center items-center">
            {navRoute.icon}
            <p className="text-sm capitalize">
              {navRoute.route.replace("/", "")}
            </p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default BottomNav;
