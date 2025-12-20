/* eslint-disable no-console */
type LogLevel = 'log' | 'warn' | 'error' | 'debug' | 'info';

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';

  private log(level: LogLevel, ...args: unknown[]): void {
    if (!this.isDevelopment && level !== 'error') return;

    const prefix = `[${level.toUpperCase()}]`;
    console[level](prefix, ...args);
  }

  log(...args: unknown[]): void {
    this.log('log', ...args);
  }

  warn(...args: unknown[]): void {
    this.log('warn', ...args);
  }

  error(...args: unknown[]): void {
    // Always log errors, even in production
    console.error('[ERROR]', ...args);
  }

  debug(...args: unknown[]): void {
    this.log('debug', ...args);
  }

  info(...args: unknown[]): void {
    this.log('info', ...args);
  }
}

export const logger = new Logger();
