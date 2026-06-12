import React from "react";

type ModalButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  leftIcon?: React.ReactNode;
  iconClassName?: string;
};

const VARIANT_CLASSES: Record<NonNullable<ModalButtonProps['variant']>, string> = {
  primary:
    "flex h-[45px] min-w-[106px] w-full items-center justify-center rounded-[16px] bg-[#3300C9] px-6 text-[18px] font-semibold text-white transition-colors hover:bg-[#2D00B4] disabled:cursor-not-allowed disabled:bg-[#BEB3EE]",
  secondary:
    "flex h-[42px] items-center justify-center rounded-[14px] border border-[#3300C9] bg-white px-6 text-[18px] font-medium text-[#3300C9] transition-colors hover:bg-[#F8F5FF]",
  ghost:
    "flex h-[42px] items-center justify-center rounded-[14px] bg-transparent text-[#3300C9]",
};

export default function ModalButton({
  variant = "primary",
  leftIcon,
  iconClassName,
  className,
  children,
  ...rest
}: ModalButtonProps) {
  const variantClasses = VARIANT_CLASSES[variant] ?? VARIANT_CLASSES.primary;

  return (
    <button {...rest} className={`${variantClasses} ${className ?? ""}`.trim()}>
      {leftIcon ? <span className={iconClassName}>{leftIcon}</span> : null}
      {children}
    </button>
  );
}
