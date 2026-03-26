# Editorial — Secure Password Storage

### Why Hashing is Essential
Storing passwords in plain text is a critical security vulnerability. Hashing transforms the password into a fixed-length string of characters, which is computationally infeasible to reverse.

### The Problem with Simple Hashing
Algorithms like MD5 and SHA-1 are extremely fast. An attacker with a leaked database of hashes can use precomputed tables (Rainbow Tables) or powerful GPUs to test billions of combinations per second.

### Solution: Salt + Key Stretching
1. **Salting**: By adding a unique random string (salt) to the password before hashing, we ensure that the same password results in a different hash every time. This makes rainbow tables useless.
2. **Key Stretching**: Algorithms like **PBKDF2**, **bcrypt**, or **Argon2** apply the hash function thousands of times (iterations). This makes each individual comparison slow, effectively neutralizing high-speed brute-force attacks.

### Recommendation
In modern web applications, **Argon2id** is currently considered the most secure option, followed by **bcrypt**.

**Complexity**
- Time: $O(\text{iterations} \times \text{key length})$.
- Space: $O(1)$ additional space beyond storing the hash and salt.
