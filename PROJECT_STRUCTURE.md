# Project Structure Overview

## 📋 Project Summary

**Bolão da Copa do Mundo** — A Node.js/TypeScript backend application for managing a FIFA World Cup betting pool. Users can create pools, participate in them, make guesses about match scores, and track rankings.

**Stack:** Node.js + Express + TypeScript + Prisma ORM + PostgreSQL

---

## 📁 Directory Structure

```
atv_criar_endpoints/
├── docker-compose.yml          # PostgreSQL database setup
├── tsconfig.json               # TypeScript configuration
├── package.json                # Dependencies & scripts
├── .env                        # Environment variables (local)
├── .env.example                # Environment template
├── .gitignore                  # Git ignore rules
├── README.md                   # Quick setup guide
│
├── scripts/
│   └── setup.sh                # Automated setup script
│
├── prisma/
│   ├── schema.prisma           # Database schema definition
│   ├── seed.ts                 # Seed script for initial data
│   └── migrations/             # Database migration history
│       ├── migration_lock.toml
│       └── 20260602225401_init/
│           └── migration.sql
│
└── src/
    ├── server.ts               # Express server entry point
    │
    ├── application/            # API Layer
    │   ├── controllers/        # Request handlers
    │   │   ├── GuessController.ts      # Guess endpoints (CREATE, UPDATE, RANKING, DELETE)
    │   │   └── MatchController.ts      # Match endpoints (LIST)
    │   └── routes/
    │       └── index.ts        # Route definitions
    │
    ├── infrastructure/         # Business Logic & Data Access Layer
    │   ├── http/
    │   │   └── app.ts          # Express app configuration
    │   │
    │   ├── prisma/
    │   │   └── index.ts        # Prisma client instance
    │   │
    │   ├── repositories/       # Data access layer
    │   │   ├── guess.repository.ts     # Guess queries
    │   │   ├── match.repository.ts     # Match queries
    │   │   └── pool.repository.ts      # Pool queries
    │   │
    │   └── services/           # Business logic
    │       └── guess.service.ts        # Guess operations (create, update, ranking, remove)
    │
    └── shared/
        └── env.ts              # Environment variables loader
```

---

## 🏗️ Architecture Pattern

The project follows a **3-Layer Architecture** pattern:

```
┌─────────────────────────────────────────┐
│      Controllers (HTTP Handlers)         │ ← application/controllers/
│   GuessController, MatchController       │
└─────────────────────────────────────────┘
                    ↓↑
┌─────────────────────────────────────────┐
│      Services (Business Logic)           │ ← infrastructure/services/
│   GuessService                           │
└─────────────────────────────────────────┘
                    ↓↑
┌─────────────────────────────────────────┐
│    Repositories (Data Access)            │ ← infrastructure/repositories/
│   GuessRepository, MatchRepository,      │
│   PoolRepository                         │
└─────────────────────────────────────────┘
                    ↓↑
┌─────────────────────────────────────────┐
│      Database (PostgreSQL)               │
│   Managed by Prisma ORM                  │
└─────────────────────────────────────────┘
```

---

## 📌 Key Components

### Controllers (`src/application/controllers/`)
**Responsibilities:** Handle HTTP requests/responses, validate input, call services

- **GuessController** — Manages guess operations
  - `create()` — Create a new guess for a match
  - `update()` — Update existing guess scores
  - `ranking()` — Get pool ranking by participant
  - `removeParticipant()` — Remove participant from pool

- **MatchController** — Manages match operations
  - `list()` — List matches with optional filters (stage, status)

### Services (`src/infrastructure/services/`)
**Responsibilities:** Implement business logic, validate rules, coordinate repositories

- **GuessService**
  - `create()` — Create guess (validates match, participant, conflicts)
  - `update()` — Update guess (validates match kickoff time)
  - `ranking()` — Calculate participant rankings
  - `removeParticipant()` — Remove participant and related guesses

### Repositories (`src/infrastructure/repositories/`)
**Responsibilities:** Abstract database operations, direct Prisma queries

- **GuessRepository** — Guess CRUD operations
- **MatchRepository** — Match queries with filtering
- **PoolRepository** — Pool & participant queries

### HTTP Server (`src/infrastructure/http/app.ts`)
**Responsibilities:** Express app setup, middleware configuration, route registration

### Database Schema (`prisma/schema.prisma`)
**Entities:**
- `Pool` — Betting pool/tournament
- `Participant` — User in a pool
- `Match` — World Cup match
- `Guess` — Participant's score prediction for a match

---

## 🔄 Data Flow

### Example: Creating a Guess

```
HTTP POST /api/pools/:poolId/guesses
    ↓
GuessController.create(req, res)
    ↓
GuessService.create({poolId, participantId, matchId, homeScore, awayScore})
    ↓
    ├─→ matchRepo.findById(matchId) — Validate match exists
    ├─→ poolRepo.findParticipant(poolId, participantId) — Validate participant in pool
    ├─→ guessRepo.findByParticipantAndMatch(...) — Check duplicate
    └─→ guessRepo.create(data) — Insert guess
    ↓
res.status(201).json(guess)
```

---

## 🚀 Setup & Execution

### Quick Start
```bash
bash scripts/setup.sh
```

### Manual Setup
```bash
# 1. Configure environment
cp .env.example .env

# 2. Start database
docker compose up -d

# 3. Install dependencies
npm install

# 4. Setup Prisma
npm run prisma:generate
npm run prisma:migrate

# 5. Seed initial data
npm run db:seed

# 6. Start development server
npm run dev
```

### Available Scripts
```json
{
  "dev": "tsx watch src/server.ts",              // Watch mode
  "build": "tsc -p tsconfig.json",               // TypeScript compile
  "start": "node dist/server.js",                // Production run
  "prisma:generate": "prisma generate",          // Generate Prisma client
  "prisma:migrate": "prisma migrate dev --name init",  // Run migrations
  "prisma:studio": "prisma studio",              // Visual DB explorer
  "db:seed": "tsx prisma/seed.ts"                // Seed database
}
```

---

## 🛠️ Technology Stack

| Technology | Version | Purpose |
|-----------|---------|---------|
| **Node.js** | Latest | Runtime |
| **Express** | 4.18.2 | Web framework |
| **TypeScript** | 5.6.3 | Type safety |
| **Prisma** | 5.20.0 | ORM & migrations |
| **PostgreSQL** | 16 | Database |
| **Helmet** | 7.1.0 | Security headers |
| **CORS** | 2.8.5 | Cross-origin requests |
| **Morgan** | 1.10.0 | HTTP logging |

---

## 📝 Environment Variables

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5433/bolao_db?schema=public"
PORT=3001
```

---

## 🎯 API Endpoints (To Be Implemented)

### Matches
- `GET /api/matches?stage=GROUP_STAGE&status=COMPLETED` — List matches with filters

### Guesses
- `POST /api/pools/:poolId/guesses` — Create guess
- `PATCH /api/guesses/:id` — Update guess
- `GET /api/pools/:poolId/ranking` — Get ranking
- `DELETE /api/pools/:poolId/participants/:participantId` — Remove participant

---

## ✅ Next Steps

1. Implement repository methods with Prisma queries
2. Implement service business logic with validation
3. Implement controller endpoints
4. Register routes in route handler
5. Test all endpoints

