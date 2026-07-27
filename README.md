# NexBridge-IT — Venture OS

This repo is the operating system of the NexBridge-IT venture: knowledge base (`docs/`),
agent system (`.claude/`), business templates (`ops/`), and the website (`website/`).

## Quickstart (once)
1. Unzip this folder, `cd NexBridge-IT`, then `git init && git add -A && git commit -m "chore: bootstrap venture os"`.
   Push to your GitHub.
2. Install/update Claude Code: `npm install -g @anthropic-ai/claude-code`
3. Start it in this folder: `claude`
4. Paste the kickoff prompt below.

## Kickoff prompt (paste into Claude Code, first session)
```
Read CLAUDE.md, then every file in docs/ in numeric order. Summarize back in max 15 lines:
our offer, brand rules, active palette status, and the website spec. Then:
1. List all PENDING items from docs/05-decisions.md and ask me to resolve any that block work.
2. Scaffold the website in website/ per docs/03-website-spec.md (Astro 5 + Tailwind + MDX).
3. Install the Impeccable design skill (run: npx impeccable install), then run /impeccable init
   using docs/02-brand.md as the source for product and design context.
4. Build ONLY the homepage nav + hero, run the design-critic agent on it, then STOP for my review.
Work in small conventional commits. Never invent prices, legal text, or client names.
```

## Skills to install (in this project root)
- **Impeccable** (design quality layer): `npx impeccable install` → then `/impeccable init`
- **Official Anthropic plugins/skills**: inside Claude Code run `/plugin` and browse the official
  directory (document skills, frontend-design). Review any third-party SKILL.md before installing —
  skills execute code.
- Optional later: superpowers (TDD/debugging workflows), a security-review skill for
  "secure by design" credibility.

## How the agent system works
- `CLAUDE.md` auto-loads every session — it is the constitution.
- `.claude/agents/*.md` are subagents. Claude Code delegates to them automatically based on their
  descriptions (research, German copy, frontend build, design critique, QA).
- `.claude/commands/*.md` are slash commands: `/new-client <name>`, `/proposal <name>`, `/brand-check`.
- Subagents work in parallel and report back. Agent teams (peer-to-peer coordination) are
  available in Claude Code for genuinely interdependent work — use sparingly.

## How this repo stays in sync with claude.ai chats
Claude Code cannot read claude.ai conversations. The contract: any lasting decision made anywhere
gets written into `docs/` (usually `05-decisions.md`) and committed. Optionally upload `CLAUDE.md`
+ `docs/` into your claude.ai Project knowledge so chat-Claude shares the same brain.

## Open items (blocking or soon)
- Register nexbridge-it.io (D-006) — free as of 2026-07-26, founders' action
- `gh auth login` + push this repo to GitHub
- Social handle check before first public post
