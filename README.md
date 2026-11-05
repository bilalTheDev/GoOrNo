# GoOrNo

Go or No? Let the market decide before you build.

GoOrNo is a two-sided platform where founders post a product idea and the community votes, comments, and — once a founder turns it on — pre-books a spot.

This repository is a JavaScript monorepo:

- `client` — React 18, Vite
- `server` — Express, Mongoose

TypeScript is intentionally not used.

## Branch model

- `main` — stable baseline. Updated when a phase is accepted.
- `develop` — integration branch for finished phase work.
- `feature/phase-N-*` — one branch per phase.

## Prerequisites

- Node.js 20 or newer
- MongoDB running locally, or a MongoDB Atlas connection string

The API defaults to `mongodb://127.0.0.1:27017/goorno`.

## Setup

```bash
npm install
npm install --prefix client
npm install --prefix server
copy server\.env.example server\.env
```

On macOS or Linux, use `cp server/.env.example server/.env`.

Edit `server/.env` if MongoDB is not on localhost.

## Run

Use two terminals:

```bash
npm run dev:server
npm run dev:client
```

Or from each package:

```bash
cd server && npm run dev
cd client && npm run dev
```

- App: http://localhost:5173
- Health check: http://localhost:5000/api/v1/health

The health check upserts one `HealthPing` document. The home page shows that write so you can confirm frontend, API, and database in one place.

## Phase 0 libraries outside the product table

These are required to boot the pipeline. They are not product features.

- `dotenv` — load `.env` (secrets stay out of source)
- `cors` — allow the Vite app to call the API
- `nodemon` — restart the API during development
- `eslint`, `prettier`, and the React ESLint plugins — required by the project setup

Product libraries from the stack (React Router, TanStack Query, Zustand, Tailwind, Passport, Stripe, Cloudinary, Socket.IO) are added in the phase that needs them.

## Current status

Phase 0 is in place: the React app can call `GET /api/v1/health`, and that route reads and writes one MongoDB document.
