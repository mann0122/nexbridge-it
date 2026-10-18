---
description: Rebuild the knowledge graph and report drift across docs/
---
1. Run `npm run kb`. It regenerates `docs/INDEX.md` from the frontmatter in `docs/`, and exits
   non-zero on a broken edge: a `depends_on` or `[[link]]` pointing at no document, a cited
   D-number that does not exist, a doc citing a SUPERSEDED decision as if it were live, a
   D-number cited in prose by `CLAUDE.md`, `website/CLAUDE.md`, an agent or a command file that
   does not exist (a superseded one there only warns), or `CLAUDE.md` / `docs/STATE.md` over its
   line budget (D-070).

2. If it is **red**: fix the cause. Never silence an error by deleting the reference — a broken
   edge means either the frontmatter is wrong or a document is missing, and both are real. A
   blown budget means how-or-why crept into a bootstrap file: move it to the governing doc or a
   D-entry and leave a pointer.

3. If it is **green**: check the already-loaded `docs/STATE.md` against reality and report drift
   (this is the one legitimate re-read — it is the lint). Specifically check the claims that have
   gone stale before:
   - the live domain and what `website/src/config/site.ts` actually says
   - the public price, against the newest non-superseded pricing decision
   - which routes actually exist under `website/src/pages/`
   - whether any open item in STATE.md has quietly been closed by a commit
   - whether an agent or command file states a fact a later decision retired
   Use `git log --oneline -15` for what has landed recently.

4. Report: graph counts, anything fixed, and any contradiction between documents with the evidence
   for it. Where the truth cannot be established from the repo, mark it `TBD:` with an owner and
   say so — **never resolve a contradiction by picking the more plausible option.**

Delegate step 3 to the `kb-curator` agent if the drift is more than a line or two.
