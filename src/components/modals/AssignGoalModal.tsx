import { useState } from "react";
import { useGoals } from "@/hooks/useGoals";
import { useInvestments } from "@/hooks/useInvestments";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AssignGoalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  investmentId: string;
  currentGoalId?: string | null;
}

export function AssignGoalModal({ open, onOpenChange, investmentId, currentGoalId }: AssignGoalModalProps) {
  const { goals } = useGoals();
  const { updateInvestment } = useInvestments();
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(currentGoalId || null);

  const handleSave = () => {
    updateInvestment.mutate(
      { id: investmentId, goal_id: selectedGoalId } as any,
      {
        onSuccess: () => onOpenChange(false),
      }
    );
  };

  const handleUnassign = () => {
    updateInvestment.mutate(
      { id: investmentId, goal_id: null } as any,
      {
        onSuccess: () => onOpenChange(false),
      }
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>Dedicate to Goal</DialogTitle>
        </DialogHeader>
        <div className="space-y-2 max-h-64 overflow-y-auto">
          {goals.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">
              No goals created yet
            </p>
          ) : (
            goals.map((goal) => (
              <button
                key={goal.id}
                onClick={() => setSelectedGoalId(goal.id)}
                className={cn(
                  "w-full text-left rounded-xl p-3 border transition-colors",
                  selectedGoalId === goal.id
                    ? "border-primary bg-primary/10"
                    : "border-border hover:bg-muted"
                )}
              >
                <p className="font-medium text-foreground text-sm">{goal.name}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Target: ₹{goal.target_amount.toLocaleString("en-IN")}
                </p>
              </button>
            ))
          )}
        </div>
        <div className="flex gap-2 pt-2">
          {currentGoalId && (
            <Button variant="outline" className="flex-1" onClick={handleUnassign}>
              Unassign
            </Button>
          )}
          <Button 
            className="flex-1" 
            onClick={handleSave}
            disabled={!selectedGoalId || selectedGoalId === currentGoalId}
          >
            Assign
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
