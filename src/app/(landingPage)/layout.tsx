import type { ReactNode } from "react";
import Script from "next/script";
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
      <Script id="landing-sso-no-flash" strategy="beforeInteractive">
        {`
          (function () {
            try {
              var params = new URLSearchParams(window.location.search);
              if (params.get("code")) {
                document.documentElement.setAttribute("data-pending-sso", "true");
              } else {
                document.documentElement.removeAttribute("data-pending-sso");
              }
            } catch (error) {}
          })();
        `}
      </Script>
      <div className="landing-shell-hide-on-sso">
        <Header />
      </div>
      <LandingPageMotionShell className="landing-shell-motion flex-1 !bg-white px-5 sm:px-6 md:px-10 lg:px-20 xl:px-28">
        {children}
      </LandingPageMotionShell>
      <div className="landing-shell-hide-on-sso">
        <Footer />
      </div>
    </>
  );
}
