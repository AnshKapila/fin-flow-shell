import { ChevronLeft, Bell, MoreHorizontal, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  showNotification?: boolean;
  showMore?: boolean;
  showSearch?: boolean;
  onMoreClick?: () => void;
  onSearchClick?: () => void;
}

export function PageHeader({
  title,
  subtitle,
  showBack = false,
  showNotification = false,
  showMore = false,
  showSearch = false,
  onMoreClick,
  onSearchClick,
}: PageHeaderProps) {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-background/95 backdrop-blur-lg">
      <div className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          {showBack && (
            <button
              onClick={() => navigate(-1)}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-primary transition-colors hover:bg-muted"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}
          <div>
            <h1 className="text-lg font-semibold text-foreground">{title}</h1>
            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          {showSearch && (
            <button
              onClick={onSearchClick}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <Search className="h-5 w-5" />
            </button>
          )}
          {showNotification && (
            <button className="relative flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              <Bell className="h-5 w-5" />
              <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500" />
            </button>
          )}
          {showMore && (
            <button
              onClick={onMoreClick}
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            >
              <MoreHorizontal className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
