import { Outlet, Navigate, useLocation } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { AssetTypeSlider } from "@/components/wealth/AssetTypeSlider";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { useState } from "react";
import { AddInvestmentModal } from "@/components/modals/AddInvestmentModal";

export default function WealthPage() {
  const location = useLocation();
  const [showAddModal, setShowAddModal] = useState(false);

  // Redirect to stocks if on base /wealth path
  if (location.pathname === "/wealth") {
    return <Navigate to="/wealth/stocks" replace />;
  }

  return (
    <div className="animate-fade-in">
      <PageHeader title="Wealth" showBack showNotification />
      <AssetTypeSlider />
      
      <div className="px-4 py-4">
        <Outlet />
      </div>

      <FloatingActionButton 
        label="Add Investment" 
        onClick={() => setShowAddModal(true)} 
      />

      <AddInvestmentModal 
        open={showAddModal} 
        onOpenChange={setShowAddModal} 
      />
    </div>
  );
}
