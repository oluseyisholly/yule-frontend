"use client";

import Link from "next/link";
import { Manrope } from "next/font/google";
import type { ReactNode } from "react";
import { useState } from "react";
import DashboardHeader from "@/components/dashboard/Header";
import MobileSidebar from "@/components/dashboard/MobileSidebar";
import DashboardSidebarNav from "@/components/dashboard/SidebarNav";
import TopAlert from "@/components/dashboard/TopAlert";
import { YuleWordmarkIcon } from "@/components/dashboard/icons";
import { cn } from "@/lib/utils";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export default function DashboardLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div
      className={cn(
        manrope.className,
        "min-h-screen bg-[#F5F6FA] lg:flex",
      )}
    >
      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      <aside className="hidden bg-white px-6 py-10 lg:block lg:min-h-screen lg:w-[288px] lg:px-7 lg:py-12">
        <Link href="/" className="mb-10 ml-[32px] block w-fit">
          <YuleWordmarkIcon
            className="h-auto w-[66px]"
            role="img"
            aria-label="Yule logo"
          />
        </Link>

        <DashboardSidebarNav />
      </aside>
      <main className="flex-1">
        <div>
          <DashboardHeader
            onMobileMenuToggle={() => setIsMobileSidebarOpen(true)}
          />

          <div className="px-6 py-4  space-y-6">
            <TopAlert
              title="Lorem ipsum dolor sit amet consectetur. Auctor aliquet sem vulputate diam."
              externalLink="/"
            />
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
