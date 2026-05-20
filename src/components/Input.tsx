"use client";

import { useField } from "formik";
import { useState, type InputHTMLAttributes } from "react";
import { Input as ShadcnInput } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type InputProps = {
  label?: string;
  name: string;
  hint?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "name">;

export default function Input({
  label,
  name,
  type = "text",
  hint,
  className,
  ...rest
}: InputProps) {
  const [field, meta] = useField(name);
  const [showPassword, setShowPassword] = useState(false);

  const hasError = Boolean(meta.touched && meta.error);
  const isPassword = type === "password";
  const inputType = isPassword && showPassword ? "text" : type;

  return (
    <div className={cn("flex flex-col gap-1.5 w-full", className)}>
      {label && (
        <label htmlFor={name} className="text-sm font-medium text-dark">
          {label}
        </label>
      )}

      <div className="relative">
        <ShadcnInput
          id={name}
          type={inputType}
          aria-invalid={hasError || undefined}
          {...field}
          {...rest}
          className={cn(
            "h-auto bg-white text-dark text-sm px-4 py-3 rounded-lg border-gray-300 placeholder:text-gray-400 focus-visible:border-primary focus-visible:ring-primary/20",
            isPassword && "pr-12"
          )}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-primary cursor-pointer"
          >
            {showPassword ? "Hide" : "Show"}
          </button>
        )}
      </div>

      {hasError ? (
        <span className="text-xs text-red-500">{meta.error}</span>
      ) : hint ? (
        <span className="text-xs text-muted">{hint}</span>
      ) : null}
    </div>
  );
}
