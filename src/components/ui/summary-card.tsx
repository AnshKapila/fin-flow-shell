import { ReactNode } from "react";

interface SummaryCardProps {
  variant?: "blue" | "green" | "dark";
  children: ReactNode;
  className?: string;
}

export function SummaryCard({ variant = "blue", children, className = "" }: SummaryCardProps) {
  const variantClasses = {
    blue: "bg-gradient-card-blue",
    green: "bg-gradient-savings",
    dark: "bg-card",
  };

  return (
    <div className={`rounded-2xl p-5 shadow-elevated ${variantClasses[variant]} ${className}`}>
      {children}
    </div>
  );
}

interface SummaryLabelProps {
  children: ReactNode;
  className?: string;
}

export function SummaryLabel({ children, className = "" }: SummaryLabelProps) {
  return (
    <span className={`text-xs font-medium uppercase tracking-wide text-primary-foreground/70 ${className}`}>
      {children}
    </span>
  );
}

interface SummaryValueProps {
  children: ReactNode;
  size?: "lg" | "xl" | "2xl";
  className?: string;
}

export function SummaryValue({ children, size = "xl", className = "" }: SummaryValueProps) {
  const sizeClasses = {
    lg: "text-2xl",
    xl: "text-3xl",
    "2xl": "text-4xl",
  };

  return (
    <div className={`font-bold text-primary-foreground ${sizeClasses[size]} ${className}`}>
      {children}
    </div>
  );
}

interface SummaryRowProps {
  label: string;
  value: string;
  valueColor?: "default" | "positive" | "negative";
  showBadge?: boolean;
  badgeValue?: string;
}

export function SummaryRow({ label, value, valueColor = "default", showBadge, badgeValue }: SummaryRowProps) {
  const valueColors = {
    default: "text-primary-foreground",
    positive: "text-fintrack-green",
    negative: "text-fintrack-red-soft",
  };

  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-primary-foreground/70">{label}</span>
      <div className="flex items-center gap-2">
        <span className={`font-semibold ${valueColors[valueColor]}`}>{value}</span>
        {showBadge && badgeValue && (
          <span className="rounded-full bg-fintrack-green px-2 py-0.5 text-xs font-bold text-primary-foreground">
            {badgeValue}
          </span>
        )}
      </div>
    </div>
  );
}
