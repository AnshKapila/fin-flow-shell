import { useNavigate } from "react-router-dom";
import { SummaryCard, SummaryLabel, SummaryValue } from "@/components/ui/summary-card";
import { HoldingCard } from "@/components/ui/list-card";
import { getInvestmentsByType, getTotalByType, formatCurrency, formatPercent } from "@/data/mockData";

export default function GoldPage() {
  const navigate = useNavigate();
  const gold = getInvestmentsByType("gold");
  const totals = getTotalByType("gold");
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
              {returnsPercent > 0 && (
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
        <div className="divide-y divide-border">
          {gold.map((item) => (
            <HoldingCard
              key={item.id}
              name={item.name}
              subtitle={item.interestRate ? `${item.interestRate}% p.a. • Matures ${item.maturityDate}` : "Digital Gold"}
              value={formatCurrency(item.currentValue)}
              invested={formatCurrency(item.investedValue)}
              returns={formatPercent(item.returnsPercent)}
              isPositive={item.returnsPercent >= 0}
              onClick={() => navigate(`/wealth/gold/${item.id}`)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
