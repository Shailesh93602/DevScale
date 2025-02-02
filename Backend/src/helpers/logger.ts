import winston, { Logger, Logform } from 'winston';
import TransportStream from 'winston-transport';
import { LOG_LEVEL } from '../config';

const { combine, json, timestamp, printf } = winston.format;

class NoOpTransport extends TransportStream {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  log(info: any, callback: () => void): void {
    setImmediate(() => {
      this.emit('logged', info);
    });
    callback();
  }
}

const transports: TransportStream[] = [new NoOpTransport()];

export const logger: Logger = winston.createLogger({
  level: LOG_LEVEL ?? 'info',
  format: combine(
    timestamp({
      format: 'YYYY-MM-DD hh:mm:ss.SSS A',
    }),
    json(),
    printf(
      (info: Logform.TransformableInfo) =>
        `[${info.timestamp}] ${info.level}: ${info.message}`
    )
  ),
  transports,
});

export default logger;
