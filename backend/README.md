# Hora de Estudar — Backend API

A study hours management platform with social ranking in rooms. Track your study sessions, compete with friends in study rooms, and visualize your progress.

## Stack

| Technology | Purpose |
|---|---|
| **Node.js** | Runtime |
| **TypeScript** | Language (strict mode) |
| **Express** | HTTP framework |
| **Prisma** | ORM |
| **PostgreSQL** | Database |
| **JWT** | Authentication |
| **Bcrypt** | Password hashing |
| **Zod** | Input validation |
| **Pino** | Structured logging |
| **Helmet** | Security headers |
| **Docker** | Containerization |

## Architecture

Modular by domain with clean separation of concerns:

```
src/
├── app.ts                    # Express setup
├── server.ts                 # Entry point
├── config/env.ts             # Zod-validated env vars
├── database/prisma.ts        # PrismaClient singleton
├── errors/                   # Custom error classes
├── middlewares/               # Auth, validation, error handling
├── routes/index.ts           # Central route registration
├── modules/
│   ├── auth/                 # Register, login
│   ├── users/                # Profile, search
│   ├── study-sessions/       # Manual sessions + Timer lifecycle
│   ├── statistics/           # Personal stats, heatmap, streaks
│   ├── rooms/                # Room CRUD, members, invites
│   ├── ranking/              # Room leaderboards
│   ├── room-statistics/      # Room aggregate stats
│   └── room-activities/      # Room activity feed
├── utils/                    # JWT, password, pagination, dates
└── types/                    # Shared types & Express augmentation
```

Each module follows: `schema → controller → service → repository` (when needed).

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+ (or Docker)
- npm or yarn

### 1. Clone & Install

```bash
git clone <repo-url>
cd backend
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/hora_de_estudar?schema=public"
JWT_SECRET="your-super-secret-key-at-least-10-chars"
JWT_EXPIRES_IN="7d"
PORT=3333
NODE_ENV=development
CORS_ORIGIN="http://localhost:3000"
```

### 3. Start Database (Docker)

```bash
docker compose up db -d
```

### 4. Run Migrations

```bash
npx prisma migrate dev --name init
```

### 5. Generate Prisma Client

```bash
npm run prisma:generate
```

### 6. Seed Database (Optional)

```bash
npm run prisma:seed
```

Creates 3 test users (alice, bob, carol) with password `Password123`, a study room, and sample sessions.

### 7. Start Dev Server

```bash
npm run dev
```

Server runs at `http://localhost:3333`. API base: `http://localhost:3333/api`.

### Running with Docker Compose (Full Stack)

```bash
docker compose up --build
```

This starts both PostgreSQL and the API. Migrations run automatically on startup.

## API Endpoints

### Health
| Method | Endpoint | Description |
|---|---|---|
| GET | `/health` | Health check |

### Auth
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |

### Users
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/users/me` | Get profile |
| PATCH | `/api/users/me` | Update profile |
| PATCH | `/api/users/me/password` | Change password |
| DELETE | `/api/users/me` | Delete account |
| GET | `/api/users/search?q=` | Search users |

### Study Sessions
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/study-sessions/manual` | Create manual session |
| POST | `/api/study-sessions/timer/start` | Start timer |
| POST | `/api/study-sessions/timer/:id/pause` | Pause timer |
| POST | `/api/study-sessions/timer/:id/resume` | Resume timer |
| POST | `/api/study-sessions/timer/:id/finish` | Finish timer |
| POST | `/api/study-sessions/timer/:id/cancel` | Cancel timer |
| GET | `/api/study-sessions/timer/active` | Get active timer |
| GET | `/api/study-sessions` | List sessions (filters) |
| GET | `/api/study-sessions/:id` | Get session |
| PATCH | `/api/study-sessions/:id` | Update session |
| DELETE | `/api/study-sessions/:id` | Delete session |

**List filters:** `period`, `startDate`, `endDate`, `subject`, `source`, `roomId`, `page`, `pageSize`, `orderBy`, `orderDirection`

### Statistics
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/statistics/me/overview` | Overview (totals, streak, comparison) |
| GET | `/api/statistics/me/by-subject` | Breakdown by subject |
| GET | `/api/statistics/me/by-day` | Daily stats |
| GET | `/api/statistics/me/by-week` | Weekly stats |
| GET | `/api/statistics/me/by-month` | Monthly stats |
| GET | `/api/statistics/me/heatmap` | Heatmap data |

**Filters:** `period`, `startDate`, `endDate`

### Rooms
| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/rooms` | Create room |
| GET | `/api/rooms` | List my rooms |
| GET | `/api/rooms/:id` | Get room details |
| PATCH | `/api/rooms/:id` | Update room |
| DELETE | `/api/rooms/:id` | Delete room |
| POST | `/api/rooms/join/:inviteCode` | Join via invite code |
| POST | `/api/rooms/:id/leave` | Leave room |
| GET | `/api/rooms/:id/members` | List members |
| PATCH | `/api/rooms/:id/members/:userId/role` | Update member role |
| DELETE | `/api/rooms/:id/members/:userId` | Remove member |
| POST | `/api/rooms/:id/regenerate-invite` | Regenerate invite code |

### Room Ranking
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/rooms/:id/ranking` | Room leaderboard |

**Filters:** `period`, `startDate`, `endDate`, `source`

### Room Statistics
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/rooms/:id/statistics/overview` | Room overview |
| GET | `/api/rooms/:id/statistics/by-member` | Stats by member |
| GET | `/api/rooms/:id/statistics/by-day` | Daily stats |
| GET | `/api/rooms/:id/statistics/by-subject` | Stats by subject |

### Room Activities
| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/rooms/:id/activities` | Activity feed (paginated) |

## Response Format

### Success
```json
{
  "message": "Study session created successfully",
  "data": { ... }
}
```

### Paginated
```json
{
  "message": "Study sessions fetched successfully",
  "data": {
    "items": [...],
    "page": 1,
    "pageSize": 10,
    "total": 35,
    "totalPages": 4
  }
}
```

### Error
```json
{
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Invalid email address" }
  ]
}
```

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Start dev server with hot reload |
| `npm run build` | Compile TypeScript |
| `npm start` | Start production build |
| `npm run lint` | Run ESLint |
| `npm run prisma:generate` | Generate Prisma Client |
| `npm run prisma:migrate` | Run migrations (dev) |
| `npm run prisma:studio` | Open Prisma Studio |
| `npm run prisma:seed` | Seed database |

## Architecture Notes

- **Timer model**: Active timers are stored in a separate `ActiveTimer` table. When a timer finishes, it creates a `StudySession` with `source=TIMER` and deletes the `ActiveTimer`. This prevents incomplete data in the sessions table.
- **Only one active timer per user** — enforced by a unique constraint on `userId` in `ActiveTimer`.
- **Room ranking** considers only sessions with `roomId` explicitly set. Sessions without a room linkage don't appear in any room's ranking.
- **Physical delete** is used for all entities. No soft delete.
- **Role hierarchy**: OWNER > ADMIN > MEMBER. Only OWNER can promote/demote. ADMIN can remove MEMBERs. Sole OWNER cannot leave or be demoted.
