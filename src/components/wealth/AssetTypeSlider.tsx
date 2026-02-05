 import { NavLink, useLocation, useNavigate } from "react-router-dom";
 import { useRef, useState, useEffect } from "react";

const assetTypes = [
  { id: "stocks", label: "Stocks", path: "/wealth/stocks" },
  { id: "mutual-funds", label: "Mutual Funds", path: "/wealth/mutual-funds" },
  { id: "gold", label: "Gold", path: "/wealth/gold" },
  { id: "fd", label: "FD", path: "/wealth/fd" },
  { id: "savings", label: "Savings", path: "/wealth/savings" },
];

export function AssetTypeSlider() {
  const location = useLocation();
   const navigate = useNavigate();
   const containerRef = useRef<HTMLDivElement>(null);
   const [touchStart, setTouchStart] = useState<number | null>(null);
   const [touchEnd, setTouchEnd] = useState<number | null>(null);
  
  const isActive = (path: string) => {
    return location.pathname === path || location.pathname.startsWith(path + "/");
  };

   // Find current active index
   const currentIndex = assetTypes.findIndex(type => isActive(type.path));
 
   // Minimum swipe distance for triggering navigation
   const minSwipeDistance = 50;
 
   const handleTouchStart = (e: React.TouchEvent) => {
     setTouchEnd(null);
     setTouchStart(e.targetTouches[0].clientX);
   };
 
   const handleTouchMove = (e: React.TouchEvent) => {
     setTouchEnd(e.targetTouches[0].clientX);
   };
 
   const handleTouchEnd = () => {
     if (!touchStart || !touchEnd) return;
     
     const distance = touchStart - touchEnd;
     const isLeftSwipe = distance > minSwipeDistance;
     const isRightSwipe = distance < -minSwipeDistance;
     
     if (isLeftSwipe && currentIndex < assetTypes.length - 1) {
       // Swipe left - go to next tab
       navigate(assetTypes[currentIndex + 1].path);
     } else if (isRightSwipe && currentIndex > 0) {
       // Swipe right - go to previous tab
       navigate(assetTypes[currentIndex - 1].path);
     }
     
     setTouchStart(null);
     setTouchEnd(null);
   };
 
   // Auto-scroll to active tab
   useEffect(() => {
     if (containerRef.current && currentIndex >= 0) {
       const container = containerRef.current;
       const tabs = container.querySelectorAll('a');
       if (tabs[currentIndex]) {
         const tab = tabs[currentIndex] as HTMLElement;
         const containerWidth = container.offsetWidth;
         const tabLeft = tab.offsetLeft;
         const tabWidth = tab.offsetWidth;
         const scrollLeft = tabLeft - (containerWidth / 2) + (tabWidth / 2);
         container.scrollTo({ left: Math.max(0, scrollLeft), behavior: 'smooth' });
       }
     }
   }, [currentIndex]);
 
  return (
     <div 
       ref={containerRef}
       className="scrollbar-hide overflow-x-auto border-b border-border"
       onTouchStart={handleTouchStart}
       onTouchMove={handleTouchMove}
       onTouchEnd={handleTouchEnd}
     >
       <div className="flex gap-1 px-4 py-2 min-w-max">
        {assetTypes.map((type) => {
          const active = isActive(type.path);
          
          return (
            <NavLink
              key={type.id}
              to={type.path}
               className={`whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition-all select-none ${
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
       {/* Swipe indicator dots */}
       <div className="flex justify-center gap-1 py-1">
         {assetTypes.map((_, index) => (
           <div
             key={index}
             className={`h-1 w-1 rounded-full transition-all ${
               index === currentIndex ? "bg-primary w-3" : "bg-muted-foreground/30"
             }`}
           />
         ))}
       </div>
    </div>
  );
}
