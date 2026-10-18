---
id: agent-system
title: Agent system & orchestration loop
type: knowledge
status: active
owner: partner-b
updated: 2026-10-18
depends_on: [vision]
decisions: [D-021, D-070]
---

# 06 — Agent System

How work gets done in this repo: one orchestrator assesses each task, dispatches specialists in
parallel, runs the result through gates, and loops until it matches the goal — or stops and asks.

## The orchestrator is the main session

Not a subagent. Two reasons, both binding:

1. [[vision]] lists "building a custom multi-agent framework" as an explicit **non-goal** —
   "we configure Claude Code's native machinery". A homegrown supervisor would be exactly the
   thing we said we would not build.
2. Subagents start cold. They cannot see the conversation, cannot ask the founder a question, and
   cannot reliably supervise other subagents. An orchestrator that has to re-derive context on
   every hop is slower and worse than one that already has it.

So the loop is **protocol, not plumbing**. The main session reads it and follows it. There is no
runtime to maintain, nothing to keep in sync, and nothing that breaks when Claude Code updates.

## Tiering — when the loop fires

Running six agents to fix a comma is theatre. Classify first:

| Tier | Trigger | Path |
|---|---|---|
| **Direct** | Read-only question · typo · one-line change · a single file that is not UI or customer-facing German · a new dated note under `docs/research/` that cites no decision · a one-line correction of a STATE.md fact that the code or `git log` contradicts (cite the evidence in the commit) | Just do it. No agents, no ceremony. The orchestrator runs `npm run kb`; the regenerated `docs/INDEX.md` and a frontmatter `updated` bump do not count as extra files. |
| **Loop** | Any UI file · any customer-facing German · anything else in `docs/` · two or more files · any task whose verb is *build*, *design*, *rewrite*, *migrate* | Full cycle below. |
| **Blocked** | The task depends on a decision marked `PENDING` in [[decisions]] | Stop. Ask the founder. Do not assume. |

When genuinely unsure which tier applies, take the higher one. The cost of an unnecessary gate is
minutes; the cost of shipping unreviewed German copy to a Mittelstand buyer is the client.

`/ship <task>` forces the Loop tier regardless of classification.

## The loop

```
1 INTAKE     Restate the task in one sentence. STATE.md is already loaded
             with CLAUDE.md — do not re-read it (unless that import failed);
             read INDEX.md's routing table and open only the docs it names.
             Write acceptance criteria that are CHECKABLE, not vibes:
               bad  — "the hero should look better"
               good — "hero H1 renders at 360px without overflow; contrast
                       ≥ 4.5:1; no second signal element in the viewport"
             If a PENDING decision blocks the task, stop here and ask.

2 PLAN       Split into lanes. For each lane state:
               - what it owns, and what it must NOT touch
               - which doc ids it must read first
               - whether it is independent (parallel-safe) or sequential
             Lanes that would edit the same file are NOT independent.
             Every user-visible string lives in website/src/i18n/ui.ts, so
             two lanes that both add strings collide there: run them in
             sequence, or let one lane add the keys first and brief the
             others with the key names.

3 DISPATCH   One agent per independent lane, dispatched in parallel in a
             single message. Each brief carries: the acceptance criteria,
             the lane boundary, and the doc ids. Sequential lanes wait.

4 INTEGRATE  The orchestrator merges the outputs and resolves conflicts
             itself. Agents do not negotiate with each other — they cannot
             see each other's work, and asking them to is how you get two
             agents confidently contradicting each other.

5 GATE       Mandatory, by what actually changed:
               design-critic   any file under website/ that renders
               copywriter-de   any customer-facing German string
               qa-reviewer     always, before commit
               kb-curator      anything under docs/, or a schema file
                               (CLAUDE.md, website/CLAUDE.md, .claude/agents/,
                               .claude/commands/)
             Gates return a verdict plus findings as file:line — issue — fix.

6 VERDICT    Compare the gate findings against the step-1 criteria.
               PASS  -> commit; append any lasting decision to 05-decisions.md
                        in the SAME commit (constitution rule 6)
               FAIL  -> return to step 3 with ONLY the failing findings as the
                        new lane scope. Do not re-run passing lanes.
             Hard cap: 3 iterations. Then stop and report to the founder.
```

**Why the cap.** A loop without a termination condition does not converge — it burns budget
rediscovering the same disagreement between two agents that each think they are right. Three
passes is enough to fix real problems and not enough to hide a disagreement that needs a human.
If you hit the cap, say so plainly and show both positions.

## Roster

| Agent | Fires when | Must not |
|---|---|---|
| `frontend-dev` | Building or changing anything under `website/` | Write German customer copy — that is `copywriter-de`'s |
| `copywriter-de` | Any German sentence a client will read | Touch code, or write legal text (Impressum, Datenschutz, AVV) |
| `design-critic` | After any UI change, before commit | Approve on taste alone — findings cite the brand doc |
| `qa-reviewer` | Before every commit and deploy | Pass anything uncertain — it is the last line |
| `kb-curator` | After any `docs/` or schema-file change outside the Direct carve-outs, and at session end when decisions were made | Edit historical D-entries |
| `researcher` | Before architectural or business decisions | Present speculation as fact |

Every agent reads [INDEX.md](INDEX.md) first — that is the map that tells it which document
answers its question, so it opens one file instead of six.

## Memory — the knowledge base is the working memory

Chat is not storage. A session that re-derives what the last one knew is the slowest session there
is, so the repo keeps its memory in files, in three layers (D-070; the pattern and its sources are
in [[research-cognitive-system]]):

| Layer | Here | Who writes it |
|---|---|---|
| **Raw evidence** — read, dated, cited, never rewritten | `docs/research/*.md`, `docs/clients/*/brief.md`, anything the founder supplied verbatim | the founder, or an agent filing a dated note; corrections are new notes |
| **The compiled state** — what is true now, and why | `docs/STATE.md` (now), `docs/05-decisions.md` (why, append-only), the governing docs, `docs/INDEX.md` (generated) | Claude, in the same commit as the change it describes |
| **The schema** — how the agent works here | `CLAUDE.md`, `website/CLAUDE.md`, `.claude/agents/*.md`, `.claude/commands/*.md` (the graph build reads these and `kb-curator` gates them); `.claude/settings.json` holds the hooks and is outside the graph, gated by `qa-reviewer` | the founders and Claude together; every change is a commit |

Three operations keep it alive:

- **Ingest** — a decision, a shipped change or a founder correction lands in the file that governs
  it in the same session, never only in chat: a D-entry plus the governing doc's frontmatter plus
  the STATE line, in one commit (`kb-curator`). A correction given a second time is written into
  the agent file, `DESIGN.md` or `CLAUDE.md` before the session ends.
- **Query, then file back** — an answer that took more than one file to derive goes into
  `docs/research/<topic>.md`, dated, or into a D-entry. Filing a note that cites no decision is
  Direct-tier work; the orchestrator runs `npm run kb` and stages the regenerated `INDEX.md`.
- **Lint** — `npm run kb` on every graph-covered commit: a Claude Code hook refuses a commit made
  from a session otherwise, while a commit from a terminal is not gated and needs the run by
  hand. And the `/kb` drift report at the weekly rhythm ([[delivery]]), which is where stale
  claims, orphans and closed open items are caught before a gate trips over them.

Two budgets keep the bootstrap readable: `CLAUDE.md` and `docs/STATE.md` load into every session,
so `npm run kb` fails when either outgrows its line budget. Anything that explains *how* or *why*
leaves STATE.md for the governing doc or a D-entry, and a pointer stays.

Effort follows the tier. Direct work runs at the session default; spend more only on Loop-tier
intake and verdict. A cheaper model for `qa-reviewer`, `kb-curator` or a research lane is an
experiment with a number attached (iterations to PASS, findings per iteration), never a standing
change; the brand gates, `design-critic` and `copywriter-de`, keep the session model (D-070) —
they exist to catch what a brand violation would cost.

## Anti-patterns

- **Dispatching agents for trivial work.** Tier it first. Direct is a legitimate answer.
- **Re-deriving in chat what a file already holds.** If the answer took three files to find, file
  it. The next session starts from the note, not from the three files.
- **Lanes that overlap.** Two agents editing one file produces a merge conflict the orchestrator
  then has to untangle by hand. If lanes share a file, they are sequential.
- **Vague acceptance criteria.** "Make it premium" is not checkable, so the gate cannot fail it,
  so the loop cannot terminate. Write criteria you could hand to a stranger.
- **Re-running passing lanes on a FAIL.** Wastes budget and risks regressing work that was fine.
- **Letting the loop run past the cap.** Three iterations, then a human decides.
- **Skipping the decision log.** A decision that is not in [[decisions]] did not happen — the next
  session will re-litigate it.
