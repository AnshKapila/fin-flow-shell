import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useInvestments, InvestmentType } from "@/hooks/useInvestments";
import { toast } from "sonner";

const assetConfig: Record<string, { 
  title: string; 
  type: InvestmentType;
  fields: { id: string; label: string; placeholder: string; required?: boolean; type?: string }[] 
}> = {
  gold: {
    title: "Add Gold",
    type: "gold",
    fields: [
      { id: "name", label: "Name / Label", placeholder: "e.g., Digital Gold - Groww", required: true },
      { id: "invested_value", label: "Invested Amount", placeholder: "₹0", required: true, type: "number" },
      { id: "current_value", label: "Current Value", placeholder: "₹0 (optional)", type: "number" },
      { id: "interest_rate", label: "Interest Rate (%) - for SGB", placeholder: "2.5", type: "number" },
      { id: "maturity_date", label: "Maturity Date - for SGB", placeholder: "e.g., Dec 2029" },
    ],
  },
  fd: {
    title: "Add Fixed Deposit",
    type: "fd",
    fields: [
      { id: "name", label: "Name / Label", placeholder: "e.g., HDFC 1-Year FD", required: true },
      { id: "bank", label: "Bank Name", placeholder: "e.g., HDFC Bank" },
      { id: "invested_value", label: "Principal Amount", placeholder: "₹0", required: true, type: "number" },
      { id: "interest_rate", label: "Interest Rate (%)", placeholder: "7.0", type: "number" },
      { id: "maturity_value", label: "Maturity Value", placeholder: "₹0", type: "number" },
      { id: "maturity_date", label: "Maturity Period", placeholder: "e.g., 12 months" },
    ],
  },
  savings: {
    title: "Add Savings Account",
    type: "savings",
    fields: [
      { id: "name", label: "Account Name", placeholder: "e.g., HDFC Savings", required: true },
      { id: "bank", label: "Bank Name", placeholder: "e.g., HDFC Bank" },
      { id: "account_number", label: "Account Number (last 4 digits)", placeholder: "1234" },
      { id: "current_value", label: "Current Balance", placeholder: "₹0", required: true, type: "number" },
    ],
  },
};

export default function AddSimpleInvestment() {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract type from URL path
  const pathSegments = location.pathname.split('/');
  const typeFromPath = pathSegments[pathSegments.length - 1];
  const config = assetConfig[typeFromPath] || assetConfig.gold;
  
  const { createInvestment } = useInvestments();
  
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFieldChange = (fieldId: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    setIsSubmitting(true);
    try {
      const investedValue = parseFloat(formData.invested_value) || parseFloat(formData.current_value) || 0;
      const currentValue = parseFloat(formData.current_value) || investedValue;
      
      await createInvestment.mutateAsync({
        name: formData.name,
        type: config.type,
        invested_value: investedValue,
        current_value: currentValue,
        bank: formData.bank || null,
        account_number: formData.account_number || null,
        interest_rate: formData.interest_rate ? parseFloat(formData.interest_rate) : null,
        maturity_date: formData.maturity_date || null,
        maturity_value: formData.maturity_value ? parseFloat(formData.maturity_value) : null,
        notes: notes || null,
      });
      
      toast.success(`${config.title.replace("Add ", "")} added successfully`);
      navigate("/wealth/" + typeFromPath);
    } catch (error) {
      console.error("Failed to add investment:", error);
      toast.error("Failed to add investment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/wealth/" + typeFromPath);
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
                type={field.type || "text"}
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
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
