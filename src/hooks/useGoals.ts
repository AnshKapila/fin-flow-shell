import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export interface Goal {
  id: string;
  user_id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  deadline: string | null;
  created_at: string;
}

export interface CreateGoalInput {
  name: string;
  target_amount: number;
  current_amount?: number;
  deadline?: string | null;
}

export interface UpdateGoalInput {
  id: string;
  name?: string;
  target_amount?: number;
  current_amount?: number;
  deadline?: string | null;
}

export function useGoals() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const goalsQuery = useQuery({
    queryKey: ["goals", user?.id],
    queryFn: async (): Promise<Goal[]> => {
      if (!user) return [];
      
      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) {
        toast({
          variant: "destructive",
          title: "Failed to fetch goals",
          description: error.message,
        });
        throw error;
      }

      return data || [];
    },
    enabled: !!user,
  });

  const createGoal = useMutation({
    mutationFn: async (input: CreateGoalInput) => {
      if (!user) throw new Error("Not authenticated");

      const { data, error } = await supabase
        .from("goals")
        .insert({
          user_id: user.id,
          name: input.name,
          target_amount: input.target_amount,
          current_amount: input.current_amount || 0,
          deadline: input.deadline || null,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast({
        title: "Goal created",
        description: "Your new goal has been added.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to create goal",
        description: error.message,
      });
    },
  });

  const updateGoal = useMutation({
    mutationFn: async (input: UpdateGoalInput) => {
      const { id, ...updates } = input;

      const { data, error } = await supabase
        .from("goals")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast({
        title: "Goal updated",
        description: "Your goal has been updated.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to update goal",
        description: error.message,
      });
    },
  });

  const deleteGoal = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("goals")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["goals"] });
      toast({
        title: "Goal deleted",
        description: "Your goal has been removed.",
      });
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Failed to delete goal",
        description: error.message,
      });
    },
  });

  return {
    goals: goalsQuery.data || [],
    isLoading: goalsQuery.isLoading,
    error: goalsQuery.error,
    createGoal,
    updateGoal,
    deleteGoal,
  };
}

export function useGoal(id: string | undefined) {
  const { user } = useAuth();
  const { toast } = useToast();

  return useQuery({
    queryKey: ["goals", id],
    queryFn: async (): Promise<Goal | null> => {
      if (!user || !id) return null;

      const { data, error } = await supabase
        .from("goals")
        .select("*")
        .eq("id", id)
        .maybeSingle();

      if (error) {
        toast({
          variant: "destructive",
          title: "Failed to fetch goal",
          description: error.message,
        });
        throw error;
      }

      return data;
    },
    enabled: !!user && !!id,
  });
}
