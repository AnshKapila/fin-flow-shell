import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Auth
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";

// Layout
import { AppLayout } from "@/components/layout/AppLayout";

// Pages
import Auth from "./pages/Auth";
import Home from "./pages/Home";
import Wealth from "./pages/Wealth";
import Stocks from "./pages/wealth/Stocks";
import MutualFunds from "./pages/wealth/MutualFunds";
import Gold from "./pages/wealth/Gold";
import FixedDeposits from "./pages/wealth/FixedDeposits";
import Savings from "./pages/wealth/Savings";
import InvestmentDetail from "./pages/wealth/InvestmentDetail";
import AddStockOrMutualFund from "./pages/wealth/AddStockOrMutualFund";
import AddSimpleInvestment from "./pages/wealth/AddSimpleInvestment";
import AddFixedDeposit from "./pages/wealth/AddFixedDeposit";
import AddGold from "./pages/wealth/AddGold";
import FDDetail from "./pages/wealth/FDDetail";
import EditFixedDeposit from "./pages/wealth/EditFixedDeposit";
import GoldDetail from "./pages/wealth/GoldDetail";
 import AddMutualFund from "./pages/wealth/AddMutualFund";
 import MutualFundDetail from "./pages/wealth/MutualFundDetail";
import Goals from "./pages/Goals";
import GoalDetail from "./pages/GoalDetail";
import EditGoal from "./pages/goals/EditGoal";
import Spendings from "./pages/Spendings";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Public route */}
            <Route path="/auth" element={<Auth />} />
            
            {/* Protected routes */}
            <Route element={<ProtectedRoute />}>
              <Route element={<AppLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/wealth" element={<Wealth />}>
                  <Route path="stocks" element={<Stocks />} />
                  <Route path="mutual-funds" element={<MutualFunds />} />
                  <Route path="gold" element={<Gold />} />
                  <Route path="fd" element={<FixedDeposits />} />
                  <Route path="savings" element={<Savings />} />
                </Route>
                <Route path="/wealth/add/stocks" element={<AddStockOrMutualFund />} />
               <Route path="/wealth/add/mutual-funds" element={<AddMutualFund />} />
                <Route path="/wealth/add/gold" element={<AddGold />} />
                <Route path="/wealth/add/fd" element={<AddFixedDeposit />} />
                <Route path="/wealth/add/savings" element={<AddSimpleInvestment />} />
                {/* FD-specific routes */}
                <Route path="/wealth/fd/:id" element={<FDDetail />} />
                <Route path="/wealth/fd/:id/edit" element={<EditFixedDeposit />} />
                {/* Gold-specific routes */}
                <Route path="/wealth/gold/:id" element={<GoldDetail />} />
               {/* Mutual Fund-specific routes */}
               <Route path="/wealth/mutual-funds/:id" element={<MutualFundDetail />} />
                {/* Generic investment detail for other types */}
                <Route path="/wealth/:type/:id" element={<InvestmentDetail />} />
                <Route path="/goals" element={<Goals />} />
                <Route path="/goals/:id" element={<GoalDetail />} />
                <Route path="/goals/:id/edit" element={<EditGoal />} />
                <Route path="/spendings" element={<Spendings />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
            </Route>
            
            {/* Catch-all route */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
