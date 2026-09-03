# F1dle — Frontend

React interface for **F1dle**, a Formula 1 guessing game inspired by Wordle.

**Live: [f1dle-md.fly.dev](https://f1dle-md.fly.dev)**

This repository holds the frontend only. The Laravel API lives in a separate
repository: **[MaelDemory/F1dle-API](https://github.com/MaelDemory/F1dle-API)**.

## Game modes

| Mode | Route |
|---|---|
| Classic — current grid or **All Time** (all 881 drivers since 1950) | `/game` |
| Guess by teams — current grid or **All Time** (race winners) | `/guess-by-teams` |
| Fill the Grid — world champions | `/fill-the-grid` |
| Constructor grid | `/constructor-grid` |
| Higher or Lower | `/higher-lower` |
| Connections | `/connections` |
| Driver browser — current grid and All Time | `/drivers` |
| Season results, 1950–2024 | `/results` |

Light / dark / system theme, and a fully translated EN/FR interface.

## Stack

React 18 · TypeScript · React Router v6 · Tailwind CSS · Motion v12 ·
lucide-react · in-house primitives in the shadcn/ui style

## Getting started

```bash
npm install
REACT_APP_API_URL=http://localhost:8000/api npm start   # http://localhost:3000

CI=true npm test        # 79 tests
npx tsc --noEmit
npm run build
```

In production nginx serves the build and proxies `/api/` to the API, so the
browser only ever talks to one origin and CORS never applies. The upstream is
the `API_UPSTREAM` environment variable, interpolated into
`nginx.conf.template` when the container starts.

## Layout

| Directory | Role |
|---|---|
| `src/game/` | Guessing-board domain — comparators, round hooks, timings. No JSX |
| `src/game/modes/` | A game mode is a value: its columns and its accessors |
| `src/components/guess/` | Board presentation. No game state |
| `src/theme/` | Light / dark / system theme, with a circular reveal |
| `src/components/ui/` | Design-system primitives |
| `src/i18n/` | EN/FR translations |

## Full documentation

Project-wide documentation lives in [`docs/`](docs/) — it covers both this
repository and the API's, and is written in French:

- **[docs/PROJECT.md](docs/PROJECT.md)** — features, architecture, API,
  seeding, deployment
- **[docs/DEPLOY.md](docs/DEPLOY.md)** — Fly.io procedure, secrets, known
  pitfalls
- **[docs/DESIGN.md](docs/DESIGN.md)** — tokens, primitives, adaptivity rules

`docker-compose.yml` at the root brings up the whole stack — MySQL, the API and
this frontend. It expects the API repository checked out as a sibling directory
named `F1dle-API`.
