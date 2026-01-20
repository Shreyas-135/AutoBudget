/**
 * Anomaly Detector Service
 * Detects unusual spending patterns using statistical methods
 */

import axios from 'axios';
import { Transaction } from './spendingPredictor';

export interface Anomaly {
  date: string;
  amount: number;
  category: string;
  z_score: number;
  expected_range: {
    min: number;
    max: number;
  };
  severity: 'high' | 'medium' | 'low';
}

const ML_SERVICE_URL = import.meta.env.VITE_ML_SERVICE_URL || 'http://localhost:8000';

/**
 * Detect anomalies in transaction data using the ML service
 * @param transactions - Historical transaction data
 * @returns Array of detected anomalies
 */
export async function detectAnomalies(transactions: Transaction[]): Promise<Anomaly[]> {
  try {
    const response = await axios.post(`${ML_SERVICE_URL}/api/ml/detect-anomalies`, {
      transactions
    });
    
    return response.data.anomalies || [];
  } catch (error) {
    console.error('Error detecting anomalies:', error);
    throw new Error('Failed to detect anomalies. Please try again later.');
  }
}

/**
 * Client-side anomaly detection using z-score method
 * @param transactions - Historical transaction data
 * @returns Array of detected anomalies
 */
export function detectAnomaliesLocal(transactions: Transaction[]): Anomaly[] {
  const expenses = transactions.filter(t => t.type === 'expense');
  
  if (expenses.length < 5) {
    return [];
  }
  
  const anomalies: Anomaly[] = [];
  
  // Group by category
  const categoryMap: Record<string, Transaction[]> = {};
  expenses.forEach(t => {
    if (!categoryMap[t.category]) {
      categoryMap[t.category] = [];
    }
    categoryMap[t.category].push(t);
  });
  
  // Detect anomalies for each category
  Object.entries(categoryMap).forEach(([category, categoryTransactions]) => {
    if (categoryTransactions.length < 3) return;
    
    const amounts = categoryTransactions.map(t => t.amount);
    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const variance = amounts.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / amounts.length;
    const stdDev = Math.sqrt(variance);
    
    if (stdDev === 0) return;
    
    categoryTransactions.forEach(t => {
      const zScore = Math.abs((t.amount - mean) / stdDev);
      
      if (zScore > 2) {
        anomalies.push({
          date: t.date,
          amount: t.amount,
          category: t.category,
          z_score: zScore,
          expected_range: {
            min: mean - 2 * stdDev,
            max: mean + 2 * stdDev
          },
          severity: zScore > 3 ? 'high' : 'medium'
        });
      }
    });
  });
  
  return anomalies.sort((a, b) => b.z_score - a.z_score);
}

/**
 * Get anomaly statistics
 * @param anomalies - Array of detected anomalies
 * @returns Statistics about the anomalies
 */
export function getAnomalyStatistics(anomalies: Anomaly[]): {
  totalAnomalies: number;
  highSeverity: number;
  mediumSeverity: number;
  totalAnomalousAmount: number;
  mostCommonCategory: string | null;
} {
  if (anomalies.length === 0) {
    return {
      totalAnomalies: 0,
      highSeverity: 0,
      mediumSeverity: 0,
      totalAnomalousAmount: 0,
      mostCommonCategory: null
    };
  }
  
  const categoryCount: Record<string, number> = {};
  let totalAmount = 0;
  let highCount = 0;
  let mediumCount = 0;
  
  anomalies.forEach(a => {
    totalAmount += a.amount;
    if (a.severity === 'high') highCount++;
    else if (a.severity === 'medium') mediumCount++;
    
    categoryCount[a.category] = (categoryCount[a.category] || 0) + 1;
  });
  
  const mostCommonCategory = Object.entries(categoryCount)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || null;
  
  return {
    totalAnomalies: anomalies.length,
    highSeverity: highCount,
    mediumSeverity: mediumCount,
    totalAnomalousAmount: totalAmount,
    mostCommonCategory
  };
}
