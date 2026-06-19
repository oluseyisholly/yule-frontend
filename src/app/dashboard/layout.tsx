"use client";

import Link from "next/link";
import { Manrope } from "next/font/google";
import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import DashboardHeader from "@/components/dashboard/Header";
import MobileSidebar from "@/components/dashboard/MobileSidebar";
import DashboardSidebarNav from "@/components/dashboard/SidebarNav";
import TopAlert from "@/components/dashboard/TopAlert";
import { YuleWordmarkIcon } from "@/components/dashboard/icons";
import { resetApiLogoutState } from "@/lib/api";
import { cn } from "@/lib/utils";
import {
  clearStoredAuthSession,
  getStoredAuthToken,
  useAuthStore,
} from "@/stores/auth-store";

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
  const [isAuthReady, setIsAuthReady] = useState(false);
  const token = useAuthStore((state) => state.token);

  useEffect(() => {
    const resolvedToken = token ?? getStoredAuthToken();

    if (!resolvedToken) {
      clearStoredAuthSession();
      window.location.assign("/");
      return;
    }

    resetApiLogoutState();
    setIsAuthReady(true);
  }, [token]);

  if (!isAuthReady) {
    return null;
  }

  return (
    <div
      className={cn(
        manrope.className,
        "min-h-screen bg-[#F5F6FA] lg:flex lg:h-screen lg:overflow-hidden",
      )}
    >
      <MobileSidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      <aside className="hidden bg-white px-6 py-10 lg:block lg:h-screen lg:w-[288px] lg:shrink-0 lg:overflow-y-auto lg:px-7 lg:py-12">
        <Link href="/" className="mb-10 ml-[32px] block w-fit">
          <YuleWordmarkIcon
            className="h-auto w-[66px]"
            role="img"
            aria-label="Yule logo"
          />
        </Link>

        <DashboardSidebarNav />
      </aside>
      <main className="flex-1 lg:flex lg:min-h-0 lg:flex-col lg:overflow-hidden">
        <DashboardHeader
          onMobileMenuToggle={() => setIsMobileSidebarOpen(true)}
        />

        <div className="px-6 py-4 space-y-6 lg:min-h-0 lg:flex-1 lg:overflow-y-auto">
          <TopAlert
            title="Lorem ipsum dolor sit amet consectetur. Auctor aliquet sem vulputate diam."
            externalLink="/"
          />
          {children}
        </div>
      </main>
    </div>
  );
}
