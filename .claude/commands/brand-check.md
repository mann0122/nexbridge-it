---
description: Audit changed UI files and copy against the brand system
---
1. `git diff --name-only HEAD` (fall back to `git status --porcelain`) to find changed files in
   `website/` and any customer-facing markdown.
2. Delegate the visual/code audit to the design-critic agent and the German copy audit to the
   copywriter-de agent, in parallel.
3. Merge results into one report: verdict (SHIP / FIX FIRST), violations as `file:line — issue —
   fix`, max three ranked improvements. If docs/02-brand.md palette is still PENDING (D-003),
   flag that first and stop — no UI ships on an undecided palette.
