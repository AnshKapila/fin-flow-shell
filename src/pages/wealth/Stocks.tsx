import { useNavigate } from "react-router-dom";
import { RefreshCw } from "lucide-react";
import { SummaryCard, SummaryLabel, SummaryValue } from "@/components/ui/summary-card";
import { HoldingCard } from "@/components/ui/list-card";
import { useInvestments } from "@/hooks/useInvestments";
import { useStockPrice } from "@/hooks/useStockPrice";
import { formatCurrency, formatPercent } from "@/data/mockData";
import { useQueryClient } from "@tanstack/react-query";

// Component for individual stock with live price
function StockHolding({ 
  stock, 
  onClick 
}: { 
  stock: { 
    id: string; 
    name: string; 
    account_number: string | null;
    bank: string | null;
    interest_rate: number | null;
    invested_value: number;
    current_value: number;
    category: string | null;
  }; 
  onClick: () => void;
}) {
  const symbol = stock.account_number || '';
  const { data: liveQuote } = useStockPrice(symbol || undefined);
  
  const quantity = stock.bank ? parseFloat(stock.bank) : 0;
  const purchasePrice = stock.interest_rate || 0;
  
  // Calculate live values
  const currentPrice = liveQuote?.price || purchasePrice;
  const liveCurrentValue = quantity > 0 ? quantity * currentPrice : Number(stock.current_value);
  const investedValue = Number(stock.invested_value);
  const returnsPercent = investedValue > 0 
    ? ((liveCurrentValue - investedValue) / investedValue) * 100 
    : 0;

  const displaySymbol = symbol.split('.')[0];

  return (
    <HoldingCard
      name={stock.name}
      subtitle={`${displaySymbol || stock.category || "Equity"} • ${quantity > 0 ? `${quantity} shares` : "Stock"}`}
      value={formatCurrency(liveCurrentValue)}
      invested={formatCurrency(investedValue)}
      returns={formatPercent(returnsPercent)}
      isPositive={returnsPercent >= 0}
      onClick={onClick}
    />
  );
}

export default function StocksPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { getInvestmentsByType, isLoading } = useInvestments();
  
  const stocks = getInvestmentsByType("stocks");

  // Calculate totals (will be updated with live prices from individual components)
  const totals = stocks.reduce((acc, stock) => {
    const quantity = stock.bank ? parseFloat(stock.bank) : 0;
    const purchasePrice = stock.interest_rate || 0;
    const investedValue = Number(stock.invested_value);
    
    // For totals, we use stored values as live prices are per-component
    const currentValue = quantity > 0 ? quantity * purchasePrice : Number(stock.current_value);
    
    return {
      current: acc.current + Number(stock.current_value),
      invested: acc.invested + investedValue,
    };
  }, { current: 0, invested: 0 });

  const returnsPercent = totals.invested > 0 
    ? ((totals.current - totals.invested) / totals.invested) * 100 
    : 0;

  const handleRefresh = () => {
    // Invalidate all stock price queries to refetch
    queryClient.invalidateQueries({ queryKey: ['stock-price'] });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="text-muted-foreground">Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      {/* Summary Card */}
      <SummaryCard variant="blue">
        <div className="flex items-center justify-between">
          <SummaryLabel>Current Value</SummaryLabel>
          <button 
            onClick={handleRefresh}
            className="p-1 rounded-full hover:bg-primary-foreground/10 transition-colors"
            title="Refresh prices"
          >
            <RefreshCw className="h-4 w-4 text-primary-foreground/70" />
          </button>
        </div>
        <SummaryValue className="mt-1">{formatCurrency(totals.current)}</SummaryValue>
        
        <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-primary-foreground/20">
          <div>
            <p className="text-sm text-primary-foreground/70">Total Invested</p>
            <p className="text-lg font-semibold text-primary-foreground">
              {formatCurrency(totals.invested)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-primary-foreground/70">Net Gain</p>
            <div className="flex items-center justify-end gap-2">
              <span className="text-lg font-semibold text-primary-foreground">
                {formatCurrency(totals.current - totals.invested)}
              </span>
              {totals.invested > 0 && (
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold text-primary-foreground ${
                  returnsPercent >= 0 ? "bg-fintrack-green" : "bg-fintrack-red-soft"
                }`}>
                  {returnsPercent >= 0 ? "↑" : "↓"} {formatPercent(Math.abs(returnsPercent))}
                </span>
              )}
            </div>
          </div>
        </div>
      </SummaryCard>

      {/* Holdings List */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">Your Holdings</h2>
        {stocks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No stocks added yet</p>
            <p className="text-sm mt-1">Tap the + button to add your first stock</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {stocks.map((stock) => (
              <StockHolding
                key={stock.id}
                stock={stock}
                onClick={() => navigate(`/wealth/stocks/${stock.id}`)}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
