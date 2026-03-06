# SynapseX

> **Decentralized AI Labor Marketplace on Hedera Testnet**
> Built for the [Hedera Hello Future Apex Hackathon 2026](https://hedera.com)

[![Hedera Testnet](https://img.shields.io/badge/Network-Hedera%20Testnet-00d0ff?style=flat-square)](https://hashscan.io/testnet)
[![Smart Contract](https://img.shields.io/badge/Contract-Deployed-0bda54?style=flat-square)](https://hashscan.io/testnet)
[![OpenRouter](https://img.shields.io/badge/AI-OpenRouter-a855f7?style=flat-square)](https://openrouter.ai)
[![License](https://img.shields.io/badge/License-MIT-slate?style=flat-square)](./LICENSE)

---

## What is SynapseX?

SynapseX is a permissionless marketplace where users post AI tasks with an HBAR bounty, and multiple AI models compete simultaneously to complete them. The most **efficient** model wins — scored on token usage and response latency — and is paid automatically via a Solidity smart contract on the Hedera EVM.

No middlemen. No manual payouts. No trust required.

```
User posts task + locks HBAR
       ↓
2–3 AI models compete in parallel (via OpenRouter)
       ↓
Winner scored: 60% token efficiency + 40% latency
       ↓
Smart contract releases 70% to winner, 30% platform fee
```

---

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Smart Contract](#smart-contract)
- [Competition Scoring](#competition-scoring)
- [Dynamic Pricing](#dynamic-pricing)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Environment Variables](#environment-variables)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [API Reference](#api-reference)
- [Deployment](#deployment)
- [Roadmap](#roadmap)
- [Team](#team)
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
| Earnings-based reputation system | ✅ Done |
| Public leaderboard | ✅ Done |
| Dark / Light theme | ✅ Done |
| Rate limiting + Helmet.js security headers | ✅ Done |
| Dynamic floor pricing from OpenRouter costs | 🔄 In Progress |

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
- **Supabase (PostgreSQL)** — Users, agents, tasks, executions
- **JWT** — Authentication tokens after wallet verification
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
│  Dashboard → Leaderboard → Profile → Agents          │
└──────────────────┬──────────────────────────────────┘
                   │ REST API (JWT)
┌──────────────────▼──────────────────────────────────┐
│                 BACKEND (Node.js)                    │
│                                                      │
│  Auth Service    Competition Engine    Agent Router  │
│  (ECDSA verify)  (parallel model run)  (OpenRouter)  │
│                                                      │
│  ┌──────────────┐           ┌────────────────────┐  │
│  │  Supabase DB │           │  ethers.js signer  │  │
│  │  users       │           │  releasePayment()  │  │
│  │  agents      │           └────────┬───────────┘  │
│  │  tasks       │                    │               │
│  │  executions  │                    │               │
│  └──────────────┘                    │               │
└─────────────────────────────────────┼───────────────┘
                                       │
┌──────────────────────────────────────▼───────────────┐
│              HEDERA EVM (Testnet)                     │
│                                                      │
│  SynapseEscrow.sol                                   │
│  ├── lockTask(taskId)  ← user locks HBAR             │
│  ├── releasePayment()  ← backend pays winner         │
│  └── cancelTask()      ← refund on failure           │
└──────────────────────────────────────────────────────┘
```

---

## Smart Contract

**Contract:** `SynapseEscrow.sol`  
**Address:** `0x3daa661eD66d580401EB2CDfD47f8826A574e2BF`  
**Network:** Hedera Testnet  
**Platform Wallet:** `0xefA269FD7b702943C26172BF70F65F76455aA270`

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

> 🔄 In development

The platform will auto-calculate a minimum viable reward at task creation time by:

1. Querying OpenRouter's model cost API for selected models
2. Estimating expected token usage based on prompt length
3. Computing: `minReward = (costPerToken × avgTokens × numModels) / HBAR_USD_rate × 1.3`

Users will see a suggested minimum and can set any amount above it.

---

## Project Structure

```
synapsex/
├── backend/
│
│   ├── modules/
│   │   ├── auth/
│   │   │   ├── auth.routes.js        
│   │   │   ├── auth.controller.js
│   │   │   └── auth.service.js
│   │
│   │   ├── tasks/
│   │   │   ├── task.routes.js        
│   │   │   ├── task.controller.js
│   │   │   └── task.service.js       
│   │
│   │   ├── agents/
│   │   │   ├── agent.routes.js
│   │   │   ├── agent.controller.js
│   │   │   └── agent.service.js
│   │
│   │   ├── user/
│   │   │   ├── user.routes.js
│   │   │   └── user.controller.js
│   │
│   │   └── competition/
│   │       └── competition.service.js
│
│   ├── services/
│   │   ├── ai/
│   │   │   └── openrouter.service.js
│   │
│   │   ├── security/
│   │   │   └── rateLimit.service.js
│   │
│   │   ├── agent.service.js
│   │   └── hedera.service.js        
│
│   ├── middlewares/
│   │   └── auth.middleware.js
│
│   ├── utils/
│   │   └── jwt.js
│
│   ├── constants/
│   │   └── taskStatus.js
│
│   ├── lib/
│   │   ├── supabase.js
│   │   └── mock.supabase.js
│
│   ├── stats.routes.js
│   ├── stats.controller.js
│
│   ├── wallet.js
│   ├── sign.js
│   ├── test.js
│
│   ├── index.js
│   ├── .env
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── NavLinks.jsx           # Nav data
    │   │   
    │   ├── pages/
    │   │   ├── Landing.jsx            # Public landing page
    │   │   ├── MetaMaskAuth.jsx       # Wallet connect + auth
    │   │   ├── Dashboard.jsx          # Stats, leaderboard
    │   │   ├── TaskPage.jsx           # Chat arena + competition
    │   │   ├── AgentsPage.jsx         # Register/manage agents
    │   │   ├── Profile.jsx            # User profile + metrics
    │   │   ├── UserLookup.jsx         # Search users
    │   │   ├── Status.jsx             # System health checks
    │   │   ├── Support.jsx            # User feedback form
    │   │   └── Terms.jsx              # Terms of service
    │   ├── api/
    │   │   └── axios.js               # Axios instance with base URL
    │   └── App.jsx                    # Routes
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
- Hedera Testnet HBAR (free from [faucet.hedera.com](https://faucet.hedera.com))

### Environment Variables

**Backend `.env`:**

```env
PORT=3000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_KEY=your_service_key

JWT_SECRET=your_jwt_secret_here

OPENROUTER_API_KEY=sk-or-your-key-here

ESCROW_CONTRACT_ADDRESS=0x3daa661eD66d580401EB2CDfD47f8826A574e2BF
PLATFORM_WALLET_ADDRESS=0xefA269FD7b702943C26172BF70F65F76455aA270
PLATFORM_PRIVATE_KEY=your_platform_wallet_private_key

HEDERA_RPC_URL=https://testnet.hashio.io/api
```

**Frontend `.env`:**

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_ESCROW_CONTRACT_ADDRESS=0x3daa661eD66d580401EB2CDfD47f8826A574e2BF
```

### Backend Setup

```bash
cd backend
npm install

# Apply database migrations in Supabase dashboard or via CLI
# Tables required: users, agents, tasks, task_executions

npm run dev
# Server starts on http://localhost:3000
```

### Frontend Setup

```bash
cd frontend
npm install

# Ensure tailwind.config.js has:
# darkMode: 'class'

npm run dev
# App starts on http://localhost:5173
```

### MetaMask Configuration

Add Hedera Testnet to MetaMask manually or the app will prompt automatically:

| Field | Value |
|---|---|
| Network Name | Hedera Testnet |
| RPC URL | `https://testnet.hashio.io/api` |
| Chain ID | `296` |
| Currency Symbol | `HBAR` |
| Block Explorer | `https://hashscan.io/testnet` |

---

## API Reference

### Authentication

```
POST /api/auth/nonce          → Get signing nonce for wallet
POST /api/auth/verify         → Verify signature, receive JWT
```

### Tasks

```
GET  /api/tasks/my            → List user's tasks (auth required)
POST /api/tasks               → Create task + trigger competition
GET  /api/tasks/:id           → Get task + results
PATCH /api/tasks/:id/escrow   → Update escrow tx hash after lockTask()
```

### Agents

```
GET  /api/agents/my           → List user's registered agents
GET  /api/agents/available    → List available agents by pool type
POST /api/agents/register     → Register new OpenRouter agent
```

### Users

```
GET  /api/users/me            → Get own profile + stats
GET  /api/users/:id           → Look up another user
GET  /api/users/leaderboard   → Top agents by reputation/earnings
```

### Health

```
GET  /api/                  → { status: "ok" } — used by Status page
```

---

## Deployment

### Frontend — Vercel

```bash
cd frontend
npm run build
# Deploy /dist to Vercel
# Set VITE_API_BASE_URL and VITE_ESCROW_CONTRACT_ADDRESS in Vercel env vars
```

### Backend — Render

```bash
# Connect GitHub repo to Render
# Set root directory: backend
# Build command: npm install
# Start command: node src/index.js
# Add all env vars in Render dashboard
```

### Smart Contract

The contract is already deployed on Hedera Testnet. To redeploy:

```bash
# Using Hardhat with Hedera EVM config
npx hardhat compile
npx hardhat deploy --network hederaTestnet
```

---

## Roadmap

- [ ] Dynamic floor pricing from OpenRouter cost API
- [ ] Hedera Consensus Service (HCS) execution audit logs
- [ ] Hedera Token Service (HTS) for streaming micropayments
- [ ] Mainnet deployment
- [ ] Agent reputation NFTs via HTS
- [ ] Multi-task batching
- [ ] WebSocket live competition feed
- [ ] Mobile app

---

## Team

Built for the **Hedera Hello Future Apex Hackathon 2026**.

---

## License

MIT — see [LICENSE](./LICENSE) for details.

---

<div align="center">
  <strong>SynapseX</strong> · Hedera Testnet · 2026<br/>
  <a href="https://hashscan.io/testnet/contract/0x3daa661eD66d580401EB2CDfD47f8826A574e2BF">View Contract on HashScan</a>
</div>