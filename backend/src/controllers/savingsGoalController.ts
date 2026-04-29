import { Response } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../types';
import { z } from 'zod';

const savingsGoalSchema = z.object({
  targetPercentage: z.number().min(0).max(100),
});

export const getGoal = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;

    const result = await query(
      'SELECT * FROM savings_goals WHERE user_id = $1',
      [userId]
    );

    res.json(result.rows[0] || null);
  } catch (error) {
    console.error('Get savings goal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const upsertGoal = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { targetPercentage } = savingsGoalSchema.parse(req.body);

    // Check if goal already exists
    const existingGoal = await query(
      'SELECT id FROM savings_goals WHERE user_id = $1',
      [userId]
    );

    const result = await query(
      `INSERT INTO savings_goals (user_id, target_percentage)
       VALUES ($1, $2)
       ON CONFLICT (user_id)
       DO UPDATE SET target_percentage = EXCLUDED.target_percentage, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [userId, targetPercentage]
    );

    // Return 201 for new goals, 200 for updates
    const statusCode = existingGoal.rows.length === 0 ? 201 : 200;
    res.status(statusCode).json(result.rows[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Upsert savings goal error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getProgress = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const months = parseInt(req.query.months as string) || 6;

    const result = await query(
      `SELECT
        TO_CHAR(date, 'YYYY-MM') as month,
        SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
        SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses
      FROM transactions
      WHERE user_id = $1
        AND date >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month' * ($2 - 1)
      GROUP BY TO_CHAR(date, 'YYYY-MM')
      ORDER BY month`,
      [userId, months]
    );

    const progress = result.rows.map((row) => {
      const totalIncome = parseFloat(row.total_income);
      const totalExpenses = parseFloat(row.total_expenses);
      const savingsRate = totalIncome > 0
        ? ((totalIncome - totalExpenses) / totalIncome) * 100
        : 0;

      return {
        month: row.month,
        total_income: row.total_income,
        total_expenses: row.total_expenses,
        savings_rate: Math.round(savingsRate * 100) / 100,
      };
    });

    res.json(progress);
  } catch (error) {
    console.error('Get savings progress error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
