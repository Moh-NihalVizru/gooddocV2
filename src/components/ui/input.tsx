import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-card px-3 py-1.5 text-xs transition-all duration-fast ease-standard",
          "file:border-0 file:bg-transparent file:text-xs file:font-medium file:text-foreground",
          "placeholder:text-muted-foreground placeholder:text-xs",
          "focus:outline-none focus-visible:outline-none focus-visible:border-primary",
          "disabled:cursor-not-allowed disabled:opacity-40 disabled:bg-muted",
          className,
        )}
        ref={ref}
        {...props}
      />
    );
  },
);
Input.displayName = "Input";

export { Input };
