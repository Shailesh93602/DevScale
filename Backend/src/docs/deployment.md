# Setup & Deployment Guide

## Local Development Setup

1. Clone the repository:

```bash
git clone https://github.com/org/learning-platform.git
cd learning-platform
```

2. Install dependencies:

```bash
npm install
```

3. Set up environment variables:

```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start development server:

```bash
npm run dev
```

## Production Deployment

### Prerequisites

- Node.js 16+
- PostgreSQL 13+
- Redis 6+

### Deployment Steps

1. Build the application:

```bash
npm run build
```

2. Set production environment variables:

```bash
# Required variables
DATABASE_URL=
REDIS_URL=
JWT_SECRET=
```

3. Run database migrations:

```bash
npx prisma migrate deploy
```

4. Start the application:

```bash
npm start
```

### Monitoring & Maintenance

1. Check application logs:

```bash
pm2 logs
```

2. Monitor performance:

```bash
pm2 monit
```

3. Database backup:

```bash
pg_dump -U username database > backup.sql
```
