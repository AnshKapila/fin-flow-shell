import { useParams, useNavigate } from "react-router-dom";
import { MoreVertical, Pencil, Trash2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { SummaryCard, SummaryLabel, SummaryValue } from "@/components/ui/summary-card";
import { ListCard } from "@/components/ui/list-card";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useInvestments } from "@/hooks/useInvestments";
import { useGoldPrice } from "@/hooks/useGoldPrice";
import { formatCurrency, formatPercent } from "@/data/mockData";
import { useState } from "react";
import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal";
import { toast } from "sonner";
import { format, differenceInDays } from "date-fns";

export default function GoldDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { investments, deleteInvestment, isLoading } = useInvestments();
  const { goldPrice, isLoading: priceLoading } = useGoldPrice();
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const investment = investments.find(inv => inv.id === id && inv.type === "gold");
  
  if (isLoading || priceLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <span className="text-muted-foreground">Loading...</span>
      </div>
    );
  }
  
  if (!investment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-muted-foreground">Gold investment not found</p>
        <button 
          onClick={() => navigate("/wealth/gold")}
          className="text-primary font-medium"
        >
          Go back
        </button>
      </div>
    );
  }

  // Extract gold-specific data
  const goldType = investment.category as "digital" | "physical" | "sgb" || "digital";
  const weightInGrams = parseFloat(investment.risk_level?.replace("g", "") || "0");
  const investmentDate = investment.start_date ? new Date(investment.start_date) : null;
  const sgbInterestRate = investment.interest_rate;
  const sgbMaturityDate = investment.maturity_date;

  // Calculate current value based on live price
  const currentValue = weightInGrams * goldPrice.price_per_gram_24k;
  const gainLoss = currentValue - Number(investment.invested_value);
  const gainLossPercent = investment.invested_value > 0 
    ? (gainLoss / Number(investment.invested_value)) * 100 
    : 0;

  // Calculate holding period
  const holdingDays = investmentDate 
    ? differenceInDays(new Date(), investmentDate)
    : 0;
  const holdingYears = holdingDays / 365;

  // Calculate SGB interest if applicable
  const sgbAccruedInterest = goldType === "sgb" && sgbInterestRate && holdingDays > 0
    ? (Number(investment.invested_value) * (sgbInterestRate / 100) * (holdingDays / 365))
    : 0;
  const totalValueWithInterest = currentValue + sgbAccruedInterest;

  const goldTypeLabel = {
    digital: "Digital Gold",
    physical: "Physical Gold",
    sgb: "Sovereign Gold Bond",
  }[goldType] || "Gold";

  const handleDelete = async () => {
    try {
      await deleteInvestment.mutateAsync(investment.id);
      toast.success("Gold investment deleted successfully");
      navigate("/wealth/gold");
    } catch (error) {
      console.error("Failed to delete:", error);
      toast.error("Failed to delete investment");
    }
  };

  return (
    <div className="animate-fade-in pb-24">
      <PageHeader 
        title="Gold"
        showBack
        rightContent={
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem 
                onClick={() => setShowDeleteModal(true)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Investment
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        }
      />
      
      <div className="px-4 space-y-6">
        {/* Name & Tags */}
        <div>
          <h1 className="text-2xl font-bold text-foreground">{investment.name}</h1>
          <div className="flex gap-2 mt-2">
            <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
              {goldTypeLabel}
            </span>
            <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
              {weightInGrams.toFixed(4)}g
            </span>
          </div>
        </div>

        {/* Value Summary Card */}
        <SummaryCard variant="blue">
          <SummaryLabel>Current Value</SummaryLabel>
          <SummaryValue size="2xl" className="mt-1">
            {formatCurrency(goldType === "sgb" ? totalValueWithInterest : currentValue)}
          </SummaryValue>
          
          <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-primary-foreground/20">
            <div>
              <p className="text-sm text-primary-foreground/70">Invested</p>
              <p className="text-lg font-semibold text-primary-foreground">
                {formatCurrency(investment.invested_value)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm text-primary-foreground/70">Gain/Loss</p>
              <div className="flex items-center justify-end gap-2">
                <span className="text-lg font-semibold text-primary-foreground">
                  {gainLoss >= 0 ? "↗" : "↘"} {formatCurrency(Math.abs(gainLoss))}
                </span>
              </div>
              <span className={`inline-block mt-1 rounded-full px-2 py-0.5 text-xs font-bold text-primary-foreground ${
                gainLossPercent >= 0 ? "bg-fintrack-green" : "bg-fintrack-red-soft"
              }`}>
                {formatPercent(gainLossPercent)}
              </span>
            </div>
          </div>
        </SummaryCard>

        {/* Live Price Info */}
        <ListCard>
          <h3 className="font-semibold text-foreground mb-3">Live Gold Price</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">24K Price</span>
              <span className="font-medium text-foreground">
                {formatCurrency(goldPrice.price_per_gram_24k)}/g
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">22K Price</span>
              <span className="font-medium text-foreground">
                {formatCurrency(goldPrice.price_per_gram_22k)}/g
              </span>
            </div>
            <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t border-border">
              <span>{goldPrice.is_fallback ? "Approximate price" : "Market price"}</span>
              <span>Updated {format(new Date(goldPrice.last_updated), "h:mm a")}</span>
            </div>
          </div>
        </ListCard>

        {/* Investment Details */}
        <ListCard>
          <h3 className="font-semibold text-foreground mb-3">Investment Details</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Gold Weight</span>
              <span className="font-medium text-foreground">{weightInGrams.toFixed(4)} grams</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Investment Date</span>
              <span className="font-medium text-foreground">
                {investmentDate ? format(investmentDate, "dd MMM yyyy") : "Not specified"}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Holding Period</span>
              <span className="font-medium text-foreground">
                {holdingYears >= 1 
                  ? `${holdingYears.toFixed(1)} years` 
                  : `${holdingDays} days`}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Purchase Price</span>
              <span className="font-medium text-foreground">
                {formatCurrency(Number(investment.invested_value) / weightInGrams)}/g
              </span>
            </div>
          </div>
        </ListCard>

        {/* SGB-specific details */}
        {goldType === "sgb" && (
          <ListCard>
            <h3 className="font-semibold text-foreground mb-3">SGB Details</h3>
            <div className="space-y-2 text-sm">
              {sgbInterestRate && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Interest Rate</span>
                  <span className="font-medium text-foreground">{sgbInterestRate}% p.a.</span>
                </div>
              )}
              {sgbAccruedInterest > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Accrued Interest</span>
                  <span className="font-medium text-fintrack-green">
                    +{formatCurrency(sgbAccruedInterest)}
                  </span>
                </div>
              )}
              {sgbMaturityDate && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Maturity</span>
                  <span className="font-medium text-foreground">{sgbMaturityDate}</span>
                </div>
              )}
            </div>
          </ListCard>
        )}

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

      {/* Fixed Edit Button */}
      <div className="fixed bottom-20 left-0 right-0 px-4 pb-4 bg-gradient-to-t from-background via-background to-transparent pt-6">
        <Button
          className="w-full"
          onClick={() => navigate(`/wealth/gold/${id}/edit`)}
        >
          <Pencil className="mr-2 h-4 w-4" />
          Edit Investment
        </Button>
      </div>

      <DeleteConfirmModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        onConfirm={handleDelete}
        title="Delete Gold Investment"
        description={`Are you sure you want to delete "${investment.name}"? This action cannot be undone.`}
      />
    </div>
  );
}
