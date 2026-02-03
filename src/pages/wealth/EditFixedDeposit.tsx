import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useInvestments, TenureUnit } from "@/hooks/useInvestments";
import { calculateFDDetails, formatTenure, parseDate } from "@/lib/fdCalculations";
import { formatCurrency } from "@/data/mockData";
import { toast } from "sonner";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function EditFixedDeposit() {
  const navigate = useNavigate();
  const { id } = useParams();
  const { investments, updateInvestment, isLoading } = useInvestments();
  
  const investment = investments.find(inv => inv.id === id && inv.type === "fd");
  
  const [name, setName] = useState("");
  const [bank, setBank] = useState("");
  const [principal, setPrincipal] = useState("");
  const [interestRate, setInterestRate] = useState("");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [tenureValue, setTenureValue] = useState("");
  const [tenureUnit, setTenureUnit] = useState<TenureUnit>("months");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [initialized, setInitialized] = useState(false);

  // Initialize form with existing data
  useEffect(() => {
    if (investment && !initialized) {
      setName(investment.name || "");
      setBank(investment.bank || "");
      setPrincipal(String(investment.invested_value || ""));
      setInterestRate(String(investment.interest_rate || ""));
      setNotes(investment.notes || "");
      
      const parsedStartDate = parseDate(investment.start_date);
      if (parsedStartDate) {
        setStartDate(parsedStartDate);
      }
      
      if (investment.tenure_value) {
        setTenureValue(String(investment.tenure_value));
      }
      
      if (investment.tenure_unit) {
        setTenureUnit(investment.tenure_unit as TenureUnit);
      }
      
      setInitialized(true);
    }
  }, [investment, initialized]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-muted-foreground">Loading...</span>
      </div>
    );
  }

  if (!investment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-muted-foreground">Fixed Deposit not found</p>
        <button 
          onClick={() => navigate("/wealth/fd")}
          className="text-primary font-medium"
        >
          Go back
        </button>
      </div>
    );
  }

  // Calculate preview values
  const principalNum = parseFloat(principal) || 0;
  const rateNum = parseFloat(interestRate) || 0;
  const tenureNum = parseInt(tenureValue) || 0;
  
  const canCalculate = principalNum > 0 && rateNum > 0 && tenureNum > 0 && startDate;
  
  const calculatedValues = canCalculate ? calculateFDDetails({
    principal: principalNum,
    interestRate: rateNum,
    startDate: startDate!,
    tenureValue: tenureNum,
    tenureUnit,
  }) : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canCalculate || !calculatedValues) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await updateInvestment.mutateAsync({
        id: investment.id,
        name: name || `${bank} FD`,
        invested_value: principalNum,
        current_value: calculatedValues.currentValue,
        bank: bank || null,
        interest_rate: rateNum,
        maturity_value: calculatedValues.maturityAmount,
        maturity_date: format(calculatedValues.maturityDate, "yyyy-MM-dd"),
        start_date: format(startDate!, "yyyy-MM-dd"),
        tenure_value: tenureNum,
        tenure_unit: tenureUnit,
        notes: notes || null,
      });
      
      toast.success("Fixed Deposit updated successfully");
      navigate(`/wealth/fd/${id}`);
    } catch (error) {
      console.error("Failed to update FD:", error);
      toast.error("Failed to update Fixed Deposit");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(`/wealth/fd/${id}`);
  };

  return (
    <div className="animate-fade-in min-h-screen bg-background">
      <PageHeader title="Edit Fixed Deposit" showBack />
      
      <div className="px-4 py-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name / Label */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-muted-foreground">
              Name / Label
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., HDFC Tax Saver FD"
              className="bg-muted border-border"
            />
          </div>

          {/* Bank Name */}
          <div className="space-y-2">
            <Label htmlFor="bank" className="text-muted-foreground">
              Bank Name
            </Label>
            <Input
              id="bank"
              value={bank}
              onChange={(e) => setBank(e.target.value)}
              placeholder="e.g., HDFC Bank"
              className="bg-muted border-border"
            />
          </div>

          {/* Principal Amount */}
          <div className="space-y-2">
            <Label htmlFor="principal" className="text-muted-foreground">
              Principal Amount <span className="text-destructive">*</span>
            </Label>
            <Input
              id="principal"
              type="number"
              value={principal}
              onChange={(e) => setPrincipal(e.target.value)}
              placeholder="₹0"
              className="bg-muted border-border"
              required
            />
          </div>

          {/* Interest Rate */}
          <div className="space-y-2">
            <Label htmlFor="interestRate" className="text-muted-foreground">
              Interest Rate (% p.a.) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="interestRate"
              type="number"
              step="0.01"
              value={interestRate}
              onChange={(e) => setInterestRate(e.target.value)}
              placeholder="7.0"
              className="bg-muted border-border"
              required
            />
          </div>

          {/* Start Date */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">
              Investment Start Date <span className="text-destructive">*</span>
            </Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal bg-muted border-border",
                    !startDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {startDate ? format(startDate, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={startDate}
                  onSelect={setStartDate}
                  initialFocus
                  className="p-3 pointer-events-auto"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Tenure */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">
              Tenure <span className="text-destructive">*</span>
            </Label>
            <div className="flex gap-3">
              <Input
                type="number"
                value={tenureValue}
                onChange={(e) => setTenureValue(e.target.value)}
                placeholder="12"
                className="bg-muted border-border flex-1"
                required
              />
              <Select value={tenureUnit} onValueChange={(v) => setTenureUnit(v as TenureUnit)}>
                <SelectTrigger className="w-32 bg-muted border-border">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="months">Months</SelectItem>
                  <SelectItem value="years">Years</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Calculation Preview */}
          {calculatedValues && (
            <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-3">
              <h4 className="font-medium text-foreground">Calculated Values</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Maturity Date</p>
                  <p className="font-medium text-foreground">
                    {format(calculatedValues.maturityDate, "dd MMM yyyy")}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tenure</p>
                  <p className="font-medium text-foreground">
                    {formatTenure(tenureNum, tenureUnit)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Maturity Amount</p>
                  <p className="font-medium text-foreground">
                    {formatCurrency(calculatedValues.maturityAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Total Interest</p>
                  <p className="font-medium text-fintrack-green">
                    +{formatCurrency(calculatedValues.totalInterest)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="text-muted-foreground">
              Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes..."
              className="bg-muted border-border resize-none"
              rows={3}
            />
          </div>

          {/* Action Buttons */}
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
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
