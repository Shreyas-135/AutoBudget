/**
 * Real-Time Stocks Service
 * WebSocket connection for real-time stock price updates
 */

import { io, Socket } from 'socket.io-client';

export interface StockPrice {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  timestamp: number;
}

export interface StockSubscription {
  symbol: string;
  onUpdate: (price: StockPrice) => void;
}

class RealtimeStockService {
  private socket: Socket | null = null;
  private subscriptions: Map<string, ((price: StockPrice) => void)[]> = new Map();
  private mockPrices: Map<string, number> = new Map();
  private mockIntervals: Map<string, NodeJS.Timeout> = new Map();

  constructor() {
    // Initialize mock prices for common stocks
    this.mockPrices.set('AAPL', 178.50);
    this.mockPrices.set('GOOGL', 142.30);
    this.mockPrices.set('MSFT', 415.20);
    this.mockPrices.set('AMZN', 178.90);
    this.mockPrices.set('TSLA', 238.45);
    this.mockPrices.set('META', 485.60);
    this.mockPrices.set('NVDA', 875.30);
  }

  /**
   * Connect to WebSocket service (or use mock data)
   * In production, this would connect to Polygon.io or similar service
   */
  connect(apiKey?: string): void {
    if (apiKey) {
      // Real WebSocket connection (commented out for now)
      /*
      this.socket = io('wss://socket.polygon.io/stocks', {
        transports: ['websocket'],
        auth: {
          apiKey: apiKey
        }
      });

      this.socket.on('connect', () => {
        console.log('Connected to stock WebSocket');
      });

      this.socket.on('stock_price', (data: any) => {
        const stockPrice: StockPrice = {
          symbol: data.sym,
          price: data.p,
          change: data.c,
          changePercent: data.cp,
          timestamp: Date.now()
        };
        this.notifySubscribers(data.sym, stockPrice);
      });
      */
    }

    // For now, use mock data
    console.log('Using mock stock data for real-time updates');
  }

  /**
   * Subscribe to real-time updates for a stock symbol
   */
  subscribe(symbol: string, callback: (price: StockPrice) => void): void {
    const upperSymbol = symbol.toUpperCase();
    
    if (!this.subscriptions.has(upperSymbol)) {
      this.subscriptions.set(upperSymbol, []);
    }
    
    this.subscriptions.get(upperSymbol)!.push(callback);

    // Start mock updates for this symbol
    if (!this.mockIntervals.has(upperSymbol)) {
      this.startMockUpdates(upperSymbol);
    }

    // If using real WebSocket
    if (this.socket?.connected) {
      this.socket.emit('subscribe', { symbol: upperSymbol });
    }
  }

  /**
   * Unsubscribe from a stock symbol
   */
  unsubscribe(symbol: string, callback: (price: StockPrice) => void): void {
    const upperSymbol = symbol.toUpperCase();
    const subscribers = this.subscriptions.get(upperSymbol);
    
    if (subscribers) {
      const index = subscribers.indexOf(callback);
      if (index > -1) {
        subscribers.splice(index, 1);
      }

      // If no more subscribers, stop updates
      if (subscribers.length === 0) {
        this.subscriptions.delete(upperSymbol);
        this.stopMockUpdates(upperSymbol);

        if (this.socket?.connected) {
          this.socket.emit('unsubscribe', { symbol: upperSymbol });
        }
      }
    }
  }

  /**
   * Disconnect from WebSocket service
   */
  disconnect(): void {
    // Stop all mock intervals
    this.mockIntervals.forEach((interval) => clearInterval(interval));
    this.mockIntervals.clear();

    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  /**
   * Get current price for a symbol (synchronous mock data)
   */
  getCurrentPrice(symbol: string): number | null {
    return this.mockPrices.get(symbol.toUpperCase()) || null;
  }

  /**
   * Notify all subscribers of a price update
   */
  private notifySubscribers(symbol: string, price: StockPrice): void {
    const subscribers = this.subscriptions.get(symbol);
    if (subscribers) {
      subscribers.forEach(callback => callback(price));
    }
  }

  /**
   * Start mock price updates for development/testing
   */
  private startMockUpdates(symbol: string): void {
    const basePrice = this.mockPrices.get(symbol) || 100;
    
    const interval = setInterval(() => {
      // Generate realistic price movement (-0.5% to +0.5%)
      const changePercent = (Math.random() - 0.5) * 1;
      const change = basePrice * (changePercent / 100);
      const newPrice = basePrice + change;
      
      // Update base price
      this.mockPrices.set(symbol, newPrice);

      const stockPrice: StockPrice = {
        symbol,
        price: newPrice,
        change,
        changePercent,
        timestamp: Date.now()
      };

      this.notifySubscribers(symbol, stockPrice);
    }, 5000); // Update every 5 seconds

    this.mockIntervals.set(symbol, interval);
  }

  /**
   * Stop mock updates for a symbol
   */
  private stopMockUpdates(symbol: string): void {
    const interval = this.mockIntervals.get(symbol);
    if (interval) {
      clearInterval(interval);
      this.mockIntervals.delete(symbol);
    }
  }
}

// Singleton instance
export const realtimeStockService = new RealtimeStockService();

/**
 * Hook-like function to subscribe to a stock
 */
export function subscribeToStock(
  symbol: string,
  onUpdate: (price: StockPrice) => void
): () => void {
  realtimeStockService.subscribe(symbol, onUpdate);
  
  // Return cleanup function
  return () => {
    realtimeStockService.unsubscribe(symbol, onUpdate);
  };
}
