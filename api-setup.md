# API Setup Guide

## How to connect the frontend to the backend API

The frontend needs a running backend API to work. The API URL is configured via an environment variable.

### Step 1: Create `.env.local`

In the project root (`Pitch-deck-analyzer/`), create a file called `.env.local`:

```
NEXT_PUBLIC_API_URL=https://your-ngrok-url.ngrok-free.app
```

### Step 2: Get your ngrok URL

If the backend is running locally (e.g. on port 8000), expose it with ngrok:

```bash
ngrok http 8000
```

Copy the `https://xxxx.ngrok-free.app` URL from the output and paste it into `.env.local`.

If the backend is already hosted somewhere, use that URL instead.

### Step 3: Start the frontend

```bash
npm run dev
```

The app will be available at `http://localhost:3000`.

### Changing the API URL

Whenever the ngrok URL changes (it changes on every restart for free plans):

1. Update `NEXT_PUBLIC_API_URL` in `.env.local`
2. Restart `npm run dev`

### API Endpoints Used

| Feature              | Method | Endpoint                      |
|----------------------|--------|-------------------------------|
| Pitch Deck Analysis  | POST   | `/api/pitch-deck/analyze`     |
| Investment Readiness | POST   | `/api/investment/readiness`   |
| Valuation Benchmark  | POST   | `/api/valuation/benchmark`    |
