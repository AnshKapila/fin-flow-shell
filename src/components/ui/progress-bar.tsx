interface ProgressBarProps {
  value: number;
  max: number;
  variant?: "default" | "blue" | "gold";
  size?: "sm" | "md";
  className?: string;
}

export function ProgressBar({ 
  value, 
  max, 
  variant = "default", 
  size = "md",
  className = "" 
}: ProgressBarProps) {
  const percent = Math.min((value / max) * 100, 100);
  
  const sizeClasses = {
    sm: "h-1.5",
    md: "h-2",
  };
  
  const variantClasses = {
    default: "bg-gradient-to-r from-primary to-fintrack-cyan",
    blue: "bg-gradient-to-r from-primary to-fintrack-blue-light",
    gold: "bg-gradient-to-r from-fintrack-gold to-yellow-400",
  };

  return (
    <div className={`rounded-full bg-muted ${sizeClasses[size]} ${className}`}>
      <div 
        className={`h-full rounded-full transition-all duration-500 ${variantClasses[variant]}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
