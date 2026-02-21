import { Response } from 'express';
import {
  getTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  getAnalytics,
} from '../../controllers/transactionController';
import * as database from '../../config/database';
import { mockAuthRequest, mockResponse } from '../utils/testHelpers';
import { AuthRequest } from '../../types';

jest.mock('../../config/database');

const mockQuery = database.query as jest.MockedFunction<typeof database.query>;

describe('Transaction Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getTransactions', () => {
    it('should return all transactions for user', async () => {
      const req = mockAuthRequest(1, 'test@example.com', {
        query: {},
      });
      const res = mockResponse();

      const mockTransactions = [
        {
          id: 1,
          user_id: 1,
          type: 'expense',
          amount: '100.00',
          date: '2024-01-01',
          category_name: 'Food',
        },
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockTransactions } as any);

      await getTransactions(req as AuthRequest, res as Response);

      expect(res.json).toHaveBeenCalledWith(mockTransactions);
    });

    it('should filter transactions by date range', async () => {
      const req = mockAuthRequest(1, 'test@example.com', {
        query: { startDate: '2024-01-01', endDate: '2024-01-31' },
      });
      const res = mockResponse();

      mockQuery.mockResolvedValueOnce({ rows: [] } as any);

      await getTransactions(req as AuthRequest, res as Response);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('t.date >= $2'),
        expect.arrayContaining([1, '2024-01-01', '2024-01-31'])
      );
    });

    it('should filter transactions by type', async () => {
      const req = mockAuthRequest(1, 'test@example.com', {
        query: { type: 'income' },
      });
      const res = mockResponse();

      mockQuery.mockResolvedValueOnce({ rows: [] } as any);

      await getTransactions(req as AuthRequest, res as Response);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('t.type = $2'),
        expect.arrayContaining([1, 'income'])
      );
    });

    it('should return 500 on database error', async () => {
      const req = mockAuthRequest(1, 'test@example.com', { query: {} });
      const res = mockResponse();

      mockQuery.mockRejectedValueOnce(new Error('Database error'));

      await getTransactions(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe('createTransaction', () => {
    it('should create transaction successfully', async () => {
      const req = mockAuthRequest(1, 'test@example.com', {
        body: {
          type: 'expense',
          categoryId: 1,
          amount: 50.5,
          description: 'Lunch',
          date: '2024-01-15',
        },
      });
      const res = mockResponse();

      const mockTransaction = {
        id: 1,
        user_id: 1,
        type: 'expense',
        amount: '50.50',
        date: '2024-01-15',
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockTransaction] } as any);

      await createTransaction(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockTransaction);
    });

    it('should create transaction without category', async () => {
      const req = mockAuthRequest(1, 'test@example.com', {
        body: {
          type: 'income',
          amount: 1000,
          date: '2024-01-01',
        },
      });
      const res = mockResponse();

      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }] } as any);

      await createTransaction(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(mockQuery).toHaveBeenCalledWith(
        expect.any(String),
        expect.arrayContaining([1, null, 'income', 1000, null, '2024-01-01'])
      );
    });

    it('should return 400 for invalid input', async () => {
      const req = mockAuthRequest(1, 'test@example.com', {
        body: {
          type: 'invalid',
          amount: -10,
        },
      });
      const res = mockResponse();

      await createTransaction(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('updateTransaction', () => {
    it('should update transaction successfully', async () => {
      const req = mockAuthRequest(1, 'test@example.com', {
        params: { id: '1' },
        body: {
          type: 'expense',
          amount: 75.0,
          description: 'Updated',
          date: '2024-01-20',
        },
      });
      const res = mockResponse();

      const mockTransaction = { id: 1, amount: '75.00' };
      mockQuery.mockResolvedValueOnce({ rows: [mockTransaction] } as any);

      await updateTransaction(req as AuthRequest, res as Response);

      expect(res.json).toHaveBeenCalledWith(mockTransaction);
    });

    it('should return 404 if transaction not found', async () => {
      const req = mockAuthRequest(1, 'test@example.com', {
        params: { id: '999' },
        body: {
          type: 'expense',
          amount: 75.0,
          date: '2024-01-20',
        },
      });
      const res = mockResponse();

      mockQuery.mockResolvedValueOnce({ rows: [] } as any);

      await updateTransaction(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Transaction not found' });
    });
  });

  describe('deleteTransaction', () => {
    it('should delete transaction successfully', async () => {
      const req = mockAuthRequest(1, 'test@example.com', {
        params: { id: '1' },
      });
      const res = mockResponse();

      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }] } as any);

      await deleteTransaction(req as AuthRequest, res as Response);

      expect(res.json).toHaveBeenCalledWith({ message: 'Transaction deleted successfully' });
    });

    it('should return 404 if transaction not found', async () => {
      const req = mockAuthRequest(1, 'test@example.com', {
        params: { id: '999' },
      });
      const res = mockResponse();

      mockQuery.mockResolvedValueOnce({ rows: [] } as any);

      await deleteTransaction(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
    });
  });

  describe('getAnalytics', () => {
    it('should return analytics successfully', async () => {
      const req = mockAuthRequest(1, 'test@example.com', {
        query: {},
      });
      const res = mockResponse();

      const mockSummary = {
        total_income: '1000.00',
        total_expenses: '500.00',
        total_transactions: '10',
      };
      const mockByCategory = [
        { name: 'Food', color: '#ef4444', type: 'expense', total: '200.00' },
      ];
      const mockByMonth = [{ month: '2024-01', type: 'expense', total: '500.00' }];

      mockQuery
        .mockResolvedValueOnce({ rows: [mockSummary] } as any)
        .mockResolvedValueOnce({ rows: mockByCategory } as any)
        .mockResolvedValueOnce({ rows: mockByMonth } as any);

      await getAnalytics(req as AuthRequest, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        summary: mockSummary,
        byCategory: mockByCategory,
        byMonth: mockByMonth,
      });
    });

    it('should filter analytics by date range', async () => {
      const req = mockAuthRequest(1, 'test@example.com', {
        query: { startDate: '2024-01-01', endDate: '2024-01-31' },
      });
      const res = mockResponse();

      mockQuery
        .mockResolvedValueOnce({ rows: [{}] } as any)
        .mockResolvedValueOnce({ rows: [] } as any)
        .mockResolvedValueOnce({ rows: [] } as any);

      await getAnalytics(req as AuthRequest, res as Response);

      expect(mockQuery).toHaveBeenCalledTimes(3);
    });

    it('should return 500 on database error', async () => {
      const req = mockAuthRequest(1, 'test@example.com', { query: {} });
      const res = mockResponse();

      mockQuery.mockRejectedValueOnce(new Error('Database error'));

      await getAnalytics(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});
