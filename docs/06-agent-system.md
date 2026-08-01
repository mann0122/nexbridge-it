---
id: agent-system
title: Agent system & orchestration loop
type: knowledge
status: active
owner: partner-b
updated: 2026-08-01
depends_on: [vision]
decisions: [D-021]
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
| **Direct** | Read-only question · typo · one-line change · a single file that is not UI or customer-facing German | Just do it. No agents, no ceremony. |
| **Loop** | Any UI file · any customer-facing German · anything in `docs/` · two or more files · any task whose verb is *build*, *design*, *rewrite*, *migrate* | Full cycle below. |
| **Blocked** | The task depends on a decision marked `PENDING` in [[decisions]] | Stop. Ask the founder. Do not assume. |

When genuinely unsure which tier applies, take the higher one. The cost of an unnecessary gate is
minutes; the cost of shipping unreviewed German copy to a Mittelstand buyer is the client.

`/ship <task>` forces the Loop tier regardless of classification.

## The loop

```
1 INTAKE     Restate the task in one sentence. Read STATE.md and INDEX.md.
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
               kb-curator      anything under docs/
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
| `kb-curator` | After any `docs/` change, and at session end when decisions were made | Edit historical D-entries |
| `researcher` | Before architectural or business decisions | Present speculation as fact |

Every agent reads [INDEX.md](INDEX.md) first — that is the map that tells it which document
answers its question, so it opens one file instead of six.

## Anti-patterns

- **Dispatching agents for trivial work.** Tier it first. Direct is a legitimate answer.
- **Lanes that overlap.** Two agents editing one file produces a merge conflict the orchestrator
  then has to untangle by hand. If lanes share a file, they are sequential.
- **Vague acceptance criteria.** "Make it premium" is not checkable, so the gate cannot fail it,
  so the loop cannot terminate. Write criteria you could hand to a stranger.
- **Re-running passing lanes on a FAIL.** Wastes budget and risks regressing work that was fine.
- **Letting the loop run past the cap.** Three iterations, then a human decides.
- **Skipping the decision log.** A decision that is not in [[decisions]] did not happen — the next
  session will re-litigate it.
