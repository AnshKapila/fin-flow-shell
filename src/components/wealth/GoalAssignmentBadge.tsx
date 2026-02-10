import { Target } from "lucide-react";
import { useGoals } from "@/hooks/useGoals";

interface GoalAssignmentBadgeProps {
  goalId: string | null | undefined;
  onAssign: () => void;
}

export function GoalAssignmentBadge({ goalId, onAssign }: GoalAssignmentBadgeProps) {
  const { goals } = useGoals();
  const goal = goalId ? goals.find(g => g.id === goalId) : null;

  return (
    <button
      onClick={onAssign}
      className="flex items-center gap-2 rounded-lg border border-border px-3 py-2 text-sm hover:bg-muted transition-colors w-full"
    >
      <Target className="h-4 w-4 text-muted-foreground shrink-0" />
      {goal ? (
        <span className="text-foreground">
          Dedicated to: <span className="font-medium text-primary">{goal.name}</span>
        </span>
      ) : (
        <span className="text-muted-foreground">Assign to a goal</span>
      )}
    </button>
  );
}
