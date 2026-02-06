export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '13.0.4';
  };
  public: {
    Tables: {
      consultations: {
        Row: {
          cal_booking_id: string | null;
          cal_booking_uid: string | null;
          cancellation_reason: string | null;
          cancelled_at: string | null;
          consultation_type: Database['public']['Enums']['consultation_type_enum'];
          created_at: string | null;
          duration_minutes: number;
          id: string;
          internal_notes: string | null;
          meeting_url: string | null;
          scheduled_at: string;
          scheduled_end_at: string;
          status: string;
          timezone: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          cal_booking_id?: string | null;
          cal_booking_uid?: string | null;
          cancellation_reason?: string | null;
          cancelled_at?: string | null;
          consultation_type?: Database['public']['Enums']['consultation_type_enum'];
          created_at?: string | null;
          duration_minutes: number;
          id?: string;
          internal_notes?: string | null;
          meeting_url?: string | null;
          scheduled_at: string;
          scheduled_end_at: string;
          status?: string;
          timezone?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          cal_booking_id?: string | null;
          cal_booking_uid?: string | null;
          cancellation_reason?: string | null;
          cancelled_at?: string | null;
          consultation_type?: Database['public']['Enums']['consultation_type_enum'];
          created_at?: string | null;
          duration_minutes?: number;
          id?: string;
          internal_notes?: string | null;
          meeting_url?: string | null;
          scheduled_at?: string;
          scheduled_end_at?: string;
          status?: string;
          timezone?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'consultations_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      email_logs: {
        Row: {
          brevo_message_id: string | null;
          consultation_id: string | null;
          email_type: string;
          id: string;
          metadata: Json | null;
          sent_at: string | null;
          status: string | null;
          user_id: string;
        };
        Insert: {
          brevo_message_id?: string | null;
          consultation_id?: string | null;
          email_type: string;
          id?: string;
          metadata?: Json | null;
          sent_at?: string | null;
          status?: string | null;
          user_id: string;
        };
        Update: {
          brevo_message_id?: string | null;
          consultation_id?: string | null;
          email_type?: string;
          id?: string;
          metadata?: Json | null;
          sent_at?: string | null;
          status?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'email_logs_consultation_id_fkey';
            columns: ['consultation_id'];
            isOneToOne: false;
            referencedRelation: 'consultations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'email_logs_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      payments: {
        Row: {
          amount_cents: number;
          consultation_id: string | null;
          created_at: string | null;
          currency: string | null;
          id: string;
          refund_reason: string | null;
          refunded_amount_cents: number | null;
          refunded_at: string | null;
          status: string;
          stripe_charge_id: string | null;
          stripe_customer_id: string | null;
          stripe_payment_intent_id: string;
          stripe_receipt_url: string | null;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          amount_cents: number;
          consultation_id?: string | null;
          created_at?: string | null;
          currency?: string | null;
          id?: string;
          refund_reason?: string | null;
          refunded_amount_cents?: number | null;
          refunded_at?: string | null;
          status?: string;
          stripe_charge_id?: string | null;
          stripe_customer_id?: string | null;
          stripe_payment_intent_id: string;
          stripe_receipt_url?: string | null;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          amount_cents?: number;
          consultation_id?: string | null;
          created_at?: string | null;
          currency?: string | null;
          id?: string;
          refund_reason?: string | null;
          refunded_amount_cents?: number | null;
          refunded_at?: string | null;
          status?: string;
          stripe_charge_id?: string | null;
          stripe_customer_id?: string | null;
          stripe_payment_intent_id?: string;
          stripe_receipt_url?: string | null;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'payments_consultation_id_fkey';
            columns: ['consultation_id'];
            isOneToOne: false;
            referencedRelation: 'consultations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'payments_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
      profiles: {
        Row: {
          accepted_terms_at: string;
          access_until: string | null;
          account_status: string;
          auth_provider: string | null;
          consultation_reason: Database['public']['Enums']['consultation_reason_enum'];
          created_at: string | null;
          email: string;
          first_name: string;
          id: string;
          last_name: string;
          marketing_consent: boolean | null;
          phone: string | null;
          trial_ends_at: string | null;
          trial_started_at: string | null;
          updated_at: string | null;
        };
        Insert: {
          accepted_terms_at?: string;
          access_until?: string | null;
          account_status?: string;
          auth_provider?: string | null;
          consultation_reason: Database['public']['Enums']['consultation_reason_enum'];
          created_at?: string | null;
          email: string;
          first_name: string;
          id: string;
          last_name: string;
          marketing_consent?: boolean | null;
          phone?: string | null;
          trial_ends_at?: string | null;
          trial_started_at?: string | null;
          updated_at?: string | null;
        };
        Update: {
          accepted_terms_at?: string;
          access_until?: string | null;
          account_status?: string;
          auth_provider?: string | null;
          consultation_reason?: Database['public']['Enums']['consultation_reason_enum'];
          created_at?: string | null;
          email?: string;
          first_name?: string;
          id?: string;
          last_name?: string;
          marketing_consent?: boolean | null;
          phone?: string | null;
          trial_ends_at?: string | null;
          trial_started_at?: string | null;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      reminders: {
        Row: {
          consultation_id: string | null;
          created_at: string | null;
          id: string;
          reminder_type: string;
          scheduled_for: string;
          sent_at: string | null;
          status: string | null;
          user_id: string;
        };
        Insert: {
          consultation_id?: string | null;
          created_at?: string | null;
          id?: string;
          reminder_type: string;
          scheduled_for: string;
          sent_at?: string | null;
          status?: string | null;
          user_id: string;
        };
        Update: {
          consultation_id?: string | null;
          created_at?: string | null;
          id?: string;
          reminder_type?: string;
          scheduled_for?: string;
          sent_at?: string | null;
          status?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'reminders_consultation_id_fkey';
            columns: ['consultation_id'];
            isOneToOne: false;
            referencedRelation: 'consultations';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'reminders_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'profiles';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      calculate_age: { Args: { birth_date: string }; Returns: number };
      diagnose_email_verification: {
        Args: never;
        Returns: {
          auth_email_verified: boolean;
          email: string;
          is_consistent: boolean;
          profile_email_verified: boolean;
          status: string;
          user_id: string;
        }[];
      };
      get_user_profile: { Args: { user_id: string }; Returns: Json };
      get_user_role: { Args: { user_id: string }; Returns: string };
      is_admin: { Args: { user_id?: string }; Returns: boolean };
      is_nutritionist: { Args: { user_id?: string }; Returns: boolean };
      is_verified_nutritionist: { Args: { user_id: string }; Returns: boolean };
      sync_all_email_verification: { Args: never; Returns: undefined };
    };
    Enums: {
      account_status_enum: 'trial' | 'active' | 'expired' | 'cancelled';
      consultation_reason_enum:
        | 'menopause_perimenopause'
        | 'perte_poids_durable'
        | 'troubles_digestifs'
        | 'glycemie_diabete'
        | 'sante_cardiovasculaire'
        | 'fatigue_energie'
        | 'longevite_vieillissement'
        | 'sante_hormonale'
        | 'alimentation_saine'
        | 'autre';
      consultation_type_enum: 'decouverte' | 'suivi';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      account_status_enum: ['trial', 'active', 'expired', 'cancelled'],
      consultation_reason_enum: [
        'menopause_perimenopause',
        'perte_poids_durable',
        'troubles_digestifs',
        'glycemie_diabete',
        'sante_cardiovasculaire',
        'fatigue_energie',
        'longevite_vieillissement',
        'sante_hormonale',
        'alimentation_saine',
        'autre',
      ],
      consultation_type_enum: ['decouverte', 'suivi'],
    },
  },
} as const;
