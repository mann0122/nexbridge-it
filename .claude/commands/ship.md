---
description: Run a task through the full orchestration loop — lanes, parallel agents, gates, verdict
argument-hint: <what to build or change>
---
Run **$ARGUMENTS** through the full loop from `docs/06-agent-system.md`. Do not shortcut it even
if the task looks small — that is what the Direct tier is for, and the founder chose this command
deliberately.

**1 — Intake.** Read `docs/STATE.md` and `docs/INDEX.md`. Restate the task in one sentence, then
write acceptance criteria that are checkable, not vibes. "Looks premium" cannot fail a gate, so it
cannot terminate the loop; "no horizontal overflow at 360px, contrast ≥ 4.5:1, one signal element
per viewport" can. Show the criteria before doing anything else.

If the task depends on a decision marked PENDING in `docs/05-decisions.md`, **stop here and ask
the founder.** Do not proceed on an assumption.

**2 — Plan.** Split into lanes. For each: what it owns, what it must not touch, which docs it must
read, and whether it is independent. Lanes that would edit the same file are sequential, not
parallel. Show the lane table.

**3 — Dispatch.** One agent per independent lane, in parallel, in a single message. Each brief
carries the acceptance criteria, the lane boundary, and the doc ids. `frontend-dev` builds,
`copywriter-de` writes German, `researcher` investigates.

**4 — Integrate.** Merge the outputs yourself and resolve conflicts. Do not ask two agents to
reconcile with each other — they cannot see each other's work.

**5 — Gate.** By what actually changed:
- any file under `website/` that renders → `design-critic`
- any customer-facing German string → `copywriter-de`
- anything under `docs/` → `kb-curator`, and `npm run kb` must be green
- always, before commit → `qa-reviewer`

**6 — Verdict.** Compare findings against the step-1 criteria and state it plainly: PASS or FAIL,
with evidence. On PASS, commit in small conventional commits and append any lasting decision to
`docs/05-decisions.md` in the same commit. On FAIL, return to step 3 with **only the failing
findings** as the new lane scope — do not re-run lanes that passed.

**Hard cap: 3 iterations.** If it still fails, stop and report to the founder: what passes, what
does not, and — if two agents disagree — both positions, so a human can decide. Do not keep
looping. Report the iteration count in your final summary either way.
