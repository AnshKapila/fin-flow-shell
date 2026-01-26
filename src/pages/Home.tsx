import { User, Bell, TrendingUp, Lightbulb, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { SummaryCard, SummaryLabel, SummaryValue } from "@/components/ui/summary-card";
import { ProgressBar } from "@/components/ui/progress-bar";
import { ListCard } from "@/components/ui/list-card";
import { 
  mockUser, 
  mockGoals, 
  formatCurrency, 
  getNetWorth, 
  getTotalInvested,
  getMonthlyExpenses,
} from "@/data/mockData";

export default function HomePage() {
  const netWorth = getNetWorth();
  const totalInvested = getTotalInvested();
  const monthlyExpenses = getMonthlyExpenses();
  const monthlyIncome = 520000 / 100; // Mock: ₹5.2k monthly income shown in screenshot
  
  // Show top 2 goals
  const topGoals = mockGoals.slice(0, 2);

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <header className="flex items-center justify-between px-4 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
            <User className="h-5 w-5 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">Good evening,</p>
            <p className="font-semibold text-foreground">{mockUser.name}</p>
          </div>
        </div>
        <button className="relative flex h-10 w-10 items-center justify-center rounded-full bg-muted">
          <Bell className="h-5 w-5 text-muted-foreground" />
          <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-destructive" />
        </button>
      </header>

      <div className="space-y-6 px-4 pb-8">
        {/* Net Worth Card */}
        <SummaryCard variant="blue">
          <div className="flex items-start justify-between">
            <div>
              <SummaryLabel>Total Net Worth</SummaryLabel>
              <SummaryValue size="2xl" className="mt-1">
                {formatCurrency(netWorth)}
              </SummaryValue>
              <div className="mt-2 flex items-center gap-1.5 text-sm text-fintrack-green">
                <TrendingUp className="h-4 w-4" />
                <span>+2.4% In last 30 days</span>
              </div>
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
            <div className="relative mx-auto h-24 w-24">
              {/* Simple donut visualization */}
              <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
                <circle cx="50" cy="50" r="40" fill="none" stroke="hsl(var(--muted))" strokeWidth="12" />
                <circle 
                  cx="50" cy="50" r="40" fill="none" 
                  stroke="hsl(var(--primary))" strokeWidth="12" 
                  strokeDasharray="150 251" strokeLinecap="round"
                />
                <circle 
                  cx="50" cy="50" r="40" fill="none" 
                  stroke="hsl(var(--fintrack-cyan))" strokeWidth="12" 
                  strokeDasharray="60 251" strokeDashoffset="-150" strokeLinecap="round"
                />
                <circle 
                  cx="50" cy="50" r="40" fill="none" 
                  stroke="hsl(var(--fintrack-purple))" strokeWidth="12" 
                  strokeDasharray="40 251" strokeDashoffset="-210" strokeLinecap="round"
                />
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
                <span className="text-muted-foreground">Assets</span>
              </div>
              <div className="flex items-center gap-2 text-xs">
                <span className="h-2 w-2 rounded-full bg-fintrack-purple" />
                <span className="text-muted-foreground">Cash</span>
              </div>
            </div>
          </ListCard>

          {/* Month Flow */}
          <ListCard className="p-4">
            <p className="mb-3 text-sm font-medium text-muted-foreground">Month Flow</p>
            <div className="space-y-4">
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-muted-foreground">Income</span>
                  <span className="font-semibold text-fintrack-green">₹5.2k</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-fintrack-green" style={{ width: "100%" }} />
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm text-muted-foreground">Expense</span>
                  <span className="font-semibold text-fintrack-red-soft">₹3.1k</span>
                </div>
                <div className="h-2 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full bg-fintrack-red-soft" style={{ width: "60%" }} />
                </div>
              </div>
              <div className="pt-2 border-t border-border">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Savings Rate:</span>
                  <span className="font-semibold text-foreground">40%</span>
                </div>
              </div>
            </div>
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
                <p className="font-semibold text-fintrack-green">+ ₹890.00</p>
                <p className="text-sm text-muted-foreground">Today's Profit</p>
              </div>
            </div>
          </ListCard>
        </section>

        {/* Goals */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-foreground">Goals</h2>
            <Link to="/goals" className="text-sm font-medium text-primary">
              View More
            </Link>
          </div>
          <div className="space-y-3">
            {topGoals.map((goal) => {
              const percent = Math.round((goal.savedAmount / goal.targetAmount) * 100);
              return (
                <ListCard key={goal.id}>
                  <div className="flex items-start gap-4">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-fintrack-gold/20">
                      <span className="text-lg">
                        {goal.category === "VEHICLE" ? "🚗" : goal.category === "EMERGENCY" ? "🛡️" : "🏠"}
                      </span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <p className="font-medium text-foreground">{goal.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatCurrency(goal.savedAmount / 100, true)} / {formatCurrency(goal.targetAmount / 100, true)}
                        </p>
                      </div>
                      <ProgressBar 
                        value={goal.savedAmount} 
                        max={goal.targetAmount} 
                        variant={goal.category === "EMERGENCY" ? "gold" : "blue"}
                      />
                    </div>
                  </div>
                </ListCard>
              );
            })}
          </div>
        </section>

        {/* Insight Card */}
        <ListCard className="bg-fintrack-card-elevated">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-fintrack-gold/20">
              <Lightbulb className="h-5 w-5 text-fintrack-gold" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-foreground">
                <span className="font-semibold text-fintrack-gold">Insight </span>
                Increasing your monthly savings by just ₹50 could help you reach your car goal 2 months early.
              </p>
            </div>
          </div>
        </ListCard>
      </div>
    </div>
  );
}
