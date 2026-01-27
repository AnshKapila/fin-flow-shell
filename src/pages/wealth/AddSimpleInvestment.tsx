import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const assetConfig: Record<string, { title: string; fields: { id: string; label: string; placeholder: string; required?: boolean }[] }> = {
  gold: {
    title: "Add Gold",
    fields: [
      { id: "name", label: "Name / Label", placeholder: "e.g., Digital Gold - Groww", required: true },
      { id: "quantity", label: "Quantity (grams)", placeholder: "0" },
      { id: "investedValue", label: "Invested Amount", placeholder: "₹0", required: true },
    ],
  },
  fd: {
    title: "Add Fixed Deposit",
    fields: [
      { id: "name", label: "Name / Label", placeholder: "e.g., HDFC 1-Year FD", required: true },
      { id: "bank", label: "Bank Name", placeholder: "e.g., HDFC Bank" },
      { id: "principal", label: "Principal Amount", placeholder: "₹0", required: true },
      { id: "interest", label: "Interest Rate (%)", placeholder: "7.0" },
      { id: "maturity", label: "Maturity Date", placeholder: "DD/MM/YYYY" },
    ],
  },
  savings: {
    title: "Add Savings Account",
    fields: [
      { id: "name", label: "Account Name", placeholder: "e.g., HDFC Savings", required: true },
      { id: "bank", label: "Bank Name", placeholder: "e.g., HDFC Bank" },
      { id: "balance", label: "Current Balance", placeholder: "₹0", required: true },
    ],
  },
};

export default function AddSimpleInvestment() {
  const navigate = useNavigate();
  const { type } = useParams<{ type: string }>();
  const config = assetConfig[type || ""] || assetConfig.gold;
  
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState("");

  const handleFieldChange = (fieldId: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Adding investment:", { type, ...formData, notes });
    navigate("/wealth/" + type);
  };

  const handleCancel = () => {
    navigate("/wealth/" + type);
  };

  return (
    <div className="animate-fade-in min-h-screen bg-background">
      <PageHeader 
        title={config.title} 
        showBack 
      />
      
      <div className="px-4 py-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {config.fields.map((field) => (
            <div key={field.id} className="space-y-2">
              <Label htmlFor={field.id} className="text-muted-foreground">
                {field.label}
                {field.required && <span className="text-destructive ml-1">*</span>}
              </Label>
              <Input
                id={field.id}
                value={formData[field.id] || ""}
                onChange={(e) => handleFieldChange(field.id, e.target.value)}
                placeholder={field.placeholder}
                className="bg-muted border-border"
                required={field.required}
              />
            </div>
          ))}

          <div className="space-y-2">
            <Label htmlFor="notes" className="text-muted-foreground">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              className="bg-muted border-border resize-none"
              rows={3}
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="flex-1 border-border"
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1">
              Save
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
