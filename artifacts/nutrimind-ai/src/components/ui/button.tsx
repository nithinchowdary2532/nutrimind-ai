import * as React from "react";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "secondary" | "ghost-muted";
  size?: "default" | "sm" | "lg" | "icon";
  showArrow?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "outline", size = "default", showArrow = false, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-md font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm": variant === "default",
            "border-2 border-primary text-primary hover:bg-primary/5": variant === "outline",
            "bg-secondary text-secondary-foreground hover:bg-secondary/90 shadow-sm": variant === "secondary",
            "hover:bg-accent hover:text-accent-foreground": variant === "ghost",
            "hover:bg-muted text-muted-foreground hover:text-foreground": variant === "ghost-muted",
            "h-10 px-4 py-2": size === "default",
            "h-9 rounded-md px-3": size === "sm",
            "h-11 rounded-md px-8": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        {...props}
      >
        {children}
        {showArrow && <ArrowUpRight className="ml-2 h-4 w-4" />}
      </button>
    );
  }
);
Button.displayName = "Button";

export { Button };
