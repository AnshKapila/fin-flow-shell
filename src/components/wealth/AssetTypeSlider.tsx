import { NavLink, useLocation } from "react-router-dom";

const assetTypes = [
  { id: "stocks", label: "Stocks", path: "/wealth/stocks" },
  { id: "mutual-funds", label: "Mutual Funds", path: "/wealth/mutual-funds" },
  { id: "gold", label: "Gold", path: "/wealth/gold" },
  { id: "fd", label: "FD", path: "/wealth/fd" },
  { id: "savings", label: "Savings", path: "/wealth/savings" },
];

export function AssetTypeSlider() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

  return (
    <div className="scrollbar-hide overflow-x-auto border-b border-border">
      <div className="flex gap-1 px-4 py-2">
        {assetTypes.map((type) => {
          const active = isActive(type.path);
          
          return (
            <NavLink
              key={type.id}
              to={type.path}
              className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                active
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {type.label}
            </NavLink>
          );
        })}
      </div>
    </div>
  );
}
