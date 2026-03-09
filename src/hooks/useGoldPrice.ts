import { useQuery } from "@tanstack/react-query";


export interface GoldPriceData {
  price_per_gram_24k: number;
  price_per_gram_22k: number;
  last_updated: string;
  is_fallback: boolean;
}

// Fallback prices if everything fails
const FALLBACK_PRICE: GoldPriceData = {
  price_per_gram_24k: 7800,
  price_per_gram_22k: 7150,
  last_updated: new Date().toISOString(),
  is_fallback: true,
};

export function useGoldPrice() {
  const query = useQuery({
    queryKey: ["gold-price"],
    queryFn: async (): Promise<GoldPriceData> => {
      try {
        const cloudUrl = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/gold-price`;
        const response = await fetch(cloudUrl, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            'Content-Type': 'application/json',
          },
        });
        
        if (!response.ok) {
          console.error("Failed to fetch gold price:", response.status);
          return FALLBACK_PRICE;
        }
        
        const data = await response.json();
        
        return data as GoldPriceData;
      } catch (e) {
        console.error("Gold price fetch error:", e);
        return FALLBACK_PRICE;
      }
    },
    // Cache for 5 minutes, refetch in background
    staleTime: 5 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    refetchInterval: 5 * 60 * 1000,
    retry: 2,
  });

  return {
    goldPrice: query.data || FALLBACK_PRICE,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}

// Helper to calculate gold weight from invested amount at a given price
export function calculateGoldWeight(investedAmount: number, pricePerGram: number): number {
  if (pricePerGram <= 0) return 0;
  return investedAmount / pricePerGram;
}

// Helper to calculate current value from weight and current price
export function calculateGoldCurrentValue(weightInGrams: number, currentPricePerGram: number): number {
  return weightInGrams * currentPricePerGram;
}
