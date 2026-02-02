import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Search } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useInvestments } from "@/hooks/useInvestments";
import { toast } from "sonner";

// Mock search results for stocks
const mockStockResults = [
  { id: "hdfc-bank", name: "HDFC Bank Ltd", symbol: "HDFCBANK", exchange: "NSE" },
  { id: "reliance", name: "Reliance Industries", symbol: "RELIANCE", exchange: "NSE" },
  { id: "tcs", name: "Tata Consultancy Services", symbol: "TCS", exchange: "NSE" },
  { id: "infosys", name: "Infosys Ltd", symbol: "INFY", exchange: "NSE" },
  { id: "icici-bank", name: "ICICI Bank Ltd", symbol: "ICICIBANK", exchange: "NSE" },
];

// Mock search results for mutual funds
const mockMutualFundResults = [
  { id: "axis-bluechip", name: "Axis Bluechip Fund", category: "Large Cap", amc: "Axis AMC" },
  { id: "parag-flexi", name: "Parag Parikh Flexi Cap Fund", category: "Flexi Cap", amc: "PPFAS" },
  { id: "mirae-emerging", name: "Mirae Asset Emerging Bluechip", category: "Large & Mid Cap", amc: "Mirae" },
  { id: "sbi-small-cap", name: "SBI Small Cap Fund", category: "Small Cap", amc: "SBI MF" },
  { id: "hdfc-index", name: "HDFC Index Fund - Nifty 50", category: "Index Fund", amc: "HDFC AMC" },
];

export default function AddStockOrMutualFund() {
  const navigate = useNavigate();
  const location = useLocation();
  const type = location.pathname.includes("stocks") ? "stocks" : "mutual-funds";
  const isStock = type === "stocks";
  
  const { createInvestment } = useInvestments();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<typeof mockStockResults[0] | typeof mockMutualFundResults[0] | null>(null);
  const [investedAmount, setInvestedAmount] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const mockResults = isStock ? mockStockResults : mockMutualFundResults;
  
  const filteredResults = searchQuery.length > 0
    ? mockResults.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const handleSelectItem = (item: typeof mockResults[0]) => {
    setSelectedItem(item);
    setSearchQuery("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItem) return;
    
    setIsSubmitting(true);
    try {
      const invested = parseFloat(investedAmount) || 0;
      const current = parseFloat(currentValue) || invested;
      
      await createInvestment.mutateAsync({
        name: selectedItem.name,
        type: isStock ? "stocks" : "mutual-funds",
        invested_value: invested,
        current_value: current,
        category: isStock 
          ? "Large Cap" 
          : (selectedItem as typeof mockMutualFundResults[0]).category,
        risk_level: isStock ? "Equity" : "Medium Risk",
        notes: notes || null,
      });
      
      toast.success(`${isStock ? "Stock" : "Mutual Fund"} added successfully`);
      navigate("/wealth/" + type);
    } catch (error) {
      console.error("Failed to add investment:", error);
      toast.error("Failed to add investment");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/wealth/" + type);
  };

  return (
    <div className="animate-fade-in min-h-screen bg-background">
      <PageHeader 
        title={isStock ? "Add Stock" : "Add Mutual Fund"} 
        showBack 
      />
      
      <div className="px-4 py-4 space-y-6">
        {/* Search Section */}
        {!selectedItem && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search the investment you want to add"
                className="bg-muted border-border pl-10"
              />
            </div>

            {/* Search Results */}
            {filteredResults.length > 0 && (
              <div className="space-y-2">
                {filteredResults.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelectItem(item)}
                    className="flex w-full items-center justify-between rounded-xl bg-muted p-4 transition-colors hover:bg-muted/80"
                  >
                    <div className="text-left">
                      <p className="font-medium text-foreground">{item.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {isStock 
                          ? `${(item as typeof mockStockResults[0]).symbol} • ${(item as typeof mockStockResults[0]).exchange}`
                          : `${(item as typeof mockMutualFundResults[0]).category} • ${(item as typeof mockMutualFundResults[0]).amc}`
                        }
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {searchQuery.length > 0 && filteredResults.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">
                No results found for "{searchQuery}"
              </p>
            )}

            {searchQuery.length === 0 && (
              <p className="text-center text-sm text-muted-foreground py-8">
                Start typing to search for {isStock ? "stocks" : "mutual funds"}
              </p>
            )}
          </div>
        )}

        {/* Form Section - shown after selection */}
        {selectedItem && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Selected Item Display */}
            <div className="rounded-xl bg-muted p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">{selectedItem.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {isStock 
                      ? `${(selectedItem as typeof mockStockResults[0]).symbol} • ${(selectedItem as typeof mockStockResults[0]).exchange}`
                      : `${(selectedItem as typeof mockMutualFundResults[0]).category} • ${(selectedItem as typeof mockMutualFundResults[0]).amc}`
                    }
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedItem(null)}
                  className="text-sm text-primary hover:underline"
                >
                  Change
                </button>
              </div>
            </div>

            {/* Investment Details */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="invested" className="text-muted-foreground">Invested Amount</Label>
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

              <div className="space-y-2">
                <Label htmlFor="current" className="text-muted-foreground">Current Value (optional)</Label>
                <Input
                  id="current"
                  type="number"
                  value={currentValue}
                  onChange={(e) => setCurrentValue(e.target.value)}
                  placeholder="₹0 (defaults to invested amount)"
                  className="bg-muted border-border"
                />
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
                {isSubmitting ? "Adding..." : `Add ${isStock ? "Stock" : "Mutual Fund"}`}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
