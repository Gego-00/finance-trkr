import { Request, Response } from 'express';
import { AuthRequest } from '../../types';

// Tipo helper para mockear Request
type MockRequest<T = any> = Partial<Request> & {
  body?: T;
  params?: Record<string, string>;
  query?: Record<string, string | string[]>;
  headers?: Record<string, string>;
};

// Tipo helper para mockear AuthRequest
type MockAuthRequest<T = any> = Partial<AuthRequest> & {
  body?: T;
  params?: Record<string, string>;
  query?: Record<string, string | string[]>;
  headers?: Record<string, string>;
  user?: { id: number; email: string };
};

export const mockRequest = <T = any>(
  data: Partial<Request> = {}
): MockRequest<T> => {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    method: 'GET',
    url: '/',
    get: jest.fn(),
    header: jest.fn(),
    ...data,
  } as MockRequest<T>;
};

export const mockAuthRequest = <T = any>(
  userId: number,
  email: string,
  data: Partial<AuthRequest> = {}
): MockAuthRequest<T> => {
  return {
    body: {},
    params: {},
    query: {},
    headers: {},
    method: 'GET',
    url: '/',
    user: { id: userId, email },
    get: jest.fn(),
    header: jest.fn(),
    ...data,
  } as unknown as MockAuthRequest<T>;
};

export const mockResponse = (): Partial<Response> => {
  const res = {
    status: jest.fn().mockReturnThis(),
    json: jest.fn().mockReturnThis(),
    send: jest.fn().mockReturnThis(),
    sendStatus: jest.fn().mockReturnThis(),
    end: jest.fn().mockReturnThis(),
    setHeader: jest.fn().mockReturnThis(),
    cookie: jest.fn().mockReturnThis(),
    clearCookie: jest.fn().mockReturnThis(),
  };
  return res as unknown as Partial<Response>;
};

export const mockNext = jest.fn();

export const mockQuery = jest.fn();

export const mockPool = {
  query: mockQuery,
  end: jest.fn(),
  on: jest.fn(),
  connect: jest.fn((callback) => callback(null, {}, jest.fn())),
};