import { ReactNode } from "react";
import { MoreHorizontal } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface ListCardProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export function ListCard({ children, onClick, className = "" }: ListCardProps) {
  return (
    <div 
      className={`rounded-xl bg-card p-4 shadow-card transition-colors hover:bg-fintrack-card-hover ${onClick ? "cursor-pointer" : ""} ${className}`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

interface ListCardWithIconProps {
  icon: ReactNode;
  iconBg?: string;
  title: string;
  subtitle?: string;
  value: string | ReactNode;
  secondaryValue?: string;
  onClick?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function ListCardWithIcon({
  icon,
  iconBg = "bg-primary",
  title,
  subtitle,
  value,
  secondaryValue,
  onClick,
  onEdit,
  onDelete,
}: ListCardWithIconProps) {
  return (
    <ListCard onClick={onClick}>
      <div className="flex items-center gap-4">
        <div className={`flex h-11 w-11 items-center justify-center rounded-xl ${iconBg}`}>
          {icon}
        </div>
        
        <div className="flex-1 min-w-0">
          <p className="font-medium text-foreground truncate">{title}</p>
          {subtitle && (
            <p className="text-sm text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>
        
        <div className="flex items-center gap-2">
          <div className="text-right">
            <div className="font-semibold text-foreground">{value}</div>
            {secondaryValue && (
              <div className="text-sm text-muted-foreground">{secondaryValue}</div>
            )}
          </div>
          
          {(onEdit || onDelete) && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button 
                  className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-5 w-5" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {onEdit && (
                  <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(); }}>
                    Edit
                  </DropdownMenuItem>
                )}
                {onDelete && (
                  <DropdownMenuItem 
                    onClick={(e) => { e.stopPropagation(); onDelete(); }}
                    className="text-destructive"
                  >
                    Delete
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>
    </ListCard>
  );
}

interface HoldingCardProps {
  name: string;
  subtitle?: string;
  value: string;
  invested?: string;
  returns?: string;
  returnsPercent?: string;
  isPositive?: boolean;
  onClick?: () => void;
}

export function HoldingCard({
  name,
  subtitle,
  value,
  invested,
  returns,
  returnsPercent,
  isPositive = true,
  onClick,
}: HoldingCardProps) {
  return (
    <div 
      className="flex items-center justify-between py-4 border-b border-border last:border-b-0 cursor-pointer hover:bg-muted/30 px-1 -mx-1 rounded-lg transition-colors"
      onClick={onClick}
    >
      <div>
        <p className="font-medium text-foreground">{name}</p>
        {subtitle && (
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        )}
      </div>
      
      <div className="text-right">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground">{value}</span>
          {returns && (
            <span className={isPositive ? "text-fintrack-green text-sm" : "text-fintrack-red-soft text-sm"}>
              {returns}
            </span>
          )}
        </div>
        {invested && (
          <p className="text-sm text-muted-foreground">Inv: {invested}</p>
        )}
      </div>
    </div>
  );
}
