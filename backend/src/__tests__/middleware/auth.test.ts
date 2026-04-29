import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { authenticateToken } from '../../middleware/auth';
import { mockRequest, mockResponse, mockNext } from '../utils/testHelpers';

jest.mock('jsonwebtoken');

const mockJwtVerify = jwt.verify as jest.MockedFunction<typeof jwt.verify>;

describe('Auth Middleware', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('authenticateToken', () => {
    it('should authenticate valid token', () => {
      const req = mockRequest({
        headers: {
          authorization: 'Bearer validtoken123',
        },
      });
      const res = mockResponse();
      const next = mockNext;

      const decoded = { id: 1, email: 'test@example.com' };
      mockJwtVerify.mockImplementation((token, secret, callback: any) => {
        callback(null, decoded);
      });

      authenticateToken(req as Request, res as Response, next as NextFunction);

      expect(next).toHaveBeenCalled();
      expect((req as any).user).toEqual(decoded);
    });

    it('should return 401 if no token provided', () => {
      const req = mockRequest({
        headers: {},
      });
      const res = mockResponse();
      const next = mockNext;

      authenticateToken(req as Request, res as Response, next as NextFunction);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Access token required' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 401 if authorization header is malformed', () => {
      const req = mockRequest({
        headers: {
          authorization: 'InvalidFormat',
        },
      });
      const res = mockResponse();
      const next = mockNext;

      authenticateToken(req as Request, res as Response, next as NextFunction);

      expect(res.status).toHaveBeenCalledWith(401);
      expect(res.json).toHaveBeenCalledWith({ error: 'Access token required' });
    });

    it('should return 403 if token is invalid', () => {
      const req = mockRequest({
        headers: {
          authorization: 'Bearer invalidtoken',
        },
      });
      const res = mockResponse();
      const next = mockNext;

      mockJwtVerify.mockImplementation((token, secret, callback: any) => {
        callback(new Error('Invalid token'), null);
      });

      authenticateToken(req as Request, res as Response, next as NextFunction);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
      expect(next).not.toHaveBeenCalled();
    });

    it('should return 403 if token is expired', () => {
      const req = mockRequest({
        headers: {
          authorization: 'Bearer expiredtoken',
        },
      });
      const res = mockResponse();
      const next = mockNext;

      const error = new Error('Token expired');
      (error as any).name = 'TokenExpiredError';
      mockJwtVerify.mockImplementation((token, secret, callback: any) => {
        callback(error, null);
      });

      authenticateToken(req as Request, res as Response, next as NextFunction);

      expect(res.status).toHaveBeenCalledWith(403);
      expect(res.json).toHaveBeenCalledWith({ error: 'Invalid or expired token' });
    });
  });
});
