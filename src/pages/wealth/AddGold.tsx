import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useInvestments } from "@/hooks/useInvestments";
import { useGoldPrice } from "@/hooks/useGoldPrice";
import { calculateGoldWeight, type GoldType } from "@/lib/goldCalculations";
import { formatCurrency } from "@/data/mockData";
import { toast } from "sonner";
import { format } from "date-fns";
import { CalendarIcon, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

export default function AddGold() {
  const navigate = useNavigate();
  const { createInvestment } = useInvestments();
  const { goldPrice, isLoading: priceLoading, refetch } = useGoldPrice();
  
  const [name, setName] = useState("");
  const [investedAmount, setInvestedAmount] = useState("");
  const [investmentDate, setInvestmentDate] = useState<Date | undefined>(new Date());
  const [goldType, setGoldType] = useState<GoldType>("digital");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [sgbInterestRate, setSgbInterestRate] = useState("2.5");
  const [sgbMaturityDate, setSgbMaturityDate] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Calculate preview values
  const investedNum = parseFloat(investedAmount) || 0;
  const purchasePriceNum = parseFloat(purchasePrice) || goldPrice.price_per_gram_24k;
  
  const canCalculate = investedNum > 0 && purchasePriceNum > 0 && investmentDate;
  
  const weightInGrams = canCalculate ? calculateGoldWeight(investedNum, purchasePriceNum) : 0;
  const currentValue = weightInGrams * goldPrice.price_per_gram_24k;
  const gainLoss = currentValue - investedNum;
  const gainLossPercent = investedNum > 0 ? (gainLoss / investedNum) * 100 : 0;

  // Set purchase price to current market price when user hasn't entered one
  const handleUseLivePrice = () => {
    setPurchasePrice(goldPrice.price_per_gram_24k.toFixed(2));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!investmentDate) {
      toast.error("Please select an investment date");
      return;
    }
    
    if (!investedAmount || investedNum <= 0) {
      toast.error("Please enter a valid invested amount");
      return;
    }
    
    setIsSubmitting(true);
    try {
      await createInvestment.mutateAsync({
        name: name || `${goldType === "sgb" ? "SGB" : goldType === "physical" ? "Physical Gold" : "Digital Gold"}`,
        type: "gold",
        invested_value: investedNum,
        current_value: currentValue,
        start_date: format(investmentDate!, "yyyy-MM-dd"),
        interest_rate: goldType === "sgb" ? parseFloat(sgbInterestRate) || 2.5 : null,
        maturity_date: goldType === "sgb" ? sgbMaturityDate || null : null,
        // Store gold-specific data
        category: goldType, // Using category to store gold type
        risk_level: `${weightInGrams.toFixed(4)}g`, // Using risk_level to store weight
        notes: notes || null,
      });
      
      toast.success("Gold investment added successfully");
      navigate("/wealth/gold");
    } catch (error) {
      console.error("Failed to add gold:", error);
      toast.error("Failed to add gold investment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/wealth/gold");
  };

  return (
    <div className="animate-fade-in min-h-screen bg-background">
      <PageHeader title="Add Gold" showBack />
      
      <div className="px-4 py-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Live Gold Price Banner */}
          <div className="rounded-lg border border-border bg-fintrack-gold/10 p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Live Gold Price (24K)</p>
                <p className="text-xl font-bold text-foreground">
                  {formatCurrency(goldPrice.price_per_gram_24k)}/g
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  {goldPrice.is_fallback ? "Approximate price" : "Market price"} • 
                  Updated {format(new Date(goldPrice.last_updated), "h:mm a")}
                </p>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => refetch()}
                disabled={priceLoading}
                className="shrink-0"
              >
                <RefreshCw className={cn("h-4 w-4", priceLoading && "animate-spin")} />
              </Button>
            </div>
          </div>

          {/* Name / Label */}
          <div className="space-y-2">
            <Label htmlFor="name" className="text-muted-foreground">
              Name / Label
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Digital Gold - Groww"
              className="bg-muted border-border"
            />
          </div>

          {/* Gold Type */}
          <div className="space-y-2">
            <Label className="text-muted-foreground">
              Gold Type <span className="text-destructive">*</span>
            </Label>
            <Select value={goldType} onValueChange={(v) => setGoldType(v as GoldType)}>
              <SelectTrigger className="bg-muted border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="digital">Digital Gold</SelectItem>
                <SelectItem value="physical">Physical Gold</SelectItem>
                <SelectItem value="sgb">Sovereign Gold Bond (SGB)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Investment Date */}
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

          {/* Invested Amount */}
          <div className="space-y-2">
            <Label htmlFor="invested" className="text-muted-foreground">
              Amount Invested (₹) <span className="text-destructive">*</span>
            </Label>
            <Input
              id="invested"
              type="number"
              value={investedAmount}
              onChange={(e) => setInvestedAmount(e.target.value)}
              placeholder="₹0"
              className="bg-muted border-border"
              required
            />
          </div>

          {/* Purchase Price per Gram */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="purchasePrice" className="text-muted-foreground">
                Purchase Price (₹/gram)
              </Label>
              <button
                type="button"
                onClick={handleUseLivePrice}
                className="text-xs text-primary hover:underline"
              >
                Use live price
              </button>
            </div>
            <Input
              id="purchasePrice"
              type="number"
              step="0.01"
              value={purchasePrice}
              onChange={(e) => setPurchasePrice(e.target.value)}
              placeholder={`₹${goldPrice.price_per_gram_24k.toFixed(2)} (current)`}
              className="bg-muted border-border"
            />
            <p className="text-xs text-muted-foreground">
              Leave empty to use current market price for calculations
            </p>
          </div>

          {/* SGB-specific fields */}
          {goldType === "sgb" && (
            <>
              <div className="space-y-2">
                <Label htmlFor="sgbRate" className="text-muted-foreground">
                  Interest Rate (% p.a.)
                </Label>
                <Input
                  id="sgbRate"
                  type="number"
                  step="0.01"
                  value={sgbInterestRate}
                  onChange={(e) => setSgbInterestRate(e.target.value)}
                  placeholder="2.5"
                  className="bg-muted border-border"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="sgbMaturity" className="text-muted-foreground">
                  Maturity Date
                </Label>
                <Input
                  id="sgbMaturity"
                  value={sgbMaturityDate}
                  onChange={(e) => setSgbMaturityDate(e.target.value)}
                  placeholder="e.g., Dec 2029"
                  className="bg-muted border-border"
                />
              </div>
            </>
          )}

          {/* Calculation Preview */}
          {canCalculate && (
            <div className="rounded-lg border border-border bg-muted/50 p-4 space-y-3">
              <h4 className="font-medium text-foreground">Calculated Values</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Gold Weight</p>
                  <p className="font-medium text-foreground">
                    {weightInGrams.toFixed(4)} grams
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Purchase Price</p>
                  <p className="font-medium text-foreground">
                    {formatCurrency(purchasePriceNum)}/g
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Current Value</p>
                  <p className="font-medium text-foreground">
                    {formatCurrency(currentValue)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Gain/Loss</p>
                  <p className={`font-medium ${gainLoss >= 0 ? "text-fintrack-green" : "text-fintrack-red-soft"}`}>
                    {gainLoss >= 0 ? "+" : ""}{formatCurrency(gainLoss)} ({gainLossPercent.toFixed(1)}%)
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
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
