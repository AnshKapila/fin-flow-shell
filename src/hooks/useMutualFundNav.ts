 import { useQuery } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 
 interface NavData {
   scheme_code: string;
   scheme_name: string;
   nav: number;
   date: string;
   last_updated: string;
   source?: string;
 }
 
 interface SearchResult {
   scheme_code: string;
   scheme_name: string;
 }
 
 interface PopularFund {
   scheme_code: string;
   scheme_name: string;
   category: string;
   amc: string;
 }
 
 export function useMutualFundNav(schemeCode: string | undefined) {
   return useQuery<NavData | null>({
     queryKey: ["mutual-fund-nav", schemeCode],
     queryFn: async () => {
       if (!schemeCode) return null;
 
      // Use POST with body for better compatibility
      const cloudUrl = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/mutual-fund-nav`;
      const response = await fetch(cloudUrl, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ scheme_code: schemeCode }),
        }
      );
 
       if (!response.ok) {
         const errorData = await response.json().catch(() => ({}));
         throw new Error(errorData.error || "Failed to fetch NAV");
       }
 
       return response.json();
     },
     enabled: !!schemeCode,
     staleTime: 5 * 60 * 1000, // 5 minutes
     refetchInterval: 10 * 60 * 1000, // Refetch every 10 minutes
   });
 }
 
 export function useMutualFundSearch(searchQuery: string) {
   return useQuery<SearchResult[]>({
     queryKey: ["mutual-fund-search", searchQuery],
     queryFn: async () => {
       if (!searchQuery || searchQuery.length < 2) return [];
 
        const cloudUrl = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/mutual-fund-nav`;
        const response = await fetch(cloudUrl, {
           method: 'POST',
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
             'Content-Type': 'application/json',
            },
           body: JSON.stringify({ search: searchQuery }),
          }
        );
 
       if (!response.ok) {
         return [];
       }
 
       const data = await response.json();
       return data.results || [];
     },
     enabled: searchQuery.length >= 2,
     staleTime: 60 * 1000, // 1 minute
   });
 }
 
 export function usePopularMutualFunds() {
   return useQuery<PopularFund[]>({
     queryKey: ["popular-mutual-funds"],
     queryFn: async () => {
        const cloudUrl = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/mutual-fund-nav`;
        const response = await fetch(cloudUrl, {
            headers: {
              Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            },
          }
        );
 
       if (!response.ok) {
         return [];
       }
 
       const data = await response.json();
       return data.popular || [];
     },
     staleTime: 60 * 60 * 1000, // 1 hour
   });
 }
 
 // Calculate MF current value based on units and current NAV
 export function calculateMFCurrentValue(units: number, nav: number): number {
   return units * nav;
 }
 
 // Calculate units from invested amount and NAV at purchase
 export function calculateMFUnits(investedAmount: number, purchaseNav: number): number {
   if (purchaseNav <= 0) return 0;
   return investedAmount / purchaseNav;
 }
 
 // Calculate SIP total invested based on start date and monthly amount
 export function calculateSIPTotalInvested(
   sipStartDate: Date,
   sipAmount: number,
   initialInvestment: number = 0
 ): number {
   const now = new Date();
   const monthsElapsed = Math.max(0,
     (now.getFullYear() - sipStartDate.getFullYear()) * 12 +
     (now.getMonth() - sipStartDate.getMonth())
   );
   return initialInvestment + (sipAmount * monthsElapsed);
 }