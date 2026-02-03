import { useParams, useNavigate } from "react-router-dom";
import { MoreVertical, Trash2, XCircle } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { SummaryCard, SummaryLabel, SummaryValue } from "@/components/ui/summary-card";
import { ListCard } from "@/components/ui/list-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useInvestments } from "@/hooks/useInvestments";
import { formatCurrency } from "@/data/mockData";
import { calculateFDDetails, formatTenure, parseDate } from "@/lib/fdCalculations";
import { useState } from "react";
import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal";
import { EndFDModal } from "@/components/modals/EndFDModal";
import { toast } from "sonner";
import { format } from "date-fns";

export default function FDDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { investments, deleteInvestment, createInvestment, isLoading } = useInvestments();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showEndFDModal, setShowEndFDModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const investment = investments.find(inv => inv.id === id && inv.type === "fd");
  
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
        <p className="text-muted-foreground">Fixed Deposit not found</p>
        <button 
          onClick={() => navigate("/wealth/fd")}
          className="text-primary font-medium"
        >
          Go back
        </button>
      </div>
    );
  }

  // Calculate FD values using the utility
  const startDate = parseDate(investment.start_date);
  const hasStructuredData = startDate && investment.tenure_value && investment.tenure_unit;
  
  let calculatedValues: ReturnType<typeof calculateFDDetails> | null = null;
  
  if (hasStructuredData) {
    calculatedValues = calculateFDDetails({
      principal: Number(investment.invested_value),
      interestRate: Number(investment.interest_rate) || 0,
      startDate: startDate!,
      tenureValue: investment.tenure_value!,
      tenureUnit: investment.tenure_unit as "months" | "years",
    });
  }

  // Fallback values for legacy data
  const currentValue = calculatedValues?.currentValue ?? Number(investment.current_value);
  const maturityAmount = calculatedValues?.maturityAmount ?? Number(investment.maturity_value) ?? Number(investment.invested_value);
  const interestEarned = currentValue - Number(investment.invested_value);
  const totalInterest = maturityAmount - Number(investment.invested_value);
  const progressPercent = calculatedValues?.progressPercent ?? 0;

  const handleDelete = async () => {
    try {
      await deleteInvestment.mutateAsync(investment.id);
      toast.success("Fixed Deposit deleted successfully");
      navigate("/wealth/fd");
    } catch (error) {
      console.error("Failed to delete FD:", error);
      toast.error("Failed to delete Fixed Deposit");
    }
  };

  const handleEndFD = async () => {
    setIsProcessing(true);
    try {
      // Create a new savings entry with the current FD value
      await createInvestment.mutateAsync({
        name: `Closed FD: ${investment.name}`,
        type: "savings",
        invested_value: currentValue,
        current_value: currentValue,
        bank: investment.bank,
        notes: `Moved from Fixed Deposit "${investment.name}" on ${format(new Date(), "dd MMM yyyy")}`,
      });
      
      // Delete the FD
      await deleteInvestment.mutateAsync(investment.id);
      
      toast.success("Fixed Deposit closed and moved to Savings");
      navigate("/wealth/fd");
    } catch (error) {
      console.error("Failed to end FD:", error);
      toast.error("Failed to end Fixed Deposit");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEdit = () => {
    navigate(`/wealth/fd/${id}/edit`);
  };

  return (
    <div className="animate-fade-in pb-32">
      {/* Header with three-dot menu */}
      <div className="flex items-center justify-between px-4 pt-4">
        <PageHeader 
          title="Fixed Deposit"
          showBack
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex h-10 w-10 items-center justify-center rounded-full hover:bg-muted">
              <MoreVertical className="h-5 w-5 text-muted-foreground" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem 
              onClick={() => setShowEndFDModal(true)}
              className="text-primary"
            >
              <XCircle className="mr-2 h-4 w-4" />
              End Fixed Deposit
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => setShowDeleteModal(true)}
              className="text-destructive"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete Investment
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      <div className="px-4 space-y-6 mt-4">
        {/* Name & Tags */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">{investment.name}</h1>
          <div className="flex gap-2 mt-2 flex-wrap">
            {investment.bank && (
              <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                {investment.bank}
              </span>
            )}
            {investment.interest_rate && (
              <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                {investment.interest_rate}% p.a.
              </span>
            )}
            {hasStructuredData && (
              <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                {formatTenure(investment.tenure_value!, investment.tenure_unit as "months" | "years")}
              </span>
            )}
          </div>
        </div>

        {/* Value Summary Card */}
        <SummaryCard variant="blue">
          <SummaryLabel>Current Value</SummaryLabel>
          <SummaryValue size="2xl" className="mt-1">
            {formatCurrency(currentValue)}
          </SummaryValue>
          
          <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-primary-foreground/20">
            <div>
              <p className="text-sm text-primary-foreground/70">Invested</p>
              <p className="text-lg font-semibold text-primary-foreground">
                {formatCurrency(investment.invested_value)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-primary-foreground/70">Interest Earned</p>
              <p className="text-lg font-semibold text-primary-foreground">
                +{formatCurrency(Math.max(0, interestEarned))}
              </p>
            </div>
          </div>
        </SummaryCard>

        {/* FD Progress */}
        {hasStructuredData && calculatedValues && (
          <ListCard>
            <h3 className="font-semibold text-foreground mb-3">Maturity Progress</h3>
            <ProgressBar 
              value={calculatedValues.daysElapsed} 
              max={calculatedValues.totalDays}
              size="md"
              className="mb-3"
            />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {calculatedValues.daysElapsed} days elapsed
              </span>
              <span className="text-muted-foreground">
                {calculatedValues.totalDays} days total
              </span>
            </div>
            {calculatedValues.isMatured && (
              <p className="text-fintrack-green text-sm font-medium mt-2">
                ✓ This FD has matured
              </p>
            )}
          </ListCard>
        )}

        {/* FD Details */}
        <ListCard>
          <h3 className="font-semibold text-foreground mb-3">FD Details</h3>
          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Invested Amount</span>
              <span className="font-medium text-foreground">
                {formatCurrency(investment.invested_value)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Current Value</span>
              <span className="font-medium text-foreground">
                {formatCurrency(currentValue)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Interest Earned Till Date</span>
              <span className="font-medium text-fintrack-green">
                +{formatCurrency(Math.max(0, interestEarned))}
              </span>
            </div>
            <div className="flex justify-between pt-3 border-t border-border">
              <span className="text-muted-foreground">Maturity Amount</span>
              <span className="font-medium text-foreground">
                {formatCurrency(maturityAmount)}
              </span>
            </div>
            {hasStructuredData && calculatedValues && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Maturity Date</span>
                <span className="font-medium text-foreground">
                  {format(calculatedValues.maturityDate, "dd MMM yyyy")}
                </span>
              </div>
            )}
            {!hasStructuredData && investment.maturity_date && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Maturity Period</span>
                <span className="font-medium text-foreground">
                  {investment.maturity_date}
                </span>
              </div>
            )}
            {investment.interest_rate && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Interest Rate</span>
                <span className="font-medium text-foreground">
                  {investment.interest_rate}% p.a.
                </span>
              </div>
            )}
          </div>
        </ListCard>

        {/* Notes */}
        {investment.notes && (
          <ListCard>
            <h3 className="font-semibold text-foreground mb-3">Notes</h3>
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
      </div>

      {/* Fixed Bottom Edit Button */}
      <div className="fixed bottom-20 left-0 right-0 px-4 pb-4 bg-background border-t border-border">
        <Button 
          onClick={handleEdit}
          className="w-full"
          size="lg"
        >
          Edit Investment
        </Button>
      </div>

      {/* Modals */}
      <DeleteConfirmModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onConfirm={handleDelete}
        title="Delete Fixed Deposit"
        description={`Are you sure you want to delete "${investment.name}"? This action cannot be undone.`}
      />

      <EndFDModal
        open={showEndFDModal}
        onOpenChange={setShowEndFDModal}
        fdName={investment.name}
        currentValue={currentValue}
        onConfirm={handleEndFD}
        isProcessing={isProcessing}
      />
    </div>
  );
}
