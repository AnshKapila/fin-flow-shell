import { useNavigate } from "react-router-dom";
import { SummaryCard, SummaryLabel, SummaryValue } from "@/components/ui/summary-card";
import { ListCard } from "@/components/ui/list-card";
import { useInvestments } from "@/hooks/useInvestments";
import { formatCurrency } from "@/data/mockData";
import { MoreHorizontal } from "lucide-react";

export default function FixedDepositsPage() {
  const navigate = useNavigate();
  const { getInvestmentsByType, getTotalByType, isLoading } = useInvestments();
  
  const fds = getInvestmentsByType("fd");
  const totals = getTotalByType("fd");
  
  // Calculate total maturity and interest
  const totalMaturity = fds.reduce((sum, fd) => sum + (Number(fd.maturity_value) || Number(fd.current_value)), 0);
  const totalInterest = totalMaturity - totals.invested;

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
          {fds.length > 0 && (
            <button className="text-sm font-medium text-primary">See All</button>
          )}
        </div>
        
        {fds.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No fixed deposits added yet</p>
            <p className="text-sm mt-1">Tap the + button to add your first FD</p>
          </div>
        ) : (
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
                      {formatCurrency(fd.invested_value)} → {formatCurrency(Number(fd.maturity_value) || fd.current_value)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {fd.maturity_date && (
                    <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                      Matures in {fd.maturity_date}
                    </span>
                  )}
                  {fd.interest_rate && (
                    <span className="rounded-full bg-muted px-3 py-1 text-xs text-muted-foreground">
                      {fd.interest_rate}% p.a.
                    </span>
                  )}
                  <button className="ml-auto flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted">
                    <MoreHorizontal className="h-4 w-4" />
                  </button>
                </div>
              </ListCard>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
