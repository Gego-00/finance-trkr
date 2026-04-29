import { useState, useEffect } from 'react';
import { savingsGoalsApi } from '@/lib/api';
import Layout from '@/components/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Target, TrendingUp, TrendingDown, Percent } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { formatCurrency } from '@/lib/utils';
import SavingsGoalDialog from '@/components/SavingsGoalDialog';
import type { SavingsGoal, SavingsProgress } from '@/types';
import { format } from 'date-fns';

export default function SavingsGoals() {
  const [goal, setGoal] = useState<SavingsGoal | null>(null);
  const [progress, setProgress] = useState<SavingsProgress[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const currentMonth = new Date();
  const currentMonthKey = format(currentMonth, 'yyyy-MM');

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setIsLoading(true);
      const [goalRes, progressRes] = await Promise.all([
        savingsGoalsApi.getGoal(),
        savingsGoalsApi.getProgress(6),
      ]);

      setGoal(goalRes.data);
      setProgress(progressRes.data || []);
    } catch (error) {
      console.error('Failed to load savings data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    loadData();
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full">
          <div className="text-lg">Loading...</div>
        </div>
      </Layout>
    );
  }

  const targetPercentage = goal ? parseFloat(goal.target_percentage) : 0;
  const currentMonthData = progress.find((p) => p.month === currentMonthKey);
  const currentSavingsRate = currentMonthData?.savings_rate ?? 0;
  const currentIncome = parseFloat(currentMonthData?.total_income || '0');
  const currentExpenses = parseFloat(currentMonthData?.total_expenses || '0');

  const getStatus = (rate: number) => {
    if (!goal) return { label: 'No target set', color: 'text-muted-foreground' };
    if (rate >= targetPercentage) return { label: 'On track', color: 'text-green-600' };
    if (rate >= targetPercentage * 0.75) return { label: 'Almost there', color: 'text-yellow-600' };
    return { label: 'Behind', color: 'text-red-600' };
  };

  const status = getStatus(currentSavingsRate);

  const chartData = progress.map((p) => {
    const [year, month] = p.month.split('-');
    const date = new Date(parseInt(year), parseInt(month) - 1);
    return {
      month: format(date, 'MMM yyyy'),
      'Savings Rate': p.savings_rate,
      Target: targetPercentage,
    };
  });

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">Savings Goals</h1>
            <p className="text-muted-foreground">
              Track your monthly savings rate for {format(currentMonth, 'MMMM yyyy')}
            </p>
          </div>
          <Button onClick={() => setIsDialogOpen(true)}>
            <Target className="h-4 w-4 mr-2" />
            {goal ? 'Update Target' : 'Set Target'}
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Current Savings Rate</CardTitle>
              <Percent className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${currentSavingsRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {currentSavingsRate.toFixed(1)}%
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {formatCurrency(currentIncome - currentExpenses)} saved this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Target Rate</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {goal ? `${targetPercentage.toFixed(1)}%` : 'Not set'}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {goal
                  ? `Save ${formatCurrency(currentIncome * targetPercentage / 100)} of income`
                  : 'Click "Set Target" to configure'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Status</CardTitle>
              {currentSavingsRate >= targetPercentage ? (
                <TrendingUp className="h-4 w-4 text-green-600" />
              ) : (
                <TrendingDown className="h-4 w-4 text-red-600" />
              )}
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${status.color}`}>
                {status.label}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {goal
                  ? `${Math.abs(currentSavingsRate - targetPercentage).toFixed(1)}% ${currentSavingsRate >= targetPercentage ? 'above' : 'below'} target`
                  : 'Set a target to track progress'}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Savings Rate Trend</CardTitle>
            <CardDescription>Your savings rate over the last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            {chartData.length === 0 ? (
              <div className="flex items-center justify-center h-[300px] text-muted-foreground">
                No transaction data available. Add transactions to see your savings rate.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis domain={[0, 100]} tickFormatter={(value) => `${value}%`} />
                  <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="Savings Rate"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6', strokeWidth: 2 }}
                  />
                  {goal && (
                    <ReferenceLine
                      y={targetPercentage}
                      stroke="#10b981"
                      strokeDasharray="5 5"
                      label={{ value: `Target: ${targetPercentage}%`, position: 'right', fill: '#10b981' }}
                    />
                  )}
                </LineChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Monthly Breakdown</CardTitle>
            <CardDescription>Detailed savings rate per month</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Month</TableHead>
                  <TableHead className="text-right">Income</TableHead>
                  <TableHead className="text-right">Expenses</TableHead>
                  <TableHead className="text-right">Saved</TableHead>
                  <TableHead className="text-right">Savings Rate</TableHead>
                  <TableHead className="text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {progress.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground">
                      No data yet. Add income and expense transactions to track your savings rate.
                    </TableCell>
                  </TableRow>
                ) : (
                  [...progress].reverse().map((row) => {
                    const income = parseFloat(row.total_income);
                    const expenses = parseFloat(row.total_expenses);
                    const saved = income - expenses;
                    const rowStatus = getStatus(row.savings_rate);
                    const [year, month] = row.month.split('-');
                    const date = new Date(parseInt(year), parseInt(month) - 1);

                    return (
                      <TableRow key={row.month}>
                        <TableCell className="font-medium">{format(date, 'MMMM yyyy')}</TableCell>
                        <TableCell className="text-right text-green-600">
                          {formatCurrency(income)}
                        </TableCell>
                        <TableCell className="text-right text-red-600">
                          {formatCurrency(expenses)}
                        </TableCell>
                        <TableCell className={`text-right font-medium ${saved >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {formatCurrency(saved)}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          {row.savings_rate.toFixed(1)}%
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            rowStatus.label === 'On track'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : rowStatus.label === 'Almost there'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : rowStatus.label === 'Behind'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                              : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                          }`}>
                            {rowStatus.label}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <SavingsGoalDialog
        open={isDialogOpen}
        onClose={handleDialogClose}
        goal={goal}
      />
    </Layout>
  );
}
