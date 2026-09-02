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
      agenda_item_optouts: {
        Row: {
          agenda_item_id: string
          created_at: string
          id: string
          note: string | null
          trip_id: string
          user_id: string
        }
        Insert: {
          agenda_item_id: string
          created_at?: string
          id?: string
          note?: string | null
          trip_id: string
          user_id: string
        }
        Update: {
          agenda_item_id?: string
          created_at?: string
          id?: string
          note?: string | null
          trip_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agenda_item_optouts_agenda_item_id_fkey"
            columns: ["agenda_item_id"]
            isOneToOne: false
            referencedRelation: "agenda_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agenda_item_optouts_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      agenda_items: {
        Row: {
          address: string | null
          booking_provider: string | null
          booking_url: string | null
          cancellation_deadline: string | null
          cancellation_notes: string | null
          cancellation_policy: string | null
          category: string
          city: string | null
          completed: boolean
          confirmation_number: string | null
          contact_company: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          contact_website: string | null
          cost_actual: number | null
          cost_estimated: number | null
          country: string | null
          created_at: string
          currency: string | null
          day_date: string | null
          description: string | null
          details: Json
          end_time: string | null
          id: string
          image_url: string | null
          latitude: number | null
          location_name: string | null
          longitude: number | null
          map_url: string | null
          notes: string | null
          paid: boolean
          paid_by: string | null
          participants: string[]
          personal_for: string | null
          refundable: boolean | null
          reservation_email: string | null
          reservation_name: string | null
          reservation_phone: string | null
          saved_place_id: string | null
          shared_expense: boolean
          sort_order: number
          split_between: string[]
          start_time: string | null
          status: string
          time_zone: string | null
          title: string
          transport_cost: number | null
          transport_departure_time: string | null
          transport_duration_minutes: number | null
          transport_from: string | null
          transport_mode: string | null
          transport_to: string | null
          travel_next_minutes: number | null
          travel_next_mode: string | null
          travel_next_note: string | null
          trip_id: string
        }
        Insert: {
          address?: string | null
          booking_provider?: string | null
          booking_url?: string | null
          cancellation_deadline?: string | null
          cancellation_notes?: string | null
          cancellation_policy?: string | null
          category?: string
          city?: string | null
          completed?: boolean
          confirmation_number?: string | null
          contact_company?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contact_website?: string | null
          cost_actual?: number | null
          cost_estimated?: number | null
          country?: string | null
          created_at?: string
          currency?: string | null
          day_date?: string | null
          description?: string | null
          details?: Json
          end_time?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          map_url?: string | null
          notes?: string | null
          paid?: boolean
          paid_by?: string | null
          participants?: string[]
          personal_for?: string | null
          refundable?: boolean | null
          reservation_email?: string | null
          reservation_name?: string | null
          reservation_phone?: string | null
          saved_place_id?: string | null
          shared_expense?: boolean
          sort_order?: number
          split_between?: string[]
          start_time?: string | null
          status?: string
          time_zone?: string | null
          title: string
          transport_cost?: number | null
          transport_departure_time?: string | null
          transport_duration_minutes?: number | null
          transport_from?: string | null
          transport_mode?: string | null
          transport_to?: string | null
          travel_next_minutes?: number | null
          travel_next_mode?: string | null
          travel_next_note?: string | null
          trip_id: string
        }
        Update: {
          address?: string | null
          booking_provider?: string | null
          booking_url?: string | null
          cancellation_deadline?: string | null
          cancellation_notes?: string | null
          cancellation_policy?: string | null
          category?: string
          city?: string | null
          completed?: boolean
          confirmation_number?: string | null
          contact_company?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          contact_website?: string | null
          cost_actual?: number | null
          cost_estimated?: number | null
          country?: string | null
          created_at?: string
          currency?: string | null
          day_date?: string | null
          description?: string | null
          details?: Json
          end_time?: string | null
          id?: string
          image_url?: string | null
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          map_url?: string | null
          notes?: string | null
          paid?: boolean
          paid_by?: string | null
          participants?: string[]
          personal_for?: string | null
          refundable?: boolean | null
          reservation_email?: string | null
          reservation_name?: string | null
          reservation_phone?: string | null
          saved_place_id?: string | null
          shared_expense?: boolean
          sort_order?: number
          split_between?: string[]
          start_time?: string | null
          status?: string
          time_zone?: string | null
          title?: string
          transport_cost?: number | null
          transport_departure_time?: string | null
          transport_duration_minutes?: number | null
          transport_from?: string | null
          transport_mode?: string | null
          transport_to?: string | null
          travel_next_minutes?: number | null
          travel_next_mode?: string | null
          travel_next_note?: string | null
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agenda_items_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_items: {
        Row: {
          assigned_to: string | null
          completed: boolean
          created_at: string
          due_date: string | null
          id: string
          notes: string | null
          section: string
          sort_order: number
          title: string
          trip_id: string
        }
        Insert: {
          assigned_to?: string | null
          completed?: boolean
          created_at?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          section?: string
          sort_order?: number
          title: string
          trip_id: string
        }
        Update: {
          assigned_to?: string | null
          completed?: boolean
          created_at?: string
          due_date?: string | null
          id?: string
          notes?: string | null
          section?: string
          sort_order?: number
          title?: string
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "checklist_items_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      comments: {
        Row: {
          agenda_item_id: string | null
          author_id: string | null
          author_name: string
          body: string
          created_at: string
          id: string
          trip_id: string
        }
        Insert: {
          agenda_item_id?: string | null
          author_id?: string | null
          author_name: string
          body: string
          created_at?: string
          id?: string
          trip_id: string
        }
        Update: {
          agenda_item_id?: string | null
          author_id?: string | null
          author_name?: string
          body?: string
          created_at?: string
          id?: string
          trip_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_agenda_item_id_fkey"
            columns: ["agenda_item_id"]
            isOneToOne: false
            referencedRelation: "agenda_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "comments_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      documents: {
        Row: {
          agenda_item_id: string | null
          category: string
          created_at: string
          external_url: string | null
          file_path: string | null
          id: string
          mime_type: string | null
          name: string
          trip_id: string
          uploaded_by: string | null
        }
        Insert: {
          agenda_item_id?: string | null
          category?: string
          created_at?: string
          external_url?: string | null
          file_path?: string | null
          id?: string
          mime_type?: string | null
          name: string
          trip_id: string
          uploaded_by?: string | null
        }
        Update: {
          agenda_item_id?: string | null
          category?: string
          created_at?: string
          external_url?: string | null
          file_path?: string | null
          id?: string
          mime_type?: string | null
          name?: string
          trip_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_agenda_item_id_fkey"
            columns: ["agenda_item_id"]
            isOneToOne: false
            referencedRelation: "agenda_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      item_links: {
        Row: {
          agenda_item_id: string | null
          created_at: string
          id: string
          label: string
          trip_id: string
          url: string
        }
        Insert: {
          agenda_item_id?: string | null
          created_at?: string
          id?: string
          label?: string
          trip_id: string
          url: string
        }
        Update: {
          agenda_item_id?: string | null
          created_at?: string
          id?: string
          label?: string
          trip_id?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "item_links_agenda_item_id_fkey"
            columns: ["agenda_item_id"]
            isOneToOne: false
            referencedRelation: "agenda_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "item_links_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          emergency_contact: string | null
          frequent_flyer: string | null
          full_name: string | null
          home_airport: string | null
          hotel_loyalty: string | null
          id: string
          known_traveler_number: string | null
          phone: string | null
          preferred_name: string | null
          rental_car_programs: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          emergency_contact?: string | null
          frequent_flyer?: string | null
          full_name?: string | null
          home_airport?: string | null
          hotel_loyalty?: string | null
          id: string
          known_traveler_number?: string | null
          phone?: string | null
          preferred_name?: string | null
          rental_car_programs?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          emergency_contact?: string | null
          frequent_flyer?: string | null
          full_name?: string | null
          home_airport?: string | null
          hotel_loyalty?: string | null
          id?: string
          known_traveler_number?: string | null
          phone?: string | null
          preferred_name?: string | null
          rental_car_programs?: string | null
        }
        Relationships: []
      }
      saved_places: {
        Row: {
          address: string | null
          category: string
          city: string | null
          created_at: string
          destination: string | null
          estimated_cost: number | null
          id: string
          image_url: string | null
          location_name: string | null
          name: string
          notes: string | null
          priority: string
          scheduled: boolean
          tags: string[]
          trip_id: string
          url: string | null
        }
        Insert: {
          address?: string | null
          category?: string
          city?: string | null
          created_at?: string
          destination?: string | null
          estimated_cost?: number | null
          id?: string
          image_url?: string | null
          location_name?: string | null
          name: string
          notes?: string | null
          priority?: string
          scheduled?: boolean
          tags?: string[]
          trip_id: string
          url?: string | null
        }
        Update: {
          address?: string | null
          category?: string
          city?: string | null
          created_at?: string
          destination?: string | null
          estimated_cost?: number | null
          id?: string
          image_url?: string | null
          location_name?: string | null
          name?: string
          notes?: string | null
          priority?: string
          scheduled?: boolean
          tags?: string[]
          trip_id?: string
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saved_places_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trip_travelers: {
        Row: {
          color: string
          created_at: string
          email: string | null
          id: string
          name: string
          role: string
          trip_id: string
          user_id: string | null
        }
        Insert: {
          color?: string
          created_at?: string
          email?: string | null
          id?: string
          name: string
          role?: string
          trip_id: string
          user_id?: string | null
        }
        Update: {
          color?: string
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          role?: string
          trip_id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trip_travelers_trip_id_fkey"
            columns: ["trip_id"]
            isOneToOne: false
            referencedRelation: "trips"
            referencedColumns: ["id"]
          },
        ]
      }
      trips: {
        Row: {
          additional_destinations: string[]
          archived: boolean
          budget_total: number | null
          cover_image_url: string | null
          created_at: string
          currency: string
          end_date: string | null
          id: string
          is_template: boolean
          name: string
          notes: string | null
          origin_city: string | null
          owner_id: string
          primary_destination: string | null
          start_date: string | null
          status: string
          trip_type: string
        }
        Insert: {
          additional_destinations?: string[]
          archived?: boolean
          budget_total?: number | null
          cover_image_url?: string | null
          created_at?: string
          currency?: string
          end_date?: string | null
          id?: string
          is_template?: boolean
          name: string
          notes?: string | null
          origin_city?: string | null
          owner_id: string
          primary_destination?: string | null
          start_date?: string | null
          status?: string
          trip_type?: string
        }
        Update: {
          additional_destinations?: string[]
          archived?: boolean
          budget_total?: number | null
          cover_image_url?: string | null
          created_at?: string
          currency?: string
          end_date?: string | null
          id?: string
          is_template?: boolean
          name?: string
          notes?: string | null
          origin_city?: string | null
          owner_id?: string
          primary_destination?: string | null
          start_date?: string | null
          status?: string
          trip_type?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_trip_member: { Args: { _trip_id: string }; Returns: boolean }
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
