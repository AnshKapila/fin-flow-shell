// Mock data for Fintrack Phase 1
// All values are in INR (₹)

export interface Investment {
  id: string;
  name: string;
  type: 'stocks' | 'mutual-funds' | 'gold' | 'fd' | 'savings';
  currentValue: number;
  investedValue: number;
  returns: number;
  returnsPercent: number;
  // Type-specific fields
  category?: string; // For stocks/MF: Large Cap, Mid Cap, etc.
  riskLevel?: string; // High Risk, Medium Risk, Low Risk
  bank?: string; // For FD/Savings
  accountNumber?: string;
  interestRate?: number; // For FD
  maturityDate?: string; // For FD
  maturityValue?: number; // For FD
  addedDate?: string;
  notes?: string;
  linkedGoals?: { goalId: string; contribution: number }[];
}

export interface Goal {
  id: string;
  name: string;
  category: string; // VEHICLE, TRAVEL, LIFESTYLE, EMERGENCY, RETIREMENT
  targetAmount: number;
  savedAmount: number;
  deadline?: string;
  createdAt: string;
  linkedInvestments?: { investmentId: string; contribution: number }[];
}

export interface Expense {
  id: string;
  name: string;
  amount: number;
  frequency: 'one-time' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  frequencyMultiplier?: number; // e.g., every 3 months
  nextOccurrence?: string;
  icon: string; // Icon name
  iconBg: string; // Background color class
}

export interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  currency: string;
  joined: string;
}

// User Profile
export const mockUser: UserProfile = {
  name: "Alex",
  email: "alex@example.com",
  phone: "+91 98765 43210",
  currency: "INR",
  joined: "March 2023",
};

// Investments Data
export const mockInvestments: Investment[] = [
  // Stocks
  {
    id: "stock-1",
    name: "Reliance Industries",
    type: "stocks",
    currentValue: 285000,
    investedValue: 220000,
    returns: 65000,
    returnsPercent: 29.5,
    category: "Large Cap",
    addedDate: "Jan 15, 2022",
    notes: "Core portfolio holding. Long-term bet on energy transition.",
  },
  {
    id: "stock-2",
    name: "HDFC Bank",
    type: "stocks",
    currentValue: 180000,
    investedValue: 150000,
    returns: 30000,
    returnsPercent: 20.0,
    category: "Large Cap",
    addedDate: "Mar 20, 2022",
    notes: "Banking sector leader. Steady compounder.",
  },
  {
    id: "stock-3",
    name: "Infosys",
    type: "stocks",
    currentValue: 125000,
    investedValue: 110000,
    returns: 15000,
    returnsPercent: 13.6,
    category: "Large Cap",
    addedDate: "Jun 10, 2022",
  },
  {
    id: "stock-4",
    name: "Tata Motors",
    type: "stocks",
    currentValue: 95000,
    investedValue: 70000,
    returns: 25000,
    returnsPercent: 35.7,
    category: "Mid Cap",
    addedDate: "Sep 5, 2023",
    notes: "EV play. High volatility expected.",
  },
  // Mutual Funds
  {
    id: "mf-1",
    name: "Bluechip Growth Fund",
    type: "mutual-funds",
    currentValue: 245920,
    investedValue: 180000,
    returns: 65920,
    returnsPercent: 36.6,
    category: "Equity",
    riskLevel: "High Risk",
    addedDate: "Mar 12, 2020",
    notes: "Focusing on 10-year compounding. Do not touch during market corrections. This fund is meant to serve as the core stability engine for the portfolio.",
    linkedGoals: [{ goalId: "goal-3", contribution: 24000 }],
  },
  {
    id: "mf-2",
    name: "Index Nifty 50",
    type: "mutual-funds",
    currentValue: 55400,
    investedValue: 50000,
    returns: 5400,
    returnsPercent: 10.8,
    category: "Equity",
    riskLevel: "Medium Risk",
    addedDate: "Jul 1, 2021",
  },
  {
    id: "mf-3",
    name: "Midcap Opportunities",
    type: "mutual-funds",
    currentValue: 210000,
    investedValue: 150000,
    returns: 60000,
    returnsPercent: 40.0,
    category: "Equity",
    riskLevel: "High Risk",
    addedDate: "Jan 15, 2021",
  },
  {
    id: "mf-4",
    name: "Axis Small Cap Fund",
    type: "mutual-funds",
    currentValue: 45200,
    investedValue: 30000,
    returns: 15200,
    returnsPercent: 50.6,
    category: "Equity",
    riskLevel: "High Risk",
    addedDate: "Nov 8, 2022",
  },
  {
    id: "mf-5",
    name: "Parag Parikh Flexi Cap",
    type: "mutual-funds",
    currentValue: 19400,
    investedValue: 18000,
    returns: 1400,
    returnsPercent: 7.7,
    category: "Equity",
    riskLevel: "Medium Risk",
    addedDate: "Feb 20, 2024",
  },
  // Gold
  {
    id: "gold-1",
    name: "Digital Gold",
    type: "gold",
    currentValue: 125000,
    investedValue: 100000,
    returns: 25000,
    returnsPercent: 25.0,
    addedDate: "Dec 1, 2021",
    notes: "Hedge against market volatility. Long-term store of value.",
  },
  {
    id: "gold-2",
    name: "Sovereign Gold Bond 2024",
    type: "gold",
    currentValue: 85000,
    investedValue: 75000,
    returns: 10000,
    returnsPercent: 13.3,
    interestRate: 2.5,
    maturityDate: "Dec 2029",
    addedDate: "Aug 15, 2024",
    notes: "Government backed. 2.5% annual interest plus capital appreciation.",
  },
  // Fixed Deposits
  {
    id: "fd-1",
    name: "HDFC Bank - Emergency FD",
    type: "fd",
    bank: "HDFC Bank",
    currentValue: 50000,
    investedValue: 50000,
    maturityValue: 55250,
    returns: 0,
    returnsPercent: 0,
    interestRate: 5.5,
    maturityDate: "14 months",
    addedDate: "Oct 1, 2024",
  },
  {
    id: "fd-2",
    name: "ICICI Bank - Tax Saver",
    type: "fd",
    bank: "ICICI Bank",
    currentValue: 150000,
    investedValue: 150000,
    maturityValue: 178500,
    returns: 0,
    returnsPercent: 0,
    interestRate: 7.2,
    maturityDate: "48 months",
    addedDate: "Jan 15, 2024",
  },
  {
    id: "fd-3",
    name: "SBI - Flexi Deposit",
    type: "fd",
    bank: "SBI",
    currentValue: 250000,
    investedValue: 250000,
    maturityValue: 278250,
    returns: 0,
    returnsPercent: 0,
    interestRate: 6.8,
    maturityDate: "18 months",
    addedDate: "Apr 20, 2024",
  },
  // Savings
  {
    id: "savings-1",
    name: "HDFC Primary Account",
    type: "savings",
    bank: "HDFC Bank",
    accountNumber: "8842",
    currentValue: 820000,
    investedValue: 820000,
    returns: 0,
    returnsPercent: 0,
  },
  {
    id: "savings-2",
    name: "Emergency Fund",
    type: "savings",
    category: "Liquid Mutual Fund",
    currentValue: 300000,
    investedValue: 300000,
    returns: 0,
    returnsPercent: 0,
  },
  {
    id: "savings-3",
    name: "Cash Buffer",
    type: "savings",
    category: "Petty Cash",
    currentValue: 125000,
    investedValue: 125000,
    returns: 0,
    returnsPercent: 0,
  },
];

// Goals Data
export const mockGoals: Goal[] = [
  {
    id: "goal-1",
    name: "Buy a Car",
    category: "VEHICLE",
    targetAmount: 100000,
    savedAmount: 38000,
    deadline: "14 months",
    createdAt: "2024-06-15",
  },
  {
    id: "goal-2",
    name: "Europe Trip",
    category: "TRAVEL",
    targetAmount: 250000,
    savedAmount: 120000,
    deadline: "8 months",
    createdAt: "2024-03-10",
  },
  {
    id: "goal-3",
    name: "Dream Home Fund",
    category: "LIFESTYLE",
    targetAmount: 5000000,
    savedAmount: 450000,
    deadline: "60 months",
    createdAt: "2023-01-01",
    linkedInvestments: [{ investmentId: "mf-1", contribution: 24000 }],
  },
  {
    id: "goal-4",
    name: "Emergency Fund",
    category: "EMERGENCY",
    targetAmount: 1000000,
    savedAmount: 800000,
    createdAt: "2023-06-01",
  },
  {
    id: "goal-5",
    name: "New Car",
    category: "VEHICLE",
    targetAmount: 3500000,
    savedAmount: 1250000,
    createdAt: "2024-01-15",
  },
];

// Expenses Data
export const mockExpenses: Expense[] = [
  {
    id: "expense-1",
    name: "Rent",
    amount: 15000,
    frequency: "monthly",
    icon: "Home",
    iconBg: "bg-blue-500",
  },
  {
    id: "expense-2",
    name: "Laptop EMI",
    amount: 5000,
    frequency: "monthly",
    nextOccurrence: "5 Aug",
    icon: "Laptop",
    iconBg: "bg-orange-500",
  },
  {
    id: "expense-3",
    name: "Gym Membership",
    amount: 2000,
    frequency: "monthly",
    icon: "Dumbbell",
    iconBg: "bg-green-500",
  },
  {
    id: "expense-4",
    name: "Internet Bill",
    amount: 1200,
    frequency: "monthly",
    icon: "Wifi",
    iconBg: "bg-cyan-500",
  },
  {
    id: "expense-5",
    name: "Car Insurance",
    amount: 8800,
    frequency: "yearly",
    nextOccurrence: "15 Sep",
    icon: "Car",
    iconBg: "bg-red-500",
  },
  {
    id: "expense-6",
    name: "Netflix",
    amount: 649,
    frequency: "monthly",
    icon: "Tv",
    iconBg: "bg-red-600",
  },
  {
    id: "expense-7",
    name: "Electricity Bill",
    amount: 2500,
    frequency: "monthly",
    icon: "Zap",
    iconBg: "bg-yellow-500",
  },
];

// Helper functions
export const formatCurrency = (amount: number, compact = false): string => {
  if (compact && amount >= 100000) {
    if (amount >= 10000000) {
      return `₹${(amount / 10000000).toFixed(1)}Cr`;
    }
    return `₹${(amount / 100000).toFixed(1)}L`;
  }
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount).replace('₹', '₹');
};

export const formatPercent = (value: number): string => {
  const sign = value >= 0 ? '+' : '';
  return `${sign}${value.toFixed(1)}%`;
};

export const getInvestmentsByType = (type: Investment['type']): Investment[] => {
  return mockInvestments.filter(inv => inv.type === type);
};

export const getTotalByType = (type: Investment['type']): { current: number; invested: number; returns: number } => {
  const investments = getInvestmentsByType(type);
  const current = investments.reduce((sum, inv) => sum + inv.currentValue, 0);
  const invested = investments.reduce((sum, inv) => sum + inv.investedValue, 0);
  return {
    current,
    invested,
    returns: current - invested,
  };
};

export const getNetWorth = (): number => {
  return mockInvestments.reduce((sum, inv) => sum + inv.currentValue, 0);
};

export const getTotalInvested = (): number => {
  const investmentTypes: Investment['type'][] = ['stocks', 'mutual-funds', 'gold'];
  return mockInvestments
    .filter(inv => investmentTypes.includes(inv.type))
    .reduce((sum, inv) => sum + inv.currentValue, 0);
};

export const getMonthlyExpenses = (): number => {
  return mockExpenses.reduce((sum, exp) => {
    if (exp.frequency === 'monthly') return sum + exp.amount;
    if (exp.frequency === 'yearly') return sum + (exp.amount / 12);
    return sum;
  }, 0);
};
