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
      agents: {
        Row: {
          created_at: string
          email: string
          id: string
          nom: string
          statut: string
          telephone: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          nom: string
          statut?: string
          telephone: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          nom?: string
          statut?: string
          telephone?: string
          updated_at?: string
        }
        Relationships: []
      }
      clients: {
        Row: {
          adresse: string
          budget_max: number | null
          budget_min: number | null
          civilite: string
          created_at: string
          dernier_contact: string
          email: string
          id: string
          nom: string
          notes: string | null
          preferred_city: string | null
          prenom: string
          quartiers: string[] | null
          telephone: string
          type: string
          type_bien: string | null
          updated_at: string
        }
        Insert: {
          adresse: string
          budget_max?: number | null
          budget_min?: number | null
          civilite: string
          created_at?: string
          dernier_contact?: string
          email: string
          id?: string
          nom: string
          notes?: string | null
          preferred_city?: string | null
          prenom: string
          quartiers?: string[] | null
          telephone: string
          type: string
          type_bien?: string | null
          updated_at?: string
        }
        Update: {
          adresse?: string
          budget_max?: number | null
          budget_min?: number | null
          civilite?: string
          created_at?: string
          dernier_contact?: string
          email?: string
          id?: string
          nom?: string
          notes?: string | null
          preferred_city?: string | null
          prenom?: string
          quartiers?: string[] | null
          telephone?: string
          type?: string
          type_bien?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      email_logs: {
        Row: {
          created_at: string
          email_type: string
          error_message: string | null
          id: string
          recipient_email: string
          sent_at: string | null
          status: string
          updated_at: string
          visit_id: string | null
        }
        Insert: {
          created_at?: string
          email_type?: string
          error_message?: string | null
          id?: string
          recipient_email: string
          sent_at?: string | null
          status?: string
          updated_at?: string
          visit_id?: string | null
        }
        Update: {
          created_at?: string
          email_type?: string
          error_message?: string | null
          id?: string
          recipient_email?: string
          sent_at?: string | null
          status?: string
          updated_at?: string
          visit_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "email_logs_visit_id_fkey"
            columns: ["visit_id"]
            isOneToOne: false
            referencedRelation: "visits"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
          nom: string
          prenom: string
          role: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id: string
          is_active?: boolean
          nom?: string
          prenom?: string
          role?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          nom?: string
          prenom?: string
          role?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          acd: boolean | null
          adresse: string
          adu: boolean | null
          agent: string
          autres_details: string | null
          caracteristiques: string[] | null
          charges: number | null
          city: string
          contacts_proprietaire: string | null
          created_at: string
          cuisine_independante: boolean | null
          description: string
          extrait_topographique: string | null
          id: string
          images: string[] | null
          jardin: boolean | null
          nom_proprietaire: string | null
          nombre_salles_eau: number | null
          pieces: number
          piscine: boolean | null
          prix: number
          quartier: string
          statut: string
          surface: number
          titre: string
          type: string
          updated_at: string
        }
        Insert: {
          acd?: boolean | null
          adresse: string
          adu?: boolean | null
          agent: string
          autres_details?: string | null
          caracteristiques?: string[] | null
          charges?: number | null
          city: string
          contacts_proprietaire?: string | null
          created_at?: string
          cuisine_independante?: boolean | null
          description: string
          extrait_topographique?: string | null
          id?: string
          images?: string[] | null
          jardin?: boolean | null
          nom_proprietaire?: string | null
          nombre_salles_eau?: number | null
          pieces: number
          piscine?: boolean | null
          prix: number
          quartier: string
          statut: string
          surface: number
          titre: string
          type: string
          updated_at?: string
        }
        Update: {
          acd?: boolean | null
          adresse?: string
          adu?: boolean | null
          agent?: string
          autres_details?: string | null
          caracteristiques?: string[] | null
          charges?: number | null
          city?: string
          contacts_proprietaire?: string | null
          created_at?: string
          cuisine_independante?: boolean | null
          description?: string
          extrait_topographique?: string | null
          id?: string
          images?: string[] | null
          jardin?: boolean | null
          nom_proprietaire?: string | null
          nombre_salles_eau?: number | null
          pieces?: number
          piscine?: boolean | null
          prix?: number
          quartier?: string
          statut?: string
          surface?: number
          titre?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          agent: string
          client_id: string | null
          created_at: string
          date_creation: string
          derniere_activite: string
          etape: string
          id: string
          notes: string | null
          probabilite: number
          property_id: string | null
          updated_at: string
          valeur: number
        }
        Insert: {
          agent: string
          client_id?: string | null
          created_at?: string
          date_creation?: string
          derniere_activite?: string
          etape: string
          id?: string
          notes?: string | null
          probabilite?: number
          property_id?: string | null
          updated_at?: string
          valeur: number
        }
        Update: {
          agent?: string
          client_id?: string | null
          created_at?: string
          date_creation?: string
          derniere_activite?: string
          etape?: string
          id?: string
          notes?: string | null
          probabilite?: number
          property_id?: string | null
          updated_at?: string
          valeur?: number
        }
        Relationships: [
          {
            foreignKeyName: "transactions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      visits: {
        Row: {
          agent: string
          agent_notification_email: string | null
          client_id: string | null
          client_nom: string
          client_notification_email: string | null
          client_prenom: string
          client_telephone: string
          created_at: string
          date: string
          feedback_client: string | null
          heure: string
          id: string
          note_visite: number | null
          notes: string | null
          notification_delay_hours: number | null
          notification_email: string | null
          notification_enabled: boolean | null
          property_id: string | null
          propriete_adresse: string
          propriete_titre: string
          statut: string
          updated_at: string
        }
        Insert: {
          agent: string
          agent_notification_email?: string | null
          client_id?: string | null
          client_nom: string
          client_notification_email?: string | null
          client_prenom: string
          client_telephone: string
          created_at?: string
          date: string
          feedback_client?: string | null
          heure: string
          id?: string
          note_visite?: number | null
          notes?: string | null
          notification_delay_hours?: number | null
          notification_email?: string | null
          notification_enabled?: boolean | null
          property_id?: string | null
          propriete_adresse: string
          propriete_titre: string
          statut: string
          updated_at?: string
        }
        Update: {
          agent?: string
          agent_notification_email?: string | null
          client_id?: string | null
          client_nom?: string
          client_notification_email?: string | null
          client_prenom?: string
          client_telephone?: string
          created_at?: string
          date?: string
          feedback_client?: string | null
          heure?: string
          id?: string
          note_visite?: number | null
          notes?: string | null
          notification_delay_hours?: number | null
          notification_email?: string | null
          notification_enabled?: boolean | null
          property_id?: string | null
          propriete_adresse?: string
          propriete_titre?: string
          statut?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "visits_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role: "admin" | "directeur" | "agent" | "commercial"
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
      user_role: ["admin", "directeur", "agent", "commercial"],
    },
  },
} as const
