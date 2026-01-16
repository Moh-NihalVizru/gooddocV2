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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      appointment_types: {
        Row: {
          buffer: number
          created_at: string
          duration: number
          id: string
          is_active: boolean
          mode: Database["public"]["Enums"]["schedule_mode"] | null
          name: string
        }
        Insert: {
          buffer?: number
          created_at?: string
          duration?: number
          id?: string
          is_active?: boolean
          mode?: Database["public"]["Enums"]["schedule_mode"] | null
          name: string
        }
        Update: {
          buffer?: number
          created_at?: string
          duration?: number
          id?: string
          is_active?: boolean
          mode?: Database["public"]["Enums"]["schedule_mode"] | null
          name?: string
        }
        Relationships: []
      }
      appointments: {
        Row: {
          appointment_type_id: string | null
          created_at: string
          created_by: string | null
          doctor_id: string
          end_time: string
          hold_expires_at: string | null
          id: string
          location_id: string | null
          mode: Database["public"]["Enums"]["schedule_mode"]
          notes: string | null
          patient_id: string
          patient_name: string | null
          source: string | null
          start_time: string
          status: Database["public"]["Enums"]["appointment_status"]
          updated_at: string
          version: number
        }
        Insert: {
          appointment_type_id?: string | null
          created_at?: string
          created_by?: string | null
          doctor_id: string
          end_time: string
          hold_expires_at?: string | null
          id?: string
          location_id?: string | null
          mode?: Database["public"]["Enums"]["schedule_mode"]
          notes?: string | null
          patient_id: string
          patient_name?: string | null
          source?: string | null
          start_time: string
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
          version?: number
        }
        Update: {
          appointment_type_id?: string | null
          created_at?: string
          created_by?: string | null
          doctor_id?: string
          end_time?: string
          hold_expires_at?: string | null
          id?: string
          location_id?: string | null
          mode?: Database["public"]["Enums"]["schedule_mode"]
          notes?: string | null
          patient_id?: string
          patient_name?: string | null
          source?: string | null
          start_time?: string
          status?: Database["public"]["Enums"]["appointment_status"]
          updated_at?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "appointments_appointment_type_id_fkey"
            columns: ["appointment_type_id"]
            isOneToOne: false
            referencedRelation: "appointment_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      doctors: {
        Row: {
          avatar_url: string | null
          created_at: string
          default_buffer: number
          default_duration: number
          degrees: string | null
          department_id: string | null
          id: string
          max_future_days: number
          min_lead_time: number
          name: string
          specialty_id: string | null
          status: string
          timezone: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          default_buffer?: number
          default_duration?: number
          degrees?: string | null
          department_id?: string | null
          id?: string
          max_future_days?: number
          min_lead_time?: number
          name: string
          specialty_id?: string | null
          status?: string
          timezone?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          default_buffer?: number
          default_duration?: number
          degrees?: string | null
          department_id?: string | null
          id?: string
          max_future_days?: number
          min_lead_time?: number
          name?: string
          specialty_id?: string | null
          status?: string
          timezone?: string
          updated_at?: string
        }
        Relationships: []
      }
      holidays: {
        Row: {
          block_bookings: boolean
          created_at: string
          holiday_date: string
          id: string
          location_id: string | null
          name: string
        }
        Insert: {
          block_bookings?: boolean
          created_at?: string
          holiday_date: string
          id?: string
          location_id?: string | null
          name: string
        }
        Update: {
          block_bookings?: boolean
          created_at?: string
          holiday_date?: string
          id?: string
          location_id?: string | null
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "holidays_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      leaves: {
        Row: {
          created_at: string
          doctor_id: string
          end_datetime: string
          id: string
          keep_existing_bookings: boolean
          leave_type: Database["public"]["Enums"]["leave_type"]
          reason: string | null
          start_datetime: string
          status: Database["public"]["Enums"]["leave_status"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          doctor_id: string
          end_datetime: string
          id?: string
          keep_existing_bookings?: boolean
          leave_type?: Database["public"]["Enums"]["leave_type"]
          reason?: string | null
          start_datetime: string
          status?: Database["public"]["Enums"]["leave_status"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          doctor_id?: string
          end_datetime?: string
          id?: string
          keep_existing_bookings?: boolean
          leave_type?: Database["public"]["Enums"]["leave_type"]
          reason?: string | null
          start_datetime?: string
          status?: Database["public"]["Enums"]["leave_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leaves_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      locations: {
        Row: {
          address: string | null
          created_at: string
          id: string
          is_active: boolean
          name: string
          timezone: string
          type: Database["public"]["Enums"]["schedule_mode"]
          updated_at: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          timezone?: string
          type?: Database["public"]["Enums"]["schedule_mode"]
          updated_at?: string
        }
        Update: {
          address?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          timezone?: string
          type?: Database["public"]["Enums"]["schedule_mode"]
          updated_at?: string
        }
        Relationships: []
      }
      patients: {
        Row: {
          address_city: string | null
          address_line1: string | null
          address_pincode: string | null
          address_state: string | null
          allergies: string[] | null
          blood_group: string | null
          created_at: string
          date_of_birth: string
          department: string | null
          email: string | null
          emergency_contact_name: string | null
          emergency_contact_phone: string | null
          first_name: string
          gdid: string
          gender: string
          id: string
          insurance_policy_number: string | null
          insurance_provider: string | null
          last_name: string
          last_visit_date: string | null
          medical_alerts: string[] | null
          phone: string
          primary_doctor_id: string | null
          registration_date: string
          status: string
          updated_at: string
        }
        Insert: {
          address_city?: string | null
          address_line1?: string | null
          address_pincode?: string | null
          address_state?: string | null
          allergies?: string[] | null
          blood_group?: string | null
          created_at?: string
          date_of_birth: string
          department?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name: string
          gdid: string
          gender: string
          id?: string
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          last_name: string
          last_visit_date?: string | null
          medical_alerts?: string[] | null
          phone: string
          primary_doctor_id?: string | null
          registration_date?: string
          status?: string
          updated_at?: string
        }
        Update: {
          address_city?: string | null
          address_line1?: string | null
          address_pincode?: string | null
          address_state?: string | null
          allergies?: string[] | null
          blood_group?: string | null
          created_at?: string
          date_of_birth?: string
          department?: string | null
          email?: string | null
          emergency_contact_name?: string | null
          emergency_contact_phone?: string | null
          first_name?: string
          gdid?: string
          gender?: string
          id?: string
          insurance_policy_number?: string | null
          insurance_provider?: string | null
          last_name?: string
          last_visit_date?: string | null
          medical_alerts?: string[] | null
          phone?: string
          primary_doctor_id?: string | null
          registration_date?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "patients_primary_doctor_id_fkey"
            columns: ["primary_doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      schedule_exceptions: {
        Row: {
          buffer: number | null
          capacity: number | null
          created_at: string
          doctor_id: string
          duration: number | null
          end_time: string
          exception_date: string
          exception_type: Database["public"]["Enums"]["exception_type"]
          id: string
          location_id: string | null
          mode: Database["public"]["Enums"]["schedule_mode"] | null
          notes: string | null
          start_time: string
          updated_at: string
        }
        Insert: {
          buffer?: number | null
          capacity?: number | null
          created_at?: string
          doctor_id: string
          duration?: number | null
          end_time: string
          exception_date: string
          exception_type: Database["public"]["Enums"]["exception_type"]
          id?: string
          location_id?: string | null
          mode?: Database["public"]["Enums"]["schedule_mode"] | null
          notes?: string | null
          start_time: string
          updated_at?: string
        }
        Update: {
          buffer?: number | null
          capacity?: number | null
          created_at?: string
          doctor_id?: string
          duration?: number | null
          end_time?: string
          exception_date?: string
          exception_type?: Database["public"]["Enums"]["exception_type"]
          id?: string
          location_id?: string | null
          mode?: Database["public"]["Enums"]["schedule_mode"] | null
          notes?: string | null
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "schedule_exceptions_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "schedule_exceptions_location_id_fkey"
            columns: ["location_id"]
            isOneToOne: false
            referencedRelation: "locations"
            referencedColumns: ["id"]
          },
        ]
      }
      schedule_templates: {
        Row: {
          created_at: string
          doctor_id: string
          id: string
          is_active: boolean
          name: string
          updated_at: string
          week_pattern: Json
        }
        Insert: {
          created_at?: string
          doctor_id: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          week_pattern?: Json
        }
        Update: {
          created_at?: string
          doctor_id?: string
          id?: string
          is_active?: boolean
          name?: string
          updated_at?: string
          week_pattern?: Json
        }
        Relationships: [
          {
            foreignKeyName: "schedule_templates_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduling_audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          payload: Json | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          payload?: Json | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          payload?: Json | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cleanup_expired_holds: { Args: never; Returns: undefined }
    }
    Enums: {
      appointment_status:
        | "held"
        | "booked"
        | "checked_in"
        | "completed"
        | "no_show"
        | "cancelled"
      exception_type: "add" | "block"
      leave_status: "active" | "cancelled"
      leave_type: "full_day" | "partial_day"
      schedule_mode: "in_person" | "telehealth" | "both"
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
      appointment_status: [
        "held",
        "booked",
        "checked_in",
        "completed",
        "no_show",
        "cancelled",
      ],
      exception_type: ["add", "block"],
      leave_status: ["active", "cancelled"],
      leave_type: ["full_day", "partial_day"],
      schedule_mode: ["in_person", "telehealth", "both"],
    },
  },
} as const
