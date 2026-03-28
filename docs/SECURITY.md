# Security & Hardening Configuration

 EduScale incorporates extensive methodologies to protect consumer data and defend against prominent OWASP vulnerability exploits. This document dictates security frameworks and reporting.

---

## 1. Perimeter Defenses

### Data Transport Security
- **Strict HTTPS/WSS:** No unencrypted traffic is accepted. HSTS headers are attached via API configuration to prevent protocol downgrade attacks.
- **Cross-Origin Resource Sharing (CORS):** Fully restricted in production. `CORS_ORIGIN` mandates that only strictly whitelisted Vercel sub-domains or native mobile clients are permitted access.
- **Helmet Headers:** Integrated explicitly within `main.ts` replacing dangerous Express headers (removing `X-Powered-By`, securing `X-Frame-Options` to mitigate Clickjacking).

---

## 2. Authentication Protocol Security

All authorization handles execute via Supabase Auth.
We DO NOT natively hash passwords locally.
- **Token Rotation:** Our system relies strictly on short-lived JWTs alongside secure, HTTP-only, restricted flags on refresh cookies.
- **Role Base Access Controls (RBAC):** Every internal resolver runs identity checks correlating with Database Role enumerators (`STUDENT`, `MENTOR`, `ADMIN`). Escaping scope immediately terminates the request with `403 Forbidden`.
- **JWT Secret Enforcement:** Hard-coded inside environment files `JWT_SECRET`. Needs aggressive periodic rotation natively through deployment hooks.

---

## 3. Threat Mitigation

### Attack Vector: Brute Force & DDoS 
We've integrated `express-rate-limit` connected natively to a robust Redis instance ensuring the cache scales dynamically horizontally across all Node processes. Specifically on endpoints:
- **Auth Limiter:** Max 5 request attempts per 15 minutes globally per IP.
- **Code Submission:** Highly suppressed logic via BullMQ to prevent Denial-Of-Service (DoS) involving heavy AST Node processing and Docker sandbox execution arrays within the Battle framework.

### Attack Vector: Cross-Site Scripting (XSS)
- Next.js acts as our primary defense, dynamically escaping HTML strings parsed onto layouts natively.
- API requests passing payload text parameters implicitly run through string normalization layers mapping Markdown execution tightly to `marked/dompurify`. We explicitly prevent `<script>` parsing globally.

### Attack Vector: SQL Injection (SQLi)
- Parameterized Queries uniformly utilized via Prisma ORM abstract.
- Direct Raw Query parsing `$queryRaw` is strictly forbidden unless absolutely mandatory and reviewed rigorously. All parameterized interpolation occurs utilizing strictly mapped type structures instead of arbitrary strings.

---

## 4. Reporting Information Scopes

**EduScale Operates responsibly under Bug Bounty Principles.**
Should you stumble upon an overarching security vulnerability within production structures (XSS, logic bypass, injection exploits) we ask you not to publicize it interactively unless communicated prior.

Send detailed reproduction steps describing the payload framework via email: **security@eduscale.com**. We aim to respond natively within 24 working hours.
