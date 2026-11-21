import rateLimit from 'express-rate-limit';

// Rate limiter for AI image analysis endpoint
export const analyzeLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 20, // max 20 requests per minute per IP
  message: {
    error: 'Too many analysis requests from this IP, please try again in a minute.',
    retryAfter: 60
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter for authentication endpoints
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50,
  message: {
    error: 'Too many authentication attempts, please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});
