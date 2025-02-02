import { config } from 'dotenv';
import * as process from 'process';

config();

const {
  MAIL_ADDRESS,
  MAIL_PASSWORD,
  ACCESS_TOKEN_SECRET,
  RESET_TOKEN_SECRET,
  NODE_ENV,
  COMPILER_CLIENT_ID,
  COMPILER_CLIENT_SECRET,
  LOG_LEVEL,
  JWT_SECRET,
} = process.env as { [key: string]: string };

export {
  MAIL_ADDRESS,
  MAIL_PASSWORD,
  ACCESS_TOKEN_SECRET,
  RESET_TOKEN_SECRET,
  NODE_ENV,
  COMPILER_CLIENT_ID,
  COMPILER_CLIENT_SECRET,
  LOG_LEVEL,
  JWT_SECRET,
};
