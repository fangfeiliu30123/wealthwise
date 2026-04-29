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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      account_balances: {
        Row: {
          available_balance: number | null
          connected_account_id: string
          created_at: string
          currency: string | null
          current_balance: number | null
          id: string
          name: string
          plaid_account_id: string
          subtype: string | null
          type: string
          updated_at: string
        }
        Insert: {
          available_balance?: number | null
          connected_account_id: string
          created_at?: string
          currency?: string | null
          current_balance?: number | null
          id?: string
          name: string
          plaid_account_id: string
          subtype?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          available_balance?: number | null
          connected_account_id?: string
          created_at?: string
          currency?: string | null
          current_balance?: number | null
          id?: string
          name?: string
          plaid_account_id?: string
          subtype?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "account_balances_connected_account_id_fkey"
            columns: ["connected_account_id"]
            isOneToOne: false
            referencedRelation: "connected_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      account_holdings: {
        Row: {
          account_balance_id: string
          created_at: string
          current_price: number | null
          id: string
          quantity: number | null
          security_name: string | null
          ticker: string | null
          type: string | null
          value: number | null
        }
        Insert: {
          account_balance_id: string
          created_at?: string
          current_price?: number | null
          id?: string
          quantity?: number | null
          security_name?: string | null
          ticker?: string | null
          type?: string | null
          value?: number | null
        }
        Update: {
          account_balance_id?: string
          created_at?: string
          current_price?: number | null
          id?: string
          quantity?: number | null
          security_name?: string | null
          ticker?: string | null
          type?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "account_holdings_account_balance_id_fkey"
            columns: ["account_balance_id"]
            isOneToOne: false
            referencedRelation: "account_balances"
            referencedColumns: ["id"]
          },
        ]
      }
      account_transactions: {
        Row: {
          account_balance_id: string
          amount: number
          category: string | null
          created_at: string
          date: string
          id: string
          merchant_name: string | null
          name: string
          plaid_transaction_id: string | null
        }
        Insert: {
          account_balance_id: string
          amount: number
          category?: string | null
          created_at?: string
          date: string
          id?: string
          merchant_name?: string | null
          name: string
          plaid_transaction_id?: string | null
        }
        Update: {
          account_balance_id?: string
          amount?: number
          category?: string | null
          created_at?: string
          date?: string
          id?: string
          merchant_name?: string | null
          name?: string
          plaid_transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "account_transactions_account_balance_id_fkey"
            columns: ["account_balance_id"]
            isOneToOne: false
            referencedRelation: "account_balances"
            referencedColumns: ["id"]
          },
        ]
      }
      connected_accounts: {
        Row: {
          created_at: string
          id: string
          institution_id: string | null
          institution_name: string | null
          plaid_access_token: string
          plaid_item_id: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          institution_id?: string | null
          institution_name?: string | null
          plaid_access_token: string
          plaid_item_id: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          institution_id?: string | null
          institution_name?: string | null
          plaid_access_token?: string
          plaid_item_id?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      metro_housing_data: {
        Row: {
          census_median_gross_rent: number | null
          census_median_home_value: number | null
          census_year: number | null
          created_at: string
          fetch_errors: Json | null
          fred_case_shiller_index: number | null
          fred_observation_date: string | null
          fred_series_id: string | null
          fred_yoy_appreciation: number | null
          hud_fmr_1br: number | null
          hud_fmr_2br: number | null
          hud_fmr_3br: number | null
          hud_fmr_4br: number | null
          hud_fmr_studio: number | null
          hud_year: number | null
          last_fetched_at: string
          metro_id: string
          sources: string[] | null
          updated_at: string
        }
        Insert: {
          census_median_gross_rent?: number | null
          census_median_home_value?: number | null
          census_year?: number | null
          created_at?: string
          fetch_errors?: Json | null
          fred_case_shiller_index?: number | null
          fred_observation_date?: string | null
          fred_series_id?: string | null
          fred_yoy_appreciation?: number | null
          hud_fmr_1br?: number | null
          hud_fmr_2br?: number | null
          hud_fmr_3br?: number | null
          hud_fmr_4br?: number | null
          hud_fmr_studio?: number | null
          hud_year?: number | null
          last_fetched_at?: string
          metro_id: string
          sources?: string[] | null
          updated_at?: string
        }
        Update: {
          census_median_gross_rent?: number | null
          census_median_home_value?: number | null
          census_year?: number | null
          created_at?: string
          fetch_errors?: Json | null
          fred_case_shiller_index?: number | null
          fred_observation_date?: string | null
          fred_series_id?: string | null
          fred_yoy_appreciation?: number | null
          hud_fmr_1br?: number | null
          hud_fmr_2br?: number | null
          hud_fmr_3br?: number | null
          hud_fmr_4br?: number | null
          hud_fmr_studio?: number | null
          hud_year?: number | null
          last_fetched_at?: string
          metro_id?: string
          sources?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          display_name: string | null
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          display_name?: string | null
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_actions: {
        Row: {
          category: Database["public"]["Enums"]["action_category"]
          completed_at: string | null
          created_at: string
          deadline: string | null
          description: string | null
          id: string
          position: number
          priority: string
          source_advice_id: string | null
          source_advice_snippet: string | null
          source_advice_title: string | null
          status: Database["public"]["Enums"]["action_status"]
          target_metric: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["action_category"]
          completed_at?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          position?: number
          priority?: string
          source_advice_id?: string | null
          source_advice_snippet?: string | null
          source_advice_title?: string | null
          status?: Database["public"]["Enums"]["action_status"]
          target_metric?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          category?: Database["public"]["Enums"]["action_category"]
          completed_at?: string | null
          created_at?: string
          deadline?: string | null
          description?: string | null
          id?: string
          position?: number
          priority?: string
          source_advice_id?: string | null
          source_advice_snippet?: string | null
          source_advice_title?: string | null
          status?: Database["public"]["Enums"]["action_status"]
          target_metric?: string | null
          title?: string
          updated_at?: string
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
      action_category:
        | "savings"
        | "investing"
        | "debt"
        | "retirement"
        | "tax"
        | "insurance"
        | "education"
        | "other"
      action_status: "todo" | "in_progress" | "done"
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
    Enums: {
      action_category: [
        "savings",
        "investing",
        "debt",
        "retirement",
        "tax",
        "insurance",
        "education",
        "other",
      ],
      action_status: ["todo", "in_progress", "done"],
    },
  },
} as const
