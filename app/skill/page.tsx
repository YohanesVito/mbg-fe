export const dynamic = 'force-static'

export const metadata = {
  title: 'MBG Skill — Install in your agent',
  description:
    'Install the MBG (Mantle Bot Gate) Skill into any OpenClaw-compatible agent. mbg-cli gives your agent on-chain TEE-attested risk scoring before it routes user funds.',
}

function CodeBlock({children}: {children: React.ReactNode}) {
  return (
    <pre className="mono text-sm text-zinc-200 bg-black/50 border border-zinc-900 rounded px-4 py-3 overflow-x-auto">
      {children}
    </pre>
  )
}

export default function SkillPage() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-12">
      <section className="mb-10">
        <h1 className="text-3xl font-semibold tracking-tight mb-3">
          Install the MBG Skill in your agent
        </h1>
        <p className="text-zinc-300 leading-relaxed max-w-2xl">
          MBG ships as an{' '}
          <span className="text-zinc-100 font-medium">OpenClaw-compatible Skill</span>, published
          to npm as{' '}
          <a
            href="https://www.npmjs.com/package/mbg-score"
            target="_blank"
            rel="noopener noreferrer"
            className="mono text-cyan-400 hover:text-cyan-300"
          >
            mbg-score
          </a>
          . Any Node 18+ agent runtime — RealClaw, Brahma, Hey Anon, Giza ARMA, custom OpenClaw
          agents, or your own — can install <span className="mono">mbg-cli</span> in one command
          and gain TEE-attested on-chain risk scoring before it routes a user&apos;s funds. Defaults
          read live Mantle Mainnet; zero config required.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xs uppercase tracking-wide text-zinc-500 mb-3">
          install (npm — works in any Node 18+ runtime)
        </h2>
        <CodeBlock>{`# Install globally
npm install -g mbg-score
# or
bun add -g mbg-score

# Verify it loaded (no env vars needed — defaults to Mantle Mainnet)
mbg-cli skill              # prints full SKILL.md
mbg-cli list-protocols     # 13 scored protocols
mbg-cli score-protocol aave-v3-mantle`}</CodeBlock>
        <p className="text-xs text-zinc-500 mt-3">
          Real, live Mantle Mainnet score (TEE-attested signer + on-chain trace hash) returned in
          one command. Override <span className="mono">MBG_RPC_URL</span> /{' '}
          <span className="mono">MBG_CHAIN_ID</span> /{' '}
          <span className="mono">MBG_ORACLE_ADDRESS</span> for local Anvil or Sepolia.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xs uppercase tracking-wide text-zinc-500 mb-3">
          install (OpenClaw Skills CLI, for Byreal-runtime agents)
        </h2>
        <CodeBlock>{`# Add directly via OpenClaw Skills CLI
npx skills add mbg-score

# Once added, the agent's LLM auto-discovers the Skill from SKILL.md
# and routes any "is this safe?" / "what's the risk of this route?"
# question through mbg-cli — no manual prompting.`}</CodeBlock>
      </section>

      <section className="mb-10">
        <h2 className="text-xs uppercase tracking-wide text-zinc-500 mb-3">
          what the agent gets
        </h2>
        <div className="rounded-lg border border-zinc-800 px-5 py-4 space-y-4 text-sm">
          <div>
            <div className="text-zinc-100 font-medium mb-1 mono">mbg-cli list-protocols</div>
            <div className="text-zinc-400">
              Enumerate every Mantle protocol MBG can score. Output is human-readable by default;
              pass <span className="mono">-o json</span> for machine parsing.
            </div>
          </div>
          <div>
            <div className="text-zinc-100 font-medium mb-1 mono">mbg-cli score-protocol &lt;id&gt;</div>
            <div className="text-zinc-400">
              Current TEE-attested score for one protocol, including the 4 on-chain components
              (contract / liquidity / centralization / oracle), the attestation hash, the signer,
              and the timestamp.
            </div>
          </div>
          <div>
            <div className="text-zinc-100 font-medium mb-1 mono">mbg-cli score-route '&lt;json&gt;'</div>
            <div className="text-zinc-400">
              Compose a multi-leg route, get the aggregate + composition penalty + distinct-protocol
              count + all-scored flag — same on-chain math we expose at{' '}
              <a href="/route" className="text-cyan-400 hover:text-cyan-300">
                /route
              </a>
              .
            </div>
          </div>
        </div>
      </section>

      <section className="mb-10">
        <h2 className="text-xs uppercase tracking-wide text-zinc-500 mb-3">
          example: end-to-end agent flow
        </h2>
        <CodeBlock>{`# User: "park 5000 USDC on Mantle for yield"

# 1. Agent enumerates lending candidates on Mantle
mbg-cli list-protocols -o json | jq '.[] | select(.category == "lending")'

# 2. Agent scores each candidate
mbg-cli score-protocol aave-v3-mantle -o json
mbg-cli score-protocol lendle -o json
mbg-cli score-protocol init-capital -o json

# 3. Agent scores the *proposed* route on-chain (single view call)
mbg-cli score-route '[
  {"protocolId":"aave-v3-mantle","actionType":1,"amount":"5000"}
]'

# 4. Agent surfaces the recommendation WITH the attestation hash
#    User can verify on Mantlescan that the agent really consulted MBG`}</CodeBlock>
      </section>

      <section className="mb-10">
        <h2 className="text-xs uppercase tracking-wide text-zinc-500 mb-3">
          hard constraints the Skill enforces
        </h2>
        <ol className="list-decimal list-inside space-y-2 text-sm text-zinc-300 leading-relaxed">
          <li>
            <span className="text-zinc-100">Always consult MBG before routing.</span> Even when the
            user names a "trusted" protocol, the score may have changed.
          </li>
          <li>
            <span className="text-zinc-100">Surface the score and attestation hash.</span> Hidden
            risk is the failure mode the Skill exists to prevent.
          </li>
          <li>
            <span className="text-zinc-100">Refuse to route below threshold without explicit user override.</span>{' '}
            If any leg scores below 4.00, ask the user to confirm in plain language.
          </li>
          <li>
            <span className="text-zinc-100">Never strip the attestation hash from output.</span>{' '}
            The user (or another verifier) needs it to validate.
          </li>
          <li>
            <span className="mono text-zinc-100">-o json</span> for internal parsing;
            human-readable for user-facing surfaces.
          </li>
        </ol>
      </section>

      <section className="mb-10">
        <h2 className="text-xs uppercase tracking-wide text-zinc-500 mb-3">
          links
        </h2>
        <div className="rounded-lg border border-zinc-800 px-5 py-4 text-sm space-y-2">
          <div className="flex gap-3">
            <span className="text-zinc-500 w-32">npm package</span>
            <a
              href="https://www.npmjs.com/package/mbg-score"
              target="_blank"
              rel="noopener noreferrer"
              className="mono text-cyan-400 hover:text-cyan-300 break-all"
            >
              npmjs.com/package/mbg-score
            </a>
          </div>
          <div className="flex gap-3">
            <span className="text-zinc-500 w-32">Skill source</span>
            <a
              href="https://github.com/YohanesVito/mbg-mantle/tree/main/skills/mbg"
              target="_blank"
              rel="noopener noreferrer"
              className="mono text-cyan-400 hover:text-cyan-300 break-all"
            >
              github.com/YohanesVito/mbg-mantle/skills/mbg
            </a>
          </div>
          <div className="flex gap-3">
            <span className="text-zinc-500 w-32">SKILL.md</span>
            <a
              href="https://github.com/YohanesVito/mbg-mantle/blob/main/skills/mbg/SKILL.md"
              target="_blank"
              rel="noopener noreferrer"
              className="mono text-cyan-400 hover:text-cyan-300 break-all"
            >
              SKILL.md on GitHub
            </a>
          </div>
          <div className="flex gap-3">
            <span className="text-zinc-500 w-32">OpenClaw docs</span>
            <a
              href="https://docs.openclaw.ai/tools/skills"
              target="_blank"
              rel="noopener noreferrer"
              className="mono text-cyan-400 hover:text-cyan-300 break-all"
            >
              docs.openclaw.ai/tools/skills
            </a>
          </div>
          <div className="flex gap-3">
            <span className="text-zinc-500 w-32">Byreal Skills repo</span>
            <a
              href="https://github.com/byreal-git/byreal-agent-skills"
              target="_blank"
              rel="noopener noreferrer"
              className="mono text-cyan-400 hover:text-cyan-300 break-all"
            >
              byreal-git/byreal-agent-skills (reference)
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}
