# Sentry IDS — Frontend

React (Vite) console for the AI-Powered-IDS backend: login/register, a live
dashboard, and an alerts workflow (filter, resolve, delete) built against
your existing Express API (`/api/auth`, `/api/users`, `/api/alerts`).

## Setup

```bash
cd frontend
npm install
cp .env.example .env   # point VITE_API_URL at your backend, default http://localhost:5000/api
npm run dev
```

Make sure the backend is running first (`cd backend && npm run dev`) and that
it has `JWT_SECRET` and `MONGO_URI` set in its own `.env` — the frontend logs
in against `/api/auth/login`, which needs both.

## What's here

- **Auth** — `/login`, `/register`, JWT stored in `localStorage`, attached to
  every request via an axios interceptor, auto-redirect to `/login` on 401.
- **Dashboard** (`/`) — stat cards from `GET /alerts/stats`, a severity
  breakdown and top-attack-types chart computed from `GET /alerts`, and a
  recent-alerts table.
- **Alerts** (`/alerts`) — full list with search + severity/status filters,
  resolve (`PUT /alerts/:id/status`) and delete (`DELETE /alerts/:id`).
- **Alert detail** (`/alerts/:id`) — full record with the same actions.
- **Profile** (`/profile`) — the logged-in user, from `GET /users/profile`.

## About "real-time"

The backend's `package.json` includes `socket.io`, but no socket server is
wired up in `app.js`/`server.js` yet, and the alert controllers don't emit
anything. So today, "real-time" here means polling: `src/hooks/useAlerts.js`
re-fetches `/alerts` and `/alerts/stats` every `VITE_POLL_INTERVAL` ms
(default 5s).

If you wire up Socket.IO on the backend (e.g. emit `alert:new` from
`createAlert`), swap the `setInterval` in `useAlerts.js` for a socket
listener — everything downstream just consumes
`{ alerts, stats, loading, error, refetch }`, so no other file needs to
change.

## Connecting the AI-ML service

`AI-ML/app.py` (FastAPI) exposes `POST /predict` and isn't called by the
Express backend yet. The natural wiring is: Express receives/derives traffic
features → calls the FastAPI `/predict` endpoint → creates an `Alert` from
the returned label. That glue code lives on the backend, not here — once it
exists, alerts created that way will show up in this frontend automatically
since it just reads from `/api/alerts`.
