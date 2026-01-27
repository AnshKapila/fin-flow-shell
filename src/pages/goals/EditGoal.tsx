import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGoal, useGoals } from "@/hooks/useGoals";

export default function EditGoal() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { data: goal, isLoading } = useGoal(id);
  const { updateGoal } = useGoals();

  const [name, setName] = useState("");
  const [targetAmount, setTargetAmount] = useState("");
  const [currentAmount, setCurrentAmount] = useState("");
  const [deadline, setDeadline] = useState("");

  useEffect(() => {
    if (goal) {
      setName(goal.name);
      setTargetAmount(goal.target_amount.toString());
      setCurrentAmount(goal.current_amount.toString());
      setDeadline(goal.deadline || "");
    }
  }, [goal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!id) return;

    await updateGoal.mutateAsync({
      id,
      name,
      target_amount: parseFloat(targetAmount) || 0,
      current_amount: parseFloat(currentAmount) || 0,
      deadline: deadline || null,
    });
    
    navigate(`/goals/${id}`);
  };

  if (isLoading) {
    return (
      <div className="animate-fade-in pb-24">
        <PageHeader title="Edit Goal" showBack />
        <div className="px-4 flex items-center justify-center py-12">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  if (!goal) {
    return (
      <div className="animate-fade-in pb-24">
        <PageHeader title="Edit Goal" showBack />
        <div className="flex items-center justify-center py-12">
          <p className="text-muted-foreground">Goal not found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-24">
      <PageHeader title="Edit Goal" showBack />
      
      <div className="px-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="goal-name" className="text-muted-foreground">Goal Name</Label>
            <Input
              id="goal-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Buy a Car"
              className="bg-muted border-border"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="target" className="text-muted-foreground">Target Amount</Label>
            <Input
              id="target"
              type="number"
              value={targetAmount}
              onChange={(e) => setTargetAmount(e.target.value)}
              placeholder="₹0"
              className="bg-muted border-border"
              required
              min="1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="current" className="text-muted-foreground">Current Amount</Label>
            <Input
              id="current"
              type="number"
              value={currentAmount}
              onChange={(e) => setCurrentAmount(e.target.value)}
              placeholder="₹0"
              className="bg-muted border-border"
              min="0"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="deadline" className="text-muted-foreground">Deadline (Optional)</Label>
            <Input
              id="deadline"
              type="date"
              value={deadline}
              onChange={(e) => setDeadline(e.target.value)}
              className="bg-muted border-border"
            />
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate(-1)}
              className="flex-1 border-border"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1"
              disabled={updateGoal.isPending}
            >
              {updateGoal.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
