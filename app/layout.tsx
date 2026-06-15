import './globals.css'
import type {Metadata} from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'MBG — Mantle Bot Gate',
  description:
    'Autonomous risk-scoring agent for Mantle DeFi. TEE-attested, on-chain, ERC-8004 #130. Trading agents consult MBG before signing.',
  metadataBase: new URL('https://mbg-fe.vercel.app'),
  openGraph: {
    title: 'MBG — Mantle Bot Gate',
    description:
      'Autonomous risk-scoring agent for Mantle DeFi. TEE-attested, on-chain, ERC-8004 #130.',
    url: 'https://mbg-fe.vercel.app',
    siteName: 'MBG',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'MBG — Mantle Bot Gate',
    description:
      'Autonomous risk-scoring agent for Mantle DeFi. TEE-attested, on-chain, ERC-8004 #130.',
  },
}

function GateMark({className = ''}: {className?: string}) {
  // Two pillars + a top crossbar with an asymmetric notch near the right corner.
  // Uses currentColor so it inherits text color (light on dark, dark on light).
  return (
    <svg
      viewBox="0 0 28 28"
      fill="currentColor"
      aria-hidden="true"
      className={className}
    >
      <rect x="4" y="4" width="3" height="20" />
      <rect x="21" y="4" width="3" height="20" />
      <rect x="4" y="4" width="15" height="3" />
    </svg>
  )
}

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-[#07070a] text-zinc-100 antialiased">
        <header className="border-b border-zinc-900/80">
          <div className="mx-auto max-w-6xl px-6 py-5 flex items-center gap-6">
            <Link
              href="/"
              className="font-semibold tracking-tight text-lg flex items-center gap-2.5"
              aria-label="MBG — Mantle Bot Gate, home"
            >
              <GateMark className="w-6 h-6 text-zinc-100" />
              <span>
                MBG <span className="text-zinc-500 font-normal text-sm">Mantle Bot Gate</span>
              </span>
            </Link>
            <nav className="flex items-baseline gap-5 text-sm">
              <Link href="/" className="text-zinc-400 hover:text-zinc-100 transition-colors">
                protocols
              </Link>
              <Link href="/route" className="text-zinc-400 hover:text-zinc-100 transition-colors">
                route checker
              </Link>
              <Link href="/skill" className="text-zinc-400 hover:text-zinc-100 transition-colors">
                install skill
              </Link>
            </nav>
            <span className="text-zinc-500 text-sm ml-auto">
              pre-trade risk gate for Mantle agents
            </span>
          </div>
        </header>
        {children}
        <footer className="border-t border-zinc-900/80 mt-24">
          <div className="mx-auto max-w-6xl px-6 py-5 text-xs text-zinc-500 flex justify-between gap-6">
            <span>
              MBG v0 — live on Mantle Mainnet. Skill on npm:{' '}
              <a
                href="https://www.npmjs.com/package/mbg-score"
                target="_blank"
                rel="noopener noreferrer"
                className="mono text-cyan-400 hover:text-cyan-300"
              >
                mbg-score
              </a>
              . ERC-8004 agentId 130. v1 attestation migrates to full Phala TDX post-hackathon.
            </span>
            <span className="mono">scoring: @mbg/be · attestation: @mbg/tee-worker · oracle: RiskOracle.sol</span>
          </div>
        </footer>
      </body>
    </html>
  )
}
