import { defineConfig } from '@prisma/config';
import { config } from 'dotenv';
import { join } from 'path';

// Load environment variables from .env file
config({ path: join(__dirname, '.env') });

export default defineConfig({
  earlyAccess: true,
  schema: './prisma/schema.prisma',
});
