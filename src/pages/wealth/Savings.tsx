import { useNavigate } from "react-router-dom";
import { CheckCircle, Eye, Building2, Shield, Coins } from "lucide-react";
import { ListCardWithIcon } from "@/components/ui/list-card";
import { useInvestments } from "@/hooks/useInvestments";
import { formatCurrency } from "@/data/mockData";

export default function SavingsPage() {
  const navigate = useNavigate();
  const { getInvestmentsByType, getTotalByType, isLoading } = useInvestments();
  
  const savings = getInvestmentsByType("savings");
  const totals = getTotalByType("savings");

  const getIcon = (name: string) => {
    if (name.includes("Primary") || name.includes("HDFC") || name.includes("Bank")) return Building2;
    if (name.includes("Emergency")) return Shield;
    return Coins;
  };

  const getIconBg = (name: string) => {
    if (name.includes("Primary") || name.includes("HDFC") || name.includes("Bank")) return "bg-primary/20";
    if (name.includes("Emergency")) return "bg-fintrack-green/20";
    return "bg-fintrack-gold/20";
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <span className="text-muted-foreground">Loading...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      {/* Summary Card */}
      <div className="rounded-2xl p-5 shadow-elevated bg-gradient-savings">
        <div className="flex items-center gap-2 mb-2">
          <CheckCircle className="h-5 w-5 text-primary-foreground" />
          <span className="text-sm font-medium text-primary-foreground">Available Anytime</span>
        </div>
        <p className="text-sm text-primary-foreground/80">Total Liquid Balance</p>
        <p className="text-3xl font-bold text-primary-foreground mt-1">
          {formatCurrency(totals.current)}
        </p>
      </div>

      {/* Accounts List */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">Accounts</h2>
          <button className="flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted">
            <Eye className="h-5 w-5" />
          </button>
        </div>
        
        {savings.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>No savings accounts added yet</p>
            <p className="text-sm mt-1">Tap the + button to add your first account</p>
          </div>
        ) : (
          <div className="space-y-3">
            {savings.map((account) => {
              const Icon = getIcon(account.name);
              const iconBg = getIconBg(account.name);
              
              return (
                <ListCardWithIcon
                  key={account.id}
                  icon={<Icon className="h-5 w-5 text-primary" />}
                  iconBg={iconBg}
                  title={account.name}
                  subtitle={account.account_number ? `**** ${account.account_number}` : account.category || "Savings"}
                  value={formatCurrency(account.current_value)}
                  onClick={() => navigate(`/wealth/savings/${account.id}`)}
                />
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}
