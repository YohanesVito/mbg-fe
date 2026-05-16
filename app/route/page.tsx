import {PROTOCOLS} from '@/lib/protocols'
import {RouteBuilder, type RoutePreset} from './route-builder'

export const dynamic = 'force-dynamic'

const PRESETS: RoutePreset[] = [
  {
    id: 'simple-yield',
    title: 'Simple USDC yield',
    description:
      'You hand 5,000 USDC to an agent and say "park this for yield." The agent picks one lending market.',
    actions: [{protocolId: 'aave-v3-mantle', actionType: 1, amount: '5000'}],
  },
  {
    id: 'yield-plus-lst',
    title: 'Yield + LST stake',
    description:
      "Two-leg route: lend USDC on Aave, stake ETH for mETH. Demonstrates the composition penalty — two protocols means two surfaces of risk.",
    actions: [
      {protocolId: 'aave-v3-mantle', actionType: 1, amount: '5000'},
      {protocolId: 'meth-protocol', actionType: 3, amount: '2'},
    ],
  },
  {
    id: 'multi-hop',
    title: 'Risky multi-hop',
    description:
      'Swap on a lower-scored DEX, borrow against a weak collateral pair, stake into a thinly-audited LST. The kind of route an agent should refuse — and MBG should propose a safer alternative.',
    actions: [
      {protocolId: 'fusionx-v3', actionType: 0, amount: '5000'},
      {protocolId: 'lendle', actionType: 2, amount: '2000'},
      {protocolId: 'treehouse', actionType: 3, amount: '1'},
    ],
  },
]

export default function RoutePage() {
  const protocolOptions = PROTOCOLS.map((p) => ({id: p.id, name: p.name}))

  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <section className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight mb-3">Route risk checker</h1>

        <div className="space-y-3 text-zinc-300 leading-relaxed max-w-2xl">
          <p>
            Imagine an AI agent is about to move your money on Mantle —{' '}
            <span className="text-zinc-400">swap here, lend there, stake the rest.</span> That whole
            sequence is a <span className="text-zinc-100 font-medium">route</span>.
          </p>
          <p>
            This page <span className="text-zinc-100 font-medium">simulates exactly what the agent should ask MBG before signing.</span>
            One on-chain call, full route scored, composition risk priced in. The result comes with
            an attestation hash the agent shows you to prove it checked.
          </p>
        </div>

        <div className="mt-6">
          <div className="text-xs uppercase tracking-wide text-zinc-500 mb-2">
            Try a preset to see how it works
          </div>
          <p className="text-xs text-zinc-600 mt-2">
            Or build your own below — each leg is one DeFi move the agent would execute.
          </p>
        </div>
      </section>

      <RouteBuilder protocols={protocolOptions} presets={PRESETS} />
    </main>
  )
}
