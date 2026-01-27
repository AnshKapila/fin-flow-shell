import { useParams, useNavigate } from "react-router-dom";
import { Calendar, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { SummaryCard, SummaryLabel, SummaryValue } from "@/components/ui/summary-card";
import { ListCard } from "@/components/ui/list-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal";
import { useGoal, useGoals } from "@/hooks/useGoals";
import { formatCurrency } from "@/data/mockData";
import { useState } from "react";

export default function GoalDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const { data: goal, isLoading } = useGoal(id);
  const { deleteGoal } = useGoals();

  const handleDelete = () => {
    if (goal) {
      deleteGoal.mutate(goal.id, {
        onSuccess: () => {
          navigate("/goals");
        },
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

  const percent = goal.target_amount > 0 
    ? Math.round((goal.current_amount / goal.target_amount) * 100)
    : 0;
  const remaining = goal.target_amount - goal.current_amount;

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
            🎯
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">{goal.name}</h1>
            <p className="text-sm text-muted-foreground">
              Created {new Date(goal.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Progress Card */}
        <SummaryCard variant="blue">
          <div className="flex items-center justify-between mb-4">
            <div>
              <SummaryLabel>Saved</SummaryLabel>
              <SummaryValue size="xl" className="mt-1">
                {formatCurrency(goal.current_amount)}
              </SummaryValue>
            </div>
            <div className="text-right">
              <p className="text-sm text-primary-foreground/70">Target</p>
              <p className="text-xl font-bold text-primary-foreground">
                {formatCurrency(goal.target_amount)}
              </p>
            </div>
          </div>

          <ProgressBar value={goal.current_amount} max={goal.target_amount} variant="blue" />
          
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
    </div>
  );
}
