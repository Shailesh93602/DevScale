type LogLevel = 'info' | 'warn' | 'error' | 'debug';

const isProduction = process.env.NODE_ENV === 'production';

const log = (level: LogLevel, message: string, ...args: unknown[]) => {
  if (isProduction && level === 'debug') return;

  const timestamp = new Date().toISOString();
  const formattedMessage = `[${timestamp}] [${level.toUpperCase()}] ${message}`;

  switch (level) {
    case 'info':
      console.log(formattedMessage, ...args);
      break;
    case 'warn':
      console.warn(formattedMessage, ...args);
      break;
    case 'error':
      console.error(formattedMessage, ...args);
      break;
    case 'debug':
      console.debug(formattedMessage, ...args);
      break;
  }
};

export const logger = {
  info: (message: string, ...args: unknown[]) => log('info', message, ...args),
  warn: (message: string, ...args: unknown[]) => log('warn', message, ...args),
  error: (message: string, ...args: unknown[]) =>
    log('error', message, ...args),
  debug: (message: string, ...args: unknown[]) =>
    log('debug', message, ...args),
};
