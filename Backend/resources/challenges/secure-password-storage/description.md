# Implement Secure Password Storage

Passwords should never be stored in plain text. If a database is compromised, an attacker can see all user passwords. To prevent this, passwords must be hashed using a one-way cryptographic hash function.

However, simple hashing (like MD5 or SHA-1) is not enough because attackers can use **rainbow tables** or **brute-force** attacks. To make storage secure, we use:
1. **Salt**: A unique, random string added to each password before hashing to ensure that users with the same password have different hashes.
2. **Key Stretching**: Using algorithms like **Argon2**, **bcrypt**, or **PBKDF2** that are intentionally slow to compute, making brute-force attacks impractical.

### Task:
Implement a class `PasswordManager` with two methods:
- `hash_password(password: string): string`: Takes a plain text password and returns a hashed version including a salt.
- `verify_password(password: string, hashed_password: string): boolean`: Returns `true` if the plain text password matches the hashed version, otherwise `false`.

For this challenge, implement a simplified version of **PBKDF2** (Password-Based Key Derivation Function 2) logic or use a standard pattern.

### Example:
```javascript
const pm = new PasswordManager();
const hash = pm.hash_password("mySecretPassword");
// hash might look like "pbkdf2$1000$randomSalt$encryptedHash"

console.log(pm.verify_password("mySecretPassword", hash)); // true
console.log(pm.verify_password("wrongPassword", hash)); // false
```

### Constraints:
- `password.length >= 8`
- The hash must be unique even for the same password if called multiple times.
