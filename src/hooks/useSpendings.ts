import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Spending {
  id: string;
  user_id: string;
  name: string;
  amount: number;
  frequency_type: string;
  frequency_interval: number | null;
  frequency_unit: string | null;
  start_date: string | null;
  icon: string | null;
  icon_bg: string | null;
  created_at: string;
}

export interface CreateSpendingInput {
  name: string;
  amount: number;
  frequency_type: string;
  frequency_interval?: number | null;
  frequency_unit?: string | null;
  start_date?: string | null;
  icon?: string;
  icon_bg?: string;
}

export interface UpdateSpendingInput {
  id: string;
  name?: string;
  amount?: number;
  frequency_type?: string;
  frequency_interval?: number | null;
  frequency_unit?: string | null;
  start_date?: string | null;
  icon?: string;
  icon_bg?: string;
}

export function useSpendings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const spendingsQuery = useQuery({
    queryKey: ["spendings", user?.id],
    queryFn: async (): Promise<Spending[]> => {
      if (!user) return [];

      const { data, error } = await supabase
        .from("spendings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          variant: "destructive",
          title: "Failed to fetch expenses",
          description: error.message,
        });
        throw error;
      }

      return data || [];
    },
    enabled: !!user,
  });

  const createSpending = useMutation({
    mutationFn: async (input: CreateSpendingInput) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("spendings")
        .insert({
          user_id: user.id,
          name: input.name,
          amount: input.amount,
          frequency_type: input.frequency_type,
          frequency_interval: input.frequency_type === "custom" ? input.frequency_interval : null,
          frequency_unit: input.frequency_type === "custom" ? input.frequency_unit : null,
          start_date: input.start_date || null,
          icon: input.icon || "Home",
          icon_bg: input.icon_bg || "bg-blue-500",
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spendings"] });
      toast({
        title: "Expense added",
        description: "Your expense has been saved.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to add expense",
        description: error.message,
      });
    },
  });

  const updateSpending = useMutation({
    mutationFn: async (input: UpdateSpendingInput) => {
      const { id, ...updates } = input;

      const { data, error } = await supabase
        .from("spendings")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spendings"] });
      toast({
        title: "Expense updated",
        description: "Your expense has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to update expense",
        description: error.message,
      });
    },
  });

  const deleteSpending = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("spendings")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["spendings"] });
      toast({
        title: "Expense deleted",
        description: "Your expense has been removed.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to delete expense",
        description: error.message,
      });
    },
  });

  // Calculate monthly total from frequency
  const getMonthlyTotal = () => {
    return spendingsQuery.data?.reduce((sum, spending) => {
      if (spending.frequency_type === "one_time") {
        return sum; // One-time expenses don't contribute to monthly total
      } else if (spending.frequency_type === "monthly") {
        return sum + spending.amount;
      } else if (spending.frequency_type === "custom" && spending.frequency_interval && spending.frequency_unit) {
        // Convert custom frequency to monthly equivalent
        const interval = spending.frequency_interval;
        switch (spending.frequency_unit) {
          case "day":
            return sum + (spending.amount * 30 / interval);
          case "week":
            return sum + (spending.amount * 4.33 / interval);
          case "month":
            return sum + (spending.amount / interval);
          case "year":
            return sum + (spending.amount / (interval * 12));
          default:
            return sum;
        }
      }
      return sum;
    }, 0) || 0;
  };

  return {
    spendings: spendingsQuery.data || [],
    isLoading: spendingsQuery.isLoading,
    error: spendingsQuery.error,
    monthlyTotal: getMonthlyTotal(),
    createSpending,
    updateSpending,
    deleteSpending,
  };
}
