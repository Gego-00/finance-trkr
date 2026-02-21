import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database';
import { z } from 'zod';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  fullName: z.string().min(2),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export const register = async (req: Request, res: Response) => {
  try {
    console.log('Register request received:', { email: req.body.email });
    const { email, password, fullName } = registerSchema.parse(req.body);

    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({ error: 'Email already registered' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await query(
      'INSERT INTO users (email, password_hash, full_name) VALUES ($1, $2, $3) RETURNING id, email, full_name',
      [email, passwordHash, fullName]
    );

    const user = result.rows[0];

    await query(
      `INSERT INTO categories (user_id, name, type, color) VALUES
       ($1, 'Salary', 'income', '#10b981'),
       ($1, 'Freelance', 'income', '#3b82f6'),
       ($1, 'Food', 'expense', '#ef4444'),
       ($1, 'Transport', 'expense', '#f59e0b'),
       ($1, 'Entertainment', 'expense', '#8b5cf6'),
       ($1, 'Shopping', 'expense', '#ec4899'),
       ($1, 'Bills', 'expense', '#6366f1'),
       ($1, 'Other', 'expense', '#64748b')`,
      [user.id]
    );

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
      return res.status(400).json({ error: error.errors });
    }
    console.error('Register error:', error);
    console.error('Error stack:', (error as Error).stack);
    res.status(500).json({ error: 'Internal server error', details: (error as Error).message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    console.log('Login request received:', { email: req.body.email });
    const { email, password } = loginSchema.parse(req.body);

    const result = await query(
      'SELECT id, email, password_hash, full_name FROM users WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = result.rows[0];
    const validPassword = await bcrypt.compare(password, user.password_hash);

    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, email: user.email },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        fullName: user.full_name,
      },
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error('Validation error:', error.errors);
      return res.status(400).json({ error: error.errors });
    }
    console.error('Login error:', error);
    console.error('Error stack:', (error as Error).stack);
    res.status(500).json({ error: 'Internal server error', details: (error as Error).message });
  }
};
