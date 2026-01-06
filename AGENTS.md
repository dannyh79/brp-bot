# AGENTS.md - Root Guidelines for BRP-Bot

## 1. Project Overview

**Name:** BRP-Bot (Bible Reading Plan Bot)
**Purpose:** An application that distributes reading plans (likely Bible devotionals) to users via LINE. It sources content from a database (seeded from Google Sheets) and runs on a schedule.

## 2. Technology Stack

- **Platform:** Cloudflare Workers
- **Runtime:** Node.js Compatibility Mode
- **Language:** TypeScript
- **Framework:** Hono (REST API), native Worker APIs (Scheduled)
- **Database:** Cloudflare D1 (SQLite)
- **External Services:**
  - LINE Messaging API (Notifications)
  - Google Sheets (Content Source)
- **Package Manager:** pnpm
- **Testing:** Vitest
- **Linting:** ESLint + Prettier

## 3. Architecture & Structure

The project follows a **Clean Architecture** inspired pattern:

- **`src/`**: Domain Logic.
  - **`types.ts`**: Core interfaces (`Usecase`, `Repository`).
  - **`readingPlans/`**: Domain entities and use cases.
  - **`repositories/`**: Data access implementations (D1).
  - **`services/`**: External service integrations (Notifiers).
- **`worker/`**: Infrastructure & Entry Points.
  - **`index.ts`**: Main worker entry point (Scheduled + Fetch).
  - **`d1/`**: Database seeds.
  - **`rest/`**: REST API implementation (Hono).
  - **`scheduled/`**: Scheduled task definitions.
- **`migrations/`**: D1 SQL migrations.
- **`scripts/`**: Utility scripts (e.g., Google Sheets sync).

## 4. Operational Guidelines

- **Dependency Management:** Always use `pnpm`.
- **Local Development:**
  - Run `pnpm dev` for local server.
  - Use `pnpm db:migrate` and `pnpm db:seed` to set up local D1.
- **Testing:**
  - Run `pnpm test` for unit/integration tests.
  - **Convention:** Tests are collocated or in `test/` directory mirroring source.
- **Deployment:**
  - Deployed via `wrangler deploy`.
  - Secrets managed via `secrets.json` and `wrangler secret bulk`.

## 5. Coding Standards

- **Style:** strict TypeScript, functional patterns where appropriate.
- **Patterns:**
  - Use `Usecase<Args, Output>` pattern for business logic.
  - Dependency Injection is used in `worker/index.ts` to wire Repos and Services.
- **Formatting:** Adhere to `.prettierrc` and `.editorconfig`.

## 6. Key Files

- `wrangler.toml`: Cloudflare configuration (Triggers, D1 bindings).
- `worker-configuration.d.ts`: Type definitions for Env/Bindings.
- `src/types.ts`: Core architectural definitions.

## 7. Definition of Done

- Code complete
- Unit tests pass
- Integration tests pass
- Documentation updated if needed
- Meets acceptance criteria

## 8. Git Committing Rules

- **Convention:** Follow [Conventional Commits](https://www.conventionalcommits.org/).
- **Format:** `<type>(<scope>): <description>` (scope is optional).
- **Types:** `feat`, `fix`, `chore`, `refactor`, `test`, `docs`, `style`, `perf`, `ci`, `build`.
- **Sync:** Always follow the repository's existing git convention (check `git log` if unsure).

## 9. Planning & Execution Strategy

- **Phased Planning:** All work must be planned and executed in distinct phases.
- **Atomic Commits:** Each git commit must be atomic (focused on a single logical change).
- **Commit Quality:** Every atomic commit must satisfy the **Definition of Done** (Section 7).
