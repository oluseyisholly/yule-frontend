"use client";

import { useEffect } from "react";
import { Toaster, toast } from "react-hot-toast";
import { consumePendingApiToast } from "@/lib/api";

export default function HotToastProvider() {
  useEffect(() => {
    const pendingToast = consumePendingApiToast();

    if (!pendingToast) {
      return;
    }

    if (pendingToast.type === "success") {
      toast.success(pendingToast.message, { id: pendingToast.id });
      return;
    }

    toast.error(pendingToast.message, { id: pendingToast.id });
  }, []);

  return (
    <Toaster
      position="top-right"
      containerClassName="font-medium"
      toastOptions={{
        duration: 4000,
        style: {
          borderRadius: "14px",
          background: "#FFFFFF",
          color: "#434343",
          border: "1px solid #EFE6FD",
          boxShadow: "0 12px 32px rgba(49, 14, 202, 0.08)",
        },
      }}
    />
  );
}
