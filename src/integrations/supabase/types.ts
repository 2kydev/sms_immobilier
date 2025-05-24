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
      properties: {
        Row: {
          adresse: string
          agent: string
          caracteristiques: string[] | null
          charges: number | null
          city: string
          created_at: string
          description: string
          id: string
          images: string[] | null
          pieces: number
          prix: number
          quartier: string
          statut: string
          surface: number
          titre: string
          type: string
          updated_at: string
        }
        Insert: {
          adresse: string
          agent: string
          caracteristiques?: string[] | null
          charges?: number | null
          city: string
          created_at?: string
          description: string
          id?: string
          images?: string[] | null
          pieces: number
          prix: number
          quartier: string
          statut: string
          surface: number
          titre: string
          type: string
          updated_at?: string
        }
        Update: {
          adresse?: string
          agent?: string
          caracteristiques?: string[] | null
          charges?: number | null
          city?: string
          created_at?: string
          description?: string
          id?: string
          images?: string[] | null
          pieces?: number
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
      visits: {
        Row: {
          agent: string
          client_id: string | null
          client_nom: string
          client_prenom: string
          client_telephone: string
          created_at: string
          date: string
          feedback_client: string | null
          heure: string
          id: string
          note_visite: number | null
          notes: string | null
          property_id: string | null
          propriete_adresse: string
          propriete_titre: string
          statut: string
          updated_at: string
        }
        Insert: {
          agent: string
          client_id?: string | null
          client_nom: string
          client_prenom: string
          client_telephone: string
          created_at?: string
          date: string
          feedback_client?: string | null
          heure: string
          id?: string
          note_visite?: number | null
          notes?: string | null
          property_id?: string | null
          propriete_adresse: string
          propriete_titre: string
          statut: string
          updated_at?: string
        }
        Update: {
          agent?: string
          client_id?: string | null
          client_nom?: string
          client_prenom?: string
          client_telephone?: string
          created_at?: string
          date?: string
          feedback_client?: string | null
          heure?: string
          id?: string
          note_visite?: number | null
          notes?: string | null
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
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
