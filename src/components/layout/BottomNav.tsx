import { NavLink, useLocation } from "react-router-dom";
import { Home, Wallet, Target, Receipt } from "lucide-react";

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/wealth", label: "Wealth", icon: Wallet },
  { path: "/goals", label: "Goals", icon: Target },
  { path: "/spendings", label: "Spendings", icon: Receipt },
];

export function BottomNav() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/") return location.pathname === "/";
    return location.pathname.startsWith(path);
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background/95 backdrop-blur-lg pb-safe">
      <div className="mx-auto max-w-md">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const active = isActive(item.path);
            const Icon = item.icon;
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={`flex flex-col items-center gap-1 px-4 py-2 text-xs font-medium transition-colors ${
                  active 
                    ? "text-primary" 
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon 
                  className={`h-5 w-5 transition-all ${
                    active ? "scale-110" : ""
                  }`} 
                  strokeWidth={active ? 2.5 : 2}
                />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
