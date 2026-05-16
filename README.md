# MBG — Mantle Bot Gate (Dashboard)

> Next.js frontend for the **Mantle Bot Gate** — a TEE-attested on-chain risk oracle for Mantle DeFi agents.

This repo contains only the dashboard. The smart contracts, scoring engine, TEE worker, and Byreal Skill live in the main repo: **[YohanesVito/mbg-mantle](https://github.com/YohanesVito/mbg-mantle)**.

## What this app does

- **Leaderboard** (`/`) — every scored Mantle DeFi protocol, sorted by aggregate score, reading directly from the on-chain `RiskOracle`.
- **Protocol detail** (`/protocol/[id]`) — component breakdown (contract / liquidity / centralization / oracle), audit history, and the on-chain attestation panel (signer + traceHash + timestamp).
- **Route checker** (`/route`) — compose a multi-leg DeFi route and see the on-chain composite score with composition penalty, computed in a single view call on Mantle.

Every score on screen comes with its TEE attestation hash so a user can independently verify on Mantlescan that the agent's claim of "I consulted MBG" is real.

## Tech

- Next.js 16 (App Router, server components, server actions)
- React 19
- Tailwind CSS 4
- [viem](https://viem.sh) for on-chain reads (Mantle Sepolia / Mainnet)
- [Bun](https://bun.sh) for install + dev

## Local development

```bash
bun install
bun run dev   # http://localhost:3000
```

## Environment variables

Create a `.env.local` (gitignored) with three values:

```env
MBG_RPC_URL=https://rpc.sepolia.mantle.xyz
MBG_CHAIN_ID=5003
MBG_ORACLE_ADDRESS=0x58519569c3D5C9a13dC0e8e7B6d2E123E2f0ae45
```

Defaults (when unset) point at a local Anvil node — useful when developing the contract side of the stack.

| Var | Sepolia (default for hosted demo) | Mainnet | Local Anvil |
|---|---|---|---|
| `MBG_RPC_URL` | `https://rpc.sepolia.mantle.xyz` | `https://rpc.mantle.xyz` | `http://127.0.0.1:8545` |
| `MBG_CHAIN_ID` | `5003` | `5000` | `31337` |
| `MBG_ORACLE_ADDRESS` | `0x58519569c3D5C9a13dC0e8e7B6d2E123E2f0ae45` | *(TBD)* | *(local deploy)* |

## Deploy

Designed for Vercel. Import this repo, set the 3 env vars above on the project, and ship. No monorepo / workspace config needed — this app is fully self-contained.

## How this app fits into MBG

```
┌────────────────────────────────────────────────────────────────┐
│  this repo: dashboard only (Next.js + viem on-chain reads)     │
└──────────────────────────────┬─────────────────────────────────┘
                               │ reads from
                               ▼
┌────────────────────────────────────────────────────────────────┐
│  RiskOracle.sol  (deployed on Mantle, source-verified)         │
│  ↑ submitScore(...)                                            │
│  ↑                                                             │
│  TEE worker     (Phala TDX, signs scores)                      │
│  ↑                                                             │
│  Scoring engine (Bun + TS, reads DefiLlama + Mantle RPC)       │
│                                                                │
│  All three live in: github.com/YohanesVito/mbg-mantle          │
└────────────────────────────────────────────────────────────────┘
```

`lib/protocols.ts` and `lib/types.ts` are **mirrored** from the upstream backend's `be/src/protocols/registry.ts` and `be/src/types.ts`. When the upstream registry changes, mirror the new content here.

## License

Apache-2.0 (matches the main repo).
