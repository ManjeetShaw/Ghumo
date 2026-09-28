# Foxico AI Travel Super-App

```
foxico/
├── frontend/   React 19 + Vite + Tailwind. Serves the UI and proxies /api/* to the backend.
└── backend/    Node/Express + MongoDB + Redis (BullMQ). Auth, search, bookings, payments, trips, AI.
```

## Run locally
Needs Node 20+, MongoDB and Redis running.

```bash
# 1) backend  (http://localhost:5000)
cd backend
cp .env.example .env      # fill in JWT_SECRET, GEMINI_API_KEY, RAZORPAY_* (see comments in the file)
npm install
npm run dev

# 2) frontend (http://localhost:3000)
cd frontend
cp .env.example .env      # BACKEND_URL=http://localhost:5000
npm install
npm run dev
```

The browser only talks to the frontend origin; `frontend/server.ts` forwards every `/api/*`
request to `BACKEND_URL`. There is no mock API or demo data in the frontend.

## Production
```bash
cd frontend && npm install && npm run build && npm start   # serves dist/ and proxies /api
cd backend  && npm install && npm start
```
Razorpay webhook: `https://<backend>/api/payments/webhook` (events `payment.captured`, `payment.failed`),
secret goes in `RAZORPAY_WEBHOOK_SECRET`.

## Still sample data
Flights, trains, buses and hotels come from the adapters in `backend/src/providers/adapters/` (Mock*).
Replace them with real providers behind the same `BaseProvider` interface.
