import Link from "next/link";
import { Button as ShadcnButton } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ButtonProps = {
  label?: string;
  href?: string;
  variant?: "filled" | "outlined" | "ghost";
} & React.ComponentProps<"button">;

export default function Button({
  label,
  href,
  variant = "filled",
  className,
  children,
  ...rest
}: ButtonProps) {
  const variantClasses = {
    filled:
      "!bg-[#3300C9] text-white hover:opacity-90 rounded-full px-6 py-2.5",
    outlined:
      "bg-transparent border border-primary text-primary hover:opacity-90 rounded-full px-6 py-2.5",
    ghost:
      "bg-transparent text-current hover:bg-transparent rounded-none border-0",
  };

  const classes = cn(
    "h-auto text-sm font-semibold cursor-pointer whitespace-nowrap transition-all",
    variantClasses[variant],
    className
  );

  const content = children ?? label;

  if (href) {
    return (
      <ShadcnButton asChild className={classes}>
        <Link href={href}>{content}</Link>
      </ShadcnButton>
    );
  }

  return (
    <ShadcnButton className={classes} {...rest}>
      {content}
    </ShadcnButton>
  );
}
