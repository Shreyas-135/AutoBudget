/**
 * Income Forecaster Service
 * Forecasts future income using time-series analysis
 */

import axios from 'axios';
import { Transaction } from './spendingPredictor';

export interface IncomeForecast {
  month: string;
  predicted_income: number;
  confidence_lower: number;
  confidence_upper: number;
}

const ML_SERVICE_URL = import.meta.env.VITE_ML_SERVICE_URL || 'http://localhost:8000';

/**
 * Forecast future income using the ML service
 * @param transactions - Historical transaction data
 * @returns Array of income forecasts
 */
export async function forecastIncome(transactions: Transaction[]): Promise<IncomeForecast[]> {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/api/ml/forecast-income`, {
      transactions
    });
    
    return response.data.forecast || [];
  } catch (error) {
    console.error('Error forecasting income:', error);
    throw new Error('Failed to forecast income. Please try again later.');
  }
}

/**
 * Client-side income forecasting using simple time-series methods
 * @param transactions - Historical transaction data
 * @param monthsAhead - Number of months to forecast
 * @returns Array of income forecasts
 */
export function forecastIncomeLocal(
  transactions: Transaction[],
  monthsAhead: number = 3
): IncomeForecast[] {
  const incomeTransactions = transactions.filter(t => t.type === 'income');
  
  if (incomeTransactions.length < 2) {
    return [];
  }
  
  // Group by month
  const monthlyIncome: Record<string, number> = {};
  
  incomeTransactions.forEach(t => {
    const date = new Date(t.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyIncome[monthKey] = (monthlyIncome[monthKey] || 0) + t.amount;
  });
  
  const sortedMonths = Object.keys(monthlyIncome).sort();
  const incomeValues = sortedMonths.map(m => monthlyIncome[m]);
  
  // Calculate average and trend
  const avgIncome = incomeValues.reduce((a, b) => a + b, 0) / incomeValues.length;
  
  // Simple linear trend
  const x = Array.from({ length: incomeValues.length }, (_, i) => i);
  const y = incomeValues;
  
  const n = x.length;
  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((sum, xi, i) => sum + xi * y[i], 0);
  const sumX2 = x.reduce((sum, xi) => sum + xi * xi, 0);
  
  const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  
  // Calculate standard deviation for confidence interval
  const predictions = x.map(xi => intercept + slope * xi);
  const residuals = y.map((yi, i) => yi - predictions[i]);
  const variance = residuals.reduce((sum, r) => sum + r * r, 0) / n;
  const stdDev = Math.sqrt(variance);
  
  // Generate forecasts
  const forecasts: IncomeForecast[] = [];
  const lastMonth = sortedMonths[sortedMonths.length - 1];
  let currentMonth = new Date(lastMonth + '-01');
  
  for (let i = 1; i <= monthsAhead; i++) {
    currentMonth.setMonth(currentMonth.getMonth() + 1);
    const monthStr = `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}`;
    
    const predictedIncome = intercept + slope * (n + i - 1);
    const confidenceMargin = 1.96 * stdDev; // 95% confidence interval
    
    forecasts.push({
      month: monthStr,
      predicted_income: Math.max(0, Math.round(predictedIncome)),
      confidence_lower: Math.max(0, Math.round(predictedIncome - confidenceMargin)),
      confidence_upper: Math.round(predictedIncome + confidenceMargin)
    });
  }
  
  return forecasts;
}

/**
 * Analyze income stability and patterns
 * @param transactions - Historical transaction data
 * @returns Income analysis metrics
 */
export function analyzeIncomeStability(transactions: Transaction[]): {
  averageMonthlyIncome: number;
  incomeVariability: number;
  isStable: boolean;
  trend: 'increasing' | 'decreasing' | 'stable';
  confidence: number;
} {
  const incomeTransactions = transactions.filter(t => t.type === 'income');
  
  if (incomeTransactions.length === 0) {
    return {
      averageMonthlyIncome: 0,
      incomeVariability: 0,
      isStable: false,
      trend: 'stable',
      confidence: 0
    };
  }
  
  // Group by month
  const monthlyIncome: Record<string, number> = {};
  
  incomeTransactions.forEach(t => {
    const date = new Date(t.date);
    const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    monthlyIncome[monthKey] = (monthlyIncome[monthKey] || 0) + t.amount;
  });
  
  const incomeValues = Object.values(monthlyIncome);
  const avgIncome = incomeValues.reduce((a, b) => a + b, 0) / incomeValues.length;
  
  // Calculate coefficient of variation (CV)
  const variance = incomeValues.reduce((sum, val) => sum + Math.pow(val - avgIncome, 2), 0) / incomeValues.length;
  const stdDev = Math.sqrt(variance);
  const coefficientOfVariation = avgIncome > 0 ? (stdDev / avgIncome) * 100 : 0;
  
  const isStable = coefficientOfVariation < 20; // Less than 20% variation is considered stable
  
  // Determine trend
  let trend: 'increasing' | 'decreasing' | 'stable' = 'stable';
  
  if (incomeValues.length >= 3) {
    const recentAvg = incomeValues.slice(-3).reduce((a, b) => a + b, 0) / 3;
    const olderAvg = incomeValues.slice(0, 3).reduce((a, b) => a + b, 0) / 3;
    const change = ((recentAvg - olderAvg) / olderAvg) * 100;
    
    if (change > 5) trend = 'increasing';
    else if (change < -5) trend = 'decreasing';
  }
  
  // Confidence based on data points and stability
  const dataPointsScore = Math.min(incomeValues.length / 12, 1); // More data = more confidence
  const stabilityScore = isStable ? 1 : 0.5;
  const confidence = Math.round((dataPointsScore * stabilityScore) * 100);
  
  return {
    averageMonthlyIncome: Math.round(avgIncome),
    incomeVariability: Math.round(coefficientOfVariation),
    isStable,
    trend,
    confidence
  };
}

/**
 * Predict income variability risk
 * @param transactions - Historical transaction data
 * @returns Risk assessment
 */
export function assessIncomeRisk(transactions: Transaction[]): {
  riskLevel: 'low' | 'medium' | 'high';
  riskFactors: string[];
  recommendation: string;
} {
  const analysis = analyzeIncomeStability(transactions);
  const riskFactors: string[] = [];
  
  if (!analysis.isStable) {
    riskFactors.push('High income variability detected');
  }
  
  if (analysis.trend === 'decreasing') {
    riskFactors.push('Income showing downward trend');
  }
  
  if (analysis.confidence < 50) {
    riskFactors.push('Insufficient data for reliable predictions');
  }
  
  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  let recommendation = 'Your income appears stable. Continue monitoring.';
  
  if (riskFactors.length >= 2) {
    riskLevel = 'high';
    recommendation = 'Consider building an emergency fund and creating additional income streams.';
  } else if (riskFactors.length === 1) {
    riskLevel = 'medium';
    recommendation = 'Monitor your income closely and consider diversifying income sources.';
  }
  
  return {
    riskLevel,
    riskFactors,
    recommendation
  };
}
