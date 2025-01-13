import rateLimit from 'express-rate-limit';
import { getIP } from './utils';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 นาที
  max: 5, // จำกัด 5 ครั้งต่อ IP
  message: 'Too many login attempts, please try again later.',
  keyGenerator: (req) => getIP(req)
});