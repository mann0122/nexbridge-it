# CLAUDE.md — NexBridge-IT

You are working inside the venture repo of **NexBridge-IT** — a German freelance venture selling
**Automatisierung, KI-Agenten, Dashboards und Individualsoftware** to German SMBs (Mittelstand).
Two people: a German partner doing sales/network, a technical founder doing delivery. You are the
delivery engine.

## Session bootstrap

@docs/STATE.md

If that import did not inline, read `docs/STATE.md` now — where things stand, in one file.
`docs/INDEX.md` is the map of everything else: which document answers which question, so you open
one file instead of six. This file and STATE.md are kept short on purpose: `npm run kb` fails when
either outgrows its line budget (D-070).

## Prime directive
`docs/` is the single source of truth and `docs/INDEX.md` is its index. STATE.md is already
loaded above — do not re-read it (unless that import failed). Before any non-trivial task, follow
the graph from `INDEX.md` to the documents that govern it — usually some of `00-vision.md`, `01-offer.md`, `02-brand.md`,
`05-decisions.md`. If a task touches the website, also read `03-website-spec.md`. If a decision is
marked PENDING in the decision log, ask the human before building on top of it — never assume.

## Hard rules
1. Never invent prices, legal text, client names, testimonials, or statistics. Placeholders are
   marked `TBD:` — leave them or ask.
2. Website copy is German-first (Sie-Form). All customer-facing German text goes through the
   `copywriter-de` agent before it ships.
3. Any change to UI files triggers a `design-critic` review before commit.
4. Impressum and Datenschutzerklärung are legally required pages. Generate structure only; final
   text comes from a generator + human/lawyer review. Say so in comments.
5. GDPR-first is our positioning: no tracking cookies, no US-hosted analytics defaults, only the
   first-party stats of D-063 (cookieless, no IP at rest) or nothing, forms need an explicit
   consent checkbox.
6. When new lasting decisions are made in a session, append them to `docs/05-decisions.md` in the
   same commit. The log is append-only — supersede, never rewrite history.
7. Touching anything the graph covers — `docs/`, this file, `website/CLAUDE.md`, `README.md`,
   `DESIGN.md`, `PRODUCT.md`, `.claude/agents/`, `.claude/commands/` or the graph script — means
   `npm run kb` green before commit. It rebuilds the graph and fails on broken references, on a
   cited decision that does not exist and on a blown line budget (a superseded citation in prose
   only warns). A Claude Code hook refuses a commit made from a session otherwise
   (`ops/scripts/commit-gate.mjs`, D-070); a commit from a terminal is not gated and needs the
   run by hand. A red build is a real error, not a formality.

## How work gets done — tiering

Do not run six agents to fix a comma, and do not ship German copy unreviewed. Classify first:

| Tier | Trigger | Path |
|---|---|---|
| **Direct** | Read-only question · typo · one-line change · a single file that is not UI or customer-facing German · a new dated note under `docs/research/` that cites no decision · a one-line correction of a STATE.md fact that the code or `git log` contradicts (cite the evidence in the commit) | Just do it. No agents. You run `npm run kb`; the regenerated `docs/INDEX.md` and a frontmatter `updated` bump do not count as extra files. |
| **Loop** | Any UI file · any customer-facing German · anything else in `docs/` · two or more files · any task whose verb is *build*, *design*, *rewrite*, *migrate* | The loop in `docs/06-agent-system.md`. |
| **Blocked** | The task depends on a `PENDING` decision | Stop. Ask the founder. |

Unsure which tier? Take the higher one. `/ship <task>` forces the Loop tier.

## The loop (Loop tier only)

You are the orchestrator — not a subagent. You already hold the context a spawned supervisor would
have to re-derive, and you can ask the founder a question. Intake (one-sentence restatement,
*checkable* acceptance criteria — "no overflow at 360px", not "looks premium") → Plan (lanes that
own disjoint files) → Dispatch (one agent per lane, in parallel, in one message) → Integrate (you
merge; agents cannot see each other's work) → Gate (`design-critic` if UI changed · `copywriter-de`
if German changed · `kb-curator` if `docs/` or a schema file — this file, `website/CLAUDE.md`,
agents, commands — changed · `qa-reviewer` always) → Verdict (pass →
commit; fail → re-dispatch only the failing findings; **hard cap 3 iterations**, then stop and
report). Full protocol, roster and anti-patterns: `docs/06-agent-system.md`. Effort follows the
tier: Direct work runs at the session default; spend more only on Loop-tier intake and verdict.

## Memory — chat is not storage
- An answer that took more than one file to derive goes into `docs/research/<topic>.md`, dated,
  or into a D-entry. The next session must not re-derive it.
- A correction the founder gives a second time is written, in the same session, into the file
  that governs it — the agent file, `DESIGN.md`, or this one — never only into chat or auto memory.
- A claim that a workflow change made us faster needs a before/after number (iterations to PASS,
  gate findings per iteration, commits per session), or it is logged as a hypothesis, not a result.
- After compaction, keep verbatim: the current tier, the acceptance criteria, the lane table, the
  iteration count, and the files changed so far.

## Stack (see D-002, superseded on three points by D-022, D-023 and D-063)
Astro 7 + Tailwind 4 + MDX in `website/`, deployed as a Cloudflare static-asset Worker (D-022),
first-party stats — own beacon, Worker route, D1, `/statistik` (D-063, live since D-064;
`statsEnabled` and Datenschutz §10 are coupled), contact form via a GDPR-compatible provider.
Node LTS. TypeScript strict where applicable. `website/package.json` is authoritative for
versions — D-002's "Astro 5, Cloudflare Pages" is history, not state.

Four single sources in the website — never work around them:
- Brand name and URLs → `website/src/config/site.ts`
- Design tokens → `website/src/styles/global.css` `@theme`
- Every user-visible string → `website/src/i18n/ui.ts` (EN/DE parity is enforced only when
  `npm --prefix website run check` runs, D-058)
- Teaser asset identity → `website/src/config/teasers.ts` (D-057; file identity only — no
  strings, and never the codes or the film paths)

## Working style
- Small, reviewable commits. Conventional commits (`feat:`, `fix:`, `docs:`, `chore:`).
- Definition of done: builds clean, `npm --prefix website run check` reports nothing new,
  `npm run kb` clean, brand-check passes, mobile 360px checked, Lighthouse ≥ 95 on
  accessibility/SEO and desktop performance, ≥ 94 on mobile performance (re-based by D-043) for
  website work. A check you cannot run is a vibe, not a criterion.
- Prefer boring, maintainable solutions. This repo must be understandable by one person at 2am.
- Use subagents (`.claude/agents/`) for independent, parallel work; agent teams only for genuinely
  interdependent work.
- We do not build a multi-agent framework — we configure Claude Code's native machinery
  (`00-vision.md` non-goals). The loop above is protocol, not plumbing; the hooks in
  `.claude/settings.json` are the only enforcement, and there are deliberately few of them.
- Language: repo, code, commits and docs in English; customer-facing output (website,
  Angebote, emails) in German.
