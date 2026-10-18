---
description: Run a task through the full orchestration loop — lanes, parallel agents, gates, verdict
argument-hint: <what to build or change>
---
Run **$ARGUMENTS** through the loop in `docs/06-agent-system.md` (§The loop), step by step. Do
not shortcut it even if the task looks small — that is what the Direct tier is for, and the founder
chose this command deliberately. The protocol lives in that one file; this command only adds:

- **Before any work**, show the one-sentence restatement and the checkable acceptance criteria.
  "Looks premium" cannot fail a gate, so it cannot terminate the loop; "no horizontal overflow at
  360px, contrast ≥ 4.5:1, one signal element per viewport" can.
- `docs/STATE.md` is already loaded with `CLAUDE.md` — do not re-read it (unless that import
  failed). Read the routing table in `docs/INDEX.md` and open only the documents it names.
- If the task depends on a decision marked PENDING in `docs/05-decisions.md`, **stop and ask the
  founder** before step 2. Do not proceed on an assumption.
- Show the lane table before dispatching, and the gate verdicts (PASS / FAIL, with evidence)
  before committing.
- **Hard cap: 3 iterations.** If it still fails, stop and report to the founder: what passes, what
  does not, and — if two agents disagree — both positions, so a human can decide.
- In the final summary report the iteration count and the gate findings per iteration, so a
  later change to the loop can be measured against this run (CLAUDE.md, Memory).
