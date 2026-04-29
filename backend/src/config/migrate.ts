import { query } from './database';
import pool from './database';

async function migrate() {
  console.log('Running migrations...');

  try {
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        full_name VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        name VARCHAR(100) NOT NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
        color VARCHAR(7),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
        type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
        amount DECIMAL(10, 2) NOT NULL,
        description TEXT,
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON transactions(user_id);
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
    `);

    await query(`
      CREATE TABLE IF NOT EXISTS savings_goals (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        target_percentage DECIMAL(5, 2) NOT NULL CHECK (target_percentage >= 0 AND target_percentage <= 100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id)
      );
    `);

    await query(`
      CREATE INDEX IF NOT EXISTS idx_savings_goals_user_id ON savings_goals(user_id);
    `);

    console.log('Migrations completed successfully!');
    await pool.end();
    process.exit(0);
  } catch (error) {
    console.error('Migration failed:', error);
    await pool.end();
    process.exit(1);
  }
}

migrate();
