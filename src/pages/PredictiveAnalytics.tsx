/**
 * Predictive Analytics Page
 * Displays ML-powered predictions and insights for spending and income
 */

import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layout/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Brain, TrendingUp, AlertTriangle, Lightbulb, DollarSign } from "lucide-react";
import { predictExpenses, analyzeSpendingTrend, Transaction, SpendingPrediction } from "@/services/ml/spendingPredictor";
import { detectAnomalies, Anomaly, getAnomalyStatistics } from "@/services/ml/anomalyDetector";
import { generateBudgetRecommendations, BudgetRecommendation, analyzeBudgetHealth } from "@/services/ml/budgetRecommender";
import { forecastIncomeLocal, IncomeForecast, analyzeIncomeStability } from "@/services/ml/incomeForecaster";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useToast } from "@/hooks/use-toast";

export default function PredictiveAnalytics() {
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Record<string, number>>({});
  const [predictions, setPredictions] = useState<SpendingPrediction[]>([]);
  const [anomalies, setAnomalies] = useState<Anomaly[]>([]);
  const [recommendations, setRecommendations] = useState<BudgetRecommendation[]>([]);
  const [incomeForecast, setIncomeForecast] = useState<IncomeForecast[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Load transactions
      const { data: transData, error: transError } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", user.id)
        .order("date", { ascending: false });

      if (transError) throw transError;

      const formattedTrans: Transaction[] = (transData || []).map(t => ({
        amount: parseFloat(t.amount.toString()),
        date: t.date,
        category: t.category || 'Other',
        type: t.type as 'income' | 'expense'
      }));

      setTransactions(formattedTrans);

      // Load budgets
      const { data: budgetData } = await supabase
        .from("budgets")
        .select("*")
        .eq("user_id", user.id);

      const budgetMap: Record<string, number> = {};
      (budgetData || []).forEach(b => {
        budgetMap[b.category] = parseFloat(b.amount.toString());
      });
      setBudgets(budgetMap);

      // Run ML analysis
      if (formattedTrans.length >= 3) {
        await runMLAnalysis(formattedTrans, budgetMap);
      }
    } catch (error) {
      console.error("Error loading data:", error);
      toast({
        title: "Error",
        description: "Failed to load data. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const runMLAnalysis = async (trans: Transaction[], budgetMap: Record<string, number>) => {
    try {
      // Get predictions from ML service (with fallback to local analysis)
      try {
        const preds = await predictExpenses(trans);
        setPredictions(preds);
      } catch {
        // Fallback to local analysis
        const trend = analyzeSpendingTrend(trans);
        const localPreds: SpendingPrediction[] = trend.forecast.map((amount, i) => ({
          month: `Month ${i + 1}`,
          total_predicted_expenses: amount,
          by_category: {}
        }));
        setPredictions(localPreds);
      }

      // Detect anomalies
      const detectedAnomalies = await detectAnomalies(trans).catch(() => []);
      setAnomalies(detectedAnomalies);

      // Generate recommendations
      const recs = generateBudgetRecommendations(trans, budgetMap);
      setRecommendations(recs);

      // Forecast income
      const forecast = forecastIncomeLocal(trans, 3);
      setIncomeForecast(forecast);
    } catch (error) {
      console.error("Error running ML analysis:", error);
    }
  };

  const spendingTrend = analyzeSpendingTrend(transactions);
  const anomalyStats = getAnomalyStatistics(anomalies);
  const budgetHealth = analyzeBudgetHealth(transactions, budgets);
  const incomeAnalysis = analyzeIncomeStability(transactions);

  if (loading) {
    return (
      <MainLayout>
        <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading predictive analytics...</div>
        </div>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Brain className="h-8 w-8 text-purple-600" />
          <div>
            <h1 className="text-3xl font-bold">Predictive Analytics</h1>
            <p className="text-muted-foreground">AI-powered insights for your financial future</p>
          </div>
        </div>

        {transactions.length < 3 && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Insufficient Data</AlertTitle>
            <AlertDescription>
              Add at least 3 transactions to enable predictive analytics features.
            </AlertDescription>
          </Alert>
        )}

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Budget Health</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{budgetHealth.overallScore}/100</div>
              <p className="text-xs text-muted-foreground capitalize">{budgetHealth.healthStatus}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Anomalies Detected</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{anomalyStats.totalAnomalies}</div>
              <p className="text-xs text-muted-foreground">
                {anomalyStats.highSeverity} high severity
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Spending Trend</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{spendingTrend.trend}</div>
              <p className="text-xs text-muted-foreground">
                {spendingTrend.growthRate > 0 ? '+' : ''}{spendingTrend.growthRate.toFixed(1)}% change
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Income Stability</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold capitalize">{incomeAnalysis.isStable ? 'Stable' : 'Variable'}</div>
              <p className="text-xs text-muted-foreground">
                {incomeAnalysis.confidence}% confidence
              </p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="predictions" className="space-y-4">
          <TabsList>
            <TabsTrigger value="predictions">Predictions</TabsTrigger>
            <TabsTrigger value="anomalies">Anomalies</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
            <TabsTrigger value="income">Income Forecast</TabsTrigger>
          </TabsList>

          <TabsContent value="predictions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Expense Forecast</CardTitle>
                <CardDescription>Predicted expenses for the next 3 months</CardDescription>
              </CardHeader>
              <CardContent>
                {predictions.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={predictions}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="total_predicted_expenses" stroke="#8884d8" fill="#8884d8" />
                    </AreaChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground">No predictions available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Spending Trend Analysis</CardTitle>
                <CardDescription>Your spending patterns over time</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Average Monthly</p>
                    <p className="text-2xl font-bold">${spendingTrend.averageMonthlySpending.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Growth Rate</p>
                    <p className="text-2xl font-bold">{spendingTrend.growthRate.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Trend</p>
                    <p className="text-2xl font-bold capitalize">{spendingTrend.trend}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="anomalies" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Unusual Spending Detected</CardTitle>
                <CardDescription>Transactions that deviate from your normal patterns</CardDescription>
              </CardHeader>
              <CardContent>
                {anomalies.length > 0 ? (
                  <div className="space-y-3">
                    {anomalies.slice(0, 10).map((anomaly, idx) => (
                      <Alert key={idx} variant={anomaly.severity === 'high' ? 'destructive' : 'default'}>
                        <AlertTriangle className="h-4 w-4" />
                        <AlertTitle className="capitalize">{anomaly.severity} Severity - {anomaly.category}</AlertTitle>
                        <AlertDescription>
                          ${anomaly.amount.toFixed(2)} on {new Date(anomaly.date).toLocaleDateString()}
                          <br />
                          Expected range: ${anomaly.expected_range.min.toFixed(2)} - ${anomaly.expected_range.max.toFixed(2)}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No anomalies detected</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Budget Recommendations</CardTitle>
                <CardDescription>AI-suggested adjustments to optimize your budget</CardDescription>
              </CardHeader>
              <CardContent>
                {recommendations.length > 0 ? (
                  <div className="space-y-3">
                    {recommendations.map((rec, idx) => (
                      <Alert key={idx}>
                        <Lightbulb className="h-4 w-4" />
                        <AlertTitle className="capitalize">{rec.priority} Priority - {rec.category}</AlertTitle>
                        <AlertDescription>
                          <p className="mb-2">{rec.reason}</p>
                          <p className="font-semibold">
                            Recommended: ${rec.recommendedBudget.toFixed(2)} 
                            {rec.currentBudget > 0 && ` (currently $${rec.currentBudget.toFixed(2)})`}
                          </p>
                          {rec.savingsPotential && (
                            <p className="text-green-600 mt-1">
                              Potential savings: ${rec.savingsPotential.toFixed(2)}/month
                            </p>
                          )}
                        </AlertDescription>
                      </Alert>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">No recommendations available</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="income" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Income Forecast</CardTitle>
                <CardDescription>Predicted income for the next 3 months</CardDescription>
              </CardHeader>
              <CardContent>
                {incomeForecast.length > 0 ? (
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={incomeForecast}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="predicted_income" fill="#82ca9d" name="Predicted Income" />
                      <Bar dataKey="confidence_upper" fill="#8dd1e1" name="Upper Bound" />
                      <Bar dataKey="confidence_lower" fill="#ffc658" name="Lower Bound" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-muted-foreground">No income forecast available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Income Stability Analysis</CardTitle>
                <CardDescription>Assessment of your income patterns</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-3">
                  <div>
                    <p className="text-sm text-muted-foreground">Average Monthly</p>
                    <p className="text-2xl font-bold">${incomeAnalysis.averageMonthlyIncome.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Variability</p>
                    <p className="text-2xl font-bold">{incomeAnalysis.incomeVariability.toFixed(1)}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Trend</p>
                    <p className="text-2xl font-bold capitalize">{incomeAnalysis.trend}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
}
