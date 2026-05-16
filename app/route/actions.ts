'use server'

import {createPublicClient, defineChain, http, keccak256, parseAbi, toHex} from 'viem'
import {PROTOCOLS} from '@/lib/protocols'

const RPC_URL = process.env.MBG_RPC_URL ?? 'http://127.0.0.1:8545'
const CHAIN_ID = Number(process.env.MBG_CHAIN_ID ?? '31337')
const ORACLE_ADDRESS = (process.env.MBG_ORACLE_ADDRESS as `0x${string}` | undefined)
  ?? '0x5FbDB2315678afecb367f032d93F642f64180aa3'

const chain = defineChain({
  id: CHAIN_ID,
  name: CHAIN_ID === 31337 ? 'Anvil' : CHAIN_ID === 5000 ? 'Mantle' : 'Mantle Sepolia',
  nativeCurrency: {name: 'Ether', symbol: 'ETH', decimals: 18},
  rpcUrls: {default: {http: [RPC_URL]}},
})

const client = createPublicClient({chain, transport: http(RPC_URL)})

const ORACLE_ABI = parseAbi([
  'function getRouteScore((address protocol, uint8 actionType, uint128 amount)[] actions) external view returns (uint16 aggregate, uint16 compositionPenalty, uint8 distinctProtocols, bool allProtocolsScored)',
  'function getProtocolScore(address protocol) external view returns ((uint16 aggregate, uint16 contractRisk, uint16 liquidityRisk, uint16 centralizationRisk, uint16 oracleRisk, uint64 timestamp, bytes32 traceHash, address signer))',
])

function placeholderProtocolAddress(id: string): `0x${string}` {
  const hash = keccak256(toHex(id))
  return `0x${hash.slice(2, 42)}` as `0x${string}`
}

export interface RouteActionInput {
  protocolId: string
  actionType: number
  amount: string
}

export interface RouteAlternative {
  description: string
  fromProtocolId: string
  toProtocolId: string
  legIndex: number
  actions: RouteActionInput[]
  newAggregate: number
  newCompositionPenalty: number
  improvement: number
}

export type RouteScoreResult =
  | {
      ok: true
      aggregate: number
      compositionPenalty: number
      distinctProtocols: number
      allProtocolsScored: boolean
      protocolIds: string[]
      alternatives: RouteAlternative[]
    }
  | {ok: false; error: string}

async function scoreRouteOnChain(actions: RouteActionInput[]) {
  const onchainActions = actions.map((a) => ({
    protocol: placeholderProtocolAddress(a.protocolId),
    actionType: a.actionType,
    amount: BigInt(a.amount || '0'),
  }))
  return client.readContract({
    address: ORACLE_ADDRESS,
    abi: ORACLE_ABI,
    functionName: 'getRouteScore',
    args: [onchainActions],
  })
}

async function findAlternatives(
  inputActions: RouteActionInput[],
  inputAggregate: number,
): Promise<RouteAlternative[]> {
  // Pull every protocol's current aggregate in parallel
  const allScores = await Promise.all(
    PROTOCOLS.map(async (p) => {
      try {
        const s = await client.readContract({
          address: ORACLE_ADDRESS,
          abi: ORACLE_ABI,
          functionName: 'getProtocolScore',
          args: [placeholderProtocolAddress(p.id)],
        })
        return {id: p.id, aggregate: s.aggregate, hasScore: s.timestamp !== 0n}
      } catch {
        return {id: p.id, aggregate: 0, hasScore: false}
      }
    }),
  )
  const scoreOf = new Map(allScores.map((s) => [s.id, s.aggregate]))

  // For each leg, identify the best same-category swap that's not already in the route
  const inRoute = new Set(inputActions.map((a) => a.protocolId))
  const swapCandidates: Array<{legIndex: number; fromId: string; toId: string}> = []

  for (let i = 0; i < inputActions.length; i++) {
    const leg = inputActions[i]!
    const protocol = PROTOCOLS.find((p) => p.id === leg.protocolId)
    if (!protocol) continue
    const currentScore = scoreOf.get(leg.protocolId) ?? 0

    const alts = PROTOCOLS.filter(
      (p) =>
        p.category === protocol.category &&
        p.id !== leg.protocolId &&
        !inRoute.has(p.id) &&
        (scoreOf.get(p.id) ?? 0) > currentScore,
    ).sort((a, b) => (scoreOf.get(b.id) ?? 0) - (scoreOf.get(a.id) ?? 0))

    if (alts[0]) {
      swapCandidates.push({legIndex: i, fromId: leg.protocolId, toId: alts[0].id})
    }
  }

  // Rank candidates by the *per-leg* score improvement (not yet route-scored)
  swapCandidates.sort((a, b) => {
    const ia = (scoreOf.get(a.toId) ?? 0) - (scoreOf.get(a.fromId) ?? 0)
    const ib = (scoreOf.get(b.toId) ?? 0) - (scoreOf.get(b.fromId) ?? 0)
    return ib - ia
  })

  // Score the top 2 candidate routes on-chain (cheap because allProtocolsScored is fast)
  const topCandidates = swapCandidates.slice(0, 2)
  const scored = await Promise.all(
    topCandidates.map(async (c) => {
      const swappedActions = inputActions.map((a, idx) =>
        idx === c.legIndex ? {...a, protocolId: c.toId} : a,
      )
      const r = await scoreRouteOnChain(swappedActions)
      return {
        description: `${PROTOCOLS.find((p) => p.id === c.fromId)?.name} → ${PROTOCOLS.find((p) => p.id === c.toId)?.name}`,
        fromProtocolId: c.fromId,
        toProtocolId: c.toId,
        legIndex: c.legIndex,
        actions: swappedActions,
        newAggregate: r[0],
        newCompositionPenalty: r[1],
        improvement: r[0] - inputAggregate,
      } satisfies RouteAlternative
    }),
  )

  return scored.filter((s) => s.improvement > 0).sort((a, b) => b.improvement - a.improvement)
}

export async function scoreRouteAction(
  actions: RouteActionInput[],
): Promise<RouteScoreResult> {
  if (actions.length === 0) return {ok: false, error: 'route is empty — add at least one action'}

  try {
    const r = await scoreRouteOnChain(actions)

    let alternatives: RouteAlternative[] = []
    try {
      alternatives = await findAlternatives(actions, r[0])
    } catch {
      // Don't fail the whole score if alternatives lookup hits an RPC issue.
    }

    return {
      ok: true,
      aggregate: r[0],
      compositionPenalty: r[1],
      distinctProtocols: r[2],
      allProtocolsScored: r[3],
      protocolIds: actions.map((a) => a.protocolId),
      alternatives,
    }
  } catch (err) {
    return {ok: false, error: (err as Error).message}
  }
}
