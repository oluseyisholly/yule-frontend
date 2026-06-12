"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type CheckboxProps = React.InputHTMLAttributes<HTMLInputElement> & {
  "aria-label"?: string;
};

export default function Checkbox({ className, ...props }: CheckboxProps) {
  return (
    <input
      type="checkbox"
      {...props}
      className={cn("size-4 !border-[#D5D7DA]  cursor-pointer accent-[#3300C9]", className)}
    />
  );
}
