/**
 * Spending Predictor Service
 * Uses TensorFlow.js for client-side ML predictions of future expenses
 */

import * as tf from '@tensorflow/tfjs';
import axios from 'axios';

export interface Transaction {
  amount: number;
  date: string;
  category: string;
  type: 'income' | 'expense';
}

export interface SpendingPrediction {
  month: string;
  total_predicted_expenses: number;
  by_category: Record<string, number>;
}

const ML_SERVICE_URL = import.meta.env.VITE_ML_SERVICE_URL || 'http://localhost:8000';

/**
 * Predict future expenses using the ML service backend
 * @param transactions - Historical transaction data
 * @returns Promise with spending predictions
 */
export async function predictExpenses(transactions: Transaction[]): Promise<SpendingPrediction[]> {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/api/ml/predict-expenses`, {
      transactions
    });
    
    return response.data.predictions || [];
  } catch (error) {
    console.error('Error predicting expenses:', error);
    throw new Error('Failed to predict expenses. Please try again later.');
  }
}

/**
 * Train a local TensorFlow.js model for spending prediction
 * This is a simple linear regression model for demonstration
 * @param transactions - Historical transaction data
 * @returns Trained model
 */
export async function trainLocalModel(transactions: Transaction[]): Promise<tf.LayersModel | null> {
  try {
    const expenses = transactions.filter(t => t.type === 'expense');
    
    if (expenses.length < 10) {
      throw new Error('Need at least 10 transactions to train a model');
    }
    
    // Prepare data: Convert dates to timestamps and amounts
    const dates = expenses.map(t => new Date(t.date).getTime());
    const amounts = expenses.map(t => t.amount);
    
    // Normalize data
    const dateMin = Math.min(...dates);
    const dateMax = Math.max(...dates);
    const amountMax = Math.max(...amounts);
    
    const normalizedDates = dates.map(d => (d - dateMin) / (dateMax - dateMin));
    const normalizedAmounts = amounts.map(a => a / amountMax);
    
    // Create tensors
    const xs = tf.tensor2d(normalizedDates, [normalizedDates.length, 1]);
    const ys = tf.tensor2d(normalizedAmounts, [normalizedAmounts.length, 1]);
    
    // Create a simple sequential model
    const model = tf.sequential({
      layers: [
        tf.layers.dense({ inputShape: [1], units: 10, activation: 'relu' }),
        tf.layers.dense({ units: 5, activation: 'relu' }),
        tf.layers.dense({ units: 1 })
      ]
    });
    
    // Compile the model
    model.compile({
      optimizer: tf.train.adam(0.01),
      loss: 'meanSquaredError',
      metrics: ['mae']
    });
    
    // Train the model
    await model.fit(xs, ys, {
      epochs: 50,
      batchSize: 8,
      verbose: 0,
      shuffle: true
    });
    
    // Clean up tensors
    xs.dispose();
    ys.dispose();
    
    return model;
  } catch (error) {
    console.error('Error training local model:', error);
    return null;
  }
}

/**
 * Use trained model to predict future spending
 * @param model - Trained TensorFlow.js model
 * @param daysAhead - Number of days to predict ahead
 * @returns Predicted amount
 */
export async function predictWithLocalModel(
  model: tf.LayersModel,
  currentDate: Date,
  daysAhead: number
): Promise<number> {
  try {
    const futureDate = new Date(currentDate);
    futureDate.setDate(futureDate.getDate() + daysAhead);
    
    // Normalize the future date (this should use the same normalization as training)
    const timestamp = futureDate.getTime();
    
    // Create input tensor
    const input = tf.tensor2d([timestamp], [1, 1]);
    
    // Make prediction
    const prediction = model.predict(input) as tf.Tensor;
    const value = (await prediction.data())[0];
    
    // Clean up
    input.dispose();
    prediction.dispose();
    
    return value;
  } catch (error) {
    console.error('Error making prediction with local model:', error);
    return 0;
  }
}

/**
 * Get spending trend analysis
 * @param transactions - Historical transaction data
 * @returns Trend analysis including average, growth rate, and forecast
 */
export function analyzeSpendingTrend(transactions: Transaction[]): {
  averageMonthlySpending: number;
  growthRate: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  forecast: number[];
} {
  const expenses = transactions.filter(t => t.type === 'expense');
  
  if (expenses.length === 0) {
    return {
      averageMonthlySpending: 0,
      growthRate: 0,
      trend: 'stable',
      forecast: []
    };
  }
  
  // Group by month
  const monthlyData: Record<string, number> = {};
  
  expenses.forEach(t => {
    const date = new Date(t.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyData[monthKey] = (monthlyData[monthKey] || 0) + t.amount;
  });
  
  const monthlySums = Object.values(monthlyData);
  const averageMonthlySpending = monthlySums.reduce((a, b) => a + b, 0) / monthlySums.length;
  
  // Calculate growth rate
  if (monthlySums.length < 2) {
    return {
      averageMonthlySpending,
      growthRate: 0,
      trend: 'stable',
      forecast: [averageMonthlySpending, averageMonthlySpending, averageMonthlySpending]
    };
  }
  
  const recentAvg = monthlySums.slice(-3).reduce((a, b) => a + b, 0) / Math.min(3, monthlySums.length);
  const oldAvg = monthlySums.slice(0, 3).reduce((a, b) => a + b, 0) / Math.min(3, monthlySums.length);
  const growthRate = oldAvg > 0 ? ((recentAvg - oldAvg) / oldAvg) * 100 : 0;
  
  let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
  if (growthRate > 5) trend = 'increasing';
  else if (growthRate < -5) trend = 'decreasing';
  
  // Simple forecast for next 3 months
  const forecast = Array.from({ length: 3 }, (_, i) => 
    averageMonthlySpending * (1 + (growthRate / 100) * (i + 1))
  );
  
  return {
    averageMonthlySpending,
    growthRate,
    trend,
    forecast
  };
}
