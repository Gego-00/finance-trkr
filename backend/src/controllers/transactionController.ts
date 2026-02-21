import { Response } from 'express';
import { query } from '../config/database';
import { AuthRequest } from '../types';
import { z } from 'zod';

const transactionSchema = z.object({
  categoryId: z.number().optional(),
  type: z.enum(['income', 'expense']),
  amount: z.number().positive(),
  description: z.string().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const getTransactions = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { startDate, endDate, type } = req.query;

    let queryText = `
      SELECT t.*, c.name as category_name, c.color as category_color
      FROM transactions t
      LEFT JOIN categories c ON t.category_id = c.id
      WHERE t.user_id = $1
    `;
    const params: any[] = [userId];
    let paramIndex = 2;

    if (startDate) {
      queryText += ` AND t.date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      queryText += ` AND t.date <= $${paramIndex}`;
      params.push(endDate);
      paramIndex++;
    }

    if (type && (type === 'income' || type === 'expense')) {
      queryText += ` AND t.type = $${paramIndex}`;
      params.push(type);
      paramIndex++;
    }

    queryText += ' ORDER BY t.date DESC, t.created_at DESC';

    const result = await query(queryText, params);
    res.json(result.rows);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { categoryId, type, amount, description, date } = transactionSchema.parse(req.body);

    const result = await query(
      `INSERT INTO transactions (user_id, category_id, type, amount, description, date)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [userId, categoryId || null, type, amount, description || null, date]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Create transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;
    const { categoryId, type, amount, description, date } = transactionSchema.parse(req.body);

    const result = await query(
      `UPDATE transactions
       SET category_id = $1, type = $2, amount = $3, description = $4, date = $5, updated_at = CURRENT_TIMESTAMP
       WHERE id = $6 AND user_id = $7
       RETURNING *`,
      [categoryId || null, type, amount, description || null, date, id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    console.error('Update transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteTransaction = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { id } = req.params;

    const result = await query(
      'DELETE FROM transactions WHERE id = $1 AND user_id = $2 RETURNING id',
      [id, userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Transaction not found' });
    }

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user!.id;
    const { startDate, endDate } = req.query;

    let dateFilter = '';
    const params: any[] = [userId];
    let paramIndex = 2;

    if (startDate) {
      dateFilter += ` AND date >= $${paramIndex}`;
      params.push(startDate);
      paramIndex++;
    }

    if (endDate) {
      dateFilter += ` AND date <= $${paramIndex}`;
      params.push(endDate);
    }

    const summaryResult = await query(
      `SELECT
         SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
         SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expenses,
         COUNT(*) as total_transactions
       FROM transactions
       WHERE user_id = $1 ${dateFilter}`,
      params
    );

    const categoryResult = await query(
      `SELECT
         c.name,
         c.color,
         t.type,
         SUM(t.amount) as total
       FROM transactions t
       LEFT JOIN categories c ON t.category_id = c.id
       WHERE t.user_id = $1 ${dateFilter}
       GROUP BY c.name, c.color, t.type
       ORDER BY total DESC`,
      params
    );

    const monthlyResult = await query(
      `SELECT
         TO_CHAR(date, 'YYYY-MM') as month,
         type,
         SUM(amount) as total
       FROM transactions
       WHERE user_id = $1 ${dateFilter}
       GROUP BY month, type
       ORDER BY month ASC`,
      params
    );

    res.json({
      summary: summaryResult.rows[0],
      byCategory: categoryResult.rows,
      byMonth: monthlyResult.rows,
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
