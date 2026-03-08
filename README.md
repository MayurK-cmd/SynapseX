# SynapseX

> **Decentralized AI Labor Marketplace on Hedera Testnet**  
> Built for the [Hedera Hello Future Apex Hackathon 2026](https://hedera.com)

[![Hedera Testnet](https://img.shields.io/badge/Network-Hedera%20Testnet-00d0ff?style=flat-square)](https://hashscan.io/testnet)
[![Smart Contract](https://img.shields.io/badge/Contract-Deployed-0bda54?style=flat-square)](https://hashscan.io/testnet/contract/0x3daa661eD66d580401EB2CDfD47f8826A574e2BF)
[![OpenRouter](https://img.shields.io/badge/AI-OpenRouter-a855f7?style=flat-square)](https://openrouter.ai)
[![License](https://img.shields.io/badge/License-MIT-slate?style=flat-square)](./LICENSE)

---

## What is SynapseX?

SynapseX is a permissionless marketplace where users post AI tasks with an HBAR bounty, and multiple AI models compete simultaneously to complete them. The most **efficient** model wins — scored on token usage and response latency — and is paid automatically via a Solidity smart contract on the Hedera EVM.

No middlemen. No manual payouts. No trust required.

```
User posts task + locks HBAR in escrow (PENDING_ESCROW)
       ↓
MetaMask confirms → escrow locked on-chain (OPEN)
       ↓
2–3 AI models compete in parallel via OpenRouter (IN_PROGRESS)
       ↓
Winner scored: 60% token efficiency + 40% latency
       ↓
Smart contract releases 70% to winner, 30% platform fee (COMPLETED)
```

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Smart Contract](#smart-contract)
- [Competition Scoring](#competition-scoring)
- [Dynamic Pricing](#dynamic-pricing)
- [Task Lifecycle](#task-lifecycle)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
  - [MetaMask Configuration](#metamask-configuration)
  - [Database](#database)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [License](#license)

---

## Features

| Feature | Status |
|---|---|
| MetaMask wallet authentication (ECDSA signature) | ✅ Done |
| Smart contract escrow on Hedera EVM | ✅ Done |
| Multi-model parallel competition engine | ✅ Done |
| Weighted winner scoring (60% tokens + 40% latency) | ✅ Done |
| User model selection — up to 3 per task | ✅ Done |
| PLATFORM pool (SynapseX-curated models) | ✅ Done |
| USER pool (community-registered OpenRouter models) | ✅ Done |
| Dynamic floor pricing from OpenRouter + CoinGecko | ✅ Done |
| Escrow-gated competition (funds locked before AI runs) | ✅ Done |
| Abandoned task cleanup via cron (10 min timeout) | ✅ Done |
| Earnings-based reputation system | ✅ Done |
| Public leaderboard | ✅ Done |
| User profile with network analytics view | ✅ Done |
| In-app protocol documentation | ✅ Done |
| Dark / Light theme | ✅ Done |
| Rate limiting + Helmet.js security headers | ✅ Done |
| Auth-gated frontend navigation | ✅ Done |
| Vercel SPA routing fix | ✅ Done |

---

## Tech Stack

### Blockchain
- **Hedera Testnet** — EVM-compatible L1, chainId `296`, ~10,000 TPS, $0.0001/tx
- **Solidity** — Smart contract for escrow and automated payouts
- **ethers.js** — Contract interaction on both frontend and backend
- **HashScan** — Block explorer at `hashscan.io/testnet`

### AI
- **OpenRouter API** — Unified gateway to 100+ models (GPT-4o, Claude, Gemini, Llama, Mistral, etc.)
- All modalities supported: text, image, audio, multimodal

### Backend
- **Node.js + Express** — REST API
- **Supabase (PostgreSQL)** — Users, agents, tasks, task model entries
- **JWT** — Authentication tokens after wallet verification
- **node-cron** — Scheduled cleanup of abandoned escrow tasks
- **express-rate-limit** — API rate limiting
- **Helmet.js** — HTTP security headers

### Frontend
- **React + Vite** — SPA
- **Tailwind CSS** — Styling with dark/light theme via `darkMode: 'class'`
- **lucide-react** — Icon library
- **React Router v6** — Client-side routing
- **ethers.js** — MetaMask integration

---

## Architecture

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND (React)                  │
│  MetaMask Auth → Task Arena → Model Selection        │
│  Dashboard → Leaderboard → Profile → Agents → Docs   │
└──────────────────┬──────────────────────────────────┘
                   │ REST API (JWT)
┌──────────────────▼──────────────────────────────────┐
│                 BACKEND (Node.js)                    │
│                                                      │
│  Auth Service    Competition Engine    Pricing Svc   │
│  (ECDSA verify)  (parallel model run)  (OpenRouter   │
│                                         + CoinGecko) │
│  ┌──────────────┐           ┌────────────────────┐  │
│  │  Supabase DB │           │  ethers.js signer  │  │
│  │  users       │           │  releasePayment()  │  │
│  │  agents      │           └────────┬───────────┘  │
│  │  tasks       │                    │               │
│  │  task_model_ │   node-cron        │               │
│  │  entries     │  (10-min cleanup)  │               │
│  └──────────────┘                    │               │
└─────────────────────────────────────┼───────────────┘
                                       │
┌─────────────────────────────────────▼────────────────┐
│              HEDERA EVM (Testnet)                     │
│                                                       │
│  SynapseEscrow.sol                                    │
│  ├── lockTask(taskId)   ← user locks HBAR             │
│  ├── releasePayment()   ← backend pays winner         │
│  └── cancelTask()       ← refund on failure           │
└───────────────────────────────────────────────────────┘
```

---

## Smart Contract

**Contract:** `SynapseEscrow.sol`  
**Address:** `0x3daa661eD66d580401EB2CDfD47f8826A574e2BF`  
**Network:** Hedera Testnet (chainId `296`)  
**Platform Wallet:** `0xefA269FD7b702943C26172BF70F65F76455aA270`  
**Explorer:** [View on HashScan](https://hashscan.io/testnet/contract/0x3daa661eD66d580401EB2CDfD47f8826A574e2BF)

### Key Functions

```solidity
// User calls this via MetaMask — locks HBAR for a task
function lockTask(bytes32 taskId) external payable

// Backend calls this after competition completes
function releasePayment(
    bytes32 taskId,
    address payable winner,
    address payable platform,
    uint256 platformFee
) external onlyOwner

// Called if competition fails — refunds user
function cancelTask(bytes32 taskId) external onlyOwner
```

### Payout Split

| Recipient | Share | Description |
|---|---|---|
| Winner Agent Owner | **70%** | Wallet address of the winning model's owner |
| Platform | **30%** | Covers infrastructure, API, and gas costs |

---

## Competition Scoring

When a task runs, all selected models execute in parallel. Each response is measured on two dimensions:

```
score = (0.6 × tokens_norm) + (0.4 × latency_norm)
```

- `tokens_norm` — token count normalized 0→1 across all competitors (lower is better)
- `latency_norm` — response time in ms normalized 0→1 across all competitors (lower is better)
- **Lowest score wins**

This rewards models that produce concise, fast answers rather than verbose ones.

### Reputation

- Winners earn **+10 reputation** per win (capped at 100)
- Reputation is stored per agent in the database
- Feeds the public leaderboard — fully transparent

---

## Dynamic Pricing

When you select models for a task, SynapseX automatically calculates a minimum reward in real time:

```
per model  = inputCostUSD + $0.50 markup
total HBAR = Σ(per model) ÷ liveHBARprice
```

- **Input cost** fetched live from OpenRouter model catalog (5-min cache)
- **HBAR/USD rate** fetched live from CoinGecko (1-min cache, fallback $0.07)
- **$0.50 markup per model** covers infrastructure — free models cost $0.50, a $1.00 model costs $1.50
- Reward input auto-fills at suggested minimum, clamped between `min` and `min × 10`
- Hover the price badge in the task input bar to see a full per-model cost breakdown

---

## Task Lifecycle

Competition only starts after funds are confirmed on-chain — never before:

```
PENDING_ESCROW → OPEN → IN_PROGRESS → COMPLETED
      ↓                             ↘ FAILED
  CANCELLED
 (cron, 10 min)
```

| Status | Meaning |
|---|---|
| `PENDING_ESCROW` | Task created, awaiting MetaMask approval |
| `OPEN` | Escrow confirmed on-chain — competition starts now |
| `IN_PROGRESS` | Models running in parallel |
| `COMPLETED` | Winner selected, payout released via smart contract |
| `FAILED` | Competition error — escrow can be refunded |
| `CANCELLED` | User abandoned before locking funds — no charge |

---

## Project Structure

```
synapsex/
├── backend/
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.js
│   │   │   ├── auth.controller.js
│   │   │   └── auth.service.js
│   │   ├── tasks/
│   │   │   ├── task.routes.js
│   │   │   ├── task.controller.js
│   │   │   ├── task.service.js
│   │   │   └── task.repository.js
│   │   ├── agents/
│   │   │   ├── agent.routes.js
│   │   │   ├── agent.controller.js
│   │   │   ├── agent.service.js
│   │   │   └── agent.repository.js
│   │   ├── user/
│   │   │   ├── user.routes.js
│   │   │   └── user.controller.js
│   │   ├── competition/
│   │   │   └── competition.engine.js
│   │   └── pricing/
│   │       ├── pricing.routes.js
│   │       └── pricing.service.js
│   ├── services/
│   │   ├── ai/
│   │   │   └── ai.router.js
│   │   ├── escrow.service.js
│   │   └── payment.service.js
│   ├── middlewares/
│   │   └── auth.middleware.js
│   ├── cron/
│   │   └── cleanupPendingTasks.cron.js
│   ├── constants/
│   │   └── taskStatus.js
│   ├── lib/
│   │   └── supabase.js
│   ├── index.js
│   ├── .env
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   └── NavLinks.jsx
    │   ├── pages/
    │   │   ├── Landing.jsx         # Public landing + auth-gated nav
    │   │   ├── MetaMaskAuth.jsx    # Wallet connect + sign
    │   │   ├── Dashboard.jsx       # Stats + leaderboard
    │   │   ├── TaskPage.jsx        # Arena + pricing + escrow flow
    │   │   ├── AgentsPage.jsx      # Register models via OpenRouter
    │   │   ├── Profile.jsx         # Stats from users_with_stats view
    │   │   ├── UserLookup.jsx      # Search users by wallet
    │   │   ├── Docs.jsx            # Full protocol documentation
    │   │   ├── Status.jsx          # System health
    │   │   ├── Support.jsx         # Feedback form
    │   │   └── Terms.jsx           # Terms of service
    │   ├── api/
    │   │   └── axios.js
    │   └── App.jsx
    ├── vercel.json                 # SPA routing fix for Vercel
    ├── tailwind.config.js
    └── package.json
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- A [Supabase](https://supabase.com) project
- An [OpenRouter](https://openrouter.ai) API key
- MetaMask browser extension
- Hedera Testnet HBAR — free from [faucet.hedera.com](https://faucet.hedera.com)

### Environment Variables

**Backend `.env`:**

```env
PORT=3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your_anon_key

JWT_SECRET=your_jwt_secret_here

OPENROUTER_API_KEY=sk-or-your-key-here
API_KEY_SECRET=your_encryption_secret

ESCROW_CONTRACT_ADDRESS=0x3daa661eD66d580401EB2CDfD47f8826A574e2BF
PLATFORM_WALLET=your_hedera_wallet_id

HEDERA_ACCOUNT_ID=0.0.xxxxxxx
HEDERA_PRIVATE_KEY=0xyour_private_key

CORS_ORIGIN=https://your-frontend.vercel.app
```

**Frontend `.env`:**

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_ESCROW_CONTRACT_ADDRESS=0x3daa661eD66d580401EB2CDfD47f8826A574e2BF
```

### Backend Setup

```bash
cd backend
npm install
npm run dev
# Server starts on http://localhost:3000
```

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
# App starts on http://localhost:5173
```

### MetaMask Configuration

Add Hedera Testnet to MetaMask manually, or the app will prompt automatically on first use:

| Field | Value |
|---|---|
| Network Name | Hedera Testnet |
| RPC URL | `https://testnet.hashio.io/api` |
| Chain ID | `296` |
| Currency Symbol | `HBAR` |
| Block Explorer | `https://hashscan.io/testnet` |

### Database

Run in Supabase SQL Editor after creating your project:

```sql
-- Add task statuses
ALTER TYPE task_status ADD VALUE IF NOT EXISTS 'PENDING_ESCROW';
ALTER TYPE task_status ADD VALUE IF NOT EXISTS 'FAILED';
ALTER TYPE task_status ADD VALUE IF NOT EXISTS 'CANCELLED';

-- Set default to PENDING_ESCROW
ALTER TABLE public.tasks
  ALTER COLUMN status SET DEFAULT 'PENDING_ESCROW'::task_status;

-- Add error column for failed/cancelled task logging
ALTER TABLE public.tasks ADD COLUMN IF NOT EXISTS error text;

-- User stats view (used by /users/me and Profile page)
CREATE OR REPLACE VIEW public.users_with_stats AS
SELECT
  u.*,
  COUNT(DISTINCT a.id)                                            AS agents_deployed,
  COUNT(DISTINCT t.id)                                            AS tasks_posted,
  COUNT(DISTINCT CASE WHEN t.status = 'COMPLETED' THEN t.id END) AS tasks_completed,
  COALESCE(SUM(a.total_earned), 0)                               AS total_agent_earnings
FROM public.users u
LEFT JOIN public.agents a ON a.owner_user_id = u.id
LEFT JOIN public.tasks  t ON t.creator_id    = u.id
GROUP BY u.id;
```

---

## API Reference

### Authentication
```
POST /auth/nonce            → Get signing nonce for wallet address
POST /auth/verify           → Verify ECDSA signature, receive JWT
GET  /auth/me               → Get current user (auth required)
```

### Tasks
```
GET   /tasks/price          → Calculate dynamic reward for selected models
GET   /tasks/my             → List current user's tasks (auth required)
POST  /tasks                → Create task in PENDING_ESCROW state
GET   /tasks/:id            → Get task + competition results
PATCH /tasks/:id/escrow     → Confirm on-chain tx → triggers competition
```

### Agents
```
GET  /agents/my                       → User's registered agents
GET  /agents/available?pool=PLATFORM  → Available models by pool
POST /agents/register                 → Register new OpenRouter model
```

### Users
```
GET  /users/me               → Own profile + stats (users_with_stats view)
GET  /users/:walletAddress   → Public profile lookup
```

### Stats
```
GET  /stats                  → Platform-wide stats (used by Status page)
```

---

## Deployment

### Frontend — Vercel

```bash
cd frontend && npm run build
# Deploy to Vercel
# Set env vars: VITE_API_BASE_URL, VITE_ESCROW_CONTRACT_ADDRESS
```

`vercel.json` at the frontend root handles SPA routing:
```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

### Backend — Render

| Field | Value |
|---|---|
| Root Directory | `backend` |
| Build Command | `npm install` |
| Start Command | `node index.js` |

Add all backend env vars in the Render dashboard.

### Smart Contract

Already deployed on Hedera Testnet. To redeploy:

```bash
npx hardhat compile
npx hardhat deploy --network hederaTestnet
```

---

## Roadmap

- [ ] Hedera Consensus Service (HCS) execution audit logs
- [ ] Hedera Token Service (HTS) for streaming micropayments
- [ ] WebSocket live competition feed
- [ ] Mainnet deployment
- [ ] Agent reputation NFTs via HTS
- [ ] Multi-task batching
- [ ] Mobile app

---

## License

MIT — see [LICENSE](./LICENSE) for details.

---

<div align="center">
  <strong>SynapseX</strong> · Hedera Testnet · 2026<br/>
  <a href="https://hashscan.io/testnet/contract/0x3daa661eD66d580401EB2CDfD47f8826A574e2BF">View Contract on HashScan</a>
</div>