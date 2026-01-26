import { useState } from "react";
import { Home, Laptop, Dumbbell, Wifi, Car, Tv, Zap } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import { SummaryCard, SummaryLabel, SummaryValue } from "@/components/ui/summary-card";
import { ListCardWithIcon } from "@/components/ui/list-card";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { AddExpenseModal } from "@/components/modals/AddExpenseModal";
import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal";
import { mockExpenses, formatCurrency, getMonthlyExpenses } from "@/data/mockData";

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Home,
  Laptop,
  Dumbbell,
  Wifi,
  Car,
  Tv,
  Zap,
};

export default function SpendingsPage() {
  const [showAddModal, setShowAddModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<string | null>(null);

  const monthlyTotal = mockExpenses
    .filter(e => e.frequency === "monthly")
    .reduce((sum, e) => sum + e.amount, 0);

  const handleEdit = (expenseId: string) => {
    console.log("Edit expense:", expenseId);
    // Would open edit modal
  };

  const handleDelete = (expenseId: string) => {
    setSelectedExpense(expenseId);
    setShowDeleteModal(true);
  };

  const confirmDelete = () => {
    console.log("Deleting expense:", selectedExpense);
    setShowDeleteModal(false);
    setSelectedExpense(null);
  };

  const getFrequencyLabel = (expense: typeof mockExpenses[0]) => {
    if (expense.nextOccurrence) {
      return `Next: ${expense.nextOccurrence}`;
    }
    return expense.frequency.charAt(0).toUpperCase() + expense.frequency.slice(1);
  };

  return (
    <div className="animate-fade-in pb-32">
      <PageHeader 
        title="Spendings" 
        subtitle="Track recurring and major expenses"
        showBack
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
              Calculated from {mockExpenses.length} recurring items
            </span>
          </div>
        </SummaryCard>

        {/* Expenses List */}
        <section>
          <h2 className="text-lg font-semibold text-foreground mb-4">Recurring Expenses</h2>
          <div className="space-y-3">
            {mockExpenses.map((expense) => {
              const IconComponent = iconMap[expense.icon] || Home;
              
              return (
                <ListCardWithIcon
                  key={expense.id}
                  icon={<IconComponent className="h-5 w-5 text-primary-foreground" />}
                  iconBg={expense.iconBg}
                  title={expense.name}
                  subtitle={getFrequencyLabel(expense)}
                  value={formatCurrency(expense.amount)}
                  onEdit={() => handleEdit(expense.id)}
                  onDelete={() => handleDelete(expense.id)}
                />
              );
            })}
          </div>
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
