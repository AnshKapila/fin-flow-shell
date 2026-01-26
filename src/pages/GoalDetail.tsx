import { useParams, useNavigate } from "react-router-dom";
import { Calendar, Pencil, Trash2, Link } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { SummaryCard, SummaryLabel, SummaryValue } from "@/components/ui/summary-card";
import { ListCard } from "@/components/ui/list-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { mockGoals, mockInvestments, formatCurrency } from "@/data/mockData";

export default function GoalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const goal = mockGoals.find(g => g.id === id);
  
  if (!goal) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-muted-foreground">Goal not found</p>
      </div>
    );
  }

  const percent = Math.round((goal.savedAmount / goal.targetAmount) * 100);
  const remaining = goal.targetAmount - goal.savedAmount;

  const linkedInvestments = goal.linkedInvestments?.map(li => {
    const investment = mockInvestments.find(inv => inv.id === li.investmentId);
    return investment ? { ...investment, contribution: li.contribution } : null;
  }).filter(Boolean);

  const getCategoryEmoji = (category: string) => {
    const emojis: Record<string, string> = {
      VEHICLE: "🚗",
      TRAVEL: "✈️",
      LIFESTYLE: "🏠",
      EMERGENCY: "🛡️",
      RETIREMENT: "🎯",
    };
    return emojis[category] || "🎯";
  };

  return (
    <div className="animate-fade-in pb-24">
      <PageHeader 
        title="Goal Details"
        showBack
        showMore
        onMoreClick={() => console.log("More options")}
      />
      
      <div className="px-4 space-y-6">
        {/* Goal Header */}
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-fintrack-card-elevated text-2xl">
            {getCategoryEmoji(goal.category)}
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wide text-primary">
              {goal.category}
            </span>
            <h1 className="text-2xl font-bold text-foreground">{goal.name}</h1>
          </div>
        </div>

        {/* Progress Card */}
        <SummaryCard variant="blue">
          <div className="flex items-center justify-between mb-4">
            <div>
              <SummaryLabel>Saved</SummaryLabel>
              <SummaryValue size="xl" className="mt-1">
                {formatCurrency(goal.savedAmount)}
              </SummaryValue>
            </div>
            <div className="text-right">
              <p className="text-sm text-primary-foreground/70">Target</p>
              <p className="text-xl font-bold text-primary-foreground">
                {formatCurrency(goal.targetAmount)}
              </p>
            </div>
          </div>

          <ProgressBar value={goal.savedAmount} max={goal.targetAmount} variant="blue" />
          
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-primary-foreground/20">
            <div>
              <p className="text-sm text-primary-foreground/70">Progress</p>
              <p className="text-lg font-semibold text-primary-foreground">{percent}%</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-primary-foreground/70">Remaining</p>
              <p className="text-lg font-semibold text-primary-foreground">
                {formatCurrency(remaining)}
              </p>
            </div>
          </div>
        </SummaryCard>

        {/* Deadline */}
        {goal.deadline && (
          <ListCard>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-muted">
                <Calendar className="h-5 w-5 text-muted-foreground" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Target Deadline</p>
                <p className="font-medium text-foreground">In {goal.deadline}</p>
              </div>
            </div>
          </ListCard>
        )}

        {/* Linked Investments */}
        {linkedInvestments && linkedInvestments.length > 0 && (
          <section>
            <h3 className="font-semibold text-foreground mb-3">Linked Investments</h3>
            <div className="space-y-3">
              {linkedInvestments.map((investment: any) => (
                <ListCard 
                  key={investment.id}
                  onClick={() => navigate(`/wealth/${investment.type}/${investment.id}`)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/20">
                      <Link className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-foreground">{investment.name}</p>
                      <p className="text-sm text-muted-foreground">
                        Contributing {formatCurrency(investment.contribution)} / month
                      </p>
                    </div>
                    <span className="text-sm font-medium text-fintrack-green">
                      +{((investment.contribution / goal.targetAmount) * 100).toFixed(1)}%
                    </span>
                  </div>
                </ListCard>
              ))}
            </div>
          </section>
        )}

        {/* Link More Investments CTA */}
        <button className="w-full rounded-xl border-2 border-dashed border-border py-4 text-center text-sm font-medium text-muted-foreground hover:border-primary hover:text-primary transition-colors">
          + Link an Investment
        </button>

        {/* Actions */}
        <div className="flex gap-4">
          <button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-muted py-3 font-medium text-foreground hover:bg-muted/80 transition-colors">
            <Pencil className="h-4 w-4" />
            Edit Goal
          </button>
          <button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-destructive/10 py-3 font-medium text-destructive hover:bg-destructive/20 transition-colors">
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
