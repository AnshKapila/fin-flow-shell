import { useNavigate } from "react-router-dom";
import { SummaryCard, SummaryLabel, SummaryValue } from "@/components/ui/summary-card";
import { HoldingCard } from "@/components/ui/list-card";
import { useInvestments } from "@/hooks/useInvestments";
import { formatCurrency, formatPercent } from "@/data/mockData";

export default function StocksPage() {
  const navigate = useNavigate();
  const { getInvestmentsByType, getTotalByType, getReturnsPercent, isLoading } = useInvestments();
  
  const stocks = getInvestmentsByType("stocks");
  const totals = getTotalByType("stocks");
  const returnsPercent = getReturnsPercent(totals.invested, totals.returns);

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
        <SummaryLabel>Current Value</SummaryLabel>
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
                {formatCurrency(totals.returns)}
              </span>
              {totals.invested > 0 && (
                <span className={`rounded-full px-2 py-0.5 text-xs font-bold text-primary-foreground ${
                  returnsPercent >= 0 ? "bg-fintrack-green" : "bg-fintrack-red-soft"
                }`}>
                  {returnsPercent >= 0 ? "↑" : "↓"} {formatPercent(returnsPercent)}
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
            {stocks.map((stock) => {
              const stockReturnsPercent = stock.invested_value > 0 
                ? ((stock.current_value - stock.invested_value) / stock.invested_value) * 100 
                : 0;
              return (
                <HoldingCard
                  key={stock.id}
                  name={stock.name}
                  subtitle={`${stock.category || "Equity"} • ${stock.risk_level || "Stock"}`}
                  value={formatCurrency(stock.current_value)}
                  invested={formatCurrency(stock.invested_value)}
                  returns={formatPercent(stockReturnsPercent)}
                  isPositive={stockReturnsPercent >= 0}
                  onClick={() => navigate(`/wealth/stocks/${stock.id}`)}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
