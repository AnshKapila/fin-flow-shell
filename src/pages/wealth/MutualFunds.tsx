 import { useNavigate } from "react-router-dom";
 import { RefreshCw } from "lucide-react";
import { SummaryCard, SummaryLabel, SummaryValue } from "@/components/ui/summary-card";
import { HoldingCard } from "@/components/ui/list-card";
import { useInvestments } from "@/hooks/useInvestments";
 import { useMutualFundNav } from "@/hooks/useMutualFundNav";
import { formatCurrency, formatPercent } from "@/data/mockData";
 import { useState, useEffect } from "react";

export default function MutualFundsPage() {
  const navigate = useNavigate();
  const { getInvestmentsByType, getTotalByType, getReturnsPercent, isLoading } = useInvestments();
  
  const funds = getInvestmentsByType("mutual-funds");
 
   // Calculate totals with live NAV data
   const [liveTotals, setLiveTotals] = useState({ current: 0, invested: 0, returns: 0 });
   const [isCalculating, setIsCalculating] = useState(true);
 
   useEffect(() => {
     // Calculate live totals from funds
     let totalCurrent = 0;
     let totalInvested = 0;
     
     funds.forEach(fund => {
       const units = fund.bank ? parseFloat(fund.bank) : 0;
       const purchaseNav = fund.interest_rate || 0;
       // For now, use purchase NAV if live NAV not available
       // In production, you'd fetch NAVs in parallel
       const currentValue = units > 0 ? units * purchaseNav : Number(fund.current_value);
       totalCurrent += currentValue;
       totalInvested += Number(fund.invested_value);
     });
     
     setLiveTotals({
       current: totalCurrent > 0 ? totalCurrent : getTotalByType("mutual-funds").current,
       invested: totalInvested > 0 ? totalInvested : getTotalByType("mutual-funds").invested,
       returns: (totalCurrent > 0 ? totalCurrent : getTotalByType("mutual-funds").current) - 
                (totalInvested > 0 ? totalInvested : getTotalByType("mutual-funds").invested),
     });
     setIsCalculating(false);
   }, [funds]);
 
   const returnsPercent = getReturnsPercent(liveTotals.invested, liveTotals.returns);

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
         <div className="flex items-center gap-2">
           <SummaryValue className="mt-1">{formatCurrency(liveTotals.current)}</SummaryValue>
           {isCalculating && <RefreshCw className="h-4 w-4 animate-spin text-primary-foreground/70" />}
         </div>
        
        <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-primary-foreground/20">
          <div>
            <p className="text-sm text-primary-foreground/70">Total Invested</p>
            <p className="text-lg font-semibold text-primary-foreground">
               {formatCurrency(liveTotals.invested)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-primary-foreground/70">Net Gain</p>
            <div className="flex items-center justify-end gap-2">
              <span className="text-lg font-semibold text-primary-foreground">
                 {formatCurrency(liveTotals.returns)}
              </span>
               {liveTotals.invested > 0 && (
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
        {funds.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No mutual funds added yet</p>
            <p className="text-sm mt-1">Tap the + button to add your first mutual fund</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {funds.map((fund) => {
               // Calculate live values
               const units = fund.bank ? parseFloat(fund.bank) : 0;
               const purchaseNav = fund.interest_rate || 0;
               const currentValue = units > 0 ? units * purchaseNav : Number(fund.current_value);
               const investedValue = Number(fund.invested_value);
               const fundReturnsPercent = investedValue > 0 
                 ? ((currentValue - investedValue) / investedValue) * 100 
                 : 0;
              return (
                <HoldingCard
                  key={fund.id}
                  name={fund.name}
                   subtitle={`${fund.category || "Equity"} • ${units > 0 ? units.toFixed(2) + " units" : ""}`}
                   value={formatCurrency(currentValue, true)}
                   invested={formatCurrency(investedValue)}
                  returns={formatPercent(fundReturnsPercent)}
                  isPositive={fundReturnsPercent >= 0}
                  onClick={() => navigate(`/wealth/mutual-funds/${fund.id}`)}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
