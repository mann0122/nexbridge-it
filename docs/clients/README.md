---
id: clients
title: Client workspaces
type: client
status: active
owner: founders
updated: 2026-08-01
depends_on: [delivery]
decisions: []
---

# Client workspaces

One folder per client: `docs/clients/<name>/`. Created by `/new-client <name>`, which scaffolds
`brief.md` and generates tailored discovery questions.

Expected contents as an engagement progresses:

| File | When | Written by |
|---|---|---|
| `brief.md` | Before the discovery call | `/new-client`, then filled by Partner A |
| `angebot-draft.md` | After the brief is complete | `/proposal <name>` via `copywriter-de` |
| `case-draft.md` | After delivery — problem, solution, numbers, quote | Partner B |

Full process → [[delivery]].

## Rules

- **No client data beyond what a proposal needs.** Personal data requires an AVV before it
  touches this repo, and an AVV is a lawyer's document, not a generated one.
- **No secrets, ever.** Credentials go in a manager. One private repo per client for actual work.
- `case-draft.md` is written after every project without exception — cases are the marketing
  engine, and the details are gone within a fortnight. Ask permission before publishing.
- Real numbers only. An invented metric in a case study is the fastest way to lose a
  Mittelstand reference.

## Status

**Empty — no clients yet.** See [[state]].
