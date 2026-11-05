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

`GET /api/v1/health` upserts one `HealthPing` document.

## Auth

Copy `server/.env.example` to `server/.env` and set two long random values:

- `ACCESS_TOKEN_SECRET`
- `REFRESH_TOKEN_SECRET`

Access tokens last 15 minutes and stay in memory. The refresh token is an httpOnly cookie for 7 days. Reloading the app calls `POST /api/v1/auth/refresh`.

There is no email provider yet. Registration prints a verification link in the API terminal. Open that link, then sign in.

Google sign-in is implemented and stays off until `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` are set. The callback URL must be `http://localhost:5000/api/v1/auth/google/callback`.

## Libraries outside the product table

These are required to run the app. They are not extra product features.

- `dotenv` — load `.env`
- `cors` — allow the Vite app to call the API
- `nodemon` — restart the API during development
- `cookie-parser` — read the httpOnly refresh cookie
- `eslint`, `prettier`, and the React ESLint plugins — project setup

React Router, TanStack Query, Zustand, Tailwind, bcrypt, JWT, and Passport are part of the stack and are used for auth. Stripe, Cloudinary, and Socket.IO wait for later phases.

## Current status

Phase 1: a person can register as a backer, a founder, or both, verify email from the API console, sign in, stay signed in across a reload, and log out. An account can also gain the founder role later.
