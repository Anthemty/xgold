export interface Database {
  __InternalSupabase: {
    PostgrestVersion: "12";
  };
  public: {
    Tables: {
      tokens: {
        Row: {
          id: string;
          symbol: string;
          name: string;
          description: string | null;
          icon_url: string;
          gradient_class: string | null;
          contract_address: string;
          decimals: number;
          oracle_type: "chainlink" | "pyth" | "fixed" | null;
          oracle_address: string | null;
          oracle_decimals: number | null;
          fixed_price_usd: string | null;
          is_tradable: boolean;
          is_stakeable: boolean;
          is_active: boolean;
          min_swap_amount: string | null;
          max_swap_amount: string | null;
          swap_fee_percentage: string | null;
          min_stake_amount: string | null;
          stake_apy: string | null;
          lock_period_days: number | null;
          website_url: string | null;
          coingecko_id: string | null;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          symbol: string;
          name: string;
          description?: string | null;
          icon_url: string;
          gradient_class?: string | null;
          contract_address: string;
          decimals?: number;
          oracle_type?: "chainlink" | "pyth" | "fixed" | null;
          oracle_address?: string | null;
          oracle_decimals?: number | null;
          fixed_price_usd?: string | null;
          is_tradable?: boolean;
          is_stakeable?: boolean;
          is_active?: boolean;
          min_swap_amount?: string | null;
          max_swap_amount?: string | null;
          swap_fee_percentage?: string | null;
          min_stake_amount?: string | null;
          stake_apy?: string | null;
          lock_period_days?: number | null;
          website_url?: string | null;
          coingecko_id?: string | null;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["tokens"]["Insert"]>;
        Relationships: [];
      };

      market_data: {
        Row: {
          id: string;
          asset_symbol: string;
          price_usd: number;
          change_24h: number;
          change_pct_24h: number;
          open_price: number;
          high_24h: number;
          low_24h: number;
          prev_close_price: number;
          ask: number | null;
          bid: number | null;
          price_gram_24k: number | null;
          updated_at: string;
        };
        Insert: {
          id?: string;
          asset_symbol: string;
          price_usd: number;
          change_24h: number;
          change_pct_24h: number;
          open_price: number;
          high_24h: number;
          low_24h: number;
          prev_close_price: number;
          ask?: number | null;
          bid?: number | null;
          price_gram_24k?: number | null;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["market_data"]["Insert"]>;
        Relationships: [];
      };

      price_history: {
        Row: {
          id: string;
          asset_symbol: string;
          price_usd: number;
          open_price: number;
          high_price: number;
          low_price: number;
          close_price: number;
          timeframe: "1h" | "4h" | "1d" | "1w";
          timestamp: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          asset_symbol: string;
          price_usd: number;
          open_price: number;
          high_price: number;
          low_price: number;
          close_price: number;
          timeframe: "1h" | "4h" | "1d" | "1w";
          timestamp: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["price_history"]["Insert"]>;
        Relationships: [];
      };

      platform_metrics: {
        Row: {
          id: string;
          metric_key: string;
          numeric_value: number;
          updated_at: string;
        };
        Insert: {
          id?: string;
          metric_key: string;
          numeric_value: number;
          updated_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["platform_metrics"]["Insert"]>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
}
