import { Plus } from "lucide-react";
import { Button } from "./button";

interface FloatingActionButtonProps {
  label: string;
  onClick: () => void;
  variant?: "primary" | "destructive";
}

export function FloatingActionButton({ 
  label, 
  onClick, 
  variant = "primary" 
}: FloatingActionButtonProps) {
  return (
    <div className="fixed bottom-24 left-0 right-0 z-40 flex justify-center px-4">
      <Button 
        onClick={onClick}
        className={`flex items-center gap-2 rounded-full px-6 py-3 text-base font-semibold shadow-elevated ${
          variant === "primary" 
            ? "bg-primary hover:bg-fintrack-blue-dark" 
            : "bg-destructive hover:bg-fintrack-red"
        }`}
        size="lg"
      >
        <Plus className="h-5 w-5" />
        {label}
      </Button>
    </div>
  );
}
