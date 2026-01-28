import { useState } from "react";
import { Home, Laptop, Dumbbell, Wifi, Car, Tv, Zap, ShoppingBag, Loader2 } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { SummaryCard, SummaryLabel, SummaryValue } from "@/components/ui/summary-card";
import { ListCardWithIcon } from "@/components/ui/list-card";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { AddExpenseModal } from "@/components/modals/AddExpenseModal";
import { EditExpenseModal } from "@/components/modals/EditExpenseModal";
import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal";
import { useSpendings, Spending } from "@/hooks/useSpendings";
import { formatCurrency } from "@/data/mockData";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  Laptop,
  Dumbbell,
  Wifi,
  Car,
  Tv,
  Zap,
  ShoppingBag,
};

export default function SpendingsPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Spending | null>(null);

  const { spendings, isLoading, monthlyTotal, deleteSpending } = useSpendings();

  const handleEdit = (expense: Spending) => {
    setSelectedExpense(expense);
    setShowEditModal(true);
  };

  const handleDelete = (expense: Spending) => {
    setSelectedExpense(expense);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (selectedExpense) {
      await deleteSpending.mutateAsync(selectedExpense.id);
    }
    setShowDeleteModal(false);
    setSelectedExpense(null);
  };

  const getFrequencyLabel = (spending: Spending) => {
    if (spending.frequency_type === "one_time") {
      return "One-time";
    } else if (spending.frequency_type === "monthly") {
      return "Monthly";
    } else if (spending.frequency_type === "custom" && spending.frequency_interval && spending.frequency_unit) {
      const interval = spending.frequency_interval;
      const unitLabels: Record<string, string> = {
        day: interval === 1 ? "day" : "days",
        week: interval === 1 ? "week" : "weeks",
        month: interval === 1 ? "month" : "months",
        year: interval === 1 ? "year" : "years",
      };
      const unit = unitLabels[spending.frequency_unit] || spending.frequency_unit;
      return `Every ${interval} ${unit}`;
    }
    // Fallback for legacy data
    const legacyLabels: Record<string, string> = {
      "one-time": "One-time",
      "daily": "Daily",
      "weekly": "Weekly",
      "yearly": "Yearly",
    };
    return legacyLabels[spending.frequency_type] || spending.frequency_type;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="animate-fade-in pb-32">
      <PageHeader 
        title="Spendings" 
        subtitle="Track recurring and major expenses"
      />
      
      <div className="px-4 space-y-6">
        {/* Summary Card */}
        <SummaryCard variant="blue">
          <SummaryLabel>MONTHLY COMMITTED SPEND</SummaryLabel>
          <SummaryValue size="2xl" className="mt-1">
            {formatCurrency(monthlyTotal)} / month
          </SummaryValue>
          <div className="mt-3">
            <span className="inline-block rounded-full bg-primary-foreground/20 px-3 py-1 text-xs font-medium text-primary-foreground">
              SUMMARY
            </span>
            <span className="ml-2 text-sm text-primary-foreground/70">
              Calculated from {spendings.filter(s => s.frequency_type !== "one_time").length} recurring items
            </span>
          </div>
        </SummaryCard>

        {/* Expenses List */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Expenses</h2>
          {spendings.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No expenses yet. Add your first expense!
            </div>
          ) : (
            <div className="space-y-3">
              {spendings.map((spending) => {
                const IconComponent = iconMap[spending.icon || "Home"] || Home;
                
                return (
                  <ListCardWithIcon
                    key={spending.id}
                    icon={<IconComponent className="h-5 w-5 text-primary-foreground" />}
                    iconBg={spending.icon_bg || "bg-blue-500"}
                    title={spending.name}
                    subtitle={getFrequencyLabel(spending)}
                    value={formatCurrency(spending.amount)}
                    onEdit={() => handleEdit(spending)}
                    onDelete={() => handleDelete(spending)}
                  />
                );
              })}
            </div>
          )}
        </section>
      </div>

      <FloatingActionButton 
        label="ADD EXPENSE" 
        onClick={() => setShowAddModal(true)} 
      />

      <AddExpenseModal 
        open={showAddModal} 
        onOpenChange={setShowAddModal} 
      />

      <EditExpenseModal
        open={showEditModal}
        onOpenChange={setShowEditModal}
        expense={selectedExpense}
      />

      <DeleteConfirmModal
        open={showDeleteModal}
        onOpenChange={setShowDeleteModal}
        title="Delete Expense"
        description="Are you sure you want to delete this expense? This action cannot be undone."
        onConfirm={confirmDelete}
      />
    </div>
  );
}
