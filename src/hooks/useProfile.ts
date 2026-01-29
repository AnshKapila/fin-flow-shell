import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export interface Profile {
  id: string;
  user_id: string;
  username: string | null;
  phone_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface ProfileUpdate {
  username?: string | null;
  phone_number?: string | null;
}

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch user profile
  const fetchProfile = useCallback(async () => {
    if (!user) {
      setProfile(null);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Update or create profile
  const updateProfile = async (updates: ProfileUpdate): Promise<boolean> => {
    if (!user) return false;

    try {
      setIsSaving(true);

      if (profile) {
        // Update existing profile
        const { data, error } = await supabase
          .from("profiles")
          .update(updates)
          .eq("user_id", user.id)
          .select()
          .single();

        if (error) throw error;
        setProfile(data);
      } else {
        // Create new profile
        const { data, error } = await supabase
          .from("profiles")
          .insert({
            user_id: user.id,
            ...updates,
          })
          .select()
          .single();

        if (error) throw error;
        setProfile(data);
      }

      toast({
        title: "Profile updated",
        description: "Your changes have been saved.",
      });
      return true;
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Error",
        description: "Failed to save profile. Please try again.",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // Get display name with priority: username > auth display name > email prefix
  const getDisplayName = useCallback((): string => {
    // Priority 1: Username from profile
    if (profile?.username?.trim()) {
      return profile.username.trim();
    }

    // Priority 2: Auth display name / full name
    const fullName = user?.user_metadata?.full_name || user?.user_metadata?.name;
    if (fullName) return fullName;

    const displayName = user?.user_metadata?.display_name;
    if (displayName) return displayName;

    // Priority 3: Email prefix
    if (user?.email) {
      return user.email.split("@")[0];
    }

    return "User";
  }, [profile, user]);

  return {
    profile,
    isLoading,
    isSaving,
    updateProfile,
    getDisplayName,
    refetch: fetchProfile,
  };
}
