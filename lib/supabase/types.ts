// Hand-written to match supabase/schema.sql. Keep in sync if the schema changes.

export type SlotStatus = "available" | "held" | "booked";
export type PaymentStatus = "pending" | "paid" | "failed" | "expired";

export type Database = {
  public: {
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Tables: {
      available_slots: {
        Row: {
          id: string;
          slot_date: string;
          slot_time: string;
          status: SlotStatus;
          held_until: string | null;
          stripe_checkout_session_id: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          slot_date: string;
          slot_time: string;
          status?: SlotStatus;
          held_until?: string | null;
          stripe_checkout_session_id?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          slot_date?: string;
          slot_time?: string;
          status?: SlotStatus;
          held_until?: string | null;
          stripe_checkout_session_id?: string | null;
          created_at?: string;
        };
        Relationships: [];
      };
      bookings: {
        Row: {
          id: string;
          slot_id: string;
          patient_name: string;
          birthdate: string;
          weight_lbs: number;
          gender: string;
          email: string;
          phone: string;
          has_provider_order: boolean;
          provider_order_path: string | null;
          payment_status: PaymentStatus;
          amount_cents: number;
          stripe_checkout_session_id: string | null;
          stripe_payment_intent_id: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slot_id: string;
          patient_name: string;
          birthdate: string;
          weight_lbs: number;
          gender: string;
          email: string;
          phone: string;
          has_provider_order?: boolean;
          provider_order_path?: string | null;
          payment_status?: PaymentStatus;
          amount_cents?: number;
          stripe_checkout_session_id?: string | null;
          stripe_payment_intent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slot_id?: string;
          patient_name?: string;
          birthdate?: string;
          weight_lbs?: number;
          gender?: string;
          email?: string;
          phone?: string;
          has_provider_order?: boolean;
          provider_order_path?: string | null;
          payment_status?: PaymentStatus;
          amount_cents?: number;
          stripe_checkout_session_id?: string | null;
          stripe_payment_intent_id?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "bookings_slot_id_fkey";
            columns: ["slot_id"];
            isOneToOne: false;
            referencedRelation: "available_slots";
            referencedColumns: ["id"];
          },
        ];
      };
    };
  };
};
