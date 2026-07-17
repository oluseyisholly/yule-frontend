import type { ReactNode } from "react";
import Header from "@/layouts/Header";
import Footer from "@/layouts/Footer";
import { LandingPageMotionShell } from "@/components/LandingMotion";

export default function LandingPageLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <>
      <Header />
      <LandingPageMotionShell className="flex-1 !bg-white px-5 sm:px-6 md:px-10 lg:px-20 xl:px-28">
        {children}
      </LandingPageMotionShell>
      <Footer />
    </>
  );
}
