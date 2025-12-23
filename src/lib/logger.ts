type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  [key: string]: any;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';

  private formatLog(level: LogLevel, message: string, meta?: any): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      ...meta,
    };
  }

  private log(level: LogLevel, message: string, meta?: any) {
    const logEntry = this.formatLog(level, message, meta);

    if (this.isDevelopment) {
      const color = {
        info: '\x1b[36m',
        warn: '\x1b[33m',
        error: '\x1b[31m',
        debug: '\x1b[35m',
      }[level];
      const reset = '\x1b[0m';

      console[level === 'debug' ? 'log' : level](
        `${color}[${level.toUpperCase()}]${reset}`,
        message,
        meta ? meta : ''
      );
    }

    if (this.isProduction) {
      console.log(JSON.stringify(logEntry));
    }
  }

  info(message: string, meta?: any) {
    this.log('info', message, meta);
  }

  warn(message: string, meta?: any) {
    this.log('warn', message, meta);
  }

  error(message: string, meta?: any) {
    this.log('error', message, meta);
  }

  debug(message: string, meta?: any) {
    if (this.isDevelopment) {
      this.log('debug', message, meta);
    }
  }
}

export const logger = new Logger();
