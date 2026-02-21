import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { register, login } from '../../controllers/authController';
import * as database from '../../config/database';
import { mockRequest, mockResponse } from '../utils/testHelpers';

jest.mock('../../config/database');
jest.mock('bcryptjs');
jest.mock('jsonwebtoken');

const mockQuery = database.query as jest.MockedFunction<typeof database.query>;
const mockBcryptHash = bcrypt.hash as jest.MockedFunction<typeof bcrypt.hash>;
const mockBcryptCompare = bcrypt.compare as jest.MockedFunction<typeof bcrypt.compare>;
const mockJwtSign = jwt.sign as jest.MockedFunction<typeof jwt.sign>;

describe('Auth Controller', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user successfully', async () => {
      const req = mockRequest({
        body: {
          email: 'test@example.com',
          password: 'password123',
          fullName: 'Test User',
        },
      });
      const res = mockResponse();

      mockQuery
        .mockResolvedValueOnce({ rows: [] } as any) // Check existing user
        .mockResolvedValueOnce({
          rows: [{ id: 1, email: 'test@example.com', full_name: 'Test User' }],
        } as any) // Insert user
        .mockResolvedValueOnce({ rows: [] } as any); // Insert categories

      mockBcryptHash.mockResolvedValue('hashedPassword' as never);
      mockJwtSign.mockReturnValue('token123' as never);

      await register(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith({
        token: 'token123',
        user: {
          id: 1,
          email: 'test@example.com',
          fullName: 'Test User',
        },
      });
    });

    it('should return 400 if email already exists', async () => {
      const req = mockRequest({
        body: {
          email: 'existing@example.com',
          password: 'password123',
          fullName: 'Test User',
        },
      });
      const res = mockResponse();

      mockQuery.mockResolvedValueOnce({
        rows: [{ id: 1 }],
      } as any);

      await register(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({ error: 'Email already registered' });
    });

    it('should return 400 for invalid input', async () => {
      const req = mockRequest({
        body: {
          email: 'invalid-email',
          password: '123',
          fullName: 'T',
        },
      });
      const res = mockResponse();

      await register(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalled();
    });

    it('should return 500 on database error', async () => {
      const req = mockRequest({
        body: {
          email: 'test@example.com',
          password: 'password123',
          fullName: 'Test User',
        },
      });
      const res = mockResponse();

      mockQuery.mockRejectedValueOnce(new Error('Database error'));

      await register(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Internal server error' })
      );
    });
  });

  describe('login', () => {
    it('should login user successfully', async () => {
      const req = mockRequest({
        body: {
          email: 'test@example.com',
          password: 'password123',
        },
      });
      const res = mockResponse();

      mockQuery.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            email: 'test@example.com',
            password_hash: 'hashedPassword',
            full_name: 'Test User',
          },
        ],
      } as any);

      mockBcryptCompare.mockResolvedValue(true as never);
      mockJwtSign.mockReturnValue('token123' as never);

      await login(req as Request, res as Response);

      expect(res.json).toHaveBeenCalledWith({
        token: 'token123',
        user: {
          id: 1,
          email: 'test@example.com',
          fullName: 'Test User',
        },
      });
    });

    it('should return 401 for invalid email', async () => {
      const req = mockRequest({
        body: {
          email: 'nonexistent@example.com',
          password: 'password123',
        },
      });
      const res = mockResponse();

      mockQuery.mockResolvedValueOnce({ rows: [] } as any);

      await login(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });

    it('should return 401 for invalid password', async () => {
      const req = mockRequest({
        body: {
          email: 'test@example.com',
          password: 'wrongpassword',
        },
      });
      const res = mockResponse();

      mockQuery.mockResolvedValueOnce({
        rows: [
          {
            id: 1,
            email: 'test@example.com',
            password_hash: 'hashedPassword',
            full_name: 'Test User',
          },
        ],
      } as any);

      mockBcryptCompare.mockResolvedValue(false as never);

      await login(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid credentials' });
    });

    it('should return 400 for invalid input format', async () => {
      const req = mockRequest({
        body: {
          email: 'invalid-email',
          password: 'pass',
        },
      });
      const res = mockResponse();

      await login(req as Request, res as Response);

      expect(res.status).toHaveBeenCalledWith(400);
    });
  });
});
