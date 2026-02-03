import { useNavigate } from "react-router-dom";
import { SummaryCard, SummaryLabel, SummaryValue } from "@/components/ui/summary-card";
import { ListCard } from "@/components/ui/list-card";
import { useInvestments } from "@/hooks/useInvestments";
import { formatCurrency } from "@/data/mockData";
import { calculateFDDetails, formatTenure, parseDate } from "@/lib/fdCalculations";
import { MoreHorizontal } from "lucide-react";
import { format } from "date-fns";

export default function FixedDepositsPage() {
  const navigate = useNavigate();
  const { getInvestmentsByType, isLoading } = useInvestments();
  
  const fds = getInvestmentsByType("fd");
  
  // Calculate values for each FD with time-based logic
  const fdsWithCalculations = fds.map(fd => {
    const startDate = parseDate(fd.start_date);
    const hasStructuredData = startDate && fd.tenure_value && fd.tenure_unit;
    
    if (hasStructuredData) {
      const calculated = calculateFDDetails({
        principal: Number(fd.invested_value),
        interestRate: Number(fd.interest_rate) || 0,
        startDate: startDate!,
        tenureValue: fd.tenure_value!,
        tenureUnit: fd.tenure_unit as "months" | "years",
      });
      
      return {
        ...fd,
        calculatedCurrentValue: calculated.currentValue,
        calculatedMaturityValue: calculated.maturityAmount,
        maturityDateFormatted: format(calculated.maturityDate, "dd MMM yyyy"),
        isMatured: calculated.isMatured,
        tenureFormatted: formatTenure(fd.tenure_value!, fd.tenure_unit as "months" | "years"),
      };
    }
    
    return {
      ...fd,
      calculatedCurrentValue: Number(fd.current_value),
      calculatedMaturityValue: Number(fd.maturity_value) || Number(fd.current_value),
      maturityDateFormatted: fd.maturity_date || null,
      isMatured: false,
      tenureFormatted: fd.maturity_date,
    };
  });
  
  // Calculate totals
  const totalInvested = fdsWithCalculations.reduce((sum, fd) => sum + Number(fd.invested_value), 0);
  const totalCurrent = fdsWithCalculations.reduce((sum, fd) => sum + fd.calculatedCurrentValue, 0);
  const totalMaturity = fdsWithCalculations.reduce((sum, fd) => sum + fd.calculatedMaturityValue, 0);
  const totalInterest = totalMaturity - totalInvested;

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
        <p className="text-sm text-primary-foreground/80 mt-1">Current Value</p>
        <SummaryValue className="mt-1">{formatCurrency(totalCurrent)}</SummaryValue>
        
        <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-primary-foreground/20">
          <div>
            <p className="text-sm text-primary-foreground/70">Total Invested</p>
            <p className="text-lg font-semibold text-primary-foreground">
              {formatCurrency(totalInvested)}
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-primary-foreground/70">Expected Interest</p>
            <p className="text-lg font-semibold text-primary-foreground">
              +{formatCurrency(totalInterest)}
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
            {fdsWithCalculations.map((fd) => (
              <ListCard 
                key={fd.id} 
                onClick={() => navigate(`/wealth/fd/${fd.id}`)}
                className="cursor-pointer"
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-semibold text-foreground">{fd.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(fd.invested_value)} → {formatCurrency(fd.calculatedMaturityValue)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {fd.maturityDateFormatted && (
                    <span className={`rounded-full px-3 py-1 text-xs ${
                      fd.isMatured 
                        ? "bg-fintrack-green/20 text-fintrack-green" 
                        : "bg-muted text-muted-foreground"
                    }`}>
                      {fd.isMatured ? "Matured" : `Matures: ${fd.maturityDateFormatted}`}
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
