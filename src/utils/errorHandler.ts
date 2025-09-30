import { Response } from 'express';

export class AppError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

export const sendError = (res: Response, statusCode: number, message: string) => {
  return res.status(statusCode).json({
    success: false,
    error: message,
  });
};

export const sendSuccess = (res: Response, statusCode: number, data: any, message?: string) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};
