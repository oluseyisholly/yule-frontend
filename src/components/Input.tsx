"use client";

import { useField } from "formik";
import { useState, type InputHTMLAttributes } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Input as ShadcnInput } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type InputProps = {
  label?: string;
  name: string;
  hint?: string;
  inputClassName?: string;
} & Omit<InputHTMLAttributes<HTMLInputElement>, "name">;

export default function Input({
  label,
  name,
  type = "text",
  hint,
  className,
  inputClassName,
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
        <label htmlFor={name} className="text-[14px] font-medium text-dark">
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
            "h-12 bg-white text-dark text-[14px] px-4 py-3 rounded-lg border-gray-300 placeholder:text-gray-400 focus-visible:border-primary focus-visible:ring-primary/20",
            isPassword && "pr-11",
            inputClassName
          )}
        />

        {isPassword && (
          <button
            type="button"
            onClick={() => setShowPassword((s) => !s)}
            aria-label={showPassword ? "Hide password" : "Show password"}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-dark cursor-pointer"
          >
            {showPassword ? (
              <Eye className="w-5 h-5" />
            ) : (
              <EyeOff className="w-5 h-5" />
            )}
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
