# Duck Hunt (Monorepo)

Monorepo for the Duck Hunt game: web client (React + Vite) and game server (Express + Socket.io). Shared types and events live in `packages/shared`.

## Prerequisites

- **Node.js** 18+ (LTS recommended)
- **npm** 9+ (comes with Node)

## Install

From the repo root:

```bash
npm install
```

This installs dependencies for all workspaces (`apps/web`, `apps/server`, `packages/shared`).

## Run

### Development (web + server)

```bash
npm run dev
```

Runs the web app and the server in parallel (via `concurrently`).

- **Web:** [http://localhost:5173](http://localhost:5173) (Vite default)
- **Server:** runs on its configured port (see `apps/server`)

### Development (single app)

```bash
npm run dev:web     # only web (Vite)
npm run dev:server  # only server (tsx watch)
```

### With or without server

The web app can run **with** the server (rounds and hits driven by Socket.io) or **without** it (local scheduling only). Toggle this via the game config:

- In `apps/web/src/store/GameStore/GameStore.ts`, the `config` object has a `useServer` property (default `true`).
- Set **`useServer: false`** to run the web app without the server: rounds are scheduled locally according to `schedulingMode` (`"random20±10"` or `"fixed10"`).
- Set **`useServer: true`** (default) to use the server when it is running; if the server is down, the app can fall back to local scheduling after a short delay.

## Build

```bash
# Build all workspaces that define a build script
npm run build

# Build only the web app
npm run build:web
```

- **Web:** output in `apps/web/dist` (Vite).
- **Server:** compiles TypeScript to `apps/server/dist`; run with `npm run start -w apps/server` (or `node dist/index.js` from `apps/server`).

## Scripts (root)

| Script               | Description                              |
| -------------------- | ---------------------------------------- |
| `npm run dev`        | Run web + server in dev mode             |
| `npm run dev:web`    | Run web app only (Vite)                  |
| `npm run dev:server` | Run server only (tsx watch)              |
| `npm run build`      | Build all workspaces (web, server, etc.) |
| `npm run build:web`  | Build web app only                       |
| `npm run lint`       | ESLint for `.ts` / `.tsx`                |
| `npm run format`     | Prettier format entire project           |
| `npm run test`       | Run tests in all workspaces              |
| `npm run knip`       | Knip unused files/deps/exports           |

## Project structure

```
duck_game/
├── apps/
│   ├── web/          # React + Vite frontend
│   └── server/       # Express + Socket.io backend
├── packages/
│   └── shared/       # Shared types & events (@duck-hunt/shared)
└── package.json      # Root workspace config
```

## Tech stack

- **Web:** React 19, Vite 5, MobX, Socket.io client, Howler (audio), SCSS modules
- **Server:** Express, Socket.io, TypeScript (tsx in dev)
- **Shared:** TypeScript types and event definitions
