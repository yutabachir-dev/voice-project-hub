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
      categories: {
        Row: {
          created_at: string
          description: string
          examples: string[]
          id: string
          image_url: string | null
          is_active: boolean
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string
          examples?: string[]
          id?: string
          image_url?: string | null
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          examples?: string[]
          id?: string
          image_url?: string | null
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      category_styles: {
        Row: {
          category_id: string
          style_id: string
        }
        Insert: {
          category_id: string
          style_id: string
        }
        Update: {
          category_id?: string
          style_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "category_styles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "category_styles_style_id_fkey"
            columns: ["style_id"]
            isOneToOne: false
            referencedRelation: "styles"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          company: string | null
          created_at: string
          email: string
          first_name: string
          id: string
          job_title: string | null
          last_name: string
          phone: string
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          email: string
          first_name: string
          id?: string
          job_title?: string | null
          last_name: string
          phone?: string
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          email?: string
          first_name?: string
          id?: string
          job_title?: string | null
          last_name?: string
          phone?: string
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          admin_notes: string | null
          artist_id: string | null
          category_id: string | null
          client_id: string | null
          created_at: string
          id: string
          order_number: string
          project_description: string
          script: string
          script_source: string
          status: Database["public"]["Enums"]["order_status"]
          style_ids: string[]
          style_names: string[]
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          artist_id?: string | null
          category_id?: string | null
          client_id?: string | null
          created_at?: string
          id?: string
          order_number?: string
          project_description?: string
          script?: string
          script_source?: string
          status?: Database["public"]["Enums"]["order_status"]
          style_ids?: string[]
          style_names?: string[]
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          artist_id?: string | null
          category_id?: string | null
          client_id?: string | null
          created_at?: string
          id?: string
          order_number?: string
          project_description?: string
          script?: string
          script_source?: string
          status?: Database["public"]["Enums"]["order_status"]
          style_ids?: string[]
          style_names?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "voice_over_artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      styles: {
        Row: {
          audio_url: string | null
          created_at: string
          description: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
        }
        Insert: {
          audio_url?: string | null
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          audio_url?: string | null
          created_at?: string
          description?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      voice_over_artists: {
        Row: {
          audio_samples: string[]
          created_at: string
          description: string
          gender: string
          id: string
          is_active: boolean
          languages: string[]
          name: string
          photo_url: string | null
          updated_at: string
          video_url: string | null
        }
        Insert: {
          audio_samples?: string[]
          created_at?: string
          description?: string
          gender?: string
          id?: string
          is_active?: boolean
          languages?: string[]
          name: string
          photo_url?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Update: {
          audio_samples?: string[]
          created_at?: string
          description?: string
          gender?: string
          id?: string
          is_active?: boolean
          languages?: string[]
          name?: string
          photo_url?: string | null
          updated_at?: string
          video_url?: string | null
        }
        Relationships: []
      }
      voice_over_categories: {
        Row: {
          artist_id: string
          category_id: string
        }
        Insert: {
          artist_id: string
          category_id: string
        }
        Update: {
          artist_id?: string
          category_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voice_over_categories_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "voice_over_artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_over_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_over_styles: {
        Row: {
          artist_id: string
          style_id: string
        }
        Insert: {
          artist_id: string
          style_id: string
        }
        Update: {
          artist_id?: string
          style_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voice_over_styles_artist_id_fkey"
            columns: ["artist_id"]
            isOneToOne: false
            referencedRelation: "voice_over_artists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voice_over_styles_style_id_fkey"
            columns: ["style_id"]
            isOneToOne: false
            referencedRelation: "styles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
      order_status:
        | "nouvelle"
        | "confirmee"
        | "en_cours"
        | "terminee"
        | "annulee"
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
      app_role: ["admin", "user"],
      order_status: [
        "nouvelle",
        "confirmee",
        "en_cours",
        "terminee",
        "annulee",
      ],
    },
  },
} as const
