"use client";

import { ChartPie, House, User, WalletMinimal } from "lucide-react";
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
    { icon: <WalletMinimal />, route: "/budget" },
    { icon: <User />, route: "/account" },
  ];

  return (
    <div className="grid grid-cols-4 items-center sticky bottom-0 rounded-t-md shadow-2xl">
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
