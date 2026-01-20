/**
 * CoinGecko API Service
 * Provides cryptocurrency market data with mock fallbacks
 */

export interface CryptoPrice {
  id: string;
  symbol: string;
  name: string;
  currentPrice: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
  marketCap: number;
  volume24h: number;
  circulatingSupply: number;
  lastUpdated: string;
}

export interface CryptoMarketData {
  id: string;
  symbol: string;
  name: string;
  image: string;
  currentPrice: number;
  marketCap: number;
  marketCapRank: number;
  fullyDilutedValuation: number;
  totalVolume: number;
  high24h: number;
  low24h: number;
  priceChange24h: number;
  priceChangePercentage24h: number;
  marketCapChange24h: number;
  marketCapChangePercentage24h: number;
  circulatingSupply: number;
  totalSupply: number;
  maxSupply: number | null;
  ath: number;
  athChangePercentage: number;
  athDate: string;
  atl: number;
  atlChangePercentage: number;
  atlDate: string;
  lastUpdated: string;
}

export interface HistoricalDataPoint {
  timestamp: number;
  price: number;
  marketCap?: number;
  volume?: number;
}

export interface CryptoHistoricalData {
  id: string;
  prices: HistoricalDataPoint[];
  marketCaps?: HistoricalDataPoint[];
  totalVolumes?: HistoricalDataPoint[];
}

const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';
const USE_MOCK_DATA = !import.meta.env.VITE_COINGECKO_API_KEY;

/**
 * Mock cryptocurrency data
 */
const MOCK_CRYPTO_DATA: Record<string, CryptoMarketData> = {
  bitcoin: {
    id: 'bitcoin',
    symbol: 'btc',
    name: 'Bitcoin',
    image: 'https://assets.coingecko.com/coins/images/1/large/bitcoin.png',
    currentPrice: 67234.56,
    marketCap: 1320000000000,
    marketCapRank: 1,
    fullyDilutedValuation: 1410000000000,
    totalVolume: 28500000000,
    high24h: 68120.34,
    low24h: 66543.21,
    priceChange24h: 1234.56,
    priceChangePercentage24h: 1.87,
    marketCapChange24h: 24500000000,
    marketCapChangePercentage24h: 1.89,
    circulatingSupply: 19600000,
    totalSupply: 21000000,
    maxSupply: 21000000,
    ath: 69045.0,
    athChangePercentage: -2.62,
    athDate: '2021-11-10T14:24:11.849Z',
    atl: 67.81,
    atlChangePercentage: 99000.12,
    atlDate: '2013-07-06T00:00:00.000Z',
    lastUpdated: new Date().toISOString(),
  },
  ethereum: {
    id: 'ethereum',
    symbol: 'eth',
    name: 'Ethereum',
    image: 'https://assets.coingecko.com/coins/images/279/large/ethereum.png',
    currentPrice: 3842.67,
    marketCap: 462000000000,
    marketCapRank: 2,
    fullyDilutedValuation: 462000000000,
    totalVolume: 15200000000,
    high24h: 3912.45,
    low24h: 3789.23,
    priceChange24h: 89.34,
    priceChangePercentage24h: 2.38,
    marketCapChange24h: 10800000000,
    marketCapChangePercentage24h: 2.39,
    circulatingSupply: 120234567,
    totalSupply: 120234567,
    maxSupply: null,
    ath: 4878.26,
    athChangePercentage: -21.24,
    athDate: '2021-11-10T14:24:19.604Z',
    atl: 0.432979,
    atlChangePercentage: 887654.32,
    atlDate: '2015-10-20T00:00:00.000Z',
    lastUpdated: new Date().toISOString(),
  },
  tether: {
    id: 'tether',
    symbol: 'usdt',
    name: 'Tether',
    image: 'https://assets.coingecko.com/coins/images/325/large/Tether.png',
    currentPrice: 1.0,
    marketCap: 95800000000,
    marketCapRank: 3,
    fullyDilutedValuation: 95800000000,
    totalVolume: 42300000000,
    high24h: 1.002,
    low24h: 0.998,
    priceChange24h: 0.0001,
    priceChangePercentage24h: 0.01,
    marketCapChange24h: 95000000,
    marketCapChangePercentage24h: 0.099,
    circulatingSupply: 95800000000,
    totalSupply: 95800000000,
    maxSupply: null,
    ath: 1.32,
    athChangePercentage: -24.24,
    athDate: '2018-07-24T00:00:00.000Z',
    atl: 0.572521,
    atlChangePercentage: 74.67,
    atlDate: '2015-03-02T00:00:00.000Z',
    lastUpdated: new Date().toISOString(),
  },
  'binancecoin': {
    id: 'binancecoin',
    symbol: 'bnb',
    name: 'BNB',
    image: 'https://assets.coingecko.com/coins/images/825/large/bnb-icon2_2x.png',
    currentPrice: 612.34,
    marketCap: 91200000000,
    marketCapRank: 4,
    fullyDilutedValuation: 91200000000,
    totalVolume: 1820000000,
    high24h: 625.78,
    low24h: 605.12,
    priceChange24h: 8.92,
    priceChangePercentage24h: 1.48,
    marketCapChange24h: 1330000000,
    marketCapChangePercentage24h: 1.48,
    circulatingSupply: 149000000,
    totalSupply: 149000000,
    maxSupply: 200000000,
    ath: 686.31,
    athChangePercentage: -10.78,
    athDate: '2024-06-06T14:10:23.507Z',
    atl: 0.0398177,
    atlChangePercentage: 1537345.67,
    atlDate: '2017-10-19T00:00:00.000Z',
    lastUpdated: new Date().toISOString(),
  },
  solana: {
    id: 'solana',
    symbol: 'sol',
    name: 'Solana',
    image: 'https://assets.coingecko.com/coins/images/4128/large/solana.png',
    currentPrice: 178.92,
    marketCap: 82300000000,
    marketCapRank: 5,
    fullyDilutedValuation: 103400000000,
    totalVolume: 3240000000,
    high24h: 184.56,
    low24h: 175.23,
    priceChange24h: 4.67,
    priceChangePercentage24h: 2.68,
    marketCapChange24h: 2150000000,
    marketCapChangePercentage24h: 2.68,
    circulatingSupply: 460000000,
    totalSupply: 578000000,
    maxSupply: null,
    ath: 259.96,
    athChangePercentage: -31.17,
    athDate: '2021-11-06T21:54:35.825Z',
    atl: 0.500801,
    atlChangePercentage: 35623.45,
    atlDate: '2020-05-11T19:35:23.449Z',
    lastUpdated: new Date().toISOString(),
  },
};

/**
 * Fetches current price for a cryptocurrency
 * @param coinId - CoinGecko coin ID (e.g., 'bitcoin', 'ethereum')
 * @param vsCurrency - Target currency (default: 'usd')
 * @returns Current price and basic data
 * @throws Error if API request fails
 */
export async function getCryptoPrice(
  coinId: string,
  vsCurrency: string = 'usd'
): Promise<CryptoPrice> {
  if (USE_MOCK_DATA) {
    const mockData = MOCK_CRYPTO_DATA[coinId.toLowerCase()];
    if (mockData) {
      return {
        id: mockData.id,
        symbol: mockData.symbol,
        name: mockData.name,
        currentPrice: mockData.currentPrice,
        priceChange24h: mockData.priceChange24h,
        priceChangePercentage24h: mockData.priceChangePercentage24h,
        marketCap: mockData.marketCap,
        volume24h: mockData.totalVolume,
        circulatingSupply: mockData.circulatingSupply,
        lastUpdated: new Date().toISOString(),
      };
    }
    
    return {
      id: coinId,
      symbol: coinId.substring(0, 3),
      name: coinId.charAt(0).toUpperCase() + coinId.slice(1),
      currentPrice: 100 + Math.random() * 1000,
      priceChange24h: (Math.random() - 0.5) * 100,
      priceChangePercentage24h: (Math.random() - 0.5) * 10,
      marketCap: 1000000000 + Math.random() * 10000000000,
      volume24h: 100000000 + Math.random() * 1000000000,
      circulatingSupply: 10000000 + Math.random() * 100000000,
      lastUpdated: new Date().toISOString(),
    };
  }

  try {
    const params = new URLSearchParams({
      ids: coinId,
      vs_currencies: vsCurrency,
      include_market_cap: 'true',
      include_24hr_vol: 'true',
      include_24hr_change: 'true',
      include_last_updated_at: 'true',
    });

    const response = await fetch(`${COINGECKO_BASE_URL}/simple/price?${params}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data[coinId]) {
      throw new Error(`Cryptocurrency '${coinId}' not found`);
    }

    const coinData = data[coinId];

    return {
      id: coinId,
      symbol: coinId.substring(0, 3),
      name: coinId.charAt(0).toUpperCase() + coinId.slice(1),
      currentPrice: coinData[vsCurrency],
      priceChange24h: coinData[`${vsCurrency}_24h_change`] || 0,
      priceChangePercentage24h: coinData[`${vsCurrency}_24h_change`] || 0,
      marketCap: coinData[`${vsCurrency}_market_cap`] || 0,
      volume24h: coinData[`${vsCurrency}_24h_vol`] || 0,
      circulatingSupply: 0,
      lastUpdated: new Date(coinData.last_updated_at * 1000).toISOString(),
    };
  } catch (error) {
    console.error('Error fetching crypto price:', error);
    
    const mockData = MOCK_CRYPTO_DATA[coinId.toLowerCase()];
    if (mockData) {
      return getCryptoPrice(coinId, vsCurrency);
    }
    throw error;
  }
}

/**
 * Fetches comprehensive market data for a cryptocurrency
 * @param coinId - CoinGecko coin ID
 * @param vsCurrency - Target currency (default: 'usd')
 * @returns Comprehensive market data
 * @throws Error if API request fails
 */
export async function getCryptoMarketData(
  coinId: string,
  vsCurrency: string = 'usd'
): Promise<CryptoMarketData> {
  if (USE_MOCK_DATA) {
    const mockData = MOCK_CRYPTO_DATA[coinId.toLowerCase()];
    if (mockData) {
      return { ...mockData, lastUpdated: new Date().toISOString() };
    }
    
    return {
      id: coinId,
      symbol: coinId.substring(0, 3),
      name: coinId.charAt(0).toUpperCase() + coinId.slice(1),
      image: `https://assets.coingecko.com/coins/images/1/large/${coinId}.png`,
      currentPrice: 100 + Math.random() * 1000,
      marketCap: 1000000000 + Math.random() * 10000000000,
      marketCapRank: Math.floor(Math.random() * 100) + 1,
      fullyDilutedValuation: 1500000000 + Math.random() * 15000000000,
      totalVolume: 100000000 + Math.random() * 1000000000,
      high24h: 110 + Math.random() * 1100,
      low24h: 90 + Math.random() * 900,
      priceChange24h: (Math.random() - 0.5) * 100,
      priceChangePercentage24h: (Math.random() - 0.5) * 10,
      marketCapChange24h: (Math.random() - 0.5) * 1000000000,
      marketCapChangePercentage24h: (Math.random() - 0.5) * 10,
      circulatingSupply: 10000000 + Math.random() * 100000000,
      totalSupply: 20000000 + Math.random() * 200000000,
      maxSupply: Math.random() > 0.5 ? 50000000 + Math.random() * 500000000 : null,
      ath: 200 + Math.random() * 2000,
      athChangePercentage: -10 - Math.random() * 50,
      athDate: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
      atl: 0.01 + Math.random() * 10,
      atlChangePercentage: 1000 + Math.random() * 10000,
      atlDate: new Date(Date.now() - Math.random() * 1825 * 24 * 60 * 60 * 1000).toISOString(),
      lastUpdated: new Date().toISOString(),
    };
  }

  try {
    const params = new URLSearchParams({
      localization: 'false',
      tickers: 'false',
      market_data: 'true',
      community_data: 'false',
      developer_data: 'false',
      sparkline: 'false',
    });

    const response = await fetch(`${COINGECKO_BASE_URL}/coins/${coinId}?${params}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    const marketData = data.market_data;

    return {
      id: data.id,
      symbol: data.symbol,
      name: data.name,
      image: data.image?.large || '',
      currentPrice: marketData.current_price[vsCurrency] || 0,
      marketCap: marketData.market_cap[vsCurrency] || 0,
      marketCapRank: data.market_cap_rank || 0,
      fullyDilutedValuation: marketData.fully_diluted_valuation?.[vsCurrency] || 0,
      totalVolume: marketData.total_volume[vsCurrency] || 0,
      high24h: marketData.high_24h[vsCurrency] || 0,
      low24h: marketData.low_24h[vsCurrency] || 0,
      priceChange24h: marketData.price_change_24h || 0,
      priceChangePercentage24h: marketData.price_change_percentage_24h || 0,
      marketCapChange24h: marketData.market_cap_change_24h || 0,
      marketCapChangePercentage24h: marketData.market_cap_change_percentage_24h || 0,
      circulatingSupply: marketData.circulating_supply || 0,
      totalSupply: marketData.total_supply || 0,
      maxSupply: marketData.max_supply || null,
      ath: marketData.ath[vsCurrency] || 0,
      athChangePercentage: marketData.ath_change_percentage[vsCurrency] || 0,
      athDate: marketData.ath_date[vsCurrency] || '',
      atl: marketData.atl[vsCurrency] || 0,
      atlChangePercentage: marketData.atl_change_percentage[vsCurrency] || 0,
      atlDate: marketData.atl_date[vsCurrency] || '',
      lastUpdated: data.last_updated,
    };
  } catch (error) {
    console.error('Error fetching crypto market data:', error);
    
    const mockData = MOCK_CRYPTO_DATA[coinId.toLowerCase()];
    if (mockData) {
      return getCryptoMarketData(coinId, vsCurrency);
    }
    throw error;
  }
}

/**
 * Fetches historical price data for a cryptocurrency
 * @param coinId - CoinGecko coin ID
 * @param days - Number of days of historical data ('1', '7', '30', '90', '365', 'max')
 * @param vsCurrency - Target currency (default: 'usd')
 * @returns Historical price data
 * @throws Error if API request fails
 */
export async function getHistoricalData(
  coinId: string,
  days: string = '30',
  vsCurrency: string = 'usd'
): Promise<CryptoHistoricalData> {
  if (USE_MOCK_DATA) {
    return {
      id: coinId,
      prices: generateMockHistoricalData(parseInt(days) || 30),
    };
  }

  try {
    const params = new URLSearchParams({
      vs_currency: vsCurrency,
      days: days,
      interval: days === '1' ? 'hourly' : 'daily',
    });

    const response = await fetch(`${COINGECKO_BASE_URL}/coins/${coinId}/market_chart?${params}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    return {
      id: coinId,
      prices: data.prices.map(([timestamp, price]: [number, number]) => ({
        timestamp,
        price,
      })),
      marketCaps: data.market_caps?.map(([timestamp, marketCap]: [number, number]) => ({
        timestamp,
        marketCap,
      })),
      totalVolumes: data.total_volumes?.map(([timestamp, volume]: [number, number]) => ({
        timestamp,
        volume,
      })),
    };
  } catch (error) {
    console.error('Error fetching historical data:', error);
    return {
      id: coinId,
      prices: generateMockHistoricalData(parseInt(days) || 30),
    };
  }
}

/**
 * Generates mock historical data for development
 * @param days - Number of days to generate
 * @returns Array of mock historical data points
 */
function generateMockHistoricalData(days: number): HistoricalDataPoint[] {
  const data: HistoricalDataPoint[] = [];
  let basePrice = 50000;

  for (let i = days - 1; i >= 0; i--) {
    const timestamp = Date.now() - i * 24 * 60 * 60 * 1000;
    const change = (Math.random() - 0.5) * 5000;
    basePrice += change;

    data.push({
      timestamp,
      price: parseFloat(basePrice.toFixed(2)),
    });
  }

  return data;
}

/**
 * List of popular cryptocurrencies for quick access
 */
export const POPULAR_CRYPTOS = [
  'bitcoin',
  'ethereum',
  'tether',
  'binancecoin',
  'solana',
  'cardano',
  'ripple',
  'polkadot',
  'dogecoin',
  'avalanche-2',
] as const;

export type PopularCrypto = typeof POPULAR_CRYPTOS[number];
