"use client";

import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { XIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type SideDrawerProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  className?: string;
  contentClassName?: string;
};

export default function SideDrawer({
  open,
  onOpenChange,
  title = "Details",
  description,
  children,
  footer,
  className,
  contentClassName,
}: SideDrawerProps) {
  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className={cn(
            "fixed inset-0 z-[170] bg-[#101014]/45 backdrop-blur-[2px]",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=open]:fade-in-0 data-[state=closed]:fade-out-0",
          )}
        />
        <DialogPrimitive.Content
          className={cn(
            "fixed right-0 top-0 z-[171] flex h-dvh w-full max-w-[420px] flex-col overflow-hidden border-l border-[#EDE8F7] bg-white shadow-[-24px_0_60px_rgba(25,18,54,0.16)] outline-none",
            "data-[state=open]:animate-in data-[state=closed]:animate-out",
            "data-[state=open]:slide-in-from-right data-[state=closed]:slide-out-to-right",
            "duration-300 sm:max-w-[440px] lg:w-[25vw] lg:min-w-[380px] lg:max-w-[520px]",
            className,
          )}
        >
          <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#F0ECF7] px-5 py-5 sm:px-6">
            <div className="min-w-0">
              <DialogPrimitive.Title className="font-body text-[22px] font-semibold leading-tight text-[#2F2F33]">
                {title}
              </DialogPrimitive.Title>
              {description ? (
                <DialogPrimitive.Description className="mt-1 text-[13px] leading-5 text-[#7D7888]">
                  {description}
                </DialogPrimitive.Description>
              ) : null}
            </div>

            <DialogPrimitive.Close className="inline-flex size-9 shrink-0 items-center justify-center rounded-full bg-[#F6F2FB] text-[#434343] transition-colors hover:bg-[#EEE7FA]">
              <XIcon className="size-4" />
              <span className="sr-only">Close drawer</span>
            </DialogPrimitive.Close>
          </div>

          <div
            className={cn(
              "min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-6",
              contentClassName,
            )}
          >
            {children}
          </div>

          {footer ? (
            <div className="shrink-0 border-t border-[#F0ECF7] bg-white px-5 py-4 sm:px-6">
              {footer}
            </div>
          ) : null}
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
