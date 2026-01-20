/**
 * Budget Recommender Service
 * Suggests budget adjustments based on spending trends
 */

import { Transaction } from './spendingPredictor';
import { analyzeSpendingTrend } from './spendingPredictor';

export interface BudgetRecommendation {
  category: string;
  currentBudget: number;
  recommendedBudget: number;
  reason: string;
  priority: 'high' | 'medium' | 'low';
  savingsPotential?: number;
}

/**
 * Generate budget recommendations based on spending patterns
 * @param transactions - Historical transaction data
 * @param currentBudgets - Current budget allocations by category
 * @returns Array of budget recommendations
 */
export function generateBudgetRecommendations(
  transactions: Transaction[],
  currentBudgets: Record<string, number>
): BudgetRecommendation[] {
  const recommendations: BudgetRecommendation[] = [];
  const expenses = transactions.filter(t => t.type === 'expense');
  
  if (expenses.length === 0) {
    return recommendations;
  }
  
  // Group spending by category
  const categorySpending: Record<string, number[]> = {};
  const monthlyCategory: Record<string, Record<string, number>> = {};
  
  expenses.forEach(t => {
    if (!categorySpending[t.category]) {
      categorySpending[t.category] = [];
    }
    
    const monthKey = new Date(t.date).toISOString().slice(0, 7);
    if (!monthlyCategory[monthKey]) {
      monthlyCategory[monthKey] = {};
    }
    monthlyCategory[monthKey][t.category] = 
      (monthlyCategory[monthKey][t.category] || 0) + t.amount;
  });
  
  // Calculate monthly averages for each category
  Object.entries(categorySpending).forEach(([category]) => {
    const monthlySums = Object.values(monthlyCategory)
      .map(month => month[category] || 0)
      .filter(val => val > 0);
    
    if (monthlySums.length === 0) return;
    
    const avgMonthlySpending = monthlySums.reduce((a, b) => a + b, 0) / monthlySums.length;
    const maxMonthlySpending = Math.max(...monthlySums);
    const currentBudget = currentBudgets[category] || 0;
    
    // Recommendation logic
    if (currentBudget === 0) {
      // No budget set - recommend based on average + buffer
      recommendations.push({
        category,
        currentBudget: 0,
        recommendedBudget: Math.ceil(avgMonthlySpending * 1.1),
        reason: 'No budget currently set. Recommended budget includes 10% buffer based on average spending.',
        priority: 'high'
      });
    } else if (avgMonthlySpending > currentBudget * 0.95) {
      // Spending near or over budget
      const overage = avgMonthlySpending - currentBudget;
      recommendations.push({
        category,
        currentBudget,
        recommendedBudget: Math.ceil(maxMonthlySpending * 1.05),
        reason: `Average spending ($${avgMonthlySpending.toFixed(2)}) exceeds current budget. Consider increasing by $${overage.toFixed(2)}.`,
        priority: 'high'
      });
    } else if (avgMonthlySpending < currentBudget * 0.7) {
      // Spending significantly under budget
      const savings = currentBudget - avgMonthlySpending;
      recommendations.push({
        category,
        currentBudget,
        recommendedBudget: Math.ceil(avgMonthlySpending * 1.15),
        reason: `Consistently under budget. Could reduce by $${savings.toFixed(2)} and allocate elsewhere.`,
        priority: 'medium',
        savingsPotential: savings
      });
    }
  });
  
  // Sort by priority
  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });
}

/**
 * Calculate optimal budget allocation across categories
 * @param transactions - Historical transaction data
 * @param totalBudget - Total available budget
 * @returns Optimal budget allocation by category
 */
export function calculateOptimalAllocation(
  transactions: Transaction[],
  totalBudget: number
): Record<string, number> {
  const expenses = transactions.filter(t => t.type === 'expense');
  
  if (expenses.length === 0) {
    return {};
  }
  
  // Calculate average monthly spending by category
  const categoryTotals: Record<string, number> = {};
  const monthsSet = new Set<string>();
  
  expenses.forEach(t => {
    const monthKey = new Date(t.date).toISOString().slice(0, 7);
    monthsSet.add(monthKey);
    categoryTotals[t.category] = (categoryTotals[t.category] || 0) + t.amount;
  });
  
  const numMonths = monthsSet.size || 1;
  const categoryAverages: Record<string, number> = {};
  
  Object.entries(categoryTotals).forEach(([category, total]) => {
    categoryAverages[category] = total / numMonths;
  });
  
  const totalAvgSpending = Object.values(categoryAverages).reduce((a, b) => a + b, 0);
  
  // Proportional allocation based on historical spending
  const allocation: Record<string, number> = {};
  
  Object.entries(categoryAverages).forEach(([category, avgSpending]) => {
    const proportion = avgSpending / totalAvgSpending;
    allocation[category] = Math.round(totalBudget * proportion);
  });
  
  return allocation;
}

/**
 * Analyze budget health across categories
 * @param transactions - Historical transaction data
 * @param budgets - Current budget allocations
 * @returns Health score and analysis
 */
export function analyzeBudgetHealth(
  transactions: Transaction[],
  budgets: Record<string, number>
): {
  overallScore: number;
  categoryScores: Record<string, number>;
  healthStatus: 'excellent' | 'good' | 'fair' | 'poor';
  issues: string[];
} {
  const expenses = transactions.filter(t => t.type === 'expense');
  const issues: string[] = [];
  const categoryScores: Record<string, number> = {};
  
  // Calculate spending vs budget for each category
  const categorySpending: Record<string, number> = {};
  
  expenses.forEach(t => {
    categorySpending[t.category] = (categorySpending[t.category] || 0) + t.amount;
  });
  
  let totalScore = 0;
  let categoriesWithBudget = 0;
  
  Object.entries(budgets).forEach(([category, budget]) => {
    const spent = categorySpending[category] || 0;
    const utilizationRate = budget > 0 ? (spent / budget) * 100 : 0;
    
    let score = 100;
    
    if (utilizationRate > 100) {
      score = Math.max(0, 100 - (utilizationRate - 100));
      issues.push(`${category}: Over budget by ${(utilizationRate - 100).toFixed(1)}%`);
    } else if (utilizationRate > 90) {
      score = 85;
    } else if (utilizationRate < 50) {
      score = 90; // Good, but could optimize
    }
    
    categoryScores[category] = Math.round(score);
    totalScore += score;
    categoriesWithBudget++;
  });
  
  const overallScore = categoriesWithBudget > 0 
    ? Math.round(totalScore / categoriesWithBudget) 
    : 100;
  
  let healthStatus: 'excellent' | 'good' | 'fair' | 'poor' = 'excellent';
  if (overallScore < 60) healthStatus = 'poor';
  else if (overallScore < 75) healthStatus = 'fair';
  else if (overallScore < 90) healthStatus = 'good';
  
  return {
    overallScore,
    categoryScores,
    healthStatus,
    issues
  };
}
