import { Outlet, Navigate, useLocation, useNavigate } from "react-router-dom";
import { PageHeader } from "@/components/layout/PageHeader";
import { AssetTypeSlider } from "@/components/wealth/AssetTypeSlider";
import { FloatingActionButton } from "@/components/ui/floating-action-button";
import { useState } from "react";
import { AssetTypeSelectionModal } from "@/components/modals/AssetTypeSelectionModal";

export default function WealthPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [showTypeModal, setShowTypeModal] = useState(false);

  // Redirect to stocks if on base /wealth path
  if (location.pathname === "/wealth") {
    return <Navigate to="/wealth/stocks" replace />;
  }

  const handleSelectAssetType = (type: string) => {
    // Navigate to the appropriate add screen based on type
    if (type === "stocks" || type === "mutual-funds") {
      navigate(`/wealth/add/${type}`);
    } else {
      navigate(`/wealth/add/${type}`);
    }
  };

  return (
    <div className="animate-fade-in">
      <PageHeader title="Wealth" />
      <AssetTypeSlider />
      
      <div className="px-4 py-4">
        <Outlet />
      </div>

      <FloatingActionButton 
        label="Add Investment" 
        onClick={() => setShowTypeModal(true)} 
      />

      <AssetTypeSelectionModal 
        open={showTypeModal} 
        onOpenChange={setShowTypeModal}
        onSelectType={handleSelectAssetType}
      />
    </div>
  );
}
