import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link" | "glass"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
          {
            "bg-violet-600 text-white shadow hover:bg-violet-500": variant === "default",
            "bg-red-500 text-white shadow-sm hover:bg-red-500/90": variant === "destructive",
            "border border-slate-700 bg-transparent text-slate-200 hover:bg-slate-800 hover:text-white": variant === "outline",
            "bg-slate-800 text-slate-100 shadow-sm hover:bg-slate-700": variant === "secondary",
            "hover:bg-slate-800 hover:text-white text-slate-300": variant === "ghost",
            "text-violet-400 underline-offset-4 hover:underline": variant === "link",
            "bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 text-slate-200 shadow-sm backdrop-blur-sm": variant === "glass",
          },
          {
            "h-9 px-4 py-2": size === "default",
            "h-8 rounded-md px-3 text-xs": size === "sm",
            "h-10 rounded-md px-8": size === "lg",
            "h-9 w-9": size === "icon",
          },
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
