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
          <span className="text-zinc-100 font-medium">OpenClaw-compatible Skill</span>. Any agent
          framework that speaks the Byreal Skills CLI — RealClaw, custom OpenClaw agents — can
          install <span className="mono">mbg-cli</span> in one command and gain TEE-attested
          on-chain risk scoring before it routes a user's funds.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xs uppercase tracking-wide text-zinc-500 mb-3">
          install (OpenClaw Skills CLI)
        </h2>
        <CodeBlock>{`# Add the MBG Skill to your OpenClaw agent
npx skills add YohanesVito/mbg-mantle/skills/mbg

# Verify it loaded
mbg-cli skill          # prints full SKILL.md
mbg-cli catalog list   # lists every capability`}</CodeBlock>
        <p className="text-xs text-zinc-500 mt-3">
          Once installed, the agent's LLM sees the Skill description and routes any
          "is this protocol safe?" / "what's the risk of this route?" question through
          <span className="mono"> mbg-cli</span>. No manual prompting required.
        </p>
      </section>

      <section className="mb-10">
        <h2 className="text-xs uppercase tracking-wide text-zinc-500 mb-3">
          install (local clone, hackathon-style)
        </h2>
        <CodeBlock>{`# Clone the upstream backend repo
git clone https://github.com/YohanesVito/mbg-mantle.git
cd mbg-mantle/skills/mbg

# Install deps + link the binary
bun install
bun link

# Now mbg-cli is on your PATH
mbg-cli list-protocols`}</CodeBlock>
        <p className="text-xs text-zinc-500 mt-3">
          Useful while the Skill isn't published to npm. The same{' '}
          <span className="mono">mbg-cli</span> binary, just linked from source.
        </p>
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
