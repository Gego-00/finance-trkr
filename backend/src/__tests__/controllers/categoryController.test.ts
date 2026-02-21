import { Response } from 'express';
import {
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
} from '../../controllers/categoryController';
import * as database from '../../config/database';
import { mockAuthRequest, mockResponse } from '../utils/testHelpers';
import { AuthRequest } from '../../types';

jest.mock('../../config/database');

const mockQuery = database.query as jest.MockedFunction<typeof database.query>;

describe('Category Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getCategories', () => {
    it('should return all categories for user', async () => {
      const req = mockAuthRequest(1, 'test@example.com');
      const res = mockResponse();

      const mockCategories = [
        { id: 1, user_id: 1, name: 'Food', type: 'expense', color: '#ef4444' },
        { id: 2, user_id: 1, name: 'Salary', type: 'income', color: '#10b981' },
      ];

      mockQuery.mockResolvedValueOnce({ rows: mockCategories } as any);

      await getCategories(req as AuthRequest, res as Response);

      expect(res.json).toHaveBeenCalledWith(mockCategories);
      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT * FROM categories WHERE user_id = $1 ORDER BY type, name',
        [1]
      );
    });

    it('should return empty array if no categories', async () => {
      const req = mockAuthRequest(1, 'test@example.com');
      const res = mockResponse();

      mockQuery.mockResolvedValueOnce({ rows: [] } as any);

      await getCategories(req as AuthRequest, res as Response);

      expect(res.json).toHaveBeenCalledWith([]);
    });

    it('should return 500 on database error', async () => {
      const req = mockAuthRequest(1, 'test@example.com');
      const res = mockResponse();

      mockQuery.mockRejectedValueOnce(new Error('Database error'));

      await getCategories(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('createCategory', () => {
    it('should create a new category successfully', async () => {
      const req = mockAuthRequest(1, 'test@example.com', {
        body: {
          name: 'New Category',
          type: 'expense',
          color: '#3b82f6',
        },
      });
      const res = mockResponse();

      const mockCategory = {
        id: 1,
        user_id: 1,
        name: 'New Category',
        type: 'expense',
        color: '#3b82f6',
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockCategory] } as any);

      await createCategory(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockCategory);
    });

    it('should create category without color', async () => {
      const req = mockAuthRequest(1, 'test@example.com', {
        body: {
          name: 'New Category',
          type: 'income',
        },
      });
      const res = mockResponse();

      const mockCategory = {
        id: 1,
        user_id: 1,
        name: 'New Category',
        type: 'income',
        color: null,
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockCategory] } as any);

      await createCategory(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(mockCategory);
    });

    it('should return 400 for invalid input', async () => {
      const req = mockAuthRequest(1, 'test@example.com', {
        body: {
          name: '',
          type: 'invalid',
        },
      });
      const res = mockResponse();

      await createCategory(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it('should return 400 for invalid color format', async () => {
      const req = mockAuthRequest(1, 'test@example.com', {
        body: {
          name: 'Category',
          type: 'expense',
          color: 'invalid',
        },
      });
      const res = mockResponse();

      await createCategory(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('updateCategory', () => {
    it('should update category successfully', async () => {
      const req = mockAuthRequest(1, 'test@example.com', {
        params: { id: '1' },
        body: {
          name: 'Updated Category',
          type: 'expense',
          color: '#f59e0b',
        },
      });
      const res = mockResponse();

      const mockCategory = {
        id: 1,
        user_id: 1,
        name: 'Updated Category',
        type: 'expense',
        color: '#f59e0b',
      };

      mockQuery.mockResolvedValueOnce({ rows: [mockCategory] } as any);

      await updateCategory(req as AuthRequest, res as Response);

      expect(res.json).toHaveBeenCalledWith(mockCategory);
    });

    it('should return 404 if category not found', async () => {
      const req = mockAuthRequest(1, 'test@example.com', {
        params: { id: '999' },
        body: {
          name: 'Updated Category',
          type: 'expense',
          color: '#f59e0b',
        },
      });
      const res = mockResponse();

      mockQuery.mockResolvedValueOnce({ rows: [] } as any);

      await updateCategory(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Category not found' });
    });

    it('should return 400 for invalid input', async () => {
      const req = mockAuthRequest(1, 'test@example.com', {
        params: { id: '1' },
        body: {
          name: '',
          type: 'invalid',
        },
      });
      const res = mockResponse();

      await updateCategory(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });

  describe('deleteCategory', () => {
    it('should delete category successfully', async () => {
      const req = mockAuthRequest(1, 'test@example.com', {
        params: { id: '1' },
      });
      const res = mockResponse();

      mockQuery.mockResolvedValueOnce({ rows: [{ id: 1 }] } as any);

      await deleteCategory(req as AuthRequest, res as Response);

      expect(res.json).toHaveBeenCalledWith({ message: 'Category deleted successfully' });
    });

    it('should return 404 if category not found', async () => {
      const req = mockAuthRequest(1, 'test@example.com', {
        params: { id: '999' },
      });
      const res = mockResponse();

      mockQuery.mockResolvedValueOnce({ rows: [] } as any);

      await deleteCategory(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({ error: 'Category not found' });
    });

    it('should return 500 on database error', async () => {
      const req = mockAuthRequest(1, 'test@example.com', {
        params: { id: '1' },
      });
      const res = mockResponse();

      mockQuery.mockRejectedValueOnce(new Error('Database error'));

      await deleteCategory(req as AuthRequest, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });
});
