import * as crypto from 'crypto';

class PasswordManager {
  private static readonly ALGORITHM = 'sha256';
  private static readonly ITERATIONS = 10000;
  private static readonly KEY_LEN = 64;

  hash_password(password: string): string {
    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.pbkdf2Sync(
      password,
      salt,
      PasswordManager.ITERATIONS,
      PasswordManager.KEY_LEN,
      PasswordManager.ALGORITHM
    ).toString('hex');
    
    return `${PasswordManager.ALGORITHM}:${PasswordManager.ITERATIONS}:${salt}:${hash}`;
  }

  verify_password(password: string, hashed_password: string): boolean {
    const [algo, iter, salt, originalHash] = hashed_password.split(':');
    const hash = crypto.pbkdf2Sync(
      password,
      salt,
      parseInt(iter),
      PasswordManager.KEY_LEN,
      algo
    ).toString('hex');

    return hash === originalHash;
  }
}
