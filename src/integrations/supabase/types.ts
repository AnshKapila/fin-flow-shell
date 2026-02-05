export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      goals: {
        Row: {
          created_at: string
          current_amount: number
          deadline: string | null
          id: string
          name: string
          target_amount: number
          user_id: string
        }
        Insert: {
          created_at?: string
          current_amount?: number
          deadline?: string | null
          id?: string
          name: string
          target_amount?: number
          user_id: string
        }
        Update: {
          created_at?: string
          current_amount?: number
          deadline?: string | null
          id?: string
          name?: string
          target_amount?: number
          user_id?: string
        }
        Relationships: []
      }
      investments: {
        Row: {
          account_number: string | null
          added_date: string | null
          bank: string | null
          category: string | null
          created_at: string
          current_value: number
          gold_type: string | null
          id: string
          interest_rate: number | null
          invested_value: number
          is_closed: boolean | null
          is_sip_enabled: boolean | null
          maturity_date: string | null
          maturity_value: number | null
          name: string
          nav_date: string | null
          nav_value: number | null
          notes: string | null
          purchase_price_per_unit: number | null
          risk_level: string | null
          scheme_code: string | null
          sip_amount: number | null
          sip_day_of_month: number | null
          sip_start_date: string | null
          start_date: string | null
          tenure_unit: string | null
          tenure_value: number | null
          type: string
          units_owned: number | null
          updated_at: string
          user_id: string
          weight_in_grams: number | null
        }
        Insert: {
          account_number?: string | null
          added_date?: string | null
          bank?: string | null
          category?: string | null
          created_at?: string
          current_value?: number
          gold_type?: string | null
          id?: string
          interest_rate?: number | null
          invested_value?: number
          is_closed?: boolean | null
          is_sip_enabled?: boolean | null
          maturity_date?: string | null
          maturity_value?: number | null
          name: string
          nav_date?: string | null
          nav_value?: number | null
          notes?: string | null
          purchase_price_per_unit?: number | null
          risk_level?: string | null
          scheme_code?: string | null
          sip_amount?: number | null
          sip_day_of_month?: number | null
          sip_start_date?: string | null
          start_date?: string | null
          tenure_unit?: string | null
          tenure_value?: number | null
          type: string
          units_owned?: number | null
          updated_at?: string
          user_id: string
          weight_in_grams?: number | null
        }
        Update: {
          account_number?: string | null
          added_date?: string | null
          bank?: string | null
          category?: string | null
          created_at?: string
          current_value?: number
          gold_type?: string | null
          id?: string
          interest_rate?: number | null
          invested_value?: number
          is_closed?: boolean | null
          is_sip_enabled?: boolean | null
          maturity_date?: string | null
          maturity_value?: number | null
          name?: string
          nav_date?: string | null
          nav_value?: number | null
          notes?: string | null
          purchase_price_per_unit?: number | null
          risk_level?: string | null
          scheme_code?: string | null
          sip_amount?: number | null
          sip_day_of_month?: number | null
          sip_start_date?: string | null
          start_date?: string | null
          tenure_unit?: string | null
          tenure_value?: number | null
          type?: string
          units_owned?: number | null
          updated_at?: string
          user_id?: string
          weight_in_grams?: number | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          related_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          related_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          related_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          phone_number: string | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          phone_number?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          phone_number?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      spendings: {
        Row: {
          amount: number
          created_at: string
          frequency_interval: number | null
          frequency_type: string
          frequency_unit: string | null
          icon: string | null
          icon_bg: string | null
          id: string
          name: string
          start_date: string | null
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          frequency_interval?: number | null
          frequency_type?: string
          frequency_unit?: string | null
          icon?: string | null
          icon_bg?: string | null
          id?: string
          name: string
          start_date?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          frequency_interval?: number | null
          frequency_type?: string
          frequency_unit?: string | null
          icon?: string | null
          icon_bg?: string | null
          id?: string
          name?: string
          start_date?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
