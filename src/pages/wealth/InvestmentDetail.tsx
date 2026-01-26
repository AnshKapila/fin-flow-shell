import { useParams, useNavigate } from "react-router-dom";
import { Pencil, Archive, ChevronRight } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { SummaryCard, SummaryLabel, SummaryValue } from "@/components/ui/summary-card";
import { ListCard } from "@/components/ui/list-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { mockInvestments, mockGoals, formatCurrency, formatPercent } from "@/data/mockData";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";

// Mock chart data
const chartData = [
  { year: "2020", value: 18000 },
  { year: "2021", value: 16000 },
  { year: "2022", value: 19000 },
  { year: "2023", value: 22000 },
  { year: "2024", value: 24592 },
];

export default function InvestmentDetail() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  
  const investment = mockInvestments.find(inv => inv.id === id);
  
  if (!investment) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Investment not found</p>
      </div>
    );
  }

  const linkedGoals = investment.linkedGoals?.map(lg => {
    const goal = mockGoals.find(g => g.id === lg.goalId);
    return goal ? { ...goal, contribution: lg.contribution } : null;
  }).filter(Boolean);

  const getTypeName = (t: string) => {
    const names: Record<string, string> = {
      stocks: "Stock",
      "mutual-funds": "Mutual Fund",
      gold: "Gold",
      fd: "Fixed Deposit",
      savings: "Savings",
    };
    return names[t] || "Investment";
  };

  return (
    <div className="animate-fade-in pb-24">
      <PageHeader 
        title={getTypeName(type || "")}
        showBack
        showMore
        onMoreClick={() => console.log("More options")}
      />
      
      <div className="px-4 space-y-6">
        {/* Name & Tags */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">{investment.name}</h1>
          <div className="flex gap-2 mt-2">
            {investment.category && (
              <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                {investment.category}
              </span>
            )}
            {investment.riskLevel && (
              <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                {investment.riskLevel}
              </span>
            )}
          </div>
        </div>

        {/* Value Summary Card */}
        <SummaryCard variant="blue">
          <SummaryLabel>Current Value</SummaryLabel>
          <SummaryValue size="2xl" className="mt-1">
            {formatCurrency(investment.currentValue)}
          </SummaryValue>
          
          <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-primary-foreground/20">
            <div>
              <p className="text-sm text-primary-foreground/70">Invested</p>
              <p className="text-lg font-semibold text-primary-foreground">
                {formatCurrency(investment.investedValue)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-primary-foreground/70">Abs. Returns</p>
              <div className="flex items-center justify-end gap-2">
                <span className="text-lg font-semibold text-primary-foreground">
                  ↗ {formatCurrency(investment.returns)}
                </span>
              </div>
              <span className="inline-block mt-1 rounded-full bg-fintrack-green px-2 py-0.5 text-xs font-bold text-primary-foreground">
                {formatPercent(investment.returnsPercent)}
              </span>
            </div>
          </div>
        </SummaryCard>

        {/* Growth Chart */}
        {type !== "fd" && type !== "savings" && (
          <ListCard>
            <h3 className="font-semibold text-foreground mb-4">Growth Over Time</h3>
            <div className="flex gap-2 mb-4">
              {["1Y", "5Y", "All"].map((period) => (
                <button
                  key={period}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${
                    period === "5Y"
                      ? "bg-primary text-primary-foreground"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {period}
                </button>
              ))}
            </div>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData}>
                  <XAxis 
                    dataKey="year" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fill: "hsl(var(--muted-foreground))", fontSize: 12 }}
                  />
                  <YAxis hide />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "hsl(var(--card))", 
                      border: "1px solid hsl(var(--border))",
                      borderRadius: "8px",
                      color: "hsl(var(--foreground))"
                    }}
                    formatter={(value) => [formatCurrency(value as number), "Value"]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="value" 
                    stroke="hsl(var(--fintrack-green))" 
                    strokeWidth={2}
                    dot={false}
                    strokeDasharray="5 5"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ListCard>
        )}

        {/* Why I Invested */}
        {investment.notes && (
          <ListCard>
            <h3 className="font-semibold text-foreground mb-3">Why I Invested</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              "{investment.notes}"
            </p>
            {investment.addedDate && (
              <p className="text-xs text-muted-foreground mt-4">
                📝 Added on {investment.addedDate}
              </p>
            )}
          </ListCard>
        )}

        {/* Linked Goals */}
        {linkedGoals && linkedGoals.length > 0 && (
          <section>
            <h3 className="font-semibold text-foreground mb-3">Linked Goals</h3>
            {linkedGoals.map((goal: any) => {
              const percent = Math.round((goal.savedAmount / goal.targetAmount) * 100);
              return (
                <ListCard 
                  key={goal.id}
                  onClick={() => navigate(`/goals/${goal.id}`)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-fintrack-gold/20">
                      <span className="text-lg">🎯</span>
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{goal.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Goal: {formatCurrency(goal.targetAmount)} • {formatCurrency(goal.contribution)} contributed
                      </p>
                      <ProgressBar value={goal.savedAmount} max={goal.targetAmount} size="sm" className="mt-2" />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-primary">{percent}%</span>
                      <ChevronRight className="h-5 w-5 text-muted-foreground" />
                    </div>
                  </div>
                </ListCard>
              );
            })}
          </section>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <button className="flex items-center gap-2 text-primary font-medium">
            <Pencil className="h-4 w-4" />
            Edit Investment
          </button>
          <button className="flex items-center gap-2 text-muted-foreground font-medium">
            <Archive className="h-4 w-4" />
            Archive Investment
          </button>
        </div>
      </div>
    </div>
  );
}
