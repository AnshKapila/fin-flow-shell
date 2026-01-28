import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useSpendings, Spending } from "@/hooks/useSpendings";

interface EditExpenseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  expense: Spending | null;
}

const frequencies = [
  { id: "one_time", label: "One-time" },
  { id: "monthly", label: "Monthly" },
  { id: "custom", label: "Custom" },
];

const frequencyUnits = [
  { id: "day", label: "Day(s)" },
  { id: "week", label: "Week(s)" },
  { id: "month", label: "Month(s)" },
  { id: "year", label: "Year(s)" },
];

const icons = [
  { id: "Home", label: "🏠 Home", bg: "bg-blue-500" },
  { id: "Car", label: "🚗 Car", bg: "bg-green-500" },
  { id: "Laptop", label: "💻 Laptop", bg: "bg-purple-500" },
  { id: "Wifi", label: "📶 Internet", bg: "bg-cyan-500" },
  { id: "Zap", label: "⚡ Electricity", bg: "bg-yellow-500" },
  { id: "Tv", label: "📺 Entertainment", bg: "bg-pink-500" },
  { id: "Dumbbell", label: "🏋️ Fitness", bg: "bg-orange-500" },
  { id: "ShoppingBag", label: "🛍️ Shopping", bg: "bg-red-500" },
];

export function EditExpenseModal({ open, onOpenChange, expense }: EditExpenseModalProps) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [frequency, setFrequency] = useState("monthly");
  const [frequencyInterval, setFrequencyInterval] = useState("1");
  const [frequencyUnit, setFrequencyUnit] = useState("month");
  const [icon, setIcon] = useState("Home");

  const { updateSpending } = useSpendings();

  useEffect(() => {
    if (expense) {
      setName(expense.name);
      setAmount(expense.amount.toString());
      setFrequency(expense.frequency_type);
      setFrequencyInterval(expense.frequency_interval?.toString() || "1");
      setFrequencyUnit(expense.frequency_unit || "month");
      setIcon(expense.icon || "Home");
    }
  }, [expense]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!expense) return;
    
    const selectedIcon = icons.find(i => i.id === icon);
    
    await updateSpending.mutateAsync({
      id: expense.id,
      name,
      amount: parseFloat(amount) || 0,
      frequency_type: frequency,
      frequency_interval: frequency === "custom" ? parseInt(frequencyInterval) || 1 : null,
      frequency_unit: frequency === "custom" ? frequencyUnit : null,
      icon: icon,
      icon_bg: selectedIcon?.bg || "bg-blue-500",
    });
    
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[90%] rounded-2xl bg-card border-border sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Edit Expense</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="edit-expense-name" className="text-muted-foreground">Expense Name</Label>
            <Input
              id="edit-expense-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Rent"
              className="bg-muted border-border"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-icon" className="text-muted-foreground">Category Icon</Label>
            <Select value={icon} onValueChange={setIcon}>
              <SelectTrigger className="bg-muted border-border">
                <SelectValue placeholder="Select icon" />
              </SelectTrigger>
              <SelectContent>
                {icons.map((ic) => (
                  <SelectItem key={ic.id} value={ic.id}>
                    {ic.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="edit-amount" className="text-muted-foreground">Amount</Label>
              <Input
                id="edit-amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="₹0"
                className="bg-muted border-border"
                required
                min="1"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-frequency" className="text-muted-foreground">Frequency</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger className="bg-muted border-border">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {frequencies.map((freq) => (
                    <SelectItem key={freq.id} value={freq.id}>
                      {freq.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {frequency === "custom" && (
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="edit-frequency-interval" className="text-muted-foreground">Every</Label>
                <Input
                  id="edit-frequency-interval"
                  type="number"
                  value={frequencyInterval}
                  onChange={(e) => setFrequencyInterval(e.target.value)}
                  placeholder="1"
                  className="bg-muted border-border"
                  min="1"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-frequency-unit" className="text-muted-foreground">Unit</Label>
                <Select value={frequencyUnit} onValueChange={setFrequencyUnit}>
                  <SelectTrigger className="bg-muted border-border">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {frequencyUnits.map((unit) => (
                      <SelectItem key={unit.id} value={unit.id}>
                        {unit.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="flex-1 border-border"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={updateSpending.isPending}
            >
              {updateSpending.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
