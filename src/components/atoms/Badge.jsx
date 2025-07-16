import React from "react";
import { cn } from "@/utils/cn";

const Badge = React.forwardRef(({ 
  className, 
  variant = "info", 
  children,
  ...props 
}, ref) => {
  const variants = {
    success: "badge badge-success",
    warning: "badge badge-warning",
    error: "badge badge-error",
    info: "badge badge-info",
  };

  return (
    <span
      ref={ref}
      className={cn(variants[variant], className)}
      {...props}
    >
      {children}
    </span>
  );
});

Badge.displayName = "Badge";

export default Badge;