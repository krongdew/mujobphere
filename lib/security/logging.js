import winston from 'winston';

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.json(),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/security.log' })
  ]
});

export const logSecurityEvent = (event, data) => {
  logger.info({
    timestamp: new Date().toISOString(),
    event,
    ...data
  });
};