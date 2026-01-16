import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-all duration-fast ease-standard focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-40 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-primary text-primary-foreground shadow-s hover:brightness-110 active:brightness-95 rounded-md",
        destructive:
          "bg-destructive text-destructive-foreground shadow-s hover:brightness-110 active:brightness-95 rounded-md",
        outline:
          "border border-primary-300 bg-background text-primary-700 hover:bg-primary-50 active:bg-primary-100 rounded-md",
        secondary:
          "bg-secondary text-secondary-foreground shadow-s hover:bg-muted active:bg-muted/80 rounded-md",
        ghost:
          "text-foreground hover:bg-muted active:bg-muted/80 rounded-md",
        link: 
          "text-primary underline-offset-4 hover:underline",
        subtle:
          "text-primary-700 hover:bg-primary-50 active:bg-primary-100 rounded-md",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 px-3 rounded-md text-sm",
        lg: "h-10 px-5 rounded-md",
        icon: "h-9 w-9 rounded-md",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
