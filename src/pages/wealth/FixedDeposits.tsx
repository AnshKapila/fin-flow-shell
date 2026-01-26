import { useNavigate } from "react-router-dom";
import { SummaryCard, SummaryLabel, SummaryValue } from "@/components/ui/summary-card";
import { ListCard } from "@/components/ui/list-card";
import { getInvestmentsByType, getTotalByType, formatCurrency } from "@/data/mockData";
import { MoreHorizontal } from "lucide-react";

export default function FixedDepositsPage() {
  const navigate = useNavigate();
  const fds = getInvestmentsByType("fd");
  const totals = getTotalByType("fd");
  
  // Calculate total maturity and interest
  const totalMaturity = fds.reduce((sum, fd) => sum + (fd.maturityValue || fd.currentValue), 0);
  const totalInterest = totalMaturity - totals.invested;

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      {/* Summary Card */}
      <SummaryCard variant="blue">
        <p className="text-xs font-medium uppercase tracking-wide text-primary-foreground/70">
          FD SUMMARY
        </p>
        <p className="text-sm text-primary-foreground/80 mt-1">Total Invested</p>
        <SummaryValue className="mt-1">{formatCurrency(totals.invested)}</SummaryValue>
        
        <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-primary-foreground/20">
          <div>
            <p className="text-sm text-primary-foreground/70">Maturity Value</p>
            <p className="text-lg font-semibold text-primary-foreground">
              {formatCurrency(totalMaturity)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-primary-foreground/70">Interest Earned</p>
            <p className="text-lg font-semibold text-primary-foreground">
              {formatCurrency(totalInterest)}
            </p>
          </div>
        </div>
      </SummaryCard>

      {/* FD List */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Your Fixed Deposits</h2>
          <button className="text-sm font-medium text-primary">See All</button>
        </div>
        
        <div className="space-y-3">
          {fds.map((fd) => (
            <ListCard 
              key={fd.id} 
              onClick={() => navigate(`/wealth/fd/${fd.id}`)}
              className="cursor-pointer"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="font-semibold text-foreground">{fd.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatCurrency(fd.investedValue)} → {formatCurrency(fd.maturityValue || fd.currentValue)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                  Matures in {fd.maturityDate}
                </span>
                <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                  {fd.interestRate}% p.a.
                </span>
                <button className="ml-auto flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </div>
            </ListCard>
          ))}
        </div>
      </section>
    </div>
  );
}
