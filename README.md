# ₿ Smart Bitcoin UTXO Viewer & Optimization System

A full-stack web application for viewing, analyzing, and optimizing Bitcoin UTXOs using **real blockchain data** from public APIs.

---

## Architecture

```
┌─────────────────────────────────────────┐
│         React Frontend (Vite)           │
│   Dashboard · Charts · Optimizer UI     │
└─────────────────┬───────────────────────┘
                  │ HTTP (Axios)
┌─────────────────▼───────────────────────┐
│       Express Backend (Node.js)         │
│   REST API · Validation · Services      │
│                                         │
│  ┌───────────────┐  ┌────────────────┐  │
│  │  node-cache   │  │   MongoDB      │  │
│  │  (5-min TTL)  │  │  (Mongoose)    │  │
│  └───────────────┘  └────────────────┘  │
└─────────────────┬───────────────────────┘
                  │
  ┌───────────────┴───────────────────┐
  │       Public Bitcoin APIs          │
  │  Blockstream · Mempool.space       │
  └────────────────────────────────────┘
```

## Features

- 🔍 **UTXO Fetching** — Real data from Blockstream API
- 📊 **Analysis** — Balance, dust detection, fragmentation score
- 🪙 **Coin Selection** — Greedy & Minimum Inputs algorithms
- ⛽ **Fee Estimation** — Live rates from Mempool.space
- ⚖️ **Strategy Comparison** — Side-by-side optimization results
- 🚀 **Caching** — 5-minute in-memory cache + MongoDB persistence
- 🔐 **Security** — Address validation, no private key handling

---

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── config/        # DB + Cache config
│   │   ├── models/        # Mongoose schemas (Address, Utxo)
│   │   ├── services/      # utxo, analysis, coinSelection, fee
│   │   ├── routes/        # api.js (all endpoints)
│   │   ├── middleware/    # validate.js, errorHandler.js
│   │   └── app.js         # Express entry point
│   ├── .env.example
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/           # apiClient.js, utxoApi.js
    │   ├── components/    # All UI components
    │   ├── pages/         # Dashboard.jsx
    │   └── App.jsx
    ├── .env.example
    └── package.json
```

---

## Setup Instructions

### Prerequisites

- Node.js >= 18
- MongoDB (local or Atlas)
- npm or yarn

---

### Backend Setup

```bash
cd backend

# 1. Copy env file
cp .env.example .env

# 2. Edit .env — set MONGO_URI to your MongoDB connection string
#    Default: mongodb://localhost:27017/bitcoin_utxo

# 3. Install dependencies
npm install

# 4. Start development server
npm run dev

# Server runs on http://localhost:5000
```

**Environment Variables** (`backend/.env`):

| Variable | Default | Description |
|---|---|---|
| `PORT` | `5000` | Express server port |
| `MONGO_URI` | `mongodb://localhost:27017/bitcoin_utxo` | MongoDB connection URI |
| `CLIENT_URL` | `http://localhost:5173` | Frontend URL (CORS) |
| `BLOCKSTREAM_API` | `https://blockstream.info/api` | Blockstream base URL |
| `MEMPOOL_API` | `https://mempool.space/api` | Mempool.space base URL |
| `CACHE_TTL` | `300` | Cache TTL in seconds |

---

### Frontend Setup

```bash
cd frontend

# 1. Copy env file
cp .env.example .env

# 2. Install dependencies
npm install

# 3. Start development server
npm run dev

# Frontend runs on http://localhost:5173
```

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/address` | Submit address & fetch UTXOs |
| `GET` | `/api/utxos/:address` | Get stored UTXOs |
| `GET` | `/api/analysis/:address` | Get UTXO analysis |
| `POST` | `/api/optimize` | Run coin selection (both strategies) |
| `GET` | `/api/fee` | Get live fee rates |
| `GET` | `/health` | Health check |

### Example Usage

```bash
# Fetch UTXOs for an address
curl -X POST http://localhost:5000/api/address \
  -H "Content-Type: application/json" \
  -d '{"address":"bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"}'

# Get analysis
curl http://localhost:5000/api/analysis/bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh

# Run optimization
curl -X POST http://localhost:5000/api/optimize \
  -H "Content-Type: application/json" \
  -d '{"address":"bc1q...","targetBTC":0.001}'

# Live fee rates
curl http://localhost:5000/api/fee
```

---

## Coin Selection Algorithms

### Greedy (Largest First)
Selects UTXOs from largest to smallest until the target is reached. Good for minimizing the number of confirmations needed.

### Minimum Inputs
Selects the fewest UTXOs possible to cover the target. Produces smallest transaction sizes and lowest fees.

**Fee Formula:**
```
size (bytes) = (inputs × 148) + (outputs × 34) + 10
fee (sat)    = size × fee_rate_per_vByte
```

---

## Fragmentation Score

| Score | Label | Meaning |
|-------|-------|---------|
| 0–39 | Low | Well consolidated, efficient |
| 40–69 | Medium | Consider consolidation |
| 70–100 | High | High fees, consolidate now |

---

## Security Notes

- ✅ Bitcoin address format validation (P2PKH, P2SH, Bech32)
- ✅ View-only: no private keys ever handled
- ✅ Input sanitization on all endpoints
- ✅ Centralized error handling with safe error messages
- ✅ CORS configured for frontend origin only
