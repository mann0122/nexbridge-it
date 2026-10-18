# NexBridge-IT — Venture OS

The operating system of the NexBridge-IT venture: knowledge base (`docs/`), agent system
(`.claude/`), business templates (`ops/`), and the marketing website (`website/`).

**Start here:** [`docs/STATE.md`](docs/STATE.md) — where things stand right now, in one file.
Then [`docs/INDEX.md`](docs/INDEX.md) — the map of everything else.

## Layout

```
CLAUDE.md          The constitution. Auto-loads into every Claude Code session.
DESIGN.md          Committed visual world. Stays at root — the impeccable skill reads it there.
PRODUCT.md         Product schema. Same constraint.
docs/              Knowledge base. Graph-linked, generated index, append-only decision log.
ops/               Business templates (Angebot, Rechnung) + the graph generator.
website/           The site: Astro 7 + Tailwind 4, deployed to nexbridge-it.com.
.claude/           Agents, slash commands, skills, hooks.
```

## Commands

```
npm run kb           Rebuild docs/INDEX.md. Fails on broken references — see below.
npm run site         Dev server for the website (localhost:4321)
npm run site:build   Production build
```

In Claude Code:

```
/ship <task>         Run a task through the full orchestration loop
/kb                  Rebuild the graph and report drift across docs/
/brand-check         Audit changed UI and copy against the brand system
/new-client <name>   Scaffold a client workspace
/proposal <name>     Draft a German Angebot from that client's brief
```

## The knowledge graph

Every document in `docs/` declares what it depends on and which decisions it rests on. `npm run kb`
builds the index from those declarations and **refuses to write when an edge is broken** — an
unknown id, a cited decision that does not exist, or a document citing a superseded decision as if
it were live.

This is not ceremony. Four files once disagreed about our own domain: one said the `.de` belonged
to someone else, the decision log said it was free, this README said register the `.io`, and the
site was deployed to the `.com`. Prose cross-references rot silently; declared edges fail loudly.

It has limits worth knowing: it checks that a cited decision *exists* and is live, not that the
decision's content supports the claim citing it. That gap is how `D-015` — an entry about a
`pages.dev` preview — ended up cited as the authority for moving to a Worker. Reading is still
your job.

If you edit anything the graph covers — `docs/`, `CLAUDE.md`, `website/CLAUDE.md`, this file,
`DESIGN.md`, `PRODUCT.md`, `.claude/agents/`, `.claude/commands/` or the graph script — run
`npm run kb` before committing. Since D-070 a Claude Code hook
(`ops/scripts/commit-gate.mjs`) refuses a `git commit` made from a session while a graph-covered
file differs from HEAD and the build is red or `docs/INDEX.md` is stale; a commit from a terminal
is not gated. The build also fails when `CLAUDE.md` or `docs/STATE.md` outgrows its line budget —
those two load into every session.

## How the agent system works

`CLAUDE.md` loads every session and classifies incoming work by a tier table. Trivial and
read-only tasks go direct — since D-070 so do a dated research note and a one-line STATE.md fact
fix. Anything else touching UI, customer-facing German, `docs/`, or multiple files runs the loop
in `docs/06-agent-system.md`: intake with checkable acceptance criteria → parallel lanes →
integrate → gates → verdict, re-dispatching only the failing findings, capped at three
iterations before a human decides.

The orchestrator is the main session, not a subagent — it already holds the context a spawned
supervisor would have to re-derive. Full protocol: [`docs/06-agent-system.md`](docs/06-agent-system.md).

## Keeping claude.ai chats in sync

Claude Code cannot read claude.ai conversations. The contract: any lasting decision made anywhere
gets appended to `docs/05-decisions.md` and committed. Upload `CLAUDE.md` + `docs/` into a
claude.ai Project's knowledge so chat-Claude shares the same brain.

## Open items

Tracked in [`docs/STATE.md`](docs/STATE.md), ranked, with owners — not here, so there is one place
to look and one place to update.
