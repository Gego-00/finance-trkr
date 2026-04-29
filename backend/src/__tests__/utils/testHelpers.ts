import { Request, Response } from 'express';
import { AuthRequest } from '../../types';

export const mockRequest = (data: Partial<Request> = {}): Partial<Request> => ({
  body: {},
  params: {},
  query: {},
  headers: {},
  ...data,
});

export const mockAuthRequest = (
  userId: number,
  email: string,
  data: Partial<AuthRequest> = {}
): Partial<AuthRequest> => ({
  body: {},
  params: {},
  query: {},
  headers: {},
  user: { id: userId, email },
  ...data,
});

export const mockResponse = (): Partial<Response> => {
  const res: Partial<Response> = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
  };
  return res;
};

export const mockNext = jest.fn();

export const mockQuery = jest.fn();

export const mockPool = {
  query: mockQuery,
  end: jest.fn(),
  on: jest.fn(),
  connect: jest.fn((callback) => callback(null, {}, jest.fn())),
};
