# Contributing Guidelines

First off, thank you for considering contributing to **EduScale**! It's people like you that make this platform a powerful learning tool for developers globally.

This document serves as the guide for contributing to this repository, navigating our codebase, and submitting high-quality Pull Requests.

---

## 1. Code of Conduct

By participating in this project, you are expected to uphold our Code of Conduct:
- Use welcoming and inclusive language.
- Respect differing viewpoints and constructive criticism.
- Gracefully accept peer review.
- Focus on what is best for the overall engineering community.

---

## 2. Setting Up Your Development Environment

Please refer to the `README.md` in the root directory for instructions on spinning up the **Frontend** and **Backend** locally via `npm run dev`. Ensure you have PostgreSQL and Redis correctly configured in your `.env`.

---

## 3. Branching Strategy

We follow a heavily modified GitFlow branching model to protect the `main` branch.

- `main` — Production-ready, stable code. Deploys to the live server automatically.
- `develop` — Integration branch. All features merge here first.
- `feat/feature-name` — Created off `develop`. Used for new features or structural updates.
- `fix/bug-name` — Created off `develop`. Used for patching bugs.
- `hotfix/critical-issue` — Created off `main`. Used strictly for urgent production outages.

### Naming Conventions:
Use hyphens for spaces and keep branch names descriptive:
- ✅ `feat/socket-reconnection-logic`
- ❌ `feature/update_sockets2`

---

## 4. Commit Message Standard

We strictly abide by **Conventional Commits**. This allows us to auto-generate changelogs and semantic versions.

**Format:**
```
<type>(<scope>): <subject>
```

**Types:**
- `feat`: A new feature
- `fix`: A bug fix
- `docs`: Documentation only changes
- `style`: Changes that do not affect the meaning of the code (white-space, formatting, etc)
- `refactor`: A code change that neither fixes a bug nor adds a feature
- `perf`: A code change that improves performance
- `test`: Adding missing tests or correcting existing tests
- `chore`: Changes to the build process or auxiliary tools and libraries

**Example:**
`feat(battles): implement global leaderboard caching in redis`

---

## 5. Coding Standards & Best Practices

### TypeScript
- **Strict Mode:** Always ensure strict typing. Avoid `any`. Use `unknown` if you must and narrow down the type.
- **Interfaces over Types:** Use `interface` for object shapes as they are easily extendable, unless you need a union type.

### Architecture (Backend)
- **Controller-Service-Repository Pattern:** 
  - *Controllers* handle HTTP logic (Req/Res/Next).
  - *Services* handle pure business logic.
  - *Repositories* interact exclusively with the Prisma ORM.

### Architecture (Frontend)
- **Component Segregation:** Keep components strictly smaller than 250 lines. Break them into modular hooks and pure components.
- **Tailwind:** Utilize the design tokens defined in `tailwind.config.ts`. Do not use arbitrary values like `h-[324px]` unless strictly necessary.

---

## 6. Pull Request Protocol

1. Fork the repo and create your branch from `develop`.
2. Ensure you have run `npm run type-check` and `npm run lint` in both directories.
3. Write relevant unit tests if introducing a critical business logic function.
4. Open a PR against the `develop` branch.
5. In your PR description, thoroughly explain:
   - What the purpose of this PR is.
   - Any breaking changes it introduces.
   - Images/Screenshots if it is a UI change.
6. Await peer review. A minimum of 1 approval is required to merge.
