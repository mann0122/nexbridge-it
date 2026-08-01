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
website/           The site: Astro 5 + Tailwind, live on nexbridge-it.com.
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
site was live on the `.com`. Prose cross-references rot silently. Declared edges fail loudly.

If you edit anything under `docs/`, run `npm run kb` before committing.

## How the agent system works

`CLAUDE.md` loads every session and classifies incoming work. Trivial and read-only tasks go
direct. Anything touching UI, customer-facing German, `docs/`, or multiple files runs the full
loop: intake with checkable acceptance criteria → parallel lanes → integrate → gates
(`design-critic`, `copywriter-de`, `kb-curator`, `qa-reviewer`) → verdict, re-dispatching only the
failing findings, capped at three iterations before a human decides.

The orchestrator is the main session, not a subagent — it already holds the context a spawned
supervisor would have to re-derive. Full protocol: [`docs/06-agent-system.md`](docs/06-agent-system.md).

## Keeping claude.ai chats in sync

Claude Code cannot read claude.ai conversations. The contract: any lasting decision made anywhere
gets appended to `docs/05-decisions.md` and committed. Upload `CLAUDE.md` + `docs/` into a
claude.ai Project's knowledge so chat-Claude shares the same brain.

## Open items

Tracked in [`docs/STATE.md`](docs/STATE.md), ranked, with owners — not here, so there is one place
to look and one place to update.
