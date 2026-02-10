import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/useNotifications";

export type InvestmentType = "stocks" | "mutual-funds" | "gold" | "fd" | "savings";
export type TenureUnit = "months" | "years";

export interface Investment {
  id: string;
  user_id: string;
  name: string;
  type: InvestmentType;
  current_value: number;
  invested_value: number;
  category: string | null;
  risk_level: string | null;
  bank: string | null;
  account_number: string | null;
  interest_rate: number | null;
  maturity_date: string | null;
  maturity_value: number | null;
  added_date: string | null;
  notes: string | null;
  // FD-specific fields
  start_date: string | null;
  tenure_value: number | null;
  tenure_unit: TenureUnit | null;
  is_closed: boolean | null;
  goal_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateInvestmentInput {
  name: string;
  type: InvestmentType;
  current_value: number;
  invested_value: number;
  category?: string | null;
  risk_level?: string | null;
  bank?: string | null;
  account_number?: string | null;
  interest_rate?: number | null;
  maturity_date?: string | null;
  maturity_value?: number | null;
  added_date?: string | null;
  notes?: string | null;
  // FD-specific fields
  start_date?: string | null;
  tenure_value?: number | null;
  tenure_unit?: TenureUnit | null;
  is_closed?: boolean | null;
  goal_id?: string | null;
}

export interface UpdateInvestmentInput extends Partial<CreateInvestmentInput> {
  id: string;
}

export function useInvestments() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { createNotification } = useNotifications();

  const investmentsQuery = useQuery({
    queryKey: ["investments", user?.id],
    queryFn: async (): Promise<Investment[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("investments")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Failed to fetch investments:", error);
        throw error;
      }

      return (data || []) as Investment[];
    },
    enabled: !!user,
  });

  const createInvestment = useMutation({
    mutationFn: async (input: CreateInvestmentInput) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("investments")
        .insert({
          user_id: user.id,
          name: input.name,
          type: input.type,
          current_value: input.current_value,
          invested_value: input.invested_value,
          category: input.category || null,
          risk_level: input.risk_level || null,
          bank: input.bank || null,
          account_number: input.account_number || null,
          interest_rate: input.interest_rate || null,
          maturity_date: input.maturity_date || null,
          maturity_value: input.maturity_value || null,
          added_date: input.added_date || new Date().toLocaleDateString("en-IN", { 
            day: "numeric", month: "short", year: "numeric" 
          }),
          notes: input.notes || null,
          // FD-specific fields
          start_date: input.start_date || null,
          tenure_value: input.tenure_value || null,
          tenure_unit: input.tenure_unit || null,
          is_closed: input.is_closed ?? false,
        })
        .select()
        .single();

      if (error) throw error;
      return data as Investment;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["investments"] });
      // Create notification for new investment
      createNotification.mutate({
        type: "wealth_added",
        title: "Investment Added",
        message: `${data.name} has been added to your wealth portfolio.`,
        related_id: data.id,
      });
    },
  });

  const updateInvestment = useMutation({
    mutationFn: async (input: UpdateInvestmentInput) => {
      if (!user) throw new Error("Not authenticated");

      const { id, ...updates } = input;
      const { data, error } = await supabase
        .from("investments")
        .update(updates)
        .eq("id", id)
        .eq("user_id", user.id)
        .select()
        .single();

      if (error) throw error;
      return data as Investment;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["investments"] });
      // Create notification for updated investment
      createNotification.mutate({
        type: "wealth_updated",
        title: "Investment Updated",
        message: `${data.name} has been updated.`,
        related_id: data.id,
      });
    },
  });

  const deleteInvestment = useMutation({
    mutationFn: async (id: string) => {
      if (!user) throw new Error("Not authenticated");

      // Get investment name before deleting for notification
      const investment = investmentsQuery.data?.find((inv) => inv.id === id);
      
      const { error } = await supabase
        .from("investments")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (error) throw error;
      return investment;
    },
    onSuccess: (deletedInvestment) => {
      queryClient.invalidateQueries({ queryKey: ["investments"] });
      if (deletedInvestment) {
        createNotification.mutate({
          type: "wealth_deleted",
          title: "Investment Removed",
          message: `${deletedInvestment.name} has been removed from your portfolio.`,
        });
      }
    },
  });

  // Helper functions for calculations
  const investments = investmentsQuery.data || [];

  const getInvestmentsByType = (type: InvestmentType): Investment[] => {
    return investments.filter((inv) => inv.type === type);
  };

  const getTotalByType = (type: InvestmentType): { current: number; invested: number; returns: number } => {
    const typeInvestments = getInvestmentsByType(type);
    const current = typeInvestments.reduce((sum, inv) => sum + Number(inv.current_value), 0);
    const invested = typeInvestments.reduce((sum, inv) => sum + Number(inv.invested_value), 0);
    return {
      current,
      invested,
      returns: current - invested,
    };
  };

  // Calculate net worth with optional gold price for live gold calculations
  const getNetWorth = (goldPricePerGram?: number): number => {
    return investments.reduce((sum, inv) => {
      if (inv.type === "gold" && goldPricePerGram) {
        const weightInGrams = parseFloat(inv.risk_level?.replace("g", "") || "0");
        return sum + (weightInGrams * goldPricePerGram);
      }
      return sum + Number(inv.current_value);
    }, 0);
  };

  const getTotalInvested = (): number => {
    const investmentTypes: InvestmentType[] = ["stocks", "mutual-funds", "gold"];
    return investments
      .filter((inv) => investmentTypes.includes(inv.type))
      .reduce((sum, inv) => sum + Number(inv.current_value), 0);
  };

  const getTotalReturns = (goldPricePerGram?: number): number => {
    return investments.reduce((sum, inv) => {
      if (inv.type === "gold" && goldPricePerGram) {
        const weightInGrams = parseFloat(inv.risk_level?.replace("g", "") || "0");
        const currentValue = weightInGrams * goldPricePerGram;
        return sum + (currentValue - Number(inv.invested_value));
      }
      return sum + (Number(inv.current_value) - Number(inv.invested_value));
    }, 0);
  };

  const getReturnsPercent = (invested: number, returns: number): number => {
    if (invested <= 0) return 0;
    return (returns / invested) * 100;
  };

  // Get totals with live gold price
  const getTotalsWithLiveGold = (goldPricePerGram: number) => {
    let totalCurrent = 0;
    let totalInvested = 0;
    
    investments.forEach(inv => {
      if (inv.type === "gold") {
        const weightInGrams = parseFloat(inv.risk_level?.replace("g", "") || "0");
        totalCurrent += weightInGrams * goldPricePerGram;
      } else {
        totalCurrent += Number(inv.current_value);
      }
      totalInvested += Number(inv.invested_value);
    });
    
    return {
      current: totalCurrent,
      invested: totalInvested,
      returns: totalCurrent - totalInvested,
    };
  };

  return {
    investments,
    isLoading: investmentsQuery.isLoading,
    error: investmentsQuery.error,
    createInvestment,
    updateInvestment,
    deleteInvestment,
    getInvestmentsByType,
    getTotalByType,
    getNetWorth,
    getTotalInvested,
    getTotalReturns,
    getReturnsPercent,
    getTotalsWithLiveGold,
  };
}
