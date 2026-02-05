 import { useParams, useNavigate } from "react-router-dom";
 import { MoreVertical, Trash2, CalendarDays, TrendingUp, Coins } from "lucide-react";
 import { PageHeader } from "@/components/layout/PageHeader";
 import { SummaryCard, SummaryLabel, SummaryValue } from "@/components/ui/summary-card";
 import { ListCard } from "@/components/ui/list-card";
 import { Button } from "@/components/ui/button";
 import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
 import { useInvestments } from "@/hooks/useInvestments";
 import { useMutualFundNav } from "@/hooks/useMutualFundNav";
 import { formatCurrency, formatPercent } from "@/data/mockData";
 import { useState } from "react";
 import { DeleteConfirmModal } from "@/components/modals/DeleteConfirmModal";
 import { toast } from "sonner";
 import { differenceInDays, parseISO, format } from "date-fns";
 
 export default function MutualFundDetail() {
   const { id } = useParams();
   const navigate = useNavigate();
   const { investments, deleteInvestment, isLoading } = useInvestments();
   const [showDeleteModal, setShowDeleteModal] = useState(false);
   
   const investment = investments.find(inv => inv.id === id);
   const schemeCode = investment?.account_number; // We store scheme_code in account_number
   
   const { data: navData, isLoading: isNavLoading } = useMutualFundNav(schemeCode || undefined);
   
   if (isLoading) {
     return (
       <div className="flex items-center justify-center min-h-screen">
         <span className="text-muted-foreground">Loading...</span>
       </div>
     );
   }
   
   if (!investment) {
     return (
       <div className="flex flex-col items-center justify-center min-h-screen gap-4">
         <p className="text-muted-foreground">Investment not found</p>
         <button 
           onClick={() => navigate("/wealth/mutual-funds")}
           className="text-primary font-medium"
         >
           Go back
         </button>
       </div>
     );
   }
 
   // Parse units stored in bank field
   const unitsOwned = investment.bank ? parseFloat(investment.bank) : 0;
   const purchaseNav = investment.interest_rate || 0;
   
   // Calculate current value using live NAV
   const currentNav = navData?.nav || purchaseNav;
   const liveCurrentValue = unitsOwned > 0 ? unitsOwned * currentNav : Number(investment.current_value);
   
   const investedAmount = Number(investment.invested_value);
   const returnsAmount = liveCurrentValue - investedAmount;
   const returnsPercent = investedAmount > 0 ? (returnsAmount / investedAmount) * 100 : 0;
 
   // Calculate holding period
   const startDate = investment.start_date ? parseISO(investment.start_date) : null;
   const holdingDays = startDate ? differenceInDays(new Date(), startDate) : 0;
   const holdingYears = Math.floor(holdingDays / 365);
   const holdingMonths = Math.floor((holdingDays % 365) / 30);
   const holdingPeriod = holdingYears > 0 
     ? `${holdingYears}y ${holdingMonths}m` 
     : `${holdingMonths}m ${holdingDays % 30}d`;
 
   const handleDelete = async () => {
     try {
       await deleteInvestment.mutateAsync(investment.id);
       toast.success("Investment deleted successfully");
       navigate("/wealth/mutual-funds");
     } catch (error) {
       console.error("Failed to delete investment:", error);
       toast.error("Failed to delete investment");
     }
   };
 
   const menuContent = (
     <DropdownMenu>
       <DropdownMenuTrigger asChild>
         <Button variant="ghost" size="icon" className="h-8 w-8">
           <MoreVertical className="h-5 w-5" />
         </Button>
       </DropdownMenuTrigger>
       <DropdownMenuContent align="end">
         <DropdownMenuItem 
           className="text-destructive focus:text-destructive"
           onClick={() => setShowDeleteModal(true)}
         >
           <Trash2 className="mr-2 h-4 w-4" />
           Delete Investment
         </DropdownMenuItem>
       </DropdownMenuContent>
     </DropdownMenu>
   );
 
   return (
     <div className="animate-fade-in pb-24">
       <PageHeader 
         title="Mutual Fund"
         showBack
         rightContent={menuContent}
       />
       
       <div className="px-4 space-y-6">
         {/* Name & Tags */}
         <div>
           <h1 className="text-xl font-bold text-foreground leading-tight">{investment.name}</h1>
           <div className="flex flex-wrap gap-2 mt-2">
             {investment.category && (
               <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                 {investment.category}
               </span>
             )}
             {schemeCode && (
               <span className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground">
                 Code: {schemeCode}
               </span>
             )}
           </div>
         </div>
 
         {/* Value Summary Card */}
         <SummaryCard variant="blue">
           <SummaryLabel>Current Value</SummaryLabel>
           <SummaryValue size="2xl" className="mt-1">
             {formatCurrency(liveCurrentValue)}
           </SummaryValue>
           
           <div className="mt-4 grid grid-cols-2 gap-4 pt-4 border-t border-primary-foreground/20">
             <div>
               <p className="text-sm text-primary-foreground/70">Invested</p>
               <p className="text-lg font-semibold text-primary-foreground">
                 {formatCurrency(investedAmount)}
               </p>
             </div>
             <div className="text-right">
               <p className="text-sm text-primary-foreground/70">Gain/Loss</p>
               <div className="flex items-center justify-end gap-2">
                 <span className="text-lg font-semibold text-primary-foreground">
                   {returnsAmount >= 0 ? "+" : ""}{formatCurrency(returnsAmount)}
                 </span>
               </div>
               <span className={`inline-block mt-1 rounded-full px-2 py-0.5 text-xs font-bold text-primary-foreground ${
                 returnsPercent >= 0 ? "bg-fintrack-green" : "bg-fintrack-red-soft"
               }`}>
                 {returnsPercent >= 0 ? "↑" : "↓"} {formatPercent(Math.abs(returnsPercent))}
               </span>
             </div>
           </div>
         </SummaryCard>
 
         {/* Investment Details */}
         <ListCard>
           <h3 className="font-semibold text-foreground mb-4">Investment Details</h3>
           <div className="space-y-4">
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-muted-foreground">
                 <Coins className="h-4 w-4" />
                 <span>Units Owned</span>
               </div>
               <span className="font-medium text-foreground">
                 {unitsOwned > 0 ? unitsOwned.toFixed(4) : "N/A"}
               </span>
             </div>
             
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-muted-foreground">
                 <TrendingUp className="h-4 w-4" />
                 <span>Purchase NAV</span>
               </div>
               <span className="font-medium text-foreground">
                 ₹{purchaseNav > 0 ? purchaseNav.toFixed(2) : "N/A"}
               </span>
             </div>
             
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-muted-foreground">
                 <TrendingUp className="h-4 w-4" />
                 <span>Current NAV</span>
               </div>
               <div className="text-right">
                 <span className="font-medium text-foreground">
                   ₹{currentNav.toFixed(2)}
                 </span>
                 {navData && (
                   <p className="text-xs text-muted-foreground">as of {navData.date}</p>
                 )}
               </div>
             </div>
             
             <div className="flex items-center justify-between">
               <div className="flex items-center gap-2 text-muted-foreground">
                 <CalendarDays className="h-4 w-4" />
                 <span>Holding Period</span>
               </div>
               <span className="font-medium text-foreground">{holdingPeriod}</span>
             </div>
             
             {startDate && (
               <div className="flex items-center justify-between">
                 <div className="flex items-center gap-2 text-muted-foreground">
                   <CalendarDays className="h-4 w-4" />
                   <span>Investment Date</span>
                 </div>
                 <span className="font-medium text-foreground">
                   {format(startDate, "dd MMM yyyy")}
                 </span>
               </div>
             )}
           </div>
         </ListCard>
 
         {/* Notes */}
         {investment.notes && (
           <ListCard>
             <h3 className="font-semibold text-foreground mb-3">Notes</h3>
             <p className="text-muted-foreground text-sm leading-relaxed">
               "{investment.notes}"
             </p>
           </ListCard>
         )}
       </div>
 
       {/* Fixed Bottom Button */}
       <div className="fixed bottom-20 left-0 right-0 p-4 bg-background border-t border-border">
         <div className="max-w-md mx-auto">
           <Button 
             className="w-full"
             onClick={() => navigate(`/wealth/mutual-funds/${id}/edit`)}
           >
             Edit Investment
           </Button>
         </div>
       </div>
 
       <DeleteConfirmModal
         open={showDeleteModal}
         onOpenChange={setShowDeleteModal}
         onConfirm={handleDelete}
         title="Delete Investment"
         description={`Are you sure you want to delete "${investment.name}"? This action cannot be undone.`}
       />
     </div>
   );
 }