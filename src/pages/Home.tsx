import { User, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { SummaryCard, SummaryLabel, SummaryValue } from "@/components/ui/summary-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ListCard } from "@/components/ui/list-card";
import { NotificationBell } from "@/components/notifications/NotificationBell";
import { useGoals } from "@/hooks/useGoals";
import { useSpendings } from "@/hooks/useSpendings";
import { useProfile } from "@/hooks/useProfile";
import { useInvestments } from "@/hooks/useInvestments";
import { featureFlags } from "@/lib/featureFlags";
import { formatCurrency } from "@/data/mockData";

// Helper to format currency for display
function formatDisplayCurrency(amount: number, compact: boolean = false): string {
  if (compact) {
    if (amount >= 100000) {
      return `₹${(amount / 100000).toFixed(1)}L`;
    } else if (amount >= 1000) {
      return `₹${(amount / 1000).toFixed(1)}k`;
    }
  }
  return `₹${amount.toLocaleString("en-IN")}`;
}

// Get time-based greeting
function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export default function HomePage() {
  const { goals, isLoading: goalsLoading } = useGoals();
  const { spendings, monthlyTotal, isLoading: spendingsLoading } = useSpendings();
  const { getDisplayName } = useProfile();
  const { 
    investments, 
    getNetWorth, 
    getTotalInvested, 
    getTotalReturns,
    isLoading: investmentsLoading 
  } = useInvestments();
  
  const netWorth = getNetWorth();
  const totalInvested = getTotalInvested();
  const totalReturns = getTotalReturns();
  const hasWealthData = investments.length > 0;
  
  // Get top 2 active goals (those not yet completed)
  const activeGoals = goals
    .filter(goal => goal.current_amount < goal.target_amount)
    .slice(0, 2);
  
  // Calculate spending data for Month Flow
  const monthlyExpense = monthlyTotal;
  // Mock income for now - will be replaced when income tracking is added
  const monthlyIncome = 52000;
  const savingsRate = monthlyIncome > 0 
    ? Math.round(((monthlyIncome - monthlyExpense) / monthlyIncome) * 100) 
    : 0;
  const expensePercentage = monthlyIncome > 0 
    ? Math.min(100, Math.round((monthlyExpense / monthlyIncome) * 100)) 
    : 0;

  // Calculate composition percentages
  const savingsTotal = investments
    .filter(inv => inv.type === "savings")
    .reduce((sum, inv) => sum + Number(inv.current_value), 0);
  const investmentTotal = investments
    .filter(inv => ["stocks", "mutual-funds", "gold"].includes(inv.type))
    .reduce((sum, inv) => sum + Number(inv.current_value), 0);
  const fdTotal = investments
    .filter(inv => inv.type === "fd")
    .reduce((sum, inv) => sum + Number(inv.current_value), 0);

  const displayName = getDisplayName();
  const greeting = getGreeting();
  
  return (
    <div className="animate-fade-in">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <Link 
            to="/profile" 
            className="flex h-10 w-10 items-center justify-center rounded-full bg-muted hover:bg-muted/80 transition-colors"
          >
            <User className="h-5 w-5 text-muted-foreground" />
          </Link>
          <div>
            <p className="text-sm text-muted-foreground">{greeting},</p>
            <p className="font-semibold text-foreground">{displayName}</p>
          </div>
        </div>
        <NotificationBell />
      </header>

      <div className="space-y-6 px-4 pb-8">
        {/* Net Worth Card */}
        <SummaryCard variant="blue">
          <div className="flex items-start justify-between">
            <div>
              <SummaryLabel>Total Net Worth</SummaryLabel>
              {investmentsLoading ? (
                <SummaryValue size="2xl" className="mt-1">Loading...</SummaryValue>
              ) : (
                <>
                  <SummaryValue size="2xl" className="mt-1">
                    {hasWealthData ? formatCurrency(netWorth) : "₹0"}
                  </SummaryValue>
                  {hasWealthData && totalReturns !== 0 && (
                    <div className={`mt-2 flex items-center gap-1.5 text-sm ${
                      totalReturns >= 0 ? "text-fintrack-green" : "text-fintrack-red-soft"
                    }`}>
                      <TrendingUp className="h-4 w-4" />
                      <span>
                        {totalReturns >= 0 ? "+" : ""}{formatDisplayCurrency(totalReturns, true)} returns
                      </span>
                    </div>
                  )}
                  {!hasWealthData && (
                    <p className="mt-2 text-sm text-primary-foreground/70">
                      Add investments to track your net worth
                    </p>
                  )}
                </>
              )}
            </div>
            <button className="rounded-full bg-primary-foreground/10 p-2">
              <div className="h-5 w-5 text-primary-foreground/70" />
            </button>
          </div>
        </SummaryCard>

        {/* Composition & Month Flow */}
        <div className="grid grid-cols-2 gap-4">
          {/* Composition */}
          <ListCard className="p-4">
            <p className="mb-3 text-sm font-medium text-muted-foreground">Composition</p>
            {investmentsLoading ? (
              <div className="flex items-center justify-center h-32">
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : !hasWealthData ? (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <span className="text-sm text-muted-foreground">No data yet</span>
                <Link to="/wealth" className="text-xs text-primary mt-1">Add investments</Link>
              </div>
            ) : (
              <>
                <div className="relative mx-auto h-24 w-24">
                  {/* Simple donut visualization */}
                  <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                    <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--muted))" strokeWidth="12" />
                    {netWorth > 0 && (
                      <>
                        <circle 
                          cx="50" cy="50" r="40" fill="none" 
                          stroke="hsl(var(--primary))" strokeWidth="12" 
                          strokeDasharray={`${(investmentTotal / netWorth) * 251} 251`} 
                          strokeLinecap="round"
                        />
                        <circle 
                          cx="50" cy="50" r="40" fill="none" 
                          stroke="hsl(var(--fintrack-cyan))" strokeWidth="12" 
                          strokeDasharray={`${(fdTotal / netWorth) * 251} 251`} 
                          strokeDashoffset={`-${(investmentTotal / netWorth) * 251}`}
                          strokeLinecap="round"
                        />
                        <circle 
                          cx="50" cy="50" r="40" fill="none" 
                          stroke="hsl(var(--fintrack-purple))" strokeWidth="12" 
                          strokeDasharray={`${(savingsTotal / netWorth) * 251} 251`} 
                          strokeDashoffset={`-${((investmentTotal + fdTotal) / netWorth) * 251}`}
                          strokeLinecap="round"
                        />
                      </>
                    )}
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-xs font-medium text-muted-foreground">Total</span>
                  </div>
                </div>
                <div className="mt-3 space-y-1.5">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="h-2 w-2 rounded-full bg-primary" />
                    <span className="text-muted-foreground">Investments</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="h-2 w-2 rounded-full bg-fintrack-cyan" />
                    <span className="text-muted-foreground">Fixed Deposits</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs">
                    <span className="h-2 w-2 rounded-full bg-fintrack-purple" />
                    <span className="text-muted-foreground">Savings</span>
                  </div>
                </div>
              </>
            )}
          </ListCard>

          {/* Month Flow - Connected to real spending data */}
          <ListCard className="p-4">
            <p className="mb-3 text-sm font-medium text-muted-foreground">Month Flow</p>
            {spendingsLoading ? (
              <div className="flex items-center justify-center h-32">
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-muted-foreground">Income</span>
                    <span className="font-semibold text-fintrack-green">
                      {formatDisplayCurrency(monthlyIncome, true)}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div className="h-full rounded-full bg-fintrack-green" style={{ width: "100%" }} />
                  </div>
                </div>
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm text-muted-foreground">Expense</span>
                    <span className="font-semibold text-fintrack-red-soft">
                      {formatDisplayCurrency(monthlyExpense, true)}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted overflow-hidden">
                    <div 
                      className="h-full rounded-full bg-fintrack-red-soft" 
                      style={{ width: `${expensePercentage}%` }} 
                    />
                  </div>
                </div>
                <div className="pt-2 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Savings Rate:</span>
                    <span className="font-semibold text-foreground">{savingsRate}%</span>
                  </div>
                </div>
              </div>
            )}
          </ListCard>
        </div>

        {/* Your Investments */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-foreground">Your Investments</h2>
            <Link to="/wealth" className="text-sm font-medium text-primary">
              View More
            </Link>
          </div>
          {investmentsLoading ? (
            <ListCard>
              <div className="flex items-center justify-center py-4">
                <span className="text-sm text-muted-foreground">Loading...</span>
              </div>
            </ListCard>
          ) : !hasWealthData ? (
            <ListCard>
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">No investments yet</p>
                <Link to="/wealth" className="text-sm font-medium text-primary mt-1 inline-block">
                  Add your first investment
                </Link>
              </div>
            </ListCard>
          ) : (
            <ListCard>
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-fintrack-card-elevated">
                  <TrendingUp className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground">Current Value</p>
                  <p className="text-xl font-bold text-foreground">
                    {formatCurrency(totalInvested)}
                  </p>
                </div>
                <div className="text-right">
                  <p className={`font-semibold ${totalReturns >= 0 ? "text-fintrack-green" : "text-fintrack-red-soft"}`}>
                    {totalReturns >= 0 ? "+" : ""} {formatDisplayCurrency(totalReturns, true)}
                  </p>
                  <p className="text-sm text-muted-foreground">Total Returns</p>
                </div>
              </div>
            </ListCard>
          )}
        </section>

        {/* Goals - Connected to real data */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-foreground">Goals</h2>
            <Link to="/goals" className="text-sm font-medium text-primary">
              View More
            </Link>
          </div>
          {goalsLoading ? (
            <div className="p-4 text-center text-sm text-muted-foreground">
              Loading goals...
            </div>
          ) : activeGoals.length === 0 ? (
            <ListCard>
              <div className="text-center py-4">
                <p className="text-sm text-muted-foreground">No active goals yet</p>
                <Link to="/goals" className="text-sm font-medium text-primary mt-1 inline-block">
                  Create your first goal
                </Link>
              </div>
            </ListCard>
          ) : (
            <div className="space-y-3">
              {activeGoals.map((goal) => {
                const percent = Math.round((goal.current_amount / goal.target_amount) * 100);
                return (
                  <ListCard key={goal.id}>
                    <div className="flex items-start gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-fintrack-gold/20">
                        <span className="text-lg">🎯</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between mb-1">
                          <p className="font-medium text-foreground">{goal.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {formatDisplayCurrency(goal.current_amount, true)} / {formatDisplayCurrency(goal.target_amount, true)}
                          </p>
                        </div>
                        <ProgressBar 
                          value={goal.current_amount} 
                          max={goal.target_amount} 
                          variant="blue"
                        />
                      </div>
                    </div>
                  </ListCard>
                );
              })}
            </div>
          )}
        </section>

        {/* Insights Section - Temporarily disabled via feature flag */}
        {featureFlags.showInsights && (
          <section>
            {/* Insight Card - Will be re-enabled when user-specific data is available */}
            <ListCard className="bg-fintrack-card-elevated">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-fintrack-gold/20">
                  {/* Lightbulb icon will go here */}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-foreground">
                    <span className="font-semibold text-fintrack-gold">Insight </span>
                    Personalized insights will appear here based on your financial data.
                  </p>
                </div>
              </div>
            </ListCard>
          </section>
        )}
      </div>
    </div>
  );
}
