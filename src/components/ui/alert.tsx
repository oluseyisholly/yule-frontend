import * as React from "react";
import { cn } from "@/lib/utils";

function Alert({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      role="alert"
      className={cn(
        "relative w-full rounded-2xl border border-transparent px-4 py-3",
        className,
      )}
      {...props}
    />
  );
}

export { Alert };
