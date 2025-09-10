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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          password_hash: string
          password_salt: string | null
          temp_password: string | null
          updated_at: string
          username: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          password_hash: string
          password_salt?: string | null
          temp_password?: string | null
          updated_at?: string
          username: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          password_hash?: string
          password_salt?: string | null
          temp_password?: string | null
          updated_at?: string
          username?: string
        }
        Relationships: []
      }
      applications: {
        Row: {
          admin_comment: string | null
          consent_form_file_path: string | null
          created_at: string
          created_by_admin: boolean | null
          current_employer: string | null
          current_position: string | null
          currently_employed: boolean | null
          email: string
          first_generation_student: boolean | null
          first_name: string
          gender_identity: string | null
          gpa: number | null
          graduation_year: number | null
          id: string
          last_name: string
          linkedin_url: string | null
          major: string | null
          pell_grant_eligible: boolean | null
          question_1: string | null
          question_2: string | null
          question_3: string | null
          question_4: string | null
          racial_identity: string | null
          resume_file_path: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          sexual_orientation: string | null
          status: string
          student_type: string | null
          submitted_at: string
          transcript_file_path: string | null
          uc_campus: string | null
          updated_at: string
        }
        Insert: {
          admin_comment?: string | null
          consent_form_file_path?: string | null
          created_at?: string
          created_by_admin?: boolean | null
          current_employer?: string | null
          current_position?: string | null
          currently_employed?: boolean | null
          email: string
          first_generation_student?: boolean | null
          first_name: string
          gender_identity?: string | null
          gpa?: number | null
          graduation_year?: number | null
          id?: string
          last_name: string
          linkedin_url?: string | null
          major?: string | null
          pell_grant_eligible?: boolean | null
          question_1?: string | null
          question_2?: string | null
          question_3?: string | null
          question_4?: string | null
          racial_identity?: string | null
          resume_file_path?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sexual_orientation?: string | null
          status?: string
          student_type?: string | null
          submitted_at?: string
          transcript_file_path?: string | null
          uc_campus?: string | null
          updated_at?: string
        }
        Update: {
          admin_comment?: string | null
          consent_form_file_path?: string | null
          created_at?: string
          created_by_admin?: boolean | null
          current_employer?: string | null
          current_position?: string | null
          currently_employed?: boolean | null
          email?: string
          first_generation_student?: boolean | null
          first_name?: string
          gender_identity?: string | null
          gpa?: number | null
          graduation_year?: number | null
          id?: string
          last_name?: string
          linkedin_url?: string | null
          major?: string | null
          pell_grant_eligible?: boolean | null
          question_1?: string | null
          question_2?: string | null
          question_3?: string | null
          question_4?: string | null
          racial_identity?: string | null
          resume_file_path?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sexual_orientation?: string | null
          status?: string
          student_type?: string | null
          submitted_at?: string
          transcript_file_path?: string | null
          uc_campus?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      bulk_upload_logs: {
        Row: {
          admin_user_id: string
          column_mapping: Json | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          errors: Json | null
          failed_records: number
          file_name: string
          file_size: number
          file_type: string
          id: string
          processing_time_ms: number | null
          successful_records: number
          summary_report: Json | null
          total_records: number
          upload_status: string
        }
        Insert: {
          admin_user_id: string
          column_mapping?: Json | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          errors?: Json | null
          failed_records?: number
          file_name: string
          file_size: number
          file_type: string
          id?: string
          processing_time_ms?: number | null
          successful_records?: number
          summary_report?: Json | null
          total_records?: number
          upload_status?: string
        }
        Update: {
          admin_user_id?: string
          column_mapping?: Json | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          errors?: Json | null
          failed_records?: number
          file_name?: string
          file_size?: number
          file_type?: string
          id?: string
          processing_time_ms?: number | null
          successful_records?: number
          summary_report?: Json | null
          total_records?: number
          upload_status?: string
        }
        Relationships: []
      }
      calendar_events: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          event_date: string
          event_time: string | null
          event_type: string | null
          id: string
          location: string | null
          signup_url: string | null
          speakers: string[] | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_date: string
          event_time?: string | null
          event_type?: string | null
          id?: string
          location?: string | null
          signup_url?: string | null
          speakers?: string[] | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          event_date?: string
          event_time?: string | null
          event_type?: string | null
          id?: string
          location?: string | null
          signup_url?: string | null
          speakers?: string[] | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      certification_uploads: {
        Row: {
          certification_name: string
          created_at: string
          file_path: string
          file_size: number
          id: string
          mime_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          certification_name: string
          created_at?: string
          file_path: string
          file_size: number
          id?: string
          mime_type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          certification_name?: string
          created_at?: string
          file_path?: string
          file_size?: number
          id?: string
          mime_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      password_reset_tokens: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          token: string
          used: boolean
        }
        Insert: {
          created_at?: string
          email: string
          expires_at: string
          id?: string
          token: string
          used?: boolean
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          token?: string
          used?: boolean
        }
        Relationships: []
      }
      profiles: {
        Row: {
          bio: string | null
          career_interests: string[] | null
          company_interests: string[] | null
          created_at: string
          email: string | null
          first_name: string | null
          github_url: string | null
          gpa: number | null
          graduation_year: number | null
          id: string
          is_temp_password_used: boolean | null
          last_name: string | null
          linkedin_url: string | null
          location: string | null
          major: string | null
          password: string | null
          phone: string | null
          target_companies: Json | null
          temp_password: string | null
          temp_password_expires_at: string | null
          uc_campus: string | null
          updated_at: string
          user_id: string
          username: string | null
        }
        Insert: {
          bio?: string | null
          career_interests?: string[] | null
          company_interests?: string[] | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          github_url?: string | null
          gpa?: number | null
          graduation_year?: number | null
          id?: string
          is_temp_password_used?: boolean | null
          last_name?: string | null
          linkedin_url?: string | null
          location?: string | null
          major?: string | null
          password?: string | null
          phone?: string | null
          target_companies?: Json | null
          temp_password?: string | null
          temp_password_expires_at?: string | null
          uc_campus?: string | null
          updated_at?: string
          user_id: string
          username?: string | null
        }
        Update: {
          bio?: string | null
          career_interests?: string[] | null
          company_interests?: string[] | null
          created_at?: string
          email?: string | null
          first_name?: string | null
          github_url?: string | null
          gpa?: number | null
          graduation_year?: number | null
          id?: string
          is_temp_password_used?: boolean | null
          last_name?: string | null
          linkedin_url?: string | null
          location?: string | null
          major?: string | null
          password?: string | null
          phone?: string | null
          target_companies?: Json | null
          temp_password?: string | null
          temp_password_expires_at?: string | null
          uc_campus?: string | null
          updated_at?: string
          user_id?: string
          username?: string | null
        }
        Relationships: []
      }
      tts_account_links: {
        Row: {
          created_at: string
          id: string
          last_sync_at: string | null
          linked_at: string
          sync_status: string | null
          tts_email: string | null
          tts_username: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          last_sync_at?: string | null
          linked_at?: string
          sync_status?: string | null
          tts_email?: string | null
          tts_username: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          last_sync_at?: string | null
          linked_at?: string
          sync_status?: string | null
          tts_email?: string | null
          tts_username?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      tts_progress: {
        Row: {
          completed_at: string | null
          completion_status: string | null
          course_id: string
          course_name: string
          created_at: string
          id: string
          last_accessed_at: string | null
          progress_percentage: number | null
          tts_username: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          completion_status?: string | null
          course_id: string
          course_name: string
          created_at?: string
          id?: string
          last_accessed_at?: string | null
          progress_percentage?: number | null
          tts_username?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          completion_status?: string | null
          course_id?: string
          course_name?: string
          created_at?: string
          id?: string
          last_accessed_at?: string | null
          progress_percentage?: number | null
          tts_username?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      website_content: {
        Row: {
          content: string | null
          created_at: string
          created_by: string | null
          id: string
          image_url: string | null
          metadata: Json | null
          section_id: string
          subtitle: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          image_url?: string | null
          metadata?: Json | null
          section_id: string
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          content?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          image_url?: string | null
          metadata?: Json | null
          section_id?: string
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin_authenticated: {
        Args: Record<PropertyKey, never>
        Returns: boolean
      }
      is_admin_user: {
        Args: Record<PropertyKey, never>
        Returns: boolean
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
