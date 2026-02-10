import { useState } from "react";
import { useInvestments } from "@/hooks/useInvestments";
import { useGoldPrice } from "@/hooks/useGoldPrice";
import { formatCurrency } from "@/data/mockData";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

interface LinkAssetModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goalId: string;
}

const typeLabels: Record<string, string> = {
  stocks: "Stocks",
  "mutual-funds": "Mutual Funds",
  gold: "Gold",
  fd: "Fixed Deposits",
  savings: "Savings",
};

export function LinkAssetModal({ open, onOpenChange, goalId }: LinkAssetModalProps) {
  const { investments, updateInvestment } = useInvestments();
  const { goldPrice } = useGoldPrice();
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  // Group investments: show unassigned or already assigned to this goal
  const availableAssets = investments.filter(
    (inv) => !inv.goal_id || inv.goal_id === goalId
  );

  const grouped = availableAssets.reduce((acc, inv) => {
    const type = inv.type || "other";
    if (!acc[type]) acc[type] = [];
    acc[type].push(inv);
    return acc;
  }, {} as Record<string, typeof investments>);

  // Track which are already linked
  const alreadyLinked = new Set(
    investments.filter((inv) => inv.goal_id === goalId).map((inv) => inv.id)
  );

  const toggleSelection = (id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const getDisplayValue = (inv: typeof investments[0]) => {
    if (inv.type === "gold") {
      const weight = parseFloat(inv.risk_level?.replace("g", "") || "0");
      return weight * goldPrice.price_per_gram_24k;
    }
    return Number(inv.current_value);
  };

  const handleSave = async () => {
    // Link newly selected
    const toLink = [...selectedIds].filter((id) => !alreadyLinked.has(id));
    // Unlink deselected (were linked but now unchecked)
    const toUnlink = [...alreadyLinked].filter((id) => !selectedIds.has(id));

    const promises = [
      ...toLink.map((id) =>
        updateInvestment.mutateAsync({ id, goal_id: goalId } as any)
      ),
      ...toUnlink.map((id) =>
        updateInvestment.mutateAsync({ id, goal_id: null } as any)
      ),
    ];

    await Promise.all(promises);
    onOpenChange(false);
  };

  // Initialize selectedIds from already linked on open
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen) {
      setSelectedIds(new Set(alreadyLinked));
    }
    onOpenChange(isOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Link Assets to Goal</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 max-h-80 overflow-y-auto">
          {Object.entries(grouped).map(([type, assets]) => (
            <div key={type}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
                {typeLabels[type] || type}
              </p>
              <div className="space-y-1.5">
                {assets.map((inv) => {
                  const isSelected = selectedIds.has(inv.id);
                  return (
                    <button
                      key={inv.id}
                      onClick={() => toggleSelection(inv.id)}
                      className={cn(
                        "w-full text-left rounded-xl p-3 border transition-colors flex items-center justify-between",
                        isSelected
                          ? "border-primary bg-primary/10"
                          : "border-border hover:bg-muted"
                      )}
                    >
                      <div>
                        <p className="font-medium text-foreground text-sm">{inv.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatCurrency(getDisplayValue(inv))}
                        </p>
                      </div>
                      {isSelected && (
                        <Check className="h-4 w-4 text-primary shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
          {availableAssets.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">
              No available assets to link
            </p>
          )}
        </div>
        <Button className="w-full" onClick={handleSave}>
          Save
        </Button>
      </DialogContent>
    </Dialog>
  );
}
