import { execSync } from 'child_process';
import path from 'path';

export default async function globalSetup() {
  const backendDir = path.resolve(__dirname, '../../Backend');
  console.log('\n[global-setup] Seeding battle data before test run...');
  try {
    execSync('npm run seed:battles', {
      cwd: backendDir,
      stdio: 'inherit',
      timeout: 60000,
    });
    console.log('[global-setup] Battle seeding complete.\n');
  } catch (err) {
    console.error('[global-setup] WARNING: Battle seeding failed:', err);
    console.error('[global-setup] Tests requiring seeded battles may fail.\n');
    // Do not throw — allow tests to run and report their own failures
  }
}
