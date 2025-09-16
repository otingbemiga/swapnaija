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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          action: string
          created_at: string | null
          id: string
          item_id: string | null
          review_reason: string | null
          swap_id: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          item_id?: string | null
          review_reason?: string | null
          swap_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          item_id?: string | null
          review_reason?: string | null
          swap_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_swap_id_fkey"
            columns: ["swap_id"]
            isOneToOne: false
            referencedRelation: "swap_offers"
            referencedColumns: ["id"]
          },
        ]
      }
      admins: {
        Row: {
          created_at: string | null
          email: string
          id: string
        }
        Insert: {
          created_at?: string | null
          email: string
          id: string
        }
        Update: {
          created_at?: string | null
          email?: string
          id?: string
        }
        Relationships: []
      }
      items: {
        Row: {
          address: string
          cash_balance: number | null
          category: string
          condition: string
          created_at: string | null
          description: string
          desired_swap: string | null
          estimated_value: number
          id: string
          image_paths: string[]
          lga: string
          phone: string
          points: number | null
          review_reason: string | null
          state: string
          status: string
          title: string
          user_id: string | null
          video_path: string | null
        }
        Insert: {
          address: string
          cash_balance?: number | null
          category: string
          condition: string
          created_at?: string | null
          description: string
          desired_swap?: string | null
          estimated_value?: number
          id?: string
          image_paths: string[]
          lga: string
          phone: string
          points?: number | null
          review_reason?: string | null
          state: string
          status?: string
          title: string
          user_id?: string | null
          video_path?: string | null
        }
        Update: {
          address?: string
          cash_balance?: number | null
          category?: string
          condition?: string
          created_at?: string | null
          description?: string
          desired_swap?: string | null
          estimated_value?: number
          id?: string
          image_paths?: string[]
          lga?: string
          phone?: string
          points?: number | null
          review_reason?: string | null
          state?: string
          status?: string
          title?: string
          user_id?: string | null
          video_path?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_items_profiles"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_items_profiles"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_points_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string | null
          created_at: string | null
          from_user: string | null
          id: string
          image_url: string | null
          item_id: string | null
          read_at: string | null
          to_user: string | null
        }
        Insert: {
          content?: string | null
          created_at?: string | null
          from_user?: string | null
          id?: string
          image_url?: string | null
          item_id?: string | null
          read_at?: string | null
          to_user?: string | null
        }
        Update: {
          content?: string | null
          created_at?: string | null
          from_user?: string | null
          id?: string
          image_url?: string | null
          item_id?: string | null
          read_at?: string | null
          to_user?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          item_id: string | null
          message: string
          recipient_id: string | null
          sender_email: string | null
          sender_id: string | null
          status: string | null
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id?: string | null
          message: string
          recipient_id?: string | null
          sender_email?: string | null
          sender_id?: string | null
          status?: string | null
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string | null
          message?: string
          recipient_id?: string | null
          sender_email?: string | null
          sender_id?: string | null
          status?: string | null
          type?: string
        }
        Relationships: []
      }
      notifications_backup: {
        Row: {
          created_at: string | null
          id: string | null
          item_id: string | null
          message: string | null
          recipient: string | null
          recipient_id: string | null
          sender_email: string | null
          status: string | null
          type: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string | null
          item_id?: string | null
          message?: string | null
          recipient?: string | null
          recipient_id?: string | null
          sender_email?: string | null
          status?: string | null
          type?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string | null
          item_id?: string | null
          message?: string | null
          recipient?: string | null
          recipient_id?: string | null
          sender_email?: string | null
          status?: string | null
          type?: string | null
        }
        Relationships: []
      }
      offers: {
        Row: {
          created_at: string | null
          id: string
          item_id: string | null
          message: string
          sender_id: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id?: string | null
          message: string
          sender_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string | null
          message?: string
          sender_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "offers_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "offers_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      phone_verification: {
        Row: {
          code: string
          expires_at: string
          phone: string
          user_id: string | null
        }
        Insert: {
          code: string
          expires_at: string
          phone: string
          user_id?: string | null
        }
        Update: {
          code?: string
          expires_at?: string
          phone?: string
          user_id?: string | null
        }
        Relationships: []
      }
      point_values: {
        Row: {
          base_unit: string
          category: string
          created_at: string | null
          id: string
          item_name: string
          points: number
        }
        Insert: {
          base_unit: string
          category: string
          created_at?: string | null
          id?: string
          item_name: string
          points: number
        }
        Update: {
          base_unit?: string
          category?: string
          created_at?: string | null
          id?: string
          item_name?: string
          points?: number
        }
        Relationships: []
      }
      points_history: {
        Row: {
          created_at: string | null
          id: string
          points: number
          reason: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          points: number
          reason: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          points?: number
          reason?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "points_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "points_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_points_summary"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          created_at: string | null
          full_name: string | null
          id: string
          lga: string | null
          phone: string | null
          points: number
          state: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id: string
          lga?: string | null
          phone?: string | null
          points?: number
          state?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          created_at?: string | null
          full_name?: string | null
          id?: string
          lga?: string | null
          phone?: string | null
          points?: number
          state?: string | null
        }
        Relationships: []
      }
      swap_offers: {
        Row: {
          admin_reviewed: boolean | null
          cash_adjustment: number | null
          cash_balance: number | null
          created_at: string | null
          final_value: number | null
          from_user: string | null
          id: string
          item_id: string | null
          item_offered: string | null
          item_requested: string | null
          offer_message: string | null
          offered_total_value: number
          requested_total_value: number
          status: string | null
          suggested_cash_topup: number | null
          to_user: string | null
          updated_at: string | null
        }
        Insert: {
          admin_reviewed?: boolean | null
          cash_adjustment?: number | null
          cash_balance?: number | null
          created_at?: string | null
          final_value?: number | null
          from_user?: string | null
          id?: string
          item_id?: string | null
          item_offered?: string | null
          item_requested?: string | null
          offer_message?: string | null
          offered_total_value?: number
          requested_total_value?: number
          status?: string | null
          suggested_cash_topup?: number | null
          to_user?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_reviewed?: boolean | null
          cash_adjustment?: number | null
          cash_balance?: number | null
          created_at?: string | null
          final_value?: number | null
          from_user?: string | null
          id?: string
          item_id?: string | null
          item_offered?: string | null
          item_requested?: string | null
          offer_message?: string | null
          offered_total_value?: number
          requested_total_value?: number
          status?: string | null
          suggested_cash_topup?: number | null
          to_user?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "swap_offers_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swap_offers_item_offered_fkey"
            columns: ["item_offered"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swap_offers_item_requested_fkey"
            columns: ["item_requested"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      swaps: {
        Row: {
          created_at: string | null
          id: string
          item_id: string
          offered_item_id: string | null
          owner_id: string
          requester_id: string
          status: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          item_id: string
          offered_item_id?: string | null
          owner_id: string
          requester_id: string
          status?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          item_id?: string
          offered_item_id?: string | null
          owner_id?: string
          requester_id?: string
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_offered_item"
            columns: ["offered_item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swaps_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "swaps_offered_item_id_fkey"
            columns: ["offered_item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          from_user_id: string | null
          id: string
          offered_item_id: string | null
          status: string | null
          swap_offer_id: string | null
          swapped_at: string | null
          target_item_id: string | null
          to_user_id: string | null
        }
        Insert: {
          from_user_id?: string | null
          id?: string
          offered_item_id?: string | null
          status?: string | null
          swap_offer_id?: string | null
          swapped_at?: string | null
          target_item_id?: string | null
          to_user_id?: string | null
        }
        Update: {
          from_user_id?: string | null
          id?: string
          offered_item_id?: string | null
          status?: string | null
          swap_offer_id?: string | null
          swapped_at?: string | null
          target_item_id?: string | null
          to_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_offered_item_id_fkey"
            columns: ["offered_item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_swap_offer_id_fkey"
            columns: ["swap_offer_id"]
            isOneToOne: false
            referencedRelation: "swap_offers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_target_item_id_fkey"
            columns: ["target_item_id"]
            isOneToOne: false
            referencedRelation: "items"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          address: string
          created_at: string | null
          email: string
          fullname: string
          id: string
          lga: string
          phone: string
          photo_url: string | null
          role: string | null
          state: string
        }
        Insert: {
          address: string
          created_at?: string | null
          email: string
          fullname: string
          id?: string
          lga: string
          phone: string
          photo_url?: string | null
          role?: string | null
          state: string
        }
        Update: {
          address?: string
          created_at?: string | null
          email?: string
          fullname?: string
          id?: string
          lga?: string
          phone?: string
          photo_url?: string | null
          role?: string | null
          state?: string
        }
        Relationships: []
      }
    }
    Views: {
      user_points_summary: {
        Row: {
          change_points: number | null
          change_time: string | null
          full_name: string | null
          points: number | null
          reason: string | null
          user_id: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      fuzzy_item_matches: {
        Args: { search_term: string; user_id_param: string }
        Returns: {
          category: string
          condition: string
          created_at: string
          description: string
          desired_swap: string
          id: string
          image_paths: string[]
          lga: string
          points: number
          similarity_score: number
          state: string
          status: string
          title: string
          user_id: string
          video_path: string
        }[]
      }
      get_admin_notifications: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string | null
          id: string
          item_id: string | null
          message: string
          recipient_id: string | null
          sender_email: string | null
          sender_id: string | null
          status: string | null
          type: string
        }[]
      }
      get_admin_notifications_v1: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          id: string
          item_id: string
          message: string
          recipient_id: string
          sender_email: string
          status: string
          type: string
        }[]
      }
      get_user_notifications: {
        Args: { user_id: string }
        Returns: {
          created_at: string | null
          id: string
          item_id: string | null
          message: string
          recipient_id: string | null
          sender_email: string | null
          sender_id: string | null
          status: string | null
          type: string
        }[]
      }
      get_user_notifications_v1: {
        Args: { user_id: string }
        Returns: {
          created_at: string
          id: string
          item_id: string
          message: string
          recipient_id: string
          sender_email: string
          status: string
          type: string
        }[]
      }
      get_user_offers: {
        Args: { uid: string }
        Returns: {
          content: string
          created_at: string
          from_user: string
          id: string
          item_description: string
          item_id: string
          item_image_paths: string[]
          item_lga: string
          item_points: number
          item_state: string
          item_title: string
          to_user: string
        }[]
      }
      gtrgm_compress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_decompress: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_in: {
        Args: { "": unknown }
        Returns: unknown
      }
      gtrgm_options: {
        Args: { "": unknown }
        Returns: undefined
      }
      gtrgm_out: {
        Args: { "": unknown }
        Returns: unknown
      }
      increment_points: {
        Args: { points: number; user_id: string }
        Returns: undefined
      }
      increment_user_points: {
        Args: { amount: number; user_id: string }
        Returns: undefined
      }
      notify_admins: {
        Args: { p_item_id?: string; p_message: string; p_type: string }
        Returns: undefined
      }
      reject_item_transaction: {
        Args: {
          p_admin_id: string
          p_item_id: string
          p_points: number
          p_reason: string
          p_user_id: string
        }
        Returns: undefined
      }
      set_limit: {
        Args: { "": number }
        Returns: number
      }
      show_limit: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      show_trgm: {
        Args: { "": string }
        Returns: string[]
      }
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
