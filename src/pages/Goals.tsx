import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, MoreVertical } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ListCard } from "@/components/ui/list-card";
import { AddGoalModal } from "@/components/modals/AddGoalModal";
import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal";
import { useGoals } from "@/hooks/useGoals";
import { formatCurrency } from "@/data/mockData";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const sortOptions = [
  { id: "ending-soon", label: "Ending soon" },
  { id: "highest-target", label: "Highest target" },
  { id: "most-collected", label: "Most collected" },
  { id: "least-collected", label: "Least collected" },
];

export default function GoalsPage() {
  const navigate = useNavigate();
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("ending-soon");

  const { goals, isLoading, deleteGoal } = useGoals();

  const handleDelete = (goalId: string) => {
    setSelectedGoalId(goalId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    if (selectedGoalId) {
      deleteGoal.mutate(selectedGoalId);
    }
    setShowDeleteModal(false);
    setSelectedGoalId(null);
  };

  // Sort goals based on selected option
  const sortedGoals = [...goals].sort((a, b) => {
    switch (sortBy) {
      case "highest-target":
        return b.target_amount - a.target_amount;
      case "most-collected":
        return b.current_amount - a.current_amount;
      case "least-collected":
        return a.current_amount - b.current_amount;
      case "ending-soon":
      default:
        // Sort by deadline (nulls last)
        if (!a.deadline && !b.deadline) return 0;
        if (!a.deadline) return 1;
        if (!b.deadline) return -1;
        return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    }
  });

  if (isLoading) {
    return (
      <div className="animate-fade-in pb-32">
        <PageHeader title="Goals" subtitle="Track what you're saving for" />
        <div className="px-4 flex items-center justify-center py-12">
          <div className="animate-pulse text-muted-foreground">Loading goals...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-32">
      <PageHeader 
        title="Goals" 
        subtitle="Track what you're saving for"
        showSearch
      />
      
      <div className="px-4">
        {/* Sort Control */}
        <div className="flex items-center justify-end gap-2 mb-4">
          <span className="text-sm text-muted-foreground">SORT BY</span>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[140px] bg-muted border-border text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {sortOptions.map((option) => (
                <SelectItem key={option.id} value={option.id}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Goals List */}
        {sortedGoals.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-muted-foreground">No goals yet. Create your first goal!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedGoals.map((goal) => {
              const percent = goal.target_amount > 0 
                ? Math.round((goal.current_amount / goal.target_amount) * 100)
                : 0;
              
              return (
                <ListCard 
                  key={goal.id}
                  onClick={() => navigate(`/goals/${goal.id}`)}
                  className="cursor-pointer"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <h3 className="text-lg font-semibold text-foreground">{goal.name}</h3>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button 
                          className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-muted hover:text-foreground"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="h-5 w-5" />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={(e) => { e.stopPropagation(); navigate(`/goals/${goal.id}/edit`); }}>
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={(e) => { e.stopPropagation(); handleDelete(goal.id); }}
                          className="text-destructive"
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  <div className="flex items-center justify-between mb-2">
                    <p className="text-sm text-muted-foreground">
                      {formatCurrency(goal.current_amount)} of {formatCurrency(goal.target_amount)}
                    </p>
                    <span className={`font-semibold ${percent >= 50 ? "text-fintrack-green" : "text-primary"}`}>
                      {percent}%
                    </span>
                  </div>

                  <ProgressBar 
                    value={goal.current_amount} 
                    max={goal.target_amount}
                    variant={percent >= 50 ? "blue" : "default"}
                  />

                  {goal.deadline && (
                    <div className="flex items-center gap-1.5 mt-3 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <span>Deadline: {new Date(goal.deadline).toLocaleDateString()}</span>
                    </div>
                  )}
                </ListCard>
              );
            })}
          </div>
        )}
      </div>

      <FloatingActionButton 
        label="Add New Goal" 
        onClick={() => setShowAddModal(true)} 
      />

      <AddGoalModal 
        open={showAddModal} 
        onOpenChange={setShowAddModal} 
      />

      <DeleteConfirmModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        title="Delete Goal"
        description="Are you sure you want to delete this goal? This action cannot be undone."
        onConfirm={confirmDelete}
      />
    </div>
  );
}
