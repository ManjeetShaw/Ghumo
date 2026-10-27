# Ghumo

Search and book flights, trains, buses and hotels for travel within India.

- `frontend/` React 19, Vite and Tailwind. `server.ts` serves the build and forwards `/api` to the backend.
- `backend/` Express, MongoDB, Redis and BullMQ. Razorpay for payments, Gemini for plain language search and the trip planner.

## Run locally

Requirements: Node 18 or newer, MongoDB, Redis.

```bash
# backend
cd backend
cp .env.example .env      # then fill in the values
npm install
npm run dev

# frontend, in a second terminal
cd frontend
cp .env.example .env
npm install
npm run dev
```

The site is at http://localhost:3000 and the API at http://localhost:5000/api.

Backend tests: `cd backend && npm test`.

## Before launch

1. Fill in the legal and contact details in `frontend/src/config/site.js`. The Privacy Policy and Terms pages show a red notice for every field that is still empty.
2. The home page shows the places in `frontend/src/data/destinations.js` that have `photo: true`. Photos live in `frontend/public/images/destinations/` (3:2 landscape, about 1200 x 800, under 250 KB). To add a place, add its photo as `<slug>.jpg` and set `photo: true`. Use photos you own or have a licence for.
3. Point your domain at the deployment, serve over HTTPS, and set `CORS_ORIGINS` if the frontend and API are on different origins.
4. Set `JWT_SECRET` and the Razorpay keys. In production the backend refuses to start without `JWT_SECRET`.
5. Replace the sample data providers with real ones. Until then every search returns built in sample results and every booking is issued by a mock provider.
6. Decide the cancellation and refund policy, then connect refunds. Cancelling currently moves a booking to `REFUND_PENDING` and nothing processes the refund yet.
7. Have the Privacy Policy and Terms reviewed by a lawyer.
