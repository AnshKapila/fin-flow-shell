import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, MoreVertical } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ListCard } from "@/components/ui/list-card";
import { AddGoalModal } from "@/components/modals/AddGoalModal";
import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal";
import { mockGoals, formatCurrency } from "@/data/mockData";
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
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState("ending-soon");

  const handleDelete = (goalId: string) => {
    setSelectedGoal(goalId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    console.log("Deleting goal:", selectedGoal);
    setShowDeleteModal(false);
    setSelectedGoal(null);
  };

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      VEHICLE: "text-primary",
      TRAVEL: "text-primary",
      LIFESTYLE: "text-primary",
      EMERGENCY: "text-fintrack-gold",
      RETIREMENT: "text-fintrack-green",
    };
    return colors[category] || "text-primary";
  };

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
        <div className="space-y-4">
          {mockGoals.map((goal) => {
            const percent = Math.round((goal.savedAmount / goal.targetAmount) * 100);
            
            return (
              <ListCard 
                key={goal.id}
                onClick={() => navigate(`/goals/${goal.id}`)}
                className="cursor-pointer"
              >
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <span className={`text-xs font-semibold uppercase tracking-wide ${getCategoryColor(goal.category)}`}>
                      {goal.category}
                    </span>
                    <h3 className="text-lg font-semibold text-foreground mt-1">{goal.name}</h3>
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
                    {formatCurrency(goal.savedAmount)} of {formatCurrency(goal.targetAmount)}
                  </p>
                  <span className={`font-semibold ${percent >= 50 ? "text-fintrack-green" : "text-primary"}`}>
                    {percent}%
                  </span>
                </div>

                <ProgressBar 
                  value={goal.savedAmount} 
                  max={goal.targetAmount}
                  variant={percent >= 50 ? "blue" : "default"}
                />

                {goal.deadline && (
                  <div className="flex items-center gap-1.5 mt-3 text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4" />
                    <span>Ends in {goal.deadline}</span>
                  </div>
                )}
              </ListCard>
            );
          })}
        </div>
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
