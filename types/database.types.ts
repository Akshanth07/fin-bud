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
      users: {
        Row: {
          id: string
          full_name: string | null
          email: string | null
          phone: string | null
          avatar_url: string | null
          date_of_birth: string | null
          gender: string | null
          occupation: string | null
          annual_income: number
          monthly_income: number
          monthly_expenses: number
          savings: number
          emergency_fund: number
          total_assets: number
          total_liabilities: number
          risk_profile: string | null
          marital_status: string | null
          state: string | null
          city: string | null
          financial_health_score: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          email?: string | null
          phone?: string | null
          avatar_url?: string | null
          date_of_birth?: string | null
          gender?: string | null
          occupation?: string | null
          annual_income?: number
          monthly_income?: number
          monthly_expenses?: number
          savings?: number
          emergency_fund?: number
          total_assets?: number
          total_liabilities?: number
          risk_profile?: string | null
          marital_status?: string | null
          state?: string | null
          city?: string | null
          financial_health_score?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          email?: string | null
          phone?: string | null
          avatar_url?: string | null
          date_of_birth?: string | null
          gender?: string | null
          occupation?: string | null
          annual_income?: number
          monthly_income?: number
          monthly_expenses?: number
          savings?: number
          emergency_fund?: number
          total_assets?: number
          total_liabilities?: number
          risk_profile?: string | null
          marital_status?: string | null
          state?: string | null
          city?: string | null
          financial_health_score?: number
          created_at?: string
          updated_at?: string
        }
      }
      investments: {
        Row: {
          id: string
          user_id: string
          asset_name: string
          asset_type: string
          quantity: number
          purchase_price: number
          current_price: number
          current_value: number
          platform: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          asset_name: string
          asset_type: string
          quantity?: number
          purchase_price?: number
          current_price?: number
          platform?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          asset_name?: string
          asset_type?: string
          quantity?: number
          purchase_price?: number
          current_price?: number
          platform?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      loans: {
        Row: {
          id: string
          user_id: string
          loan_type: string
          lender: string
          principal_amount: number
          outstanding_amount: number
          interest_rate: number
          emi: number
          tenure: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          loan_type: string
          lender: string
          principal_amount?: number
          outstanding_amount?: number
          interest_rate?: number
          emi?: number
          tenure?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          loan_type?: string
          lender?: string
          principal_amount?: number
          outstanding_amount?: number
          interest_rate?: number
          emi?: number
          tenure?: number
          created_at?: string
          updated_at?: string
        }
      }
      insurance_policies: {
        Row: {
          id: string
          user_id: string
          provider: string
          policy_name: string
          policy_number: string | null
          policy_type: string
          coverage_amount: number
          premium: number
          renewal_date: string | null
          document_url: string | null
          ai_summary: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          provider: string
          policy_name: string
          policy_number?: string | null
          policy_type: string
          coverage_amount?: number
          premium?: number
          renewal_date?: string | null
          document_url?: string | null
          ai_summary?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          provider?: string
          policy_name?: string
          policy_number?: string | null
          policy_type?: string
          coverage_amount?: number
          premium?: number
          renewal_date?: string | null
          document_url?: string | null
          ai_summary?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      goals: {
        Row: {
          id: string
          user_id: string
          goal_name: string
          target_amount: number
          current_amount: number
          target_date: string | null
          status: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          goal_name: string
          target_amount?: number
          current_amount?: number
          target_date?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          goal_name?: string
          target_amount?: number
          current_amount?: number
          target_date?: string | null
          status?: string
          created_at?: string
          updated_at?: string
        }
      }
      life_event_simulations: {
        Row: {
          id: string
          user_id: string
          event_type: string
          input_data: Json
          ai_result: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          event_type: string
          input_data?: Json
          ai_result?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          event_type?: string
          input_data?: Json
          ai_result?: Json | null
          created_at?: string
        }
      }
      government_schemes: {
        Row: {
          id: string
          scheme_name: string
          description: string | null
          state: string | null
          eligibility_rules: Json
          benefit: string | null
          official_link: string | null
          category: string | null
          is_active: boolean
          updated_at: string
        }
        Insert: {
          id?: string
          scheme_name: string
          description?: string | null
          state?: string | null
          eligibility_rules?: Json
          benefit?: string | null
          official_link?: string | null
          category?: string | null
          is_active?: boolean
          updated_at?: string
        }
        Update: {
          id?: string
          scheme_name?: string
          description?: string | null
          state?: string | null
          eligibility_rules?: Json
          benefit?: string | null
          official_link?: string | null
          category?: string | null
          is_active?: boolean
          updated_at?: string
        }
      }
      user_scheme_matches: {
        Row: {
          id: string
          user_id: string
          scheme_id: string
          eligibility_score: number
          matched_at: string
        }
        Insert: {
          id?: string
          user_id: string
          scheme_id: string
          eligibility_score?: number
          matched_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          scheme_id?: string
          eligibility_score?: number
          matched_at?: string
        }
      }
      market_news: {
        Row: {
          id: string
          title: string
          source: string | null
          url: string | null
          summary: string | null
          published_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          source?: string | null
          url?: string | null
          summary?: string | null
          published_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          title?: string
          source?: string | null
          url?: string | null
          summary?: string | null
          published_at?: string | null
          created_at?: string
        }
      }
      ai_insights: {
        Row: {
          id: string
          user_id: string
          insight_type: string
          title: string
          description: string | null
          priority: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          insight_type: string
          title: string
          description?: string | null
          priority?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          insight_type?: string
          title?: string
          description?: string | null
          priority?: string | null
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          title: string
          message: string
          type: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          title: string
          message: string
          type?: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          title?: string
          message?: string
          type?: string
          is_read?: boolean
          created_at?: string
        }
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
  }
}
