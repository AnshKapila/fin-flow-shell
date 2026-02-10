import { useParams, useNavigate } from "react-router-dom";
import { Calendar, Pencil, Trash2, Link2, Plus } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { SummaryCard, SummaryLabel, SummaryValue } from "@/components/ui/summary-card";
import { ListCard } from "@/components/ui/list-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal";
import { LinkAssetModal } from "@/components/modals/LinkAssetModal";
import { useGoal, useGoals } from "@/hooks/useGoals";
import { useInvestments } from "@/hooks/useInvestments";
import { useGoldPrice } from "@/hooks/useGoldPrice";
import { formatCurrency } from "@/data/mockData";
import { useState } from "react";
import { Button } from "@/components/ui/button";

const typeLabels: Record<string, string> = {
  stocks: "Stock",
  "mutual-funds": "Mutual Fund",
  gold: "Gold",
  fd: "Fixed Deposit",
  savings: "Savings",
};

export default function GoalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showLinkModal, setShowLinkModal] = useState(false);
  
  const { data: goal, isLoading } = useGoal(id);
  const { deleteGoal } = useGoals();
  const { investments } = useInvestments();
  const { goldPrice } = useGoldPrice();

  const linkedAssets = investments.filter(inv => inv.goal_id === id);

  const getAssetValue = (inv: typeof investments[0]) => {
    if (inv.type === "gold") {
      const weight = parseFloat(inv.risk_level?.replace("g", "") || "0");
      return weight * goldPrice.price_per_gram_24k;
    }
    return Number(inv.current_value);
  };

  const linkedTotal = linkedAssets.reduce((sum, inv) => sum + getAssetValue(inv), 0);

  const handleDelete = () => {
    if (goal) {
      deleteGoal.mutate(goal.id, {
        onSuccess: () => navigate("/goals"),
      });
    }
    setShowDeleteModal(false);
  };
  
  if (isLoading) {
    return (
      <div className="animate-fade-in pb-24">
        <PageHeader title="Goal Details" showBack />
        <div className="px-4 flex items-center justify-center py-12">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="animate-fade-in pb-24">
        <PageHeader title="Goal Details" showBack />
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Goal not found</p>
        </div>
      </div>
    );
  }

  const progressAmount = linkedAssets.length > 0 ? linkedTotal : goal.current_amount;
  const percent = goal.target_amount > 0 
    ? Math.min(100, Math.round((progressAmount / goal.target_amount) * 100))
    : 0;
  const remaining = goal.target_amount - progressAmount;
  const isCompleted = progressAmount >= goal.target_amount;

  return (
    <div className="animate-fade-in pb-24">
      <PageHeader 
        title="Goal Details"
        showBack
      />
      
      <div className="px-4 space-y-6">
        {/* Goal Header */}
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-fintrack-card-elevated text-2xl">
            🎯
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{goal.name}</h1>
            <p className="text-sm text-muted-foreground">
              Created {new Date(goal.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Completed banner */}
        {isCompleted && (
          <div className="rounded-xl bg-fintrack-green/10 border border-fintrack-green/20 p-3">
            <p className="text-sm font-medium text-fintrack-green">
              ✓ Goal completed using assigned assets
            </p>
          </div>
        )}

        {/* Progress Card */}
        <SummaryCard variant="blue">
          <div className="flex items-center justify-between mb-4">
            <div>
              <SummaryLabel>{linkedAssets.length > 0 ? "Assets Value" : "Saved"}</SummaryLabel>
              <SummaryValue size="xl" className="mt-1">
                {formatCurrency(progressAmount)}
              </SummaryValue>
            </div>
            <div className="text-right">
              <p className="text-sm text-primary-foreground/70">Target</p>
              <p className="text-xl font-bold text-primary-foreground">
                {formatCurrency(goal.target_amount)}
              </p>
            </div>
          </div>

          <ProgressBar value={progressAmount} max={goal.target_amount} variant="blue" />
          
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-primary-foreground/20">
            <div>
              <p className="text-sm text-primary-foreground/70">Progress</p>
              <p className="text-lg font-semibold text-primary-foreground">{percent}%</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-primary-foreground/70">Remaining</p>
              <p className="text-lg font-semibold text-primary-foreground">
                {formatCurrency(remaining > 0 ? remaining : 0)}
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
                <p className="font-medium text-foreground">
                  {new Date(goal.deadline).toLocaleDateString()}
                </p>
              </div>
            </div>
          </ListCard>
        )}

        {/* Linked Assets */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-foreground">Dedicated Assets</h3>
            <button
              onClick={() => setShowLinkModal(true)}
              className="flex items-center gap-1 text-sm font-medium text-primary"
            >
              <Plus className="h-4 w-4" />
              Link Asset
            </button>
          </div>
          {linkedAssets.length === 0 ? (
            <ListCard>
              <div className="text-center py-4">
                <Link2 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No assets linked yet</p>
                <button
                  onClick={() => setShowLinkModal(true)}
                  className="text-sm font-medium text-primary mt-1"
                >
                  Assign assets to this goal
                </button>
              </div>
            </ListCard>
          ) : (
            <div className="space-y-2">
              {linkedAssets.map((inv) => (
                <ListCard
                  key={inv.id}
                  onClick={() => navigate(`/wealth/${inv.type}/${inv.id}`)}
                  className="cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-foreground text-sm">{inv.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {typeLabels[inv.type] || inv.type}
                      </p>
                    </div>
                    <p className="font-semibold text-foreground text-sm">
                      {formatCurrency(getAssetValue(inv))}
                    </p>
                  </div>
                </ListCard>
              ))}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button 
            onClick={() => navigate(`/goals/${goal.id}/edit`)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-muted py-3 font-medium text-foreground hover:bg-muted/80 transition-colors"
          >
            <Pencil className="h-4 w-4" />
            Edit Goal
          </button>
          <button 
            onClick={() => setShowDeleteModal(true)}
            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-destructive/10 py-3 font-medium text-destructive hover:bg-destructive/20 transition-colors"
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </button>
        </div>
      </div>

      <DeleteConfirmModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        title="Delete Goal"
        description="Are you sure you want to delete this goal? This action cannot be undone."
        onConfirm={handleDelete}
      />

      <LinkAssetModal
        open={showLinkModal}
        onOpenChange={setShowLinkModal}
        goalId={goal.id}
      />
    </div>
  );
}
