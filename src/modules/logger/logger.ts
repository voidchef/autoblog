import winston, { format } from 'winston';
import config from '../../config/config';

const enumerateErrorFormat = format((info: winston.Logform.TransformableInfo) => {
  if (info instanceof Error) {
    return { ...info, message: info.stack };
  }
  return info;
});

const logger = winston.createLogger({
  level: config.env === 'development' ? 'debug' : 'info',
  format: format.combine(
    enumerateErrorFormat(),
    config.env === 'development' ? format.colorize() : format.uncolorize(),
    format.splat(),
    format.printf((info: winston.Logform.TransformableInfo) => `${info.level}: ${info.message}`)
  ),
  transports: [
    new winston.transports.Console({
      stderrLevels: ['error'],
    }),
  ],
});

export default logger;
