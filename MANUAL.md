# EduScale — Manual Action Checklist

Tasks that **cannot be done in code** — they require dashboard logins, platform configs, or infrastructure provisioning.
Everything here blocks or supports production launch. Work through P0 first.

---

## P0 — Do Before First Production Deploy

### 🔑 Supabase — Rotate Leaked Credentials
`Frontend/.env` was in git history. Both keys are compromised.

1. Go to **Supabase Dashboard → Project Settings → API**
2. Click **"Rotate API key"** next to the anon/public key → copy new key
3. Go to **Project Settings → Auth → JWT Settings** → click **"Generate new secret"**
4. Update your Backend `.env`:
   ```
   SUPABASE_JWT_SECRET=<new value>
   SUPABASE_ANON_KEY=<new value>
   ```
5. Update your Frontend `.env.local`:
   ```
   NEXT_PUBLIC_SUPABASE_ANON_KEY=<new value>
   ```
6. Redeploy both services.

### 🔐 Supabase — Fix Google OAuth
The OAuth redirect URL points to the wrong Supabase project.

1. Go to **Supabase Dashboard → Authentication → Providers → Google**
2. Copy the **Callback URL** shown there (looks like `https://<ref>.supabase.co/auth/v1/callback`)
3. Go to **Google Cloud Console → APIs & Services → Credentials → your OAuth client**
4. Under **Authorized redirect URIs**, add the URL from step 2
5. Save. Test login with Google.

### 🛡️ GitHub — Branch Protection on `main`
1. Go to **GitHub → repo → Settings → Branches → Add branch ruleset**
2. Target: `main`
3. Enable:
   - ✅ Require a pull request before merging (1 reviewer)
   - ✅ Require status checks to pass (select the CI jobs: `backend-lint`, `backend-typecheck`, `backend-build`, `frontend-build`)
   - ✅ Require branches to be up to date before merging
   - ✅ Block force pushes

---

## P1 — Do Before Scaling Beyond ~10k Users

### 🗄️ Supabase — Enable Read Replica
> Routes analytics and leaderboard reads off the primary.

1. Upgrade to **Supabase Pro** (required for read replicas)
2. Go to **Project Settings → Infrastructure → Read Replicas → Add replica**
3. After provisioning, copy the replica connection string
4. Add to Backend `.env`:
   ```
   DATABASE_READ_URL=postgresql://...
   ```
5. Tell the dev: update Prisma client to use `DATABASE_READ_URL` for `SELECT`-only queries (analytics, leaderboard)

### ⚙️ Supabase — PostgreSQL Timeouts
> Prevents runaway queries from holding connections.

1. Go to **Supabase Dashboard → Database → Extensions → pg_net** (already enabled)
2. Go to **SQL Editor** and run:
   ```sql
   ALTER DATABASE postgres SET statement_timeout = '30s';
   ALTER DATABASE postgres SET idle_in_transaction_session_timeout = '60s';
   ```

### 🧠 Redis — Memory Policy
> Without this, Redis silently drops keys when full instead of evicting LRU.

**Upstash (recommended):**
1. Go to **Upstash Console → your Redis database → Config**
2. Set `maxmemory-policy` = `allkeys-lru`
3. Set `maxmemory` to ~80% of your plan limit

**Self-hosted Redis:**
```bash
redis-cli CONFIG SET maxmemory-policy allkeys-lru
redis-cli CONFIG SET maxmemory 400mb
redis-cli CONFIG REWRITE   # persist to redis.conf
```

### 📊 Sentry — Error Rate Alerts
1. Go to **Sentry → your backend project → Alerts → Create Alert Rule**
2. Set condition: `Number of errors > 10 in 1 minute` → notify Slack `#alerts`
3. Set condition: `Error rate > 1% in 5 minutes` → notify PagerDuty (if on-call set up)
4. Repeat for the frontend Sentry project

### 🔍 UptimeRobot — External Monitoring
1. Sign up at **uptimerobot.com** (free tier covers 50 monitors, 5-min intervals)
2. Create monitor: `GET https://your-api.com/api/v1/health/ready` — alert on non-200
3. Create monitor: `GET https://your-frontend.vercel.app` — alert on non-200
4. Configure email + Slack notifications

### 🐳 Docker / ECS — HEALTHCHECK in Dockerfile
> When the backend Dockerfile is created, add:
```dockerfile
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD curl -f http://localhost:5000/api/v1/health/ready || exit 1
```

### 📈 ECS — Auto-Scaling
1. Go to **AWS ECS → your service → Update → Auto Scaling**
2. Add **Target Tracking Policy**:
   - Metric: `ECSServiceAverageCPUUtilization` → target 70%
   - Min capacity: 2, Max capacity: 10
3. Add second policy: `ECSServiceAverageMemoryUtilization` → target 80%

### 🔒 AWS — Secrets Manager
> Move all secrets out of ECS environment variables into Secrets Manager.

1. Go to **AWS Secrets Manager → Store a new secret → Other type**
2. Create one secret per service (`eduscale/backend/prod`, `eduscale/frontend/prod`)
3. In ECS Task Definition, replace plaintext env vars with `valueFrom` ARN references
4. Grant the ECS Task Role `secretsmanager:GetSecretValue` permission

### 📦 AWS ALB — Socket.io Sticky Sessions
> Without this, WebSocket reconnections land on different ECS tasks and break.

1. Go to **AWS EC2 → Load Balancers → your ALB → Target Groups**
2. Select your backend target group → **Actions → Edit attributes**
3. Enable **Stickiness** → type: `lb_cookie` → duration: `1 day`

---

## P2 — Pre-GA / Growth Stage

### 📊 PostHog or Mixpanel — Product Analytics
1. Sign up at **posthog.com** (generous free tier) or **mixpanel.com**
2. Add the SDK to `Frontend/` → track page views, battle starts, roadmap enrolls
3. Create a dashboard: DAU, battle completion rate, roadmap completion rate

### 🏗️ Terraform — Infrastructure as Code
> Once ECS/RDS/Redis are manually provisioned and stable, encode them in Terraform
> so staging ↔ prod parity is guaranteed and reprovisioning takes minutes.

1. Install Terraform
2. Modules to write: `ecs_service`, `rds_postgres`, `elasticache_redis`, `alb`, `ecr`, `cloudwatch_alarms`
3. Store state in S3 with DynamoDB locking

### 🔵 ECS — Blue/Green Deployment
1. Go to **AWS CodeDeploy → Create application → ECS platform**
2. Create a deployment group pointing at your ECS service
3. Requires a second ALB target group (green) and listener rule

### 🌐 AWS WAF — OWASP Rules
1. Go to **AWS WAF → Create Web ACL → attach to your ALB**
2. Add managed rule group: `AWSManagedRulesCommonRuleSet`
3. Add managed rule group: `AWSManagedRulesSQLiRuleSet`
4. Set default action: Allow

---

## Notes

- Items marked **P0** must be done before any real users hit the production URL.
- Items under "ECS" assume AWS ECS + ALB deployment. Adjust if using Railway, Fly.io, etc.
- The dev side of each item (e.g. `DATABASE_READ_URL` Prisma routing) is tracked in `TODO.md`.
