"use client";

import * as React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

export type CheckboxProps = Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">;

/**
 * 네이티브 checkbox 위에 커스텀 체크 표식을 덧씌운 간단한 구현.
 * radix-ui/react-checkbox 를 사용하지 않아 의존성을 줄였다.
 */
const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, ...props }, ref) => (
    <span className="relative inline-flex h-5 w-5 items-center justify-center">
      <input
        ref={ref}
        type="checkbox"
        className={cn(
          "peer absolute inset-0 appearance-none rounded border border-input bg-background checked:border-primary checked:bg-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
      <Check
        aria-hidden
        className="pointer-events-none h-3.5 w-3.5 text-primary-foreground opacity-0 peer-checked:opacity-100"
      />
    </span>
  ),
);
Checkbox.displayName = "Checkbox";

export { Checkbox };
