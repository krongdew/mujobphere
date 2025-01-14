// lib/security/rateLimit.js
import { NextResponse } from 'next/server';
import { getIP } from '@/utils/ip';

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_REQUESTS = 5;

// Store for rate limiting
const rateLimitStore = new Map();

export const authLimiter = async (request) => {
  const ip = getIP(request);
  const now = Date.now();
  
  // Get existing record
  const record = rateLimitStore.get(ip) || {
    count: 0,
    resetTime: now + WINDOW_MS
  };

  // Reset if window has passed
  if (now > record.resetTime) {
    record.count = 0;
    record.resetTime = now + WINDOW_MS;
  }

  // Increment count
  record.count += 1;
  rateLimitStore.set(ip, record);

  // Check if limit exceeded
  if (record.count > MAX_REQUESTS) {
    return new NextResponse(
      JSON.stringify({ 
        error: 'Too many requests, please try again later.' 
      }),
      { 
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'Retry-After': String(Math.ceil((record.resetTime - now) / 1000))
        }
      }
    );
  }

  return null;
};