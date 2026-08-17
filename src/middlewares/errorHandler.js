import config from '../config/index.js';

// eslint-disable-next-line no-unused-vars -- Express identifies error middleware by arity
export default function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  if (statusCode >= 500) {
    console.error(err);
  }

  res.status(statusCode).json({
    success: false,
    error: {
      message: statusCode >= 500 && config.isProduction ? 'Internal server error' : err.message,
      ...(err.details ? { details: err.details } : {}),
      ...(config.isProduction ? {} : { stack: err.stack }),
    },
  });
}
