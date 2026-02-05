 import { useState, useEffect } from "react";
 import { useNavigate } from "react-router-dom";
 import { Search, CalendarIcon, RefreshCw } from "lucide-react";
 import { PageHeader } from "@/components/layout/PageHeader";
 import { Input } from "@/components/ui/input";
 import { Button } from "@/components/ui/button";
 import { Label } from "@/components/ui/label";
 import { Textarea } from "@/components/ui/textarea";
 import { Calendar } from "@/components/ui/calendar";
 import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
 import { Switch } from "@/components/ui/switch";
 import { useInvestments } from "@/hooks/useInvestments";
 import { useMutualFundSearch, useMutualFundNav, usePopularMutualFunds, calculateMFUnits } from "@/hooks/useMutualFundNav";
 import { toast } from "sonner";
 import { format } from "date-fns";
 import { cn } from "@/lib/utils";
 
 interface SelectedFund {
   scheme_code: string;
   scheme_name: string;
   category?: string;
   amc?: string;
 }
 
 export default function AddMutualFund() {
   const navigate = useNavigate();
   const { createInvestment } = useInvestments();
   
   const [searchQuery, setSearchQuery] = useState("");
   const [selectedFund, setSelectedFund] = useState<SelectedFund | null>(null);
   const [investedAmount, setInvestedAmount] = useState("");
   const [investmentDate, setInvestmentDate] = useState<Date | undefined>(new Date());
   const [notes, setNotes] = useState("");
   const [isSubmitting, setIsSubmitting] = useState(false);
   
   // SIP fields
   const [isSipEnabled, setIsSipEnabled] = useState(false);
   const [sipAmount, setSipAmount] = useState("");
   const [sipStartDate, setSipStartDate] = useState<Date | undefined>(new Date());
   const [sipDayOfMonth, setSipDayOfMonth] = useState("1");
 
   // Fetch data
   const { data: searchResults, isLoading: isSearching } = useMutualFundSearch(searchQuery);
   const { data: popularFunds } = usePopularMutualFunds();
   const { data: navData, isLoading: isLoadingNav, refetch: refetchNav } = useMutualFundNav(selectedFund?.scheme_code);
 
   const displayResults = searchQuery.length >= 2 
     ? searchResults 
     : popularFunds?.map(f => ({ scheme_code: f.scheme_code, scheme_name: f.scheme_name }));
 
   const handleSelectFund = (fund: { scheme_code: string; scheme_name: string }) => {
     const popularFund = popularFunds?.find(p => p.scheme_code === fund.scheme_code);
     setSelectedFund({
       ...fund,
       category: popularFund?.category,
       amc: popularFund?.amc,
     });
     setSearchQuery("");
   };
 
   const handleSubmit = async (e: React.FormEvent) => {
     e.preventDefault();
     if (!selectedFund) return;
     
     if (!investmentDate) {
       toast.error("Please select an investment date");
       return;
     }
 
     if (!investedAmount || parseFloat(investedAmount) <= 0) {
       toast.error("Please enter a valid invested amount");
       return;
     }
     
     setIsSubmitting(true);
     try {
       const invested = parseFloat(investedAmount) || 0;
       const nav = navData?.nav || 0;
       const units = nav > 0 ? calculateMFUnits(invested, nav) : 0;
       const currentValue = units * nav;
       
       await createInvestment.mutateAsync({
         name: selectedFund.scheme_name,
         type: "mutual-funds",
         invested_value: invested,
         current_value: currentValue || invested,
         start_date: format(investmentDate, "yyyy-MM-dd"),
         category: selectedFund.category || "Equity",
         risk_level: "Medium Risk",
         notes: notes || null,
         // MF-specific fields (using existing columns appropriately)
         account_number: selectedFund.scheme_code, // Store scheme_code here
         interest_rate: nav, // Store NAV at purchase
         maturity_date: navData?.date || null, // Store NAV date
         // Using bank field for units (workaround until we update the types)
         bank: units > 0 ? units.toFixed(4) : null,
       });
       
       // Note: SIP logic would need additional handling in a real app
       // For now, we store the initial investment
       
       toast.success("Mutual Fund added successfully");
       navigate("/wealth/mutual-funds");
     } catch (error) {
       console.error("Failed to add mutual fund:", error);
       toast.error("Failed to add mutual fund");
     } finally {
       setIsSubmitting(false);
     }
   };
 
   return (
     <div className="animate-fade-in min-h-screen bg-background">
       <PageHeader title="Add Mutual Fund" showBack />
       
       <div className="px-4 py-4 space-y-6">
         {/* Search Section */}
         {!selectedFund && (
           <div className="space-y-4">
             <div className="relative">
               <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
               <Input
                 value={searchQuery}
                 onChange={(e) => setSearchQuery(e.target.value)}
                 placeholder="Search mutual funds by name..."
                 className="bg-muted border-border pl-10"
               />
             </div>
 
             {isSearching && (
               <div className="flex items-center justify-center py-4">
                 <RefreshCw className="h-5 w-5 animate-spin text-muted-foreground" />
               </div>
             )}
 
             {/* Results */}
             {displayResults && displayResults.length > 0 && (
               <div className="space-y-2">
                 <p className="text-sm text-muted-foreground">
                   {searchQuery.length >= 2 ? "Search Results" : "Popular Funds"}
                 </p>
                 {displayResults.map((fund) => (
                   <button
                     key={fund.scheme_code}
                     onClick={() => handleSelectFund(fund)}
                     className="flex w-full items-start justify-between rounded-xl bg-muted p-4 transition-colors hover:bg-muted/80 text-left"
                   >
                     <div>
                       <p className="font-medium text-foreground text-sm">{fund.scheme_name}</p>
                       <p className="text-xs text-muted-foreground mt-1">
                         Scheme Code: {fund.scheme_code}
                       </p>
                     </div>
                   </button>
                 ))}
               </div>
             )}
 
             {searchQuery.length >= 2 && !isSearching && (!searchResults || searchResults.length === 0) && (
               <p className="text-center text-sm text-muted-foreground py-8">
                 No results found for "{searchQuery}"
               </p>
             )}
           </div>
         )}
 
         {/* Form Section */}
         {selectedFund && (
           <form onSubmit={handleSubmit} className="space-y-6">
             {/* Selected Fund Display */}
             <div className="rounded-xl bg-muted p-4">
               <div className="flex items-start justify-between">
                 <div className="flex-1">
                   <p className="font-medium text-foreground text-sm">{selectedFund.scheme_name}</p>
                   <p className="text-xs text-muted-foreground mt-1">
                     {selectedFund.category && `${selectedFund.category} • `}
                     Code: {selectedFund.scheme_code}
                   </p>
                 </div>
                 <button
                   type="button"
                   onClick={() => setSelectedFund(null)}
                   className="text-sm text-primary hover:underline ml-2"
                 >
                   Change
                 </button>
               </div>
               
               {/* Live NAV Display */}
               <div className="mt-3 pt-3 border-t border-border">
                 {isLoadingNav ? (
                   <div className="flex items-center gap-2 text-muted-foreground">
                     <RefreshCw className="h-3 w-3 animate-spin" />
                     <span className="text-sm">Fetching NAV...</span>
                   </div>
                 ) : navData ? (
                   <div className="flex items-center justify-between">
                     <div>
                       <p className="text-xs text-muted-foreground">Current NAV</p>
                       <p className="text-lg font-semibold text-primary">₹{navData.nav.toFixed(2)}</p>
                     </div>
                     <div className="text-right">
                       <p className="text-xs text-muted-foreground">As of {navData.date}</p>
                       <button
                         type="button"
                         onClick={() => refetchNav()}
                         className="text-xs text-primary hover:underline flex items-center gap-1 justify-end"
                       >
                         <RefreshCw className="h-3 w-3" />
                         Refresh
                       </button>
                     </div>
                   </div>
                 ) : (
                   <p className="text-sm text-muted-foreground">NAV unavailable</p>
                 )}
               </div>
             </div>
 
             {/* Investment Details */}
             <div className="space-y-4">
               {/* Investment Date */}
               <div className="space-y-2">
                 <Label className="text-muted-foreground">
                   Investment Date <span className="text-destructive">*</span>
                 </Label>
                 <Popover>
                   <PopoverTrigger asChild>
                     <Button
                       variant="outline"
                       className={cn(
                         "w-full justify-start text-left font-normal bg-muted border-border",
                         !investmentDate && "text-muted-foreground"
                       )}
                     >
                       <CalendarIcon className="mr-2 h-4 w-4" />
                       {investmentDate ? format(investmentDate, "PPP") : <span>Pick a date</span>}
                     </Button>
                   </PopoverTrigger>
                   <PopoverContent className="w-auto p-0" align="start">
                     <Calendar
                       mode="single"
                       selected={investmentDate}
                       onSelect={setInvestmentDate}
                       disabled={(date) => date > new Date()}
                       initialFocus
                       className="p-3 pointer-events-auto"
                     />
                   </PopoverContent>
                 </Popover>
               </div>
 
               {/* Invested Amount */}
               <div className="space-y-2">
                 <Label htmlFor="invested" className="text-muted-foreground">
                   Invested Amount <span className="text-destructive">*</span>
                 </Label>
                 <Input
                   id="invested"
                   type="number"
                   value={investedAmount}
                   onChange={(e) => setInvestedAmount(e.target.value)}
                   placeholder="₹0"
                   className="bg-muted border-border"
                   required
                 />
                 {navData && investedAmount && parseFloat(investedAmount) > 0 && (
                   <p className="text-xs text-muted-foreground">
                     ≈ {calculateMFUnits(parseFloat(investedAmount), navData.nav).toFixed(4)} units at current NAV
                   </p>
                 )}
               </div>
 
               {/* SIP Toggle */}
               <div className="flex items-center justify-between rounded-xl bg-muted p-4">
                 <div>
                   <p className="font-medium text-foreground">Enable Monthly SIP</p>
                   <p className="text-sm text-muted-foreground">Automatically track recurring investments</p>
                 </div>
                 <Switch
                   checked={isSipEnabled}
                   onCheckedChange={setIsSipEnabled}
                 />
               </div>
 
               {/* SIP Details */}
               {isSipEnabled && (
                 <div className="space-y-4 rounded-xl border border-border p-4">
                   <div className="space-y-2">
                     <Label htmlFor="sipAmount" className="text-muted-foreground">
                       Monthly SIP Amount <span className="text-destructive">*</span>
                     </Label>
                     <Input
                       id="sipAmount"
                       type="number"
                       value={sipAmount}
                       onChange={(e) => setSipAmount(e.target.value)}
                       placeholder="₹0"
                       className="bg-muted border-border"
                       required={isSipEnabled}
                     />
                   </div>
 
                   <div className="space-y-2">
                     <Label className="text-muted-foreground">SIP Start Date</Label>
                     <Popover>
                       <PopoverTrigger asChild>
                         <Button
                           variant="outline"
                           className={cn(
                             "w-full justify-start text-left font-normal bg-muted border-border",
                             !sipStartDate && "text-muted-foreground"
                           )}
                         >
                           <CalendarIcon className="mr-2 h-4 w-4" />
                           {sipStartDate ? format(sipStartDate, "PPP") : <span>Pick a date</span>}
                         </Button>
                       </PopoverTrigger>
                       <PopoverContent className="w-auto p-0" align="start">
                         <Calendar
                           mode="single"
                           selected={sipStartDate}
                           onSelect={setSipStartDate}
                           initialFocus
                           className="p-3 pointer-events-auto"
                         />
                       </PopoverContent>
                     </Popover>
                   </div>
 
                   <div className="space-y-2">
                     <Label htmlFor="sipDay" className="text-muted-foreground">SIP Day of Month</Label>
                     <Input
                       id="sipDay"
                       type="number"
                       min="1"
                       max="28"
                       value={sipDayOfMonth}
                       onChange={(e) => setSipDayOfMonth(e.target.value)}
                       placeholder="1"
                       className="bg-muted border-border"
                     />
                   </div>
                 </div>
               )}
 
               {/* Notes */}
               <div className="space-y-2">
                 <Label htmlFor="notes" className="text-muted-foreground">Notes (Optional)</Label>
                 <Textarea
                   id="notes"
                   value={notes}
                   onChange={(e) => setNotes(e.target.value)}
                   placeholder="Why did you invest in this fund?"
                   className="bg-muted border-border resize-none"
                   rows={3}
                 />
               </div>
             </div>
 
             {/* Action Buttons */}
             <div className="flex gap-3 pt-4">
               <Button
                 type="button"
                 variant="outline"
                 onClick={() => navigate("/wealth/mutual-funds")}
                 className="flex-1 border-border"
                 disabled={isSubmitting}
               >
                 Cancel
               </Button>
               <Button type="submit" className="flex-1" disabled={isSubmitting || isLoadingNav}>
                 {isSubmitting ? "Adding..." : "Add Mutual Fund"}
               </Button>
             </div>
           </form>
         )}
       </div>
     </div>
   );
 }