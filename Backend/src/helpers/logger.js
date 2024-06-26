import winston from "winston";

const { combine, json, timestamp, printf } = winston.format;

// Create a "no-op" transport that does nothing
class NoOpTransport extends winston.Transport {
  log(info, callback) {
    setImmediate(() => this.emit('logged', info));
    callback();
  }
}

const transports = [
  new NoOpTransport() 
];

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: combine(
    timestamp({
      format: 'YYYY-MM-DD hh:mm:ss.SSS A',
    }),
    json(),
    printf((info) => `[${info.timestamp}] ${info.level}: ${info.message}`)
  ),
  transports
});
