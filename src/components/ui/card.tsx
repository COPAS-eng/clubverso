import { cn } from "@/lib/utils";
export function Card({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) { return <div className={cn("rounded-2xl border bg-white shadow-sm", className)} {...p} />; }
export function CardHeader({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) { return <div className={cn("p-6 pb-3", className)} {...p} />; }
export function CardContent({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) { return <div className={cn("p-6 pt-0", className)} {...p} />; }
export function CardTitle({ className, ...p }: React.HTMLAttributes<HTMLHeadingElement>) { return <h3 className={cn("text-lg font-bold leading-none", className)} {...p} />; }
