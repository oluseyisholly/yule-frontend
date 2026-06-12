"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ModalStepLayoutProps = {
  header?: ReactNode;
  footer?: ReactNode;
  children?: ReactNode;
  className?: string;
  headerClassName?: string;
  contentClassName?: string;
  footerClassName?: string;
};

export default function ModalStepLayout({
  header,
  footer,
  children,
  className,
  headerClassName,
  contentClassName,
  footerClassName,
}: ModalStepLayoutProps) {
  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)}>
      {header ? (
        <div className={cn("shrink-0", headerClassName)}>{header}</div>
      ) : null}

      <div className={cn("min-h-0 flex-1 overflow-y-auto", contentClassName)}>
        {children}
      </div>

      {footer ? (
        <div className={cn("shrink-0", footerClassName)}>{footer}</div>
      ) : null}
    </div>
  );
}
