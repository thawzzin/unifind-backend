import * as healthService from '../services/health.service.js';
import asyncHandler from '../utils/asyncHandler.js';

export const check = asyncHandler(async (_req, res) => {
  res.json({ success: true, data: healthService.getStatus() });
});
