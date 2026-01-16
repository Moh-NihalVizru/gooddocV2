import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-pill border px-3 py-1 text-[12px] font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-primary-foreground",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive text-destructive-foreground",
        outline:
          "border-border text-foreground bg-transparent",
        success:
          "border-transparent bg-success-light text-success-dark",
        warning:
          "border-transparent bg-warning-light text-warning-dark",
        error:
          "border-transparent bg-error-light text-error-dark",
        info:
          "border-transparent bg-info-light text-info-dark",
        accent:
          "border-transparent bg-accent-100 text-accent-800",
        neutral:
          "border-transparent bg-neutral-100 text-neutral-700",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
