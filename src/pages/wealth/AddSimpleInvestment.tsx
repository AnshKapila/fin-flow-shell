import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { CalendarIcon } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useInvestments, InvestmentType } from "@/hooks/useInvestments";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

const assetConfig: Record<string, { 
  title: string; 
  type: InvestmentType;
  fields: { id: string; label: string; placeholder: string; required?: boolean; type?: string }[] 
}> = {
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
  const config = assetConfig[typeFromPath] || assetConfig.savings;
  
  const { createInvestment } = useInvestments();
  
  const [formData, setFormData] = useState<Record<string, string>>({});
  const [investmentDate, setInvestmentDate] = useState<Date | undefined>(new Date());
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleFieldChange = (fieldId: string, value: string) => {
    setFormData(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!investmentDate) {
      toast.error("Please select an investment date");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const investedValue = parseFloat(formData.invested_value) || parseFloat(formData.current_value) || 0;
      const currentValue = parseFloat(formData.current_value) || investedValue;
      
      await createInvestment.mutateAsync({
        name: formData.name,
        type: config.type,
        invested_value: investedValue,
        current_value: currentValue,
        start_date: format(investmentDate, "yyyy-MM-dd"),
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
          {/* Investment Date - Required */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">
              Investment Date <span className="text-destructive">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-muted border-border",
                    !investmentDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {investmentDate ? format(investmentDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={investmentDate}
                  onSelect={setInvestmentDate}
                  disabled={(date) => date > new Date()}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>
          
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
