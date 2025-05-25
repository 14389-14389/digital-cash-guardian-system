export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      daily_commissions: {
        Row: {
          amount: number
          commission_date: string
          created_at: string
          day_number: number
          id: string
          investment_id: string
          user_id: string
        }
        Insert: {
          amount: number
          commission_date?: string
          created_at?: string
          day_number: number
          id?: string
          investment_id: string
          user_id: string
        }
        Update: {
          amount?: number
          commission_date?: string
          created_at?: string
          day_number?: number
          id?: string
          investment_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_commissions_investment_id_fkey"
            columns: ["investment_id"]
            isOneToOne: false
            referencedRelation: "investments"
            referencedColumns: ["id"]
          },
        ]
      }
      investments: {
        Row: {
          amount: number
          created_at: string
          daily_earning: number
          days_completed: number
          end_date: string
          id: string
          package_id: string
          start_date: string
          status: Database["public"]["Enums"]["investment_status"]
          total_earned: number
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          daily_earning: number
          days_completed?: number
          end_date: string
          id?: string
          package_id: string
          start_date?: string
          status?: Database["public"]["Enums"]["investment_status"]
          total_earned?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          daily_earning?: number
          days_completed?: number
          end_date?: string
          id?: string
          package_id?: string
          start_date?: string
          status?: Database["public"]["Enums"]["investment_status"]
          total_earned?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "investments_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "packages"
            referencedColumns: ["id"]
          },
        ]
      }
      packages: {
        Row: {
          created_at: string
          daily_earning: number
          duration_days: number
          features: Json
          id: string
          is_active: boolean
          name: string
          price: number
          type: Database["public"]["Enums"]["package_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          daily_earning: number
          duration_days?: number
          features?: Json
          id?: string
          is_active?: boolean
          name: string
          price: number
          type: Database["public"]["Enums"]["package_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          daily_earning?: number
          duration_days?: number
          features?: Json
          id?: string
          is_active?: boolean
          name?: string
          price?: number
          type?: Database["public"]["Enums"]["package_type"]
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
        }
        Relationships: []
      }
      referrals: {
        Row: {
          bonus_amount: number
          created_at: string
          id: string
          referral_code: string
          referred_id: string
          referrer_id: string
        }
        Insert: {
          bonus_amount?: number
          created_at?: string
          id?: string
          referral_code: string
          referred_id: string
          referrer_id: string
        }
        Update: {
          bonus_amount?: number
          created_at?: string
          id?: string
          referral_code?: string
          referred_id?: string
          referrer_id?: string
        }
        Relationships: []
      }
      withdrawals: {
        Row: {
          amount: number
          id: string
          notes: string | null
          phone: string
          processed_at: string | null
          processed_by: string | null
          requested_at: string
          status: Database["public"]["Enums"]["withdrawal_status"]
          user_id: string
        }
        Insert: {
          amount: number
          id?: string
          notes?: string | null
          phone: string
          processed_at?: string | null
          processed_by?: string | null
          requested_at?: string
          status?: Database["public"]["Enums"]["withdrawal_status"]
          user_id: string
        }
        Update: {
          amount?: number
          id?: string
          notes?: string | null
          phone?: string
          processed_at?: string | null
          processed_by?: string | null
          requested_at?: string
          status?: Database["public"]["Enums"]["withdrawal_status"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      process_daily_commissions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      investment_status: "active" | "completed" | "suspended"
      package_type: "starter" | "growth" | "premium" | "elite"
      user_role: "admin" | "client"
      withdrawal_status: "pending" | "approved" | "rejected" | "completed"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      investment_status: ["active", "completed", "suspended"],
      package_type: ["starter", "growth", "premium", "elite"],
      user_role: ["admin", "client"],
      withdrawal_status: ["pending", "approved", "rejected", "completed"],
    },
  },
} as const
