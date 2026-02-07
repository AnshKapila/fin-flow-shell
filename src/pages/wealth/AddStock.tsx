import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Search, CalendarIcon, TrendingUp, Building2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useInvestments } from "@/hooks/useInvestments";
import { useStockSearch, useStockPrice, StockSearchResult } from "@/hooks/useStockPrice";
import { toast } from "sonner";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/data/mockData";

export default function AddStock() {
  const navigate = useNavigate();
  const { createInvestment } = useInvestments();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStock, setSelectedStock] = useState<StockSearchResult | null>(null);
  const [quantity, setQuantity] = useState("");
  const [purchasePrice, setPurchasePrice] = useState("");
  const [investmentDate, setInvestmentDate] = useState<Date | undefined>(new Date());
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Search stocks
  const { data: searchResults = [], isLoading: isSearching } = useStockSearch(searchQuery);
  
  // Fetch live price for selected stock
  const { data: liveQuote, isLoading: isPriceLoading } = useStockPrice(selectedStock?.symbol);

  // Auto-fill purchase price with current market price
  useEffect(() => {
    if (liveQuote && !purchasePrice) {
      setPurchasePrice(liveQuote.price.toString());
    }
  }, [liveQuote, purchasePrice]);

  const handleSelectStock = (stock: StockSearchResult) => {
    setSelectedStock(stock);
    setSearchQuery("");
    setPurchasePrice(""); // Reset to allow auto-fill
  };

  const calculateInvestedAmount = (): number => {
    const qty = parseFloat(quantity) || 0;
    const price = parseFloat(purchasePrice) || 0;
    return qty * price;
  };

  const calculateCurrentValue = (): number => {
    const qty = parseFloat(quantity) || 0;
    const currentPrice = liveQuote?.price || parseFloat(purchasePrice) || 0;
    return qty * currentPrice;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStock) return;
    
    if (!investmentDate) {
      toast.error("Please select an investment date");
      return;
    }

    if (!quantity || parseFloat(quantity) <= 0) {
      toast.error("Please enter a valid quantity");
      return;
    }

    if (!purchasePrice || parseFloat(purchasePrice) <= 0) {
      toast.error("Please enter a valid purchase price");
      return;
    }
    
    setIsSubmitting(true);
    try {
      const investedAmount = calculateInvestedAmount();
      const currentValue = calculateCurrentValue();
      
      await createInvestment.mutateAsync({
        name: selectedStock.name,
        type: "stocks",
        invested_value: investedAmount,
        current_value: currentValue,
        start_date: format(investmentDate, "yyyy-MM-dd"),
        account_number: selectedStock.symbol, // Store symbol for price lookup
        bank: quantity, // Store quantity
        interest_rate: parseFloat(purchasePrice), // Store purchase price per share
        category: selectedStock.exchange,
        risk_level: "Equity",
        notes: notes || null,
      });
      
      toast.success("Stock added successfully");
      navigate("/wealth/stocks");
    } catch (error) {
      console.error("Failed to add stock:", error);
      toast.error("Failed to add stock");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate("/wealth/stocks");
  };

  const investedAmount = calculateInvestedAmount();
  const currentValue = calculateCurrentValue();
  const gainLoss = currentValue - investedAmount;

  return (
    <div className="animate-fade-in min-h-screen bg-background">
      <PageHeader title="Add Stock" showBack />
      
      <div className="px-4 py-4 space-y-6">
        {/* Search Section */}
        {!selectedStock && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for stocks (e.g., Reliance, TCS)"
                className="bg-muted border-border pl-10"
              />
            </div>

            {/* Search Results */}
            {isSearching && (
              <div className="text-center py-4 text-muted-foreground">
                Searching...
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="space-y-2">
                {searchResults.map((stock) => (
                  <button
                    key={stock.symbol}
                    onClick={() => handleSelectStock(stock)}
                    className="flex w-full items-center justify-between rounded-xl bg-muted p-4 transition-colors hover:bg-muted/80"
                  >
                    <div className="text-left">
                      <p className="font-medium text-foreground">{stock.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {stock.symbol.split('.')[0]} • {stock.exchange}
                      </p>
                    </div>
                    <Building2 className="h-5 w-5 text-muted-foreground" />
                  </button>
                ))}
              </div>
            )}

            {searchQuery.length >= 2 && searchResults.length === 0 && !isSearching && (
              <p className="text-center text-sm text-muted-foreground py-8">
                No results found for "{searchQuery}"
              </p>
            )}

            {searchQuery.length < 2 && (
              <p className="text-center text-sm text-muted-foreground py-8">
                Start typing to search for stocks
              </p>
            )}
          </div>
        )}

        {/* Form Section - shown after selection */}
        {selectedStock && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Selected Stock Display with Live Price */}
            <div className="rounded-xl bg-muted p-4">
              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="font-medium text-foreground">{selectedStock.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {selectedStock.symbol.split('.')[0]} • {selectedStock.exchange}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedStock(null);
                    setPurchasePrice("");
                  }}
                  className="text-sm text-primary hover:underline"
                >
                  Change
                </button>
              </div>
              
              {/* Live Price Display */}
              {isPriceLoading ? (
                <div className="text-sm text-muted-foreground">Loading price...</div>
              ) : liveQuote ? (
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-primary" />
                    <span className="text-sm text-muted-foreground">Current Price</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-foreground">
                      {formatCurrency(liveQuote.price)}
                    </span>
                    <span className={`ml-2 text-xs ${
                      liveQuote.changePercent >= 0 ? "text-fintrack-green" : "text-destructive"
                    }`}>
                      {liveQuote.changePercent >= 0 ? "+" : ""}{liveQuote.changePercent.toFixed(2)}%
                    </span>
                  </div>
                </div>
              ) : null}
            </div>

            {/* Investment Details */}
            <div className="space-y-4">
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

              {/* Quantity */}
              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-muted-foreground">
                  Quantity (Shares) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  step="1"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="e.g., 10"
                  className="bg-muted border-border"
                  required
                />
              </div>

              {/* Purchase Price */}
              <div className="space-y-2">
                <Label htmlFor="purchasePrice" className="text-muted-foreground">
                  Purchase Price (per share) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  step="0.01"
                  value={purchasePrice}
                  onChange={(e) => setPurchasePrice(e.target.value)}
                  placeholder={liveQuote ? `Current: ₹${liveQuote.price}` : "₹0.00"}
                  className="bg-muted border-border"
                  required
                />
                <p className="text-xs text-muted-foreground">
                  Enter your actual purchase price per share
                </p>
              </div>

              {/* Investment Summary */}
              {quantity && purchasePrice && (
                <div className="rounded-xl bg-primary/10 p-4 space-y-3">
                  <h4 className="font-medium text-foreground">Investment Summary</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground">Total Invested</p>
                      <p className="font-semibold text-foreground">{formatCurrency(investedAmount)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Current Value</p>
                      <p className="font-semibold text-foreground">{formatCurrency(currentValue)}</p>
                    </div>
                    {liveQuote && investedAmount > 0 && (
                      <div className="col-span-2">
                        <p className="text-muted-foreground">Expected Gain/Loss</p>
                        <p className={`font-semibold ${gainLoss >= 0 ? "text-fintrack-green" : "text-destructive"}`}>
                          {gainLoss >= 0 ? "+" : ""}{formatCurrency(gainLoss)}
                          {" "}
                          ({gainLoss >= 0 ? "+" : ""}{((gainLoss / investedAmount) * 100).toFixed(2)}%)
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes" className="text-muted-foreground">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Why did you invest in this stock?"
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
                {isSubmitting ? "Adding..." : "Add Stock"}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
