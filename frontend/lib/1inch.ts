/**
 * 1inch Aggregation Protocol API Integration
 * Docs: https://portal.1inch.dev/documentation/swap/swagger
 */

const API_BASE = 'https://api.1inch.dev/swap/v6.0';
const API_KEY = process.env.NEXT_PUBLIC_1INCH_API_KEY || '';

export const ONEINCH_ROUTER = '0x111111125421cA6dc452d289314280a0f8842A65' as const;

export interface Token {
  symbol: string;
  contractAddress: string;
  decimals: number;
}

export interface OneInchQuote {
  dstAmount: string;
  gas: string;
}

export interface OneInchSwap {
  tx: {
    to: string;
    data: string;
    value: string;
    gas: string;
  };
  dstAmount: string;
}

/**
 * 获取 1inch 报价
 */
export async function get1inchQuote(
  sellToken: Token,
  buyToken: Token,
  sellAmount: string,
  chainId: number = 1
): Promise<OneInchQuote | null> {
  try {
    // 检查 API Key
    if (!API_KEY || API_KEY === 'your_1inch_api_key_here') {
      console.error('[1inch] API Key not configured. Please set NEXT_PUBLIC_1INCH_API_KEY in .env.local');
      return null;
    }

    // 将 sellAmount 转换为 wei
    const amountWei = (parseFloat(sellAmount) * Math.pow(10, sellToken.decimals)).toFixed(0);
    
    const url = `${API_BASE}/${chainId}/quote?src=${sellToken.contractAddress}&dst=${buyToken.contractAddress}&amount=${amountWei}`;
    
    console.log('[1inch] Fetching quote:', {
      sellToken: sellToken.symbol,
      buyToken: buyToken.symbol,
      amount: sellAmount,
      amountWei,
      chainId,
      url
    });
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[1inch] Quote error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      return null;
    }

    const data = await response.json();
    console.log('[1inch] Quote success:', data);
    return data;
  } catch (error) {
    console.error('[1inch] Failed to get quote:', error);
    return null;
  }
}

/**
 * 获取 1inch Swap 交易数据
 */
export async function get1inchSwap(
  sellToken: Token,
  buyToken: Token,
  sellAmount: string,
  fromAddress: string,
  slippage: number = 1,
  chainId: number = 1
): Promise<OneInchSwap | null> {
  try {
    // 检查 API Key
    if (!API_KEY || API_KEY === 'your_1inch_api_key_here') {
      console.error('[1inch] API Key not configured. Please set NEXT_PUBLIC_1INCH_API_KEY in .env.local');
      return null;
    }

    // 将 sellAmount 转换为 wei
    const amountWei = (parseFloat(sellAmount) * Math.pow(10, sellToken.decimals)).toFixed(0);
    
    const params = new URLSearchParams({
      src: sellToken.contractAddress,
      dst: buyToken.contractAddress,
      amount: amountWei,
      from: fromAddress,
      slippage: slippage.toString(),
    });
    
    const url = `${API_BASE}/${chainId}/swap?${params}`;
    
    console.log('[1inch] Fetching swap data:', {
      sellToken: sellToken.symbol,
      buyToken: buyToken.symbol,
      amount: sellAmount,
      from: fromAddress,
      slippage,
      chainId
    });
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[1inch] Swap error:', {
        status: response.status,
        statusText: response.statusText,
        error: errorText
      });
      return null;
    }

    const data = await response.json();
    console.log('[1inch] Swap data success:', data);
    return data;
  } catch (error) {
    console.error('[1inch] Failed to get swap data:', error);
    return null;
  }
}
