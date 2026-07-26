# CLAUDE.md — Klarfluss

You are working inside the venture repo of **Klarfluss** — a German freelance venture selling
**Automatisierung, KI-Agenten, Dashboards und Individualsoftware** to German SMBs (Mittelstand).
Two people: a German partner doing sales/network, a technical founder doing delivery. You are the
delivery engine.

## Prime directive
`docs/` is the single source of truth. Before any non-trivial task, read `docs/00-vision.md`,
`docs/01-offer.md`, `docs/02-brand.md`, and `docs/05-decisions.md`. If a task touches the website,
also read `docs/03-website-spec.md`. If a decision is marked PENDING in `docs/05-decisions.md`,
ask the human before building on top of it — never assume.

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
   same commit.

## Stack (decided — see D-002)
Astro 5 + Tailwind + MDX in `website/`, deployed on Cloudflare Pages, Plausible analytics,
contact form via a GDPR-compatible provider. Node LTS. TypeScript strict where applicable.

## Working style
- Small, reviewable commits. Conventional commits (`feat:`, `fix:`, `docs:`, `chore:`).
- Definition of done: builds clean, lints clean, brand-check passes, mobile 360px checked,
  Lighthouse ≥ 95 on performance/accessibility/SEO for website work.
- Prefer boring, maintainable solutions. This repo must be understandable by one person at 2am.
- Use subagents (`.claude/agents/`) for parallelizable, independent work. Only escalate to agent
  teams for genuinely interdependent parallel work.

## Language
- Repo, code, commits, docs: English.
- Customer-facing output (website, Angebote, emails): German.
