import { useNavigate } from "react-router-dom";
import { SummaryCard, SummaryLabel, SummaryValue } from "@/components/ui/summary-card";
import { HoldingCard } from "@/components/ui/list-card";
import { useInvestments } from "@/hooks/useInvestments";
import { useGoldPrice } from "@/hooks/useGoldPrice";
import { formatCurrency, formatPercent } from "@/data/mockData";
import { RefreshCw } from "lucide-react";
import { format } from "date-fns";

export default function GoldPage() {
  const navigate = useNavigate();
  const { getInvestmentsByType, isLoading } = useInvestments();
  const { goldPrice, isLoading: priceLoading, refetch } = useGoldPrice();
  
  const gold = getInvestmentsByType("gold");
  
  // Calculate totals using live price
  const calculateGoldValues = () => {
    let totalInvested = 0;
    let totalCurrentValue = 0;
    
    gold.forEach(item => {
      const weightInGrams = parseFloat(item.risk_level?.replace("g", "") || "0");
      const currentValue = weightInGrams * goldPrice.price_per_gram_24k;
      
      totalInvested += Number(item.invested_value);
      totalCurrentValue += currentValue;
    });
    
    return {
      invested: totalInvested,
      current: totalCurrentValue,
      returns: totalCurrentValue - totalInvested,
    };
  };
  
  const totals = calculateGoldValues();
  const returnsPercent = totals.invested > 0 ? (totals.returns / totals.invested) * 100 : 0;

  if (isLoading || priceLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="text-muted-foreground">Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      {/* Live Price Banner */}
      <div className="flex items-center justify-between p-3 rounded-lg bg-fintrack-gold/10 border border-fintrack-gold/20">
        <div>
          <p className="text-xs text-muted-foreground">Live Gold (24K)</p>
          <p className="font-bold text-foreground">{formatCurrency(goldPrice.price_per_gram_24k)}/g</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {format(new Date(goldPrice.last_updated), "h:mm a")}
          </span>
          <button 
            onClick={() => refetch()}
            className="p-1.5 rounded-md hover:bg-muted text-muted-foreground"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        </div>
      </div>

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
        <h2 className="text-lg font-semibold text-foreground mb-4">Your Gold Holdings</h2>
        {gold.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No gold holdings added yet</p>
            <p className="text-sm mt-1">Tap the + button to add your first gold investment</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {gold.map((item) => {
              const weightInGrams = parseFloat(item.risk_level?.replace("g", "") || "0");
              const currentValue = weightInGrams * goldPrice.price_per_gram_24k;
              const gainLoss = currentValue - Number(item.invested_value);
              const itemReturnsPercent = item.invested_value > 0 
                ? (gainLoss / Number(item.invested_value)) * 100 
                : 0;
              
              const goldTypeLabel = {
                digital: "Digital Gold",
                physical: "Physical Gold",
                sgb: "SGB",
              }[item.category || "digital"] || "Gold";
              
              return (
                <HoldingCard
                  key={item.id}
                  name={item.name}
                  subtitle={`${goldTypeLabel} • ${weightInGrams.toFixed(3)}g`}
                  value={formatCurrency(currentValue)}
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
