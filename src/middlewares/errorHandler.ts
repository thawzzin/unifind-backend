import type { ErrorRequestHandler } from 'express';

import config from '../config/index.js';
import ApiError from '../utils/ApiError.js';

const errorHandler: ErrorRequestHandler = (err: unknown, _req, res, _next) => {
  const error = err instanceof Error ? err : new Error('Unknown error');
  const statusCode = error instanceof ApiError ? error.statusCode : 500;

  if (statusCode >= 500) {
    console.error(error);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message:
        statusCode >= 500 && config.isProduction ? 'Internal server error' : error.message,
      ...(error instanceof ApiError && error.details !== undefined
        ? { details: error.details }
        : {}),
      ...(config.isProduction ? {} : { stack: error.stack }),
    },
  });
};

export default errorHandler;
