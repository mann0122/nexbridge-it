# Research: Claude Code skills for Klarfluss

Date: 2026-07-26. Sources checked: GitHub repos (primary), npm, community rankings.

## Question
Which Claude Code skills give us a top-tier delivery setup without bloating the repo?

## Installed (project-level, versioned in `.claude/`)
- **Impeccable v4.0.2** (`pbakaus/impeccable`, Apache 2.0) — design quality layer.
  23 commands (`/impeccable shape|audit|critique|animate|typeset|polish|…`), 58-rule
  anti-slop detector, PostToolUse + Stop hooks (in `.claude/settings.json`) that auto-check
  UI files. Run `/impeccable init` at the start of the website build session with
  docs/02-brand.md as source → generates PRODUCT.md + DESIGN.md.
  Rationale: purpose-built against generic "AI slop" design — exactly our brief.

## Available session-wide already (user-level plugins — do not vendor into repo)
- Document skills (docx, pdf, pptx, xlsx) — Angebote/reports as polished files.
- dataviz — chart/dashboard design system guidance (relevant for P-demo dashboard + client work).
- skill-creator — build our own skills later (e.g. a Klarfluss delivery-checklist skill).

## Evaluated, deliberately NOT installed (avoid overlap/bloat)
- **anthropics/skills `frontend-design`** — good, but overlaps ~80% with Impeccable which is
  stricter and has enforcement hooks. Two design authorities = conflicting guidance. Skip.
- **obra/superpowers** (~41k stars) — full TDD/brainstorm/worktree workflow framework. Heavy;
  our CLAUDE.md + agents already cover the workflow at our scale. Revisit at company phase.
- **Context7 MCP** — fresh library docs on demand. Useful during client delivery; add per-need,
  not by default.

## Recommendation
Impeccable as the single design authority + our own agents (design-critic, copywriter-de,
qa-reviewer) as enforcement. Revisit superpowers + Context7 when delivery volume grows.
Confidence: high for v1 website; re-evaluate before first client project.

## Sources
- https://github.com/pbakaus/impeccable
- https://github.com/anthropics/skills
- https://github.com/travisvn/awesome-claude-skills
- https://www.firecrawl.dev/blog/best-claude-code-skills
- https://designrevision.com/blog/best-claude-code-skills
