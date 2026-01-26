import { useNavigate } from "react-router-dom";
import { SummaryCard, SummaryLabel, SummaryValue, SummaryRow } from "@/components/ui/summary-card";
import { HoldingCard } from "@/components/ui/list-card";
import { getInvestmentsByType, getTotalByType, formatCurrency, formatPercent } from "@/data/mockData";

export default function StocksPage() {
  const navigate = useNavigate();
  const stocks = getInvestmentsByType("stocks");
  const totals = getTotalByType("stocks");
  const returnsPercent = totals.invested > 0 ? ((totals.returns / totals.invested) * 100) : 0;

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
              <span className="rounded-full bg-fintrack-green px-2 py-0.5 text-xs font-bold text-primary-foreground">
                ↑ {formatPercent(returnsPercent)}
              </span>
            </div>
          </div>
        </div>
      </SummaryCard>

      {/* Holdings List */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">Your Holdings</h2>
        <div className="divide-y divide-border">
          {stocks.map((stock) => (
            <HoldingCard
              key={stock.id}
              name={stock.name}
              subtitle={`${stock.category} • ${stock.riskLevel || "Equity"}`}
              value={formatCurrency(stock.currentValue)}
              invested={formatCurrency(stock.investedValue)}
              returns={formatPercent(stock.returnsPercent)}
              isPositive={stock.returnsPercent >= 0}
              onClick={() => navigate(`/wealth/stocks/${stock.id}`)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
