import { useNavigate } from "react-router-dom";
import { SummaryCard, SummaryLabel, SummaryValue } from "@/components/ui/summary-card";
import { HoldingCard } from "@/components/ui/list-card";
import { useInvestments } from "@/hooks/useInvestments";
import { formatCurrency, formatPercent } from "@/data/mockData";

export default function GoldPage() {
  const navigate = useNavigate();
  const { getInvestmentsByType, getTotalByType, getReturnsPercent, isLoading } = useInvestments();
  
  const gold = getInvestmentsByType("gold");
  const totals = getTotalByType("gold");
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
              {totals.invested > 0 && returnsPercent > 0 && (
                <span className="rounded-full bg-fintrack-green px-2 py-0.5 text-xs font-bold text-primary-foreground">
                  ↑ {formatPercent(returnsPercent)}
                </span>
              )}
            </div>
          </div>
        </div>
      </SummaryCard>

      {/* Holdings List */}
      <section>
        <h2 className="text-lg font-semibold text-foreground mb-4">Your Gold Holdings</h2>
        {gold.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No gold holdings added yet</p>
            <p className="text-sm mt-1">Tap the + button to add your first gold investment</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {gold.map((item) => {
              const itemReturnsPercent = item.invested_value > 0 
                ? ((item.current_value - item.invested_value) / item.invested_value) * 100 
                : 0;
              return (
                <HoldingCard
                  key={item.id}
                  name={item.name}
                  subtitle={item.interest_rate ? `${item.interest_rate}% p.a. • Matures ${item.maturity_date}` : "Digital Gold"}
                  value={formatCurrency(item.current_value)}
                  invested={formatCurrency(item.invested_value)}
                  returns={formatPercent(itemReturnsPercent)}
                  isPositive={itemReturnsPercent >= 0}
                  onClick={() => navigate(`/wealth/gold/${item.id}`)}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
