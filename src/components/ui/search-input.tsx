"use client";

import * as React from "react";
import { SearchIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type SearchInputProps = Omit<
  React.ComponentProps<typeof Input>,
  "type"
> & {
  containerClassName?: string;
  iconClassName?: string;
};

const SearchInput = React.forwardRef<HTMLInputElement, SearchInputProps>(
  ({ containerClassName, className, iconClassName, ...props }, ref) => {
    return (
      <div className={cn("relative w-full", containerClassName)}>
        <SearchIcon
          aria-hidden="true"
          className={cn(
            "pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#716F6F]",
            iconClassName,
          )}
        />
        <Input
          ref={ref}
          type="search"
          className={cn("pl-9", className)}
          {...props}
        />
      </div>
    );
  },
);

SearchInput.displayName = "SearchInput";

export { SearchInput };
