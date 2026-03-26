<div align="center">
  <img src="https://raw.githubusercontent.com/shaileshchaudhary/EduScale/main/public/logo.png" alt="EduScale Logo" width="200" height="auto" />
  <h1>🚀 EduScale Platform</h1>
  <p><strong>The All-in-One Engineering Learning Hub & Community</strong></p>

  <p>
    <a href="https://nextjs.org"><img src="https://img.shields.io/badge/Next.js-15-black?style=for-the-badge&logo=next.js" alt="Next.js" /></a>
    <a href="https://react.dev"><img src="https://img.shields.io/badge/React-19-blue?style=for-the-badge&logo=react" alt="React" /></a>
    <a href="https://nodejs.org"><img src="https://img.shields.io/badge/Node.js-Backend-green?style=for-the-badge&logo=node.js" alt="Node" /></a>
    <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-Ready-blue?style=for-the-badge&logo=typescript" alt="TypeScript" /></a>
    <a href="https://postgresql.org"><img src="https://img.shields.io/badge/PostgreSQL-Database-336791?style=for-the-badge&logo=postgresql" alt="Postgres" /></a>
  </p>
  
  <p>
    <em>Empowering developers to grow from beginners to experts through interactive roadmaps, real-time coding battles, and peer mentorship.</em>
  </p>
</div>

---

## 📖 Table of Contents
- [Overview](#-overview)
- [System Architecture](#-system-architecture)
- [Core Modules & Features](#-core-modules--features)
- [Technology Stack](#-technology-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Environment Variables](#-environment-variables)
- [Future Roadmap](#-future-roadmap)
- [License & Authors](#-license--authors)

---

## ✨ Overview

**EduScale** is a highly scalable, premium EdTech platform tailored for engineering students and aspiring developers. Designed with a microservice-like layered architecture, EduScale bridges the gap between academic theory and industry implementation. 

Users begin by selecting specialized pathways (e.g., Full Stack, DevOps, Data Science) and execute a curated learning journey. The platform enforces learning through interactive quizzes, an integrated IDE for coding challenges, real-time developer face-offs (Battle Zone), and deep community integrations like study groups and mentoring capabilities.

---

## 🏗 System Architecture

EduScale utilizes a modern decoupled architecture ensuring high availability, rapid scaling capabilities, and real-time interaction speed via WebSocket integration.

```mermaid
graph TD
  subgraph Client Layer
    Web[Next.js 15 Web Application]
    Mobile[React Native App - Planned]
  end

  subgraph API Gateway / CDN
    Vercel[Vercel Edge Network]
    Nginx[Nginx Reverse Proxy]
  end

  subgraph Service Layer - Express / Node.js
    REST[RESTful API Services]
    WS[WebSocket Server - Socket.io]
    Auth[Supabase Auth Service]
  end

  subgraph Data & Infra Layer
    DB[(PostgreSQL)]
    Cache[(Redis In-Memory Cache)]
    Queue[(BullMQ Background Jobs)]
    Storage[(Cloudinary / Object Storage)]
  end

  Web -->|HTTPS| Vercel
  Mobile -->|HTTPS| Nginx
  
  Vercel -.->|REST| REST
  Vercel -.->|WSS| WS
  Nginx -.->|Traffic| REST
  
  REST -->|Prisma Client| DB
  REST -->|Session/Rate Limits| Cache
  REST -->|Async Tasks| Queue
  REST -->|Media Asset Uploads| Storage
  
  WS <-->|Game State PubSub| Cache
  
  Web -->|JWT Issuance| Auth
  REST -->|Token Validation| Auth
```

---

## 🎯 Core Modules & Features

### 🎓 **Personalized Learning Paths**
- **Structured Roadmaps:** Curated, stage-by-stage learning trees.
- **Progress Tracking:** Automatic milestone completion and streak algorithms.
- **Certifications:** Verifiable credential generation upon curriculum completion.

### ⚔️ **Interactive Battle Zone (Real-Time)**
- **Multiplayer Coding Battles:** Socket.io powered synchronized 1v1 and Free-for-All matches.
- **Live Leaderboards:** Real-time scoring and rank tracking via Redis.
- **Multi-Language IDE:** Monaco-based editor supporting JS, Python, Java, C++, and Go.

### 👥 **Community & Mentorship**
- **Discussion Forums:** Reddit-style threaded Q&A and knowledge sharing.
- **Peer Study Groups:** Create and join distinct cohorts for collaborative project building.
- **Mentorship System:** Connect juniors with verified industry experts.

### 💼 **Career Progression**
- **Interview Prep:** Highly curated bank of technical interview questions.
- **Job Board:** Internal pipeline for hiring partners and curated listings.
- **Developer Portfolio:** Public-facing profile aggregating Git stats, badges, and project history.

---

## 🛠 Technology Stack

We've chosen a bleeding-edge, enterprise-grade stack perfectly suited for a $50k+ ARR SaaS product:

| Layer | Technologies Used | Purpose |
| :--- | :--- | :--- |
| **Frontend** | Next.js 15, React 19, TypeScript | SEO-optimized, SSR/SSG capable client interface |
| **Styling & UI** | TailwindCSS, Radix UI, Framer Motion | Accessible, animated, and dark-mode native components |
| **State Mgt.** | Redux Toolkit, Zustand, React Query | Complex global state and server-state caching |
| **Backend** | Node.js, Express.js, TypeScript | Highly scalable monolithic service architecture |
| **Database** | PostgreSQL, Prisma ORM | Relational data integrity with type-safe querying |
| **Real-time** | Socket.io, Redis | Event-driven architecture for live battles and chat |
| **Auth** | Supabase Authentication | Secure, session-based & OAuth flow identity provider |
| **Media** | Cloudinary | Auto-optimized, edge-delivered asset management |

---

## 📂 Project Structure

EduScale operates as a managed monorepo structure separating the presentation layer from the core infrastructure constraints.

```bash
EduScale/
├── Frontend/                 # Next.js 15 Client Application
│   ├── src/
│   │   ├── app/              # Next.js App Router Pages
│   │   ├── components/       # Reusable UI/Radix Components
│   │   ├── contexts/         # React Context (Auth, Theme)
│   │   ├── hooks/            # Custom React Hooks (e.g., useBattleSocket)
│   │   └── utils/            # Supabase clients, formatters
│   ├── public/               # Static web assets
│   └── tailwind.config.ts    # Design System Tokens
│
└── Backend/                  # Express.js API Server
    ├── src/
    │   ├── controllers/      # Route logic & payload formatting
    │   ├── services/         # Core business logic & WebSocket classes
    │   ├── repositories/     # Data Access Layer (Prisma wrappers)
    │   ├── middlewares/      # Rate Limiting, Helmet, Auth Guards
    │   └── routes/           # API Endpoint declarations
    ├── prisma/               # Schema definitions & Database Seeders
    └── docs/                 # OpenAPI/Swagger Specifications
```

---

## 🚀 Getting Started

Follow these instructions to spin up the local development environment seamlessly.

### Prerequisites
- **Node.js**: `v18.17.0` or higher
- **Package Manager**: `npm` (v9+)
- **Database**: Active PostgreSQL instance (Local or Supabase)
- **Cache**: Active Redis server running on `localhost:6379`

### 1. Clone the Repository
```bash
git clone https://github.com/shaileshchaudhary/EduScale.git
cd EduScale
```

### 2. Backend Setup
```bash
cd Backend
npm install

# Setup Prisma Schema & Seed the database
npx prisma generate
npx prisma db push
npm run seed

# Start the API & WebSocket server (Runs on port 5000)
npm run dev
```

### 3. Frontend Setup
```bash
# Open a new terminal
cd Frontend
npm install

# Start the Next.js development server (Runs on port 3000)
npm run dev
```

---

## 🔐 Environment Variables

Both layers require proper `.env` configurations. Refer to `.env.example` in each directory.

**Backend (`Backend/.env`) High-level:**
```env
DATABASE_URL="postgres://user:pass@localhost:5432/eduscale"
REDIS_URL="redis://localhost:6379"
PORT=5000
JWT_SECRET="super_secure_key"
CLOUDINARY_CLOUD_NAME="..."
```

**Frontend (`Frontend/.env`) High-level:**
```env
NEXT_PUBLIC_API_BASE_URL="http://localhost:5000/api/v1"
NEXT_PUBLIC_WS_URL="http://localhost:5000"
NEXT_PUBLIC_SUPABASE_URL="..."
NEXT_PUBLIC_SUPABASE_ANON_KEY="..."
```

---

## 🔮 Future Roadmap

EduScale's master roadmap focuses on bringing deep, AI-centric enterprise features to our core users.

- [ ] **AI-Powered Code Review:** Automated AST and linting feedback using LLMs for submitted programming challenges.
- [ ] **Dynamic Virtual Whiteboard:** A WebRTC-powered shared canvas system for 1-on-1 system design mentorship.
- [ ] **React Native Mobile App:** Cross-platform native application equipped with offline-learning support and push notifications.
- [ ] **Advanced Gamification:** Implementation of competitive leagues (Bronze, Silver, Gold), monthly sprint hackathons, and global ELO rankings.
- [ ] **Corporate Dashboard:** B2B integration allowing recruiting partners to source top talent directly via specialized leaderboards.

---

## 📄 License & Authors

**EduScale** is proprietary software and architecture conceptually built for premier deployment.

Built and maintained with ❤️ by the EduScale Development Team & [Exavel Technologies](https://exaveltech.com). All Rights Reserved.
