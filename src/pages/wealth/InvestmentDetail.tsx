import { useParams, useNavigate } from "react-router-dom";
import { Pencil, Archive, ChevronRight, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { SummaryCard, SummaryLabel, SummaryValue } from "@/components/ui/summary-card";
import { ListCard } from "@/components/ui/list-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { useInvestments } from "@/hooks/useInvestments";
import { useGoals } from "@/hooks/useGoals";
import { formatCurrency, formatPercent } from "@/data/mockData";
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { useState } from "react";
import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal";
import { toast } from "sonner";

export default function InvestmentDetail() {
  const { type, id } = useParams();
  const navigate = useNavigate();
  const { investments, deleteInvestment, isLoading } = useInvestments();
  const { goals } = useGoals();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const investment = investments.find(inv => inv.id === id);
  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-muted-foreground">Loading...</span>
      </div>
    );
  }
  
  if (!investment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-muted-foreground">Investment not found</p>
        <button 
          onClick={() => navigate(`/wealth/${type}`)}
          className="text-primary font-medium"
        >
          Go back
        </button>
      </div>
    );
  }

  const returnsAmount = Number(investment.current_value) - Number(investment.invested_value);
  const returnsPercent = investment.invested_value > 0 
    ? (returnsAmount / Number(investment.invested_value)) * 100 
    : 0;

  // Generate mock chart data based on investment
  const chartData = [
    { year: "2020", value: Number(investment.invested_value) * 0.8 },
    { year: "2021", value: Number(investment.invested_value) * 0.9 },
    { year: "2022", value: Number(investment.invested_value) },
    { year: "2023", value: Number(investment.invested_value) * 1.1 },
    { year: "2024", value: Number(investment.current_value) },
  ];

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

  const handleDelete = async () => {
    try {
      await deleteInvestment.mutateAsync(investment.id);
      toast.success("Investment deleted successfully");
      navigate(`/wealth/${type}`);
    } catch (error) {
      console.error("Failed to delete investment:", error);
      toast.error("Failed to delete investment");
    }
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
            {investment.risk_level && (
              <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                {investment.risk_level}
              </span>
            )}
          </div>
        </div>

        {/* Value Summary Card */}
        <SummaryCard variant="blue">
          <SummaryLabel>Current Value</SummaryLabel>
          <SummaryValue size="2xl" className="mt-1">
            {formatCurrency(investment.current_value)}
          </SummaryValue>
          
          <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-primary-foreground/20">
            <div>
              <p className="text-sm text-primary-foreground/70">Invested</p>
              <p className="text-lg font-semibold text-primary-foreground">
                {formatCurrency(investment.invested_value)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-primary-foreground/70">Abs. Returns</p>
              <div className="flex items-center justify-end gap-2">
                <span className="text-lg font-semibold text-primary-foreground">
                  {returnsAmount >= 0 ? "↗" : "↘"} {formatCurrency(Math.abs(returnsAmount))}
                </span>
              </div>
              <span className={`inline-block mt-1 rounded-full px-2 py-0.5 text-xs font-bold text-primary-foreground ${
                returnsPercent >= 0 ? "bg-fintrack-green" : "bg-fintrack-red-soft"
              }`}>
                {formatPercent(returnsPercent)}
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

        {/* FD-specific info */}
        {type === "fd" && investment.maturity_value && (
          <ListCard>
            <h3 className="font-semibold text-foreground mb-3">FD Details</h3>
            <div className="space-y-2 text-sm">
              {investment.interest_rate && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Interest Rate</span>
                  <span className="font-medium text-foreground">{investment.interest_rate}% p.a.</span>
                </div>
              )}
              {investment.maturity_date && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Maturity Period</span>
                  <span className="font-medium text-foreground">{investment.maturity_date}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Maturity Value</span>
                <span className="font-medium text-foreground">{formatCurrency(investment.maturity_value)}</span>
              </div>
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
            {investment.added_date && (
              <p className="text-xs text-muted-foreground mt-4">
                📝 Added on {investment.added_date}
              </p>
            )}
          </ListCard>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <button className="flex items-center gap-2 text-primary font-medium">
            <Pencil className="h-4 w-4" />
            Edit Investment
          </button>
          <button 
            className="flex items-center gap-2 text-destructive font-medium"
            onClick={() => setShowDeleteModal(true)}
          >
            <Trash2 className="h-4 w-4" />
            Delete Investment
          </button>
        </div>
      </div>

      <DeleteConfirmModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onConfirm={handleDelete}
        title="Delete Investment"
        description={`Are you sure you want to delete "${investment.name}"? This action cannot be undone.`}
      />
    </div>
  );
}
