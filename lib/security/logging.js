// lib/security/logging.js

// สำหรับ client-side logging
const clientLogger = {
  info: (data) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[Security Event]:', data);
    }
    // ส่ง log ไปยัง server ผ่าน API endpoint ถ้าต้องการ
    fetch('/api/log', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    }).catch(console.error);
  }
};

// สำหรับ server-side logging
let serverLogger;
if (typeof window === 'undefined') {
  const winston = require('winston');
  serverLogger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
      new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
      new winston.transports.File({ filename: 'logs/security.log' })
    ]
  });

  // เพิ่ม console transport ในโหมด development
  if (process.env.NODE_ENV !== 'production') {
    serverLogger.add(new winston.transports.Console({
      format: winston.format.simple()
    }));
  }
}

export const logSecurityEvent = (event, data) => {
  const logData = {
    timestamp: new Date().toISOString(),
    event,
    ...data
  };

  if (typeof window === 'undefined') {
    // Server-side logging
    serverLogger.info(logData);
  } else {
    // Client-side logging
    clientLogger.info(logData);
  }
};