"use client";

import type { ReactNode } from "react";
import HotToastProvider from "@/components/providers/HotToastProvider";
import ReactQueryProvider from "@/components/providers/ReactQueryProvider";

type AppProvidersProps = {
  children: ReactNode;
};

export default function AppProviders({ children }: AppProvidersProps) {
  return (
    <ReactQueryProvider>
      <HotToastProvider />
      {children}
    </ReactQueryProvider>
  );
}
