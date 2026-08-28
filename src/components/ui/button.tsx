import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
const buttonVariants = cva("inline-flex items-center justify-center rounded-xl text-sm font-semibold transition-all focus-visible:outline-none disabled:opacity-50", {
  variants: {
    variant: { default: "bg-[#C3281E] text-white hover:bg-[#9F1F18] shadow-lg", outline: "border border-zinc-300 bg-white hover:bg-zinc-50", ghost: "hover:bg-zinc-100", premium: "bg-zinc-900 text-white hover:bg-black border border-zinc-700" },
    size: { default: "h-11 px-6 py-2", sm: "h-9 px-4", lg: "h-12 px-8 text-base", icon: "h-10 w-10" },
  }, defaultVariants: { variant: "default", size: "default" },
});
export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> { asChild?: boolean }
export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, ...props }, ref) => (
  <button className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />
));
Button.displayName = "Button";
