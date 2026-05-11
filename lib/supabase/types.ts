// Generado con: npx supabase gen types typescript --project-id <ID> > lib/supabase/types.ts
// Este archivo se sobreescribe automáticamente — no editar manualmente

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      services: {
        Row: {
          id: string
          name: string
          description: string | null
          price_cents: number
          duration_minutes: number | null
          slug: string | null
          is_active: boolean
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['services']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['services']['Insert']>
      }
      availability: {
        Row: {
          id: string
          service_id: string
          day_of_week: number
          start_time: string
          end_time: string
        }
        Insert: Omit<Database['public']['Tables']['availability']['Row'], 'id'>
        Update: Partial<Database['public']['Tables']['availability']['Insert']>
      }
      bookings: {
        Row: {
          id: string
          user_id: string
          service_id: string
          booked_at: string
          status: 'pending' | 'confirmed' | 'cancelled'
          stripe_session_id: string | null
          stripe_payment_intent: string | null
          created_at: string
        }
        Insert: Omit<Database['public']['Tables']['bookings']['Row'], 'id' | 'created_at'>
        Update: Partial<Database['public']['Tables']['bookings']['Insert']>
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          updated_at: string | null
        }
        Insert: Omit<Database['public']['Tables']['profiles']['Row'], never>
        Update: Partial<Database['public']['Tables']['profiles']['Row']>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
