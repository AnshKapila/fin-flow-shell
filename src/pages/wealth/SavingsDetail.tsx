import { useParams, useNavigate } from "react-router-dom";
import { MoreVertical, Trash2, CalendarDays, Building2, CreditCard } from "lucide-react";
import { GoalAssignmentBadge } from "@/components/wealth/GoalAssignmentBadge";
import { AssignGoalModal } from "@/components/modals/AssignGoalModal";
import { PageHeader } from "@/components/layout/PageHeader";
import { SummaryCard, SummaryLabel, SummaryValue } from "@/components/ui/summary-card";
import { ListCard } from "@/components/ui/list-card";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useInvestments } from "@/hooks/useInvestments";
import { formatCurrency } from "@/data/mockData";
import { useState } from "react";
import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal";
import { toast } from "sonner";
import { parseISO, format } from "date-fns";

export default function SavingsDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { investments, deleteInvestment, isLoading } = useInvestments();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showGoalModal, setShowGoalModal] = useState(false);
  
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
        <p className="text-muted-foreground">Account not found</p>
        <button 
          onClick={() => navigate("/wealth/savings")}
          className="text-primary font-medium"
        >
          Go back
        </button>
      </div>
    );
  }

  const currentBalance = Number(investment.current_value);
  const startDate = investment.start_date ? parseISO(investment.start_date) : null;

  const handleDelete = async () => {
    try {
      await deleteInvestment.mutateAsync(investment.id);
      toast.success("Savings account removed successfully");
      navigate("/wealth/savings");
    } catch (error) {
      console.error("Failed to delete account:", error);
      toast.error("Failed to remove account");
    }
  };

  const menuContent = (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8">
          <MoreVertical className="h-5 w-5" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem 
          className="text-destructive focus:text-destructive"
          onClick={() => setShowDeleteModal(true)}
        >
          <Trash2 className="mr-2 h-4 w-4" />
          Remove Account
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className="animate-fade-in pb-24">
      <PageHeader 
        title="Savings Account"
        showBack
        rightContent={menuContent}
      />
      
      <div className="px-4 space-y-6">
        {/* Name & Tags */}
        <div>
          <h1 className="text-xl font-bold text-foreground leading-tight">{investment.name}</h1>
          <div className="flex flex-wrap gap-2 mt-2">
            {investment.bank && (
              <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                {investment.bank}
              </span>
            )}
            <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
              Savings
            </span>
          </div>
        </div>

        {/* Balance Summary Card */}
        <SummaryCard variant="green">
          <SummaryLabel>Current Balance</SummaryLabel>
          <SummaryValue size="2xl" className="mt-1">
            {formatCurrency(currentBalance)}
          </SummaryValue>
          
          <div className="mt-4 pt-4 border-t border-primary-foreground/20">
            <p className="text-sm text-primary-foreground/70">
              Liquid funds available for immediate use
            </p>
          </div>
        </SummaryCard>

        {/* Account Details */}
        <ListCard>
          <h3 className="font-semibold text-foreground mb-4">Account Details</h3>
          <div className="space-y-4">
            {investment.bank && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Building2 className="h-4 w-4" />
                  <span>Bank</span>
                </div>
                <span className="font-medium text-foreground">
                  {investment.bank}
                </span>
              </div>
            )}
            
            {investment.account_number && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CreditCard className="h-4 w-4" />
                  <span>Account Number</span>
                </div>
                <span className="font-medium text-foreground">
                  **** {investment.account_number}
                </span>
              </div>
            )}
            
            {startDate && (
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <CalendarDays className="h-4 w-4" />
                  <span>Added On</span>
                </div>
                <span className="font-medium text-foreground">
                  {format(startDate, "dd MMM yyyy")}
                </span>
              </div>
            )}
          </div>
        </ListCard>

        {/* Goal Assignment */}
        <GoalAssignmentBadge
          goalId={investment.goal_id}
          onAssign={() => setShowGoalModal(true)}
        />

        {/* Notes */}
        {investment.notes && (
          <ListCard>
            <h3 className="font-semibold text-foreground mb-3">Notes</h3>
            <p className="text-muted-foreground text-sm leading-relaxed">
              "{investment.notes}"
            </p>
          </ListCard>
        )}
      </div>

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-background border-t border-border">
        <div className="max-w-md mx-auto">
          <Button 
            className="w-full"
            onClick={() => navigate(`/wealth/savings/${id}/edit`)}
          >
            Edit Account
          </Button>
        </div>
      </div>

      {investment && (
        <AssignGoalModal
          open={showGoalModal}
          onOpenChange={setShowGoalModal}
          investmentId={investment.id}
          currentGoalId={investment.goal_id}
        />
      )}

      <DeleteConfirmModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onConfirm={handleDelete}
        title="Remove Account"
        description={`Are you sure you want to remove "${investment.name}"? This action cannot be undone.`}
      />
    </div>
  );
}
