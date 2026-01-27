import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { TrendingUp, PieChart, Coins, Building, Wallet } from "lucide-react";

interface AssetTypeSelectionModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelectType: (type: string) => void;
}

const assetTypes = [
  { id: "stocks", label: "Stocks", icon: TrendingUp, description: "Individual company shares" },
  { id: "mutual-funds", label: "Mutual Funds", icon: PieChart, description: "Diversified fund investments" },
  { id: "gold", label: "Gold", icon: Coins, description: "Physical or digital gold holdings" },
  { id: "fd", label: "Fixed Deposit", icon: Building, description: "Bank fixed deposits" },
  { id: "savings", label: "Savings", icon: Wallet, description: "Savings account balances" },
];

export function AssetTypeSelectionModal({ open, onOpenChange, onSelectType }: AssetTypeSelectionModalProps) {
  const handleSelect = (typeId: string) => {
    onSelectType(typeId);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90%] rounded-2xl bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Choose Asset Type</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-2 pt-2">
          {assetTypes.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.id}
                onClick={() => handleSelect(type.id)}
                className="flex w-full items-center gap-4 rounded-xl bg-muted p-4 transition-colors hover:bg-muted/80"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground">{type.label}</p>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </DialogContent>
    </Dialog>
  );
}
