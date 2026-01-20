/**
 * Alpha Vantage API Service
 * Provides stock market data with mock fallbacks for development
 */

export interface StockQuote {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: string;
}

export interface CompanyInfo {
  symbol: string;
  name: string;
  description: string;
  sector: string;
  industry: string;
  marketCap: number;
  peRatio: number;
  dividendYield: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
}

export interface TimeSeriesData {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface SymbolSearchResult {
  symbol: string;
  name: string;
  type: string;
  region: string;
  currency: string;
}

const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';
const API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY || 'demo';
const USE_MOCK_DATA = !import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;

/**
 * Mock data for development and fallback
 */
const MOCK_QUOTES: Record<string, StockQuote> = {
  AAPL: {
    symbol: 'AAPL',
    price: 178.25,
    change: 2.35,
    changePercent: 1.33,
    volume: 52734100,
    timestamp: new Date().toISOString(),
  },
  GOOGL: {
    symbol: 'GOOGL',
    price: 142.87,
    change: -0.89,
    changePercent: -0.62,
    volume: 28456300,
    timestamp: new Date().toISOString(),
  },
  MSFT: {
    symbol: 'MSFT',
    price: 412.65,
    change: 5.42,
    changePercent: 1.33,
    volume: 24532100,
    timestamp: new Date().toISOString(),
  },
  TSLA: {
    symbol: 'TSLA',
    price: 242.84,
    change: -3.21,
    changePercent: -1.30,
    volume: 98234500,
    timestamp: new Date().toISOString(),
  },
};

const MOCK_COMPANY_INFO: Record<string, CompanyInfo> = {
  AAPL: {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide.',
    sector: 'Technology',
    industry: 'Consumer Electronics',
    marketCap: 2800000000000,
    peRatio: 29.45,
    dividendYield: 0.52,
    fiftyTwoWeekHigh: 199.62,
    fiftyTwoWeekLow: 164.08,
  },
  GOOGL: {
    symbol: 'GOOGL',
    name: 'Alphabet Inc.',
    description: 'Alphabet Inc. offers various products and platforms in the United States, Europe, the Middle East, Africa, the Asia-Pacific, Canada, and Latin America.',
    sector: 'Technology',
    industry: 'Internet Content & Information',
    marketCap: 1800000000000,
    peRatio: 27.32,
    dividendYield: 0,
    fiftyTwoWeekHigh: 153.78,
    fiftyTwoWeekLow: 121.46,
  },
};

/**
 * Fetches real-time stock quote from Alpha Vantage API
 * @param symbol - Stock symbol (e.g., 'AAPL', 'GOOGL')
 * @returns Stock quote data
 * @throws Error if API request fails
 */
export async function getStockQuote(symbol: string): Promise<StockQuote> {
  if (USE_MOCK_DATA || !symbol) {
    const mockData = MOCK_QUOTES[symbol.toUpperCase()];
    if (mockData) {
      return { ...mockData, timestamp: new Date().toISOString() };
    }
    return {
      symbol: symbol.toUpperCase(),
      price: 100 + Math.random() * 50,
      change: (Math.random() - 0.5) * 10,
      changePercent: (Math.random() - 0.5) * 5,
      volume: Math.floor(Math.random() * 10000000),
      timestamp: new Date().toISOString(),
    };
  }

  try {
    const params = new URLSearchParams({
      function: 'GLOBAL_QUOTE',
      symbol: symbol.toUpperCase(),
      apikey: API_KEY,
    });

    const response = await fetch(`${ALPHA_VANTAGE_BASE_URL}?${params}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data['Error Message']) {
      throw new Error(data['Error Message']);
    }

    if (data['Note']) {
      console.warn('Alpha Vantage API limit reached, using mock data');
      return getStockQuote(symbol);
    }

    const quote = data['Global Quote'];
    
    if (!quote || !quote['01. symbol']) {
      throw new Error('Invalid response from Alpha Vantage API');
    }

    return {
      symbol: quote['01. symbol'],
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
      volume: parseInt(quote['06. volume']),
      timestamp: quote['07. latest trading day'],
    };
  } catch (error) {
    console.error('Error fetching stock quote:', error);
    const mockData = MOCK_QUOTES[symbol.toUpperCase()];
    if (mockData) {
      return { ...mockData, timestamp: new Date().toISOString() };
    }
    throw error;
  }
}

/**
 * Fetches company overview information
 * @param symbol - Stock symbol
 * @returns Company information
 * @throws Error if API request fails
 */
export async function getCompanyInfo(symbol: string): Promise<CompanyInfo> {
  if (USE_MOCK_DATA || !symbol) {
    const mockData = MOCK_COMPANY_INFO[symbol.toUpperCase()];
    if (mockData) {
      return mockData;
    }
    return {
      symbol: symbol.toUpperCase(),
      name: `${symbol.toUpperCase()} Company`,
      description: 'Company description not available',
      sector: 'Technology',
      industry: 'Software',
      marketCap: 1000000000,
      peRatio: 25.0,
      dividendYield: 1.5,
      fiftyTwoWeekHigh: 150.0,
      fiftyTwoWeekLow: 80.0,
    };
  }

  try {
    const params = new URLSearchParams({
      function: 'OVERVIEW',
      symbol: symbol.toUpperCase(),
      apikey: API_KEY,
    });

    const response = await fetch(`${ALPHA_VANTAGE_BASE_URL}?${params}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data['Error Message']) {
      throw new Error(data['Error Message']);
    }

    if (data['Note']) {
      console.warn('Alpha Vantage API limit reached, using mock data');
      return getCompanyInfo(symbol);
    }

    if (!data.Symbol) {
      throw new Error('Invalid response from Alpha Vantage API');
    }

    return {
      symbol: data.Symbol,
      name: data.Name,
      description: data.Description,
      sector: data.Sector,
      industry: data.Industry,
      marketCap: parseFloat(data.MarketCapitalization),
      peRatio: parseFloat(data.PERatio),
      dividendYield: parseFloat(data.DividendYield) * 100,
      fiftyTwoWeekHigh: parseFloat(data['52WeekHigh']),
      fiftyTwoWeekLow: parseFloat(data['52WeekLow']),
    };
  } catch (error) {
    console.error('Error fetching company info:', error);
    const mockData = MOCK_COMPANY_INFO[symbol.toUpperCase()];
    if (mockData) {
      return mockData;
    }
    throw error;
  }
}

/**
 * Fetches historical time series data
 * @param symbol - Stock symbol
 * @param interval - Time interval ('daily', 'weekly', 'monthly')
 * @param outputSize - 'compact' (100 data points) or 'full' (20+ years)
 * @returns Array of time series data
 * @throws Error if API request fails
 */
export async function getTimeSeries(
  symbol: string,
  interval: 'daily' | 'weekly' | 'monthly' = 'daily',
  outputSize: 'compact' | 'full' = 'compact'
): Promise<TimeSeriesData[]> {
  if (USE_MOCK_DATA || !symbol) {
    return generateMockTimeSeries(30);
  }

  try {
    const functionMap = {
      daily: 'TIME_SERIES_DAILY',
      weekly: 'TIME_SERIES_WEEKLY',
      monthly: 'TIME_SERIES_MONTHLY',
    };

    const params = new URLSearchParams({
      function: functionMap[interval],
      symbol: symbol.toUpperCase(),
      outputsize: outputSize,
      apikey: API_KEY,
    });

    const response = await fetch(`${ALPHA_VANTAGE_BASE_URL}?${params}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data['Error Message']) {
      throw new Error(data['Error Message']);
    }

    if (data['Note']) {
      console.warn('Alpha Vantage API limit reached, using mock data');
      return generateMockTimeSeries(30);
    }

    const timeSeriesKey = Object.keys(data).find(key => key.includes('Time Series'));
    
    if (!timeSeriesKey) {
      throw new Error('Invalid response from Alpha Vantage API');
    }

    const timeSeries = data[timeSeriesKey];
    
    return Object.entries(timeSeries).map(([date, values]: [string, any]) => ({
      date,
      open: parseFloat(values['1. open']),
      high: parseFloat(values['2. high']),
      low: parseFloat(values['3. low']),
      close: parseFloat(values['4. close']),
      volume: parseInt(values['5. volume']),
    }));
  } catch (error) {
    console.error('Error fetching time series:', error);
    return generateMockTimeSeries(30);
  }
}

/**
 * Searches for stock symbols matching the query
 * @param query - Search query
 * @returns Array of matching symbols
 * @throws Error if API request fails
 */
export async function searchSymbols(query: string): Promise<SymbolSearchResult[]> {
  if (USE_MOCK_DATA || !query) {
    const mockResults: SymbolSearchResult[] = [
      { symbol: 'AAPL', name: 'Apple Inc.', type: 'Equity', region: 'United States', currency: 'USD' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'Equity', region: 'United States', currency: 'USD' },
      { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'Equity', region: 'United States', currency: 'USD' },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'Equity', region: 'United States', currency: 'USD' },
      { symbol: 'TSLA', name: 'Tesla Inc.', type: 'Equity', region: 'United States', currency: 'USD' },
    ];
    
    return mockResults.filter(result => 
      result.symbol.toLowerCase().includes(query.toLowerCase()) ||
      result.name.toLowerCase().includes(query.toLowerCase())
    );
  }

  try {
    const params = new URLSearchParams({
      function: 'SYMBOL_SEARCH',
      keywords: query,
      apikey: API_KEY,
    });

    const response = await fetch(`${ALPHA_VANTAGE_BASE_URL}?${params}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (data['Error Message']) {
      throw new Error(data['Error Message']);
    }

    if (data['Note']) {
      console.warn('Alpha Vantage API limit reached, using mock data');
      return searchSymbols(query);
    }

    const matches = data.bestMatches || [];
    
    return matches.map((match: any) => ({
      symbol: match['1. symbol'],
      name: match['2. name'],
      type: match['3. type'],
      region: match['4. region'],
      currency: match['8. currency'],
    }));
  } catch (error) {
    console.error('Error searching symbols:', error);
    return searchSymbols(query);
  }
}

/**
 * Generates mock time series data for development
 * @param days - Number of days to generate
 * @returns Array of mock time series data
 */
function generateMockTimeSeries(days: number): TimeSeriesData[] {
  const data: TimeSeriesData[] = [];
  let basePrice = 150;

  for (let i = days - 1; i >= 0; i--) {
    const date = new Date();
    date.setDate(date.getDate() - i);

    const change = (Math.random() - 0.5) * 10;
    basePrice += change;

    const open = basePrice + (Math.random() - 0.5) * 2;
    const close = basePrice + (Math.random() - 0.5) * 2;
    const high = Math.max(open, close) + Math.random() * 3;
    const low = Math.min(open, close) - Math.random() * 3;

    data.push({
      date: date.toISOString().split('T')[0],
      open: parseFloat(open.toFixed(2)),
      high: parseFloat(high.toFixed(2)),
      low: parseFloat(low.toFixed(2)),
      close: parseFloat(close.toFixed(2)),
      volume: Math.floor(Math.random() * 10000000) + 1000000,
    });
  }

  return data;
}
