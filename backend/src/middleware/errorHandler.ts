import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

export interface APIError extends Error {
  status?: number;
  code?: string;
  details?: any;
}

export class AppError extends Error implements APIError {
  public status: number;
  public code: string;
  public details?: any;
  public isOperational: boolean;

  constructor(message: string, status: number = 500, code?: string, details?: any) {
    super(message);
    this.status = status;
    this.code = code || 'INTERNAL_ERROR';
    this.details = details;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const createError = (message: string, status: number = 500, code?: string, details?: any): AppError => {
  return new AppError(message, status, code, details);
};

export const asyncHandler = (fn: Function) => {
  return (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
};

export const notFoundHandler = (req: Request, _res: Response, next: NextFunction): void => {
  const error = createError(
    `Resource not found: ${req.method} ${req.originalUrl}`,
    404,
    'NOT_FOUND'
  );
  next(error);
};

export const errorHandler = (
  err: APIError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error('Error:', {
    message: error.message,
    status: error.status,
    code: error.code,
    stack: error.stack,
    url: req.originalUrl,
    method: req.method,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    timestamp: new Date().toISOString(),
  });

  // Zod validation errors
  if (err instanceof ZodError) {
    const message = 'Validation Error';
    const details = err.errors.map(e => ({
      field: e.path.join('.'),
      message: e.message,
      code: e.code,
    }));
    error = createError(message, 400, 'VALIDATION_ERROR', details);
  }

  // Prisma errors
  if (err.name === 'PrismaClientKnownRequestError') {
    const prismaError = err as any;
    switch (prismaError.code) {
      case 'P2002':
        error = createError('Duplicate entry', 409, 'DUPLICATE_ENTRY', {
          field: prismaError.meta?.target,
        });
        break;
      case 'P2025':
        error = createError('Record not found', 404, 'NOT_FOUND');
        break;
      default:
        error = createError('Database error', 500, 'DATABASE_ERROR');
    }
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    error = createError('Invalid token', 401, 'INVALID_TOKEN');
  }

  if (err.name === 'TokenExpiredError') {
    error = createError('Token expired', 401, 'TOKEN_EXPIRED');
  }

  // Multer errors (file upload)
  if (err.name === 'MulterError') {
    const multerError = err as any;
    switch (multerError.code) {
      case 'LIMIT_FILE_SIZE':
        error = createError('File too large', 413, 'FILE_TOO_LARGE');
        break;
      case 'LIMIT_FILE_COUNT':
        error = createError('Too many files', 413, 'TOO_MANY_FILES');
        break;
      case 'LIMIT_UNEXPECTED_FILE':
        error = createError('Unexpected file field', 400, 'UNEXPECTED_FILE');
        break;
      default:
        error = createError('File upload error', 400, 'UPLOAD_ERROR');
    }
  }

  // Default to 500 server error
  const status = error.status || 500;
  const code = error.code || 'INTERNAL_ERROR';

  // Send error response
  const response: any = {
    error: {
      message: error.message || 'Internal Server Error',
      code,
      status,
      timestamp: new Date().toISOString(),
      requestId: req.headers['x-request-id'] || 'unknown',
    },
  };

  // Add details in development
  if (process.env['NODE_ENV'] !== 'production') {
    response.error.stack = error.stack;
    if (error.details) {
      response.error.details = error.details;
    }
  }

  res.status(status).json(response);
};

export const handleUncaughtException = (err: Error): void => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
};

export const handleUnhandledRejection = (reason: any, promise: Promise<any>): void => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
};