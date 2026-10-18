---
id: research-cognitive-system
title: Research — the "Karpathy + Obsidian + Opus 5.5 + Jev" post
type: research
status: active
owner: partner-b
updated: 2026-10-18
depends_on: []
decisions: [D-070]
---

# Research: the "Karpathy + Obsidian + Opus 5.5 + Jev" post

Date: 2026-10-18. Method: six parallel research agents on separate questions, each result tried
by two skeptics (source accuracy; attribution and counter-evidence), then one audit of this repo
against the surviving principles — 19 agents and about 1,200 tool calls per the session's
workflow log, which is not in the repo. The post itself could not be fetched from the sandbox,
and neither could X, Threads or Instagram; the transcription below is from the founder's
screenshot, and anything that rests on an X post is marked as unfetched.

## Question

An Instagram post (account `0xsojalsec`, ~2026-10-15) shows an IEEE-styled one-pager titled
*"Andrej Karpathy — Obsidian + Opus 5.5 + Jev — A Unified Cognitive System for 10× Chat Speed and
80% Less Time in Work"*: an "Andrej Karpathy Framework (cognitive core, reasoning, learning, code
understanding)" feeding Obsidian (persistent memory), Opus 5.5 (deep reasoning) and Jev (agent
orchestration) into a "unified agent loop: plan → act → observe → improve". The founder asked
what is real in it and which principles should become our working principles.

## Verdict

**Real ingredients, invented dish.** Every noun is real; every claim that ties them together is
not. No paper, benchmark or measurement was found under that title — the research's title search
returned nothing, and the skeptics could not re-run it — and, the firmer point, none of the three
real artefacts it borrows from contains "10×" or "80%".

| Element of the post | What is actually there | Source (date) |
|---|---|---|
| "Karpathy's approach to building cognitive systems" | No such framework. "Cognitive core" is a 2025 model-design idea (a small model that trades encyclopedic knowledge for capability). The real knowledge-work artefact is the **LLM Wiki** gist. | [X post 2025-06-27](https://x.com/karpathy/status/1938626382248149433) (date from the status id; text unread); [LLM Wiki gist](https://gist.github.com/karpathy/442a6bf555914893e9891c11519de94f) (2026-04-04, read in full) |
| Obsidian as "persistent memory, knowledge graph" | In the gist Obsidian is the **viewer** — "Obsidian is the IDE; the LLM is the programmer; the wiki is the codebase". The memory is a directory of markdown files in a git repo. | gist, 2026-04-04 |
| Opus 5.5 for "deep reasoning" | Claude Opus 5.5 is real (`claude-opus-5-5`, 2026-09-22). Anthropic's own claims: more than 30 % faster output and 40 % cheaper than Opus 5, fast mode up to 2.5×. No link to Karpathy, Obsidian or Jev on Anthropic's pages. | [anthropic.com/news/claude-opus-5-5](https://www.anthropic.com/news/claude-opus-5-5) (2026-09-22) |
| Jev as "agent orchestration layer" that "reads every note" | Jev is TypeSafe AI's typed-decision model (launch 15 or 16 September 2026 per secondary coverage): it returns yes/no probabilities, choices and scores rather than text, and third-party tools wire it into agent loops as a router or gate. It is not an orchestrator and reads no notes. The vendor site was unreachable; the product description rests on PyPI, the `typesafe-ai` GitHub org and a third-party wrapper README. | [pypi.org/project/jev](https://pypi.org/project/jev/) (v0.3.0, 2026-09-18); [github.com/typesafe-ai](https://github.com/typesafe-ai) |
| "10× faster chat", "80% less time" | No source. The post's figure most likely comes from the viral "Opus 5.5 + Jev" X genre (late September to October 2026), whose ~80 % claims are personal anecdotes — search snippets only, unverified. The only 80 % with a documented method anywhere is Claude's own estimate of time saved on ~100k chat conversations in Anthropic's Economic Index note, which Anthropic says ignores work outside the conversation and the effort to refine Claude's output, and "might overstate current productivity effects". | [anthropic.com/research/estimating-productivity-gains](https://www.anthropic.com/research/estimating-productivity-gains) (2025-11-25) |
| The author | A security/AI hobbyist; the GitHub profile was fetched and links the Instagram account. Search snippets show the same account reposting a "Karpathy prompt for Opus 5.5" that a Threads fact-check called misattributed — threads.com was unreachable, so the repost and the fact-check are unverified. | GitHub profile `0xSojalSec`, fetched 2026-10-18; Threads items via search snippets only |

Karpathy joined Anthropic in May 2026 (secondary reports only), which is the likely reason hype
posts now attach his name to Claude models. The only real Karpathy–Jev trace is one approving
reply about low-latency single-token answers (~2026-09-21, snippet only) and promotional comments
on his gist — he endorsed no system.

## What the real sources say

**Karpathy, LLM Wiki (gist, 2026-04-04; every quote verified verbatim).** Three layers: immutable
*raw* sources the LLM reads but never edits; a *wiki* of LLM-written, interlinked markdown the
human reads but never edits; a *schema* file ("e.g. CLAUDE.md for Claude Code") that "makes the
LLM a disciplined wiki maintainer rather than a generic chatbot". Three operations: **ingest** (one
source at a time, the human in the loop, "a single source might touch 10-15 wiki pages"),
**query** ("good answers can be filed back into the wiki as new pages" — so that a comparison or
an analysis does not "disappear into chat history"), **lint** (a periodic health check for
"contradictions between pages, stale claims … orphan pages … missing cross-references").
Navigation by an `index.md` read first and an append-only, grep-able `log.md`; this "avoids the
need for embedding-based RAG infrastructure" at "~100 sources, ~hundreds of pages". Why: RAG "is
rediscovering knowledge from scratch on every question. There's no accumulation." "The human's
job is to curate sources, direct the analysis, ask good questions … The LLM's job is everything
else." No benchmarks, token costs or speed figures are given; a commenter asked whether the
claims were benchmarked, and no reply from Karpathy is visible in the thread.

**Karpathy on working with coding agents (2025–2026).** Mostly X posts and talks that were
unreachable from the sandbox; the skeptics could confirm the dates from status ids and the
autoresearch repo verbatim, so these are kept in their weak form. Agents work when given
well-specified tasks whose result can be verified or tested, and will loop until a goal is met
(X posts, January–February 2026, unfetched); review them for a named list of failure modes
(unchecked assumptions, bloat, dead code, edits outside the ask); small increments, fast
verification, "agentic engineering" — orchestrate and oversee without compromising the quality of
the software — for professional work, vibe coding for throwaway work. **autoresearch** (2026-03,
README and `program.md` verbatim): the human edits only `program.md`, the agent edits only one
file, a fixed budget, one metric, keep or discard logged — with an explicit simplicity criterion:
a 0.001 val_bpb gain that "adds 20 lines of hacky code? Probably not worth it", the same gain
"from deleting code? Definitely keep." Its "NEVER STOP" rule is for a sandboxed training loop
and its own issue tracker shows the metric being gamed; not transferable to client work. An
8-agent "research org" (X post, late February 2026, unfetched) reportedly does not work because
agents' *ideas* are poor, although they implement well-scoped tasks well.

**Anthropic's own guidance (docs and engineering posts, 2025–2026).** The source-accuracy
skeptics confirmed 43 of 46 findings in the practices thread and 47 of 53 in the memory thread
against the live pages, quotes verbatim or trivially paraphrased. The memory thread's misses
were wrong-page attributions; the practices thread's were one false negative ("ultrathink" is
still a keyword), one ranking inferred from ordering and one added framing — none of them is
used here. The context window is the scarce resource: keep the
always-loaded `CLAUDE.md` under ~200 lines of non-inferable facts, and note that `@imports` do not
reduce context cost. The single most emphasised practice is a check Claude can run itself (tests,
build, lint, screenshot), escalated to a Stop hook or a fresh-context reviewer, because agents
"reliably skew positive when grading their own work". Explore → plan → implement → commit, but
skip the plan for one-sentence diffs. Anything that must always happen is a hook, since
CLAUDE.md is advisory and "delivered as a user message". Subagents for investigation and verbose
output; after two failed corrections, clear and rewrite the prompt. Multi-agent systems cost
~15× the tokens of a chat; the measured payoff (a 90.2 % eval gain, research time cut by up to
90 %) was in parallelisable research, and Anthropic's June-2025 caveat that coding has fewer
parallelisable subtasks was qualified with "today" and has since loosened. Right-size model and
effort; "max" effort "is prone to overthinking". Auto memory and `/doctor prompt-audit` exist;
persistent rules belong in files because conversation-only instructions are summarised away at
compaction. Reduce approval friction with an allowlist of the repo's own safe commands.

**Measured productivity.** METR, the Google and Microsoft trials and the surveys are secondhand
(metr.org, arXiv and the survey sites were unreachable); the Anthropic and DORA items were read
and confirmed on the live pages. The one randomised trial on experienced developers in their own
repositories (METR, 2025-07) found them 19 % *slower* with early-2025 tools while believing they
were faster; METR's 2026-02 follow-up leans towards a speed-up but, per the summaries, calls its
own data very weak evidence. Enterprise trials with completion tools report +21 % to +26 %; Anthropic's internal
study reports self-reported +50 % and a 67 % rise in merged PRs, with the biases listed. DORA
2025 finds AI adoption correlates with throughput and with *lower* delivery stability unless
small batches, version control and AI-accessible internal docs are in place. Our reading of this
evidence, not a measured result: expect 20–30 % more throughput on well-scoped, verifiable work
(the range of the enterprise trials), no measured gain where the work is novel or judgment-heavy
(Anthropic's 2026 RCT found none on a new-library task; METR found a slowdown on familiar
repos), and a dip while the workflow is learned.

## How this repo already compares

The audit agent mapped every surviving principle to the repo. **Already present, often more
rigorously than in the gist:** `docs/` is the wiki, `docs/STATE.md` the compiled "now",
`docs/05-decisions.md` the append-only log, `docs/INDEX.md` the generated index with a routing
table, `npm run kb` the lint that fails the build on a broken edge, `cites_history:` and `updated`
as staleness signals, `kb-curator` the maintainer, graders without write tools, the tier table as
the autonomy slider, checkable acceptance criteria, lanes with explicit briefs, the 3-iteration
cap, decisions in the same commit. The repo contradicted none of the verified principles in
substance. **The real speed losses were mechanical:** the always-loaded bootstrap had grown to
~354 lines (CLAUDE.md 98 + the imported STATE.md 256, which explained *how* the teaser build and
the stats river work against its own "no history, no rationale" header); the loop protocol
existed in four near-verbatim copies (CLAUDE.md, 06-agent-system.md, ship.md, README) that had
already drifted; Intake told every `/ship` to re-read STATE.md although CLAUDE.md imports it;
"anything in `docs/`" was Loop tier, so filing a one-paragraph research note cost two gates,
which is why answers were not filed back; rule 7 and the gates were prose only, with the one
deterministic hook being the vendored design detector; every build command prompted for
approval; `qa-reviewer` still said the stats beacon was "off by default" a month after D-064
switched it on, and agent files sat outside the graph check; `brand-check` carried a dead branch
on a decision settled in July; one Definition-of-done check could not pass — there is no linter
behind "lints clean" — and its obvious replacement, `astro check`, fails on four known errors;
two vendored workflow skills claim every turn, against the Direct tier.

## Adopted (D-070)

Each item is a file, not a slogan. Not adopted: the 10×/80 % figures, Jev, Obsidian, a "cognitive
core", NEVER-STOP loops, auto-commits at session end, scheduled unattended runs, model downgrades
on the brand gates, and the agent-written `memory:` directories (an unreviewed second source of
truth is the drift D-020 exists to catch).

- Line budgets for `CLAUDE.md` (110) and `docs/STATE.md` (150), enforced by `npm run kb`;
  STATE.md trimmed to state and pointers; the loop text kept in full in one place and only
  summarised in `CLAUDE.md` and the README.
- A `PreToolUse` hook (`ops/scripts/commit-gate.mjs`) that refuses a `git commit` made from a
  Claude Code session while a graph-covered file differs from HEAD and the build is red or
  `INDEX.md` is stale — rule 7 enforced for sessions; a terminal commit is not gated.
- `npm run kb` also checks D-numbers cited in prose by `CLAUDE.md`, `website/CLAUDE.md`,
  `.claude/agents/` and `.claude/commands/`.
- The Definition of done names a check that exists (`npm --prefix website run check`) instead
  of "lints clean", and says that a check you cannot run is a vibe.
- The four single sources are listed in `CLAUDE.md` §Stack; `website/CLAUDE.md` and
  `frontend-dev` point there and keep only the Astro-side detail instead of carrying copies.
- The three-layer memory section in [[agent-system]] (raw evidence · compiled state · schema;
  ingest · query-and-file-back · lint) and the matching rules in `kb-curator` and `researcher`.
- CLAUDE.md "Memory — chat is not storage": file answers back, write a repeated correction into
  the governing file, measure before claiming a speed-up, keep loop state across compaction.
- Direct-tier carve-outs for a dated research note and a one-line STATE.md correction.
- Intake no longer re-reads STATE.md; `/ship` points at the one protocol and reports iteration
  count and findings per iteration; the `/kb` drift report joins the weekly rhythm.
- Permission allowlist for the repo's own build and check commands.
- `qa-reviewer` corrected (beacon on since D-064) and given a diff-hygiene check; the dead D-003
  branch removed from `/brand-check`; `ui.ts` lane collisions named in the Plan step.

## Confidence, and what would change our mind

High on the gist and on Anthropic's pages (read in full, quotes verified). Medium on Karpathy's
X posts and talks, on Jev's product facts and on the post's provenance (dates verified, texts not).
The productivity numbers are secondhand. A measurement that shows the budgets or the hook costing
more sessions than they save would reverse those items; a Karpathy or Anthropic source for the
10×/80 % figures would be news, and none was found.

## Left open

- Open item 13 in [[state]]: allowlisting the vendored workflow skills as D-031 did for design
  skills — a founder call because it narrows D-009.
- The known-failing check behind the Definition of done: clear the four `heroArrow` nulls and
  wire `astro check` into `build` (known defect in [[state]]).
- A baseline for the process itself — iterations to PASS and findings per iteration are now
  reported by `/ship`; nothing is measured until a few runs exist.
