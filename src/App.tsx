import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Layout
import { AppLayout } from "@/components/layout/AppLayout";

// Pages
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
import Goals from "./pages/Goals";
import GoalDetail from "./pages/GoalDetail";
import Spendings from "./pages/Spendings";
import Profile from "./pages/Profile";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
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
            <Route path="/wealth/add/mutual-funds" element={<AddStockOrMutualFund />} />
            <Route path="/wealth/add/gold" element={<AddSimpleInvestment />} />
            <Route path="/wealth/add/fd" element={<AddSimpleInvestment />} />
            <Route path="/wealth/add/savings" element={<AddSimpleInvestment />} />
            <Route path="/wealth/:type/:id" element={<InvestmentDetail />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/goals/:id" element={<GoalDetail />} />
            <Route path="/spendings" element={<Spendings />} />
            <Route path="/profile" element={<Profile />} />
          </Route>
          {/* Catch-all route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
