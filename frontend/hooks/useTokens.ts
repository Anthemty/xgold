import { useCallback, useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import type { Token, TokenRow } from "@/lib/types/token";

interface UseTokensOptions {
  isTradable?: boolean;
  isStakeable?: boolean;
  enabled?: boolean;
}

// 转换数据库行到前端类型（snake_case -> camelCase）
function mapTokenRow(row: TokenRow): Token {
  return {
    id: row.id,
    symbol: row.symbol,
    name: row.name,
    description: row.description,
    iconUrl: row.icon_url,
    gradientClass: row.gradient_class || "",
    contractAddress: row.contract_address as `0x${string}`,
    decimals: row.decimals,
    oracleType: row.oracle_type,
    oracleAddress: row.oracle_address as `0x${string}` | undefined,
    oracleDecimals: row.oracle_decimals,
    fixedPriceUsd: row.fixed_price_usd ? Number.parseFloat(row.fixed_price_usd) : undefined,
    isTradable: row.is_tradable,
    isStakeable: row.is_stakeable,
    isActive: row.is_active,
    minSwapAmount: row.min_swap_amount,
    maxSwapAmount: row.max_swap_amount,
    swapFeePercentage: row.swap_fee_percentage,
    minStakeAmount: row.min_stake_amount,
    stakeApy: row.stake_apy,
    lockPeriodDays: row.lock_period_days,
    websiteUrl: row.website_url,
    coingeckoId: row.coingecko_id,
    sortOrder: row.sort_order,
  };
}

export function useTokens(options: UseTokensOptions = {}) {
  const { isTradable, isStakeable, enabled = true } = options;

  const [tokens, setTokens] = useState<Token[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTokens = useCallback(async () => {
    if (!enabled) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      let query = supabase.from("tokens").select("*").eq("is_active", true);

      if (isTradable !== undefined) {
        query = query.eq("is_tradable", isTradable);
      }

      if (isStakeable !== undefined) {
        query = query.eq("is_stakeable", isStakeable);
      }

      const { data, error: fetchError } = await query.order("sort_order", { ascending: true });

      if (fetchError) throw fetchError;

      const mappedTokens = (data || []).map(mapTokenRow);
      setTokens(mappedTokens);
      setError(null);
    } catch (err) {
      console.error("Failed to fetch tokens:", err);
      setError(err instanceof Error ? err : new Error("Failed to fetch tokens"));
    } finally {
      setLoading(false);
    }
  }, [isTradable, isStakeable, enabled]);

  useEffect(() => {
    fetchTokens();

    // 订阅实时更新
    const channel = supabase
      .channel("tokens-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tokens",
        },
        () => {
          console.log("Tokens updated, refetching...");
          fetchTokens();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTokens]);

  return {
    tokens,
    loading,
    error,
    refetch: fetchTokens,
  };
}

// 简化的快捷 hooks
export function useSwapTokens() {
  return useTokens({ isTradable: true });
}

export function useStakeTokens() {
  return useTokens({ isStakeable: true });
}

// 获取单个 token
export function useToken(symbolOrId?: string) {
  const [token, setToken] = useState<Token | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!symbolOrId) {
      setLoading(false);
      return;
    }

    async function fetchToken() {
      try {
        setLoading(true);
        const { data, error: fetchError } = await supabase
          .from("tokens")
          .select("*")
          .or(`symbol.eq.${symbolOrId},id.eq.${symbolOrId}`)
          .single();

        if (fetchError) throw fetchError;

        setToken(data ? mapTokenRow(data as TokenRow) : null);
        setError(null);
      } catch (err) {
        console.error("Failed to fetch token:", err);
        setError(err instanceof Error ? err : new Error("Failed to fetch token"));
      } finally {
        setLoading(false);
      }
    }

    fetchToken();
  }, [symbolOrId]);

  return { token, loading, error };
}
