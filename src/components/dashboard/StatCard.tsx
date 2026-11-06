import * as React from "react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: string;
    isPositive: boolean;
  };
  variant?: "primary" | "warning" | "destructive" | "success" | "purple";
}

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  variant = "primary",
}: StatCardProps) {
  const variantStyles = {
    primary: "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20",
    warning: "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20",
    destructive: "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20",
    success: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20",
    purple: "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20",
  };

  return (
    <div className="rounded-2xl border border-border bg-card p-5 shadow-sm transition-all hover:shadow-md">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl border", variantStyles[variant])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2">
        <span className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
          {value}
        </span>
        {trend && (
          <span
            className={cn(
              "text-xs font-semibold",
              trend.isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-rose-600 dark:text-rose-400"
            )}
          >
            {trend.value}
          </span>
        )}
      </div>

      {subtitle && (
        <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
      )}
    </div>
  );
}
