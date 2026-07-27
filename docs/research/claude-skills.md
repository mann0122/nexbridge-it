# Research: Claude Code skills for NexBridge-IT

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
- skill-creator — build our own skills later (e.g. a NexBridge-IT delivery-checklist skill).

## Full arsenal installed 2026-07-26 (D-009, founder mandate: masterpiece output)
Vendored from shallow clones into `.claude/skills/` (32 skills total):
- **taste-skill trio** (`Leonxlnx/taste-skill`, ~68k stars): design-taste-frontend v2 (variance/
  motion/density dials), brandkit (logo & identity art direction), redesign-skill.
- **emilkowalski/skills** (Vercel/Linear pedigree), all 7: emil-design-eng, animation-vocabulary,
  review/improve/find-animation-opportunities, apple-design, pick-ui-library.
- **greensock/gsap-skills** (OFFICIAL GSAP), 7 of 8: core, timeline, scrolltrigger, plugins,
  performance, utils, frameworks. Skipped gsap-react (no React in stack — Astro/vanilla).
- **obra/superpowers** (~41k stars), all 14 workflow skills: brainstorming, writing/executing
  plans, TDD, systematic-debugging, code review pair, git worktrees, subagent-driven dev, etc.

### Authority order when skills conflict
docs/02-brand.md (the brief) > impeccable (enforcement layer, has hooks) > taste/emil guidance >
generic defaults. The brief always wins — skills serve the brand, not the reverse.

## Still not installed
- **anthropics/skills `frontend-design`** — ~80% overlap with impeccable; two default design
  authorities would conflict. Impeccable owns that slot.
- **Context7 MCP** — add per-need during client delivery.

## Sources
- https://github.com/pbakaus/impeccable
- https://github.com/anthropics/skills
- https://github.com/travisvn/awesome-claude-skills
- https://www.firecrawl.dev/blog/best-claude-code-skills
- https://designrevision.com/blog/best-claude-code-skills
