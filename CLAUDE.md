# CLAUDE.md — NexBridge-IT

You are working inside the venture repo of **NexBridge-IT** — a German freelance venture selling
**Automatisierung, KI-Agenten, Dashboards und Individualsoftware** to German SMBs (Mittelstand).
Two people: a German partner doing sales/network, a technical founder doing delivery. You are the
delivery engine.

## Session bootstrap

@docs/STATE.md

If that import did not inline, read `docs/STATE.md` now — it is where things stand right now, in
one file. Then `docs/INDEX.md` is the map of everything else: it tells you which document answers
your question, so you open one file instead of six.

## Prime directive
`docs/` is the single source of truth and `docs/INDEX.md` is its index. Read `docs/STATE.md`
first, always. Before any non-trivial task, follow the graph from `INDEX.md` to the documents that
actually govern it — usually some of `00-vision.md`, `01-offer.md`, `02-brand.md`,
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
5. GDPR-first is our positioning: no tracking cookies, no US-hosted analytics defaults, Plausible
   only, forms need an explicit consent checkbox.
6. When new lasting decisions are made in a session, append them to `docs/05-decisions.md` in the
   same commit. The log is append-only — supersede, never rewrite history.
7. Touching anything in `docs/` means running `npm run kb` before commit. It rebuilds the graph
   and fails on broken references. A red build is a real error, not a formality.

## How work gets done — tiering

Do not run six agents to fix a comma, and do not ship German copy unreviewed. Classify first:

| Tier | Trigger | Path |
|---|---|---|
| **Direct** | Read-only question · typo · one-line change · a single file that is not UI or customer-facing German | Just do it. No agents. |
| **Loop** | Any UI file · any customer-facing German · anything in `docs/` · two or more files · any task whose verb is *build*, *design*, *rewrite*, *migrate* | Full loop below. |
| **Blocked** | The task depends on a `PENDING` decision | Stop. Ask the founder. |

Unsure which tier? Take the higher one. `/ship <task>` forces the Loop tier.

## The loop (Loop tier only)

You are the orchestrator — not a subagent. You already hold the context a spawned supervisor would
have to re-derive, and you can ask the founder a question.

1. **Intake** — restate the task in one sentence. Write acceptance criteria that are *checkable*
   ("no overflow at 360px", "contrast ≥ 4.5:1"), not vibes ("looks premium"). Vague criteria
   cannot fail a gate, so the loop cannot terminate.
2. **Plan** — split into lanes. Name what each owns, what it must not touch, and which docs it
   must read. Lanes that would edit the same file are not independent.
3. **Dispatch** — one agent per independent lane, in parallel, in a single message.
4. **Integrate** — you merge and resolve conflicts. Agents cannot see each other's work; asking
   them to reconcile it just produces two confident contradictions.
5. **Gate** — `design-critic` if UI changed · `copywriter-de` if German changed · `kb-curator` if
   `docs/` changed · `qa-reviewer` always, before commit.
6. **Verdict** — check gate findings against the step-1 criteria. Pass → commit. Fail → back to
   step 3 with *only* the failing findings. **Hard cap: 3 iterations**, then stop and report.

Full protocol and anti-patterns: `docs/06-agent-system.md`.

## Stack (decided — see D-002, D-015)
Astro 5 + Tailwind + MDX in `website/`, deployed as a Cloudflare static-asset Worker, Plausible
analytics (specced, not yet installed), contact form via a GDPR-compatible provider. Node LTS.
TypeScript strict where applicable.

Three single sources in the website — never work around them:
- Brand name and URLs → `website/src/config/site.ts`
- Design tokens → `website/src/styles/global.css` `@theme`
- Every user-visible string → `website/src/i18n/ui.ts`

## Working style
- Small, reviewable commits. Conventional commits (`feat:`, `fix:`, `docs:`, `chore:`).
- Definition of done: builds clean, lints clean, `npm run kb` clean, brand-check passes,
  mobile 360px checked, Lighthouse ≥ 95 on performance/accessibility/SEO for website work.
- Prefer boring, maintainable solutions. This repo must be understandable by one person at 2am.
- Use subagents (`.claude/agents/`) for parallelizable, independent work. Only escalate to agent
  teams for genuinely interdependent parallel work.
- We do not build a multi-agent framework — we configure Claude Code's native machinery
  (`00-vision.md` non-goals). The loop above is protocol, not plumbing.

## Language
- Repo, code, commits, docs: English.
- Customer-facing output (website, Angebote, emails): German.
