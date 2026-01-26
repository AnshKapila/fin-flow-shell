import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface AddInvestmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  defaultType?: string;
}

const assetTypes = [
  { id: "stocks", label: "Stocks" },
  { id: "mutual-funds", label: "Mutual Funds" },
  { id: "gold", label: "Gold" },
  { id: "fd", label: "Fixed Deposit" },
  { id: "savings", label: "Savings Account" },
];

export function AddInvestmentModal({ open, onOpenChange, defaultType }: AddInvestmentModalProps) {
  const [assetType, setAssetType] = useState(defaultType || "");
  const [name, setName] = useState("");
  const [investedValue, setInvestedValue] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [notes, setNotes] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock save - in real app this would update state/API
    console.log("Adding investment:", { assetType, name, investedValue, currentValue, notes });
    onOpenChange(false);
    resetForm();
  };

  const resetForm = () => {
    setAssetType(defaultType || "");
    setName("");
    setInvestedValue("");
    setCurrentValue("");
    setNotes("");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90%] rounded-2xl bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Add Investment</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="asset-type" className="text-muted-foreground">Asset Type</Label>
            <Select value={assetType} onValueChange={setAssetType}>
              <SelectTrigger className="bg-muted border-border">
                <SelectValue placeholder="Select asset type" />
              </SelectTrigger>
              <SelectContent>
                {assetTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="name" className="text-muted-foreground">Name / Label</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., HDFC Bank Shares"
              className="bg-muted border-border"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="invested" className="text-muted-foreground">Invested Amount</Label>
              <Input
                id="invested"
                type="number"
                value={investedValue}
                onChange={(e) => setInvestedValue(e.target.value)}
                placeholder="₹0"
                className="bg-muted border-border"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="current" className="text-muted-foreground">Current Value</Label>
              <Input
                id="current"
                type="number"
                value={currentValue}
                onChange={(e) => setCurrentValue(e.target.value)}
                placeholder="₹0"
                className="bg-muted border-border"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-muted-foreground">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Why did you invest?"
              className="bg-muted border-border resize-none"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-border"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Add Investment
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
