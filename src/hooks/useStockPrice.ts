import { useQuery } from "@tanstack/react-query";


export interface StockQuote {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  lastUpdated: string;
  exchange: string;
  isFallback?: boolean;
}

export interface StockSearchResult {
  symbol: string;
  name: string;
  exchange: string;
  type: string;
}

async function fetchStockQuote(symbol: string): Promise<StockQuote | null> {
  const cloudUrl = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/stocks?action=quote&symbol=${encodeURIComponent(symbol)}`;
  const response = await fetch(cloudUrl, {
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to fetch stock price');
  }

  return response.json();
}

async function searchStocks(query: string): Promise<StockSearchResult[]> {
  const cloudUrl = `https://${import.meta.env.VITE_SUPABASE_PROJECT_ID}.supabase.co/functions/v1/stocks?action=search&query=${encodeURIComponent(query)}`;
  const response = await fetch(cloudUrl, {
    headers: {
      'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Failed to search stocks');
  }

  const data = await response.json();
  return data.results || [];
}

export function useStockPrice(symbol: string | undefined) {
  return useQuery({
    queryKey: ['stock-price', symbol],
    queryFn: () => fetchStockQuote(symbol!),
    enabled: !!symbol,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 5 * 60 * 1000, // Refetch every 5 minutes
  });
}

export function useStockSearch(query: string) {
  return useQuery({
    queryKey: ['stock-search', query],
    queryFn: () => searchStocks(query),
    enabled: query.length >= 2,
    staleTime: 60 * 1000, // 1 minute
  });
}

// Calculate current value based on quantity and live price
export function calculateStockCurrentValue(quantity: number, livePrice: number): number {
  return quantity * livePrice;
}

// Calculate gain/loss
export function calculateStockGainLoss(
  currentValue: number, 
  investedValue: number
): { amount: number; percent: number } {
  const amount = currentValue - investedValue;
  const percent = investedValue > 0 ? (amount / investedValue) * 100 : 0;
  return { amount, percent };
}
