---
id: decisions
title: Decision log
type: decision-log
status: active
owner: founders
updated: 2026-08-01
depends_on: []
decisions: []
---

# 05 — Decision Log

Format: `D-### | date | decision | status | rationale`. Append-only; supersede, don't delete.

## D-001 | 2026-07-26 | Name: Klarfluss | SUPERSEDED by D-016
Klarheit + Fluss; German-credible, describes the product. Retired: klarfluss.de was squatted
and the founders preferred an IT-explicit name. Kept for the record — do not "fix" this entry
to the current name; the log is history, not state.

## D-002 | 2026-07-26 | Stack: Astro 5 + Tailwind + MDX, Cloudflare Pages, Plausible | DECIDED
Marketing site → static-first wins: speed, SEO, near-zero cost, cookieless analytics avoids
consent-banner friction. Content lives as MDX in this repo.

## D-003 | 2026-07-26 | Palette: A — Signal | DECIDED
Graphite #14171A / paper #F7F5F0 / signal #FF4D00 / steel #5B6770. Rationale: maximum
differentiation (competitor sites are white/generic), engineering voice fits the offer. Long-form
sections flip to paper so the site is not wall-to-wall dark. B (Petrol & Kupfer) rejected: too
close to the standard consultancy look.

## D-004 | 2026-07-26 | Scope v1 | DECIDED
Automatisierung, KI-Agenten, Dashboards, Individualsoftware. Cybersecurity services and
outsourced delivery explicitly excluded (see docs/00-vision.md non-goals).

## D-005 | 2026-07-26 | Legal vehicle | PENDING
GbR with written agreement vs Einzelunternehmen + commission agreement. Blocked on: employment
contract checks + Steuerberater input. Owner: Partner A.

## D-006 | 2026-07-26 | Domain: klarfluss.eu | SUPERSEDED by D-016
Chosen because klarfluss.de was squatted. Moot after the rename; nothing was registered.

## D-007 | 2026-07-26 | v1 package prices | SUPERSEDED by D-018
Set by Claude on founder instruction ("put according to you"); Partner A may adjust anytime.
P1 Prozess-Audit: 1.900 € Festpreis. P2 Automation Sprint: 7.500–12.000 € nach Umfang.
P3 Betrieb & Ausbau: 1.200 €/Monat, Mindestlaufzeit 3 Monate. Netto zzgl. USt.

## D-008 | 2026-07-26 | Legal/admin items: covered by founders | DECIDED
Founders confirm all legal/admin groundwork (contracts, permits, tax setup) is handled outside
this repo. Agents and sessions must NOT re-raise these topics. Impressum/Datenschutz pages remain
part of the website scope as normal build items.

## D-009 | 2026-07-26 | Skill arsenal: maximal | DECIDED
Mandate: masterpiece output, not "good". Installed at project level: impeccable (+ hooks),
taste-skill trio (design-taste-frontend, brandkit, redesign-skill), all 7 emilkowalski design/
animation skills, official GSAP skills (7, minus gsap-react — no React in stack), all 14
superpowers workflow skills. See docs/research/claude-skills.md.

## D-010 | 2026-07-26 | Bilingual DE/EN from v1; name provisional until demo review | DECIDED
Website ships German (default, `/`) AND English (`/en/`) from day one with a language switcher
in the header. Supersedes the "EN later" line in 03-website-spec.md. The brand name stays
provisional until the founders review the demo — it lives in ONE config constant (site.ts) so
a rename is a one-line change. This paid off twice: Klarfluss → NextBridge → NexBridge-IT.

## D-011 | 2026-07-26 | Premium motion layer on the landing page | DECIDED
Founder direction: the clean build read as "simple", not masterpiece. Added Lenis smooth scroll,
a generative canvas flow field behind the hero, SplitText headline assembly, film grain, a
magnetic crosshair cursor, a marquee annotation band and a live sparkline. Deliberately NO
downloaded stock assets, Lottie files or 3D blobs — stock motion is what makes sites look
generic; everything here is generated from the brand's own geometry. See DESIGN.md → Motion.

## D-012 | 2026-07-26 | No FAQ — objections answered inside a narrative | DECIDED
Founder direction: an FAQ block puts the buyer's doubts in headlines and reads defensive. Instead
a `Projektverlauf` section tells one project as a 5-chapter log, and each chapter answers a fear
in passing: data stays in the client's systems (03 + closing note), we build around existing
systems, no migration (03), all access + source + German docs handed over, no lock-in (04, 05).
Every chapter also states **what the client receives** and **what it costs them in time** — the
hidden objection nobody voices. Data claims stay generic on purpose: no infrastructure promises
we cannot verify per project.

## D-013 | 2026-07-26 | Contact: real form, mailto only as fallback | DECIDED
The `mailto:` CTA was the biggest conversion leak (opens a blank mail client, unmeasurable).
Replaced with an accessible form (name/company/email/message, consent checkbox, honeypot,
client-side validation in German). `src/config/site.ts` holds two empty slots: `formEndpoint`
(POST target — set when a GDPR-compatible provider or Cloudflare Pages Function exists) and
`bookingUrl` (e.g. self-hosted Cal.com). Until `formEndpoint` is set — or if it fails — the form
hands the finished message to the visitor's mail client, so an enquiry is never lost.
Owner for both: founders. Analytics (Plausible) still NOT installed — do before driving traffic.

## D-014 | 2026-07-26 | Name: NextBridge | SUPERSEDED by D-016 (one day later)
Interim name between Klarfluss and NexBridge-IT. Never published; nextbridge.de was taken.

## D-015 | 2026-07-26 | Published preview on Cloudflare Pages | DECIDED
Site deployed to a *.pages.dev URL so the founders can review it from any laptop. Repo is
public (founder decision: nothing to hide). robots.txt ships with `Disallow: /` so the
provisional name and placeholder Impressum are not indexed — MUST be flipped before launch on
the real domain.

## D-016 | 2026-07-27 | Name: NexBridge-IT · Domain: nexbridge-it.de | DECIDED
Final name **NexBridge-IT** (founder confirmed the exact spelling: "Nex", not "Next").
Supersedes D-001 (Klarfluss) and D-014 (NextBridge). The `-IT` suffix says what the venture
does, which the Mittelstand reader parses instantly.

**nexbridge-it.de is FREE** (DENIC RDAP 404, checked 2026-07-27) — the hyphenated form
sidesteps the squatter on nexbridge.de. This is the first time a plain `.de` has been
available across all three name rounds. Recommendation: register it. `nexbridge-it.io` also
free as a defensive secondary; `.com` is taken and does not matter for a German-market venture.
Owner: founders. DPMA trademark check still open and must precede any printing.

## D-017 | 2026-07-27 | Open to AI crawlers; SEO baseline shipped | DECIDED
We sell KI-Agenten, so being citable when a buyer asks an assistant "who automates processes in
Baden-Württemberg?" outweighs withholding public marketing copy from model training. The site
carries no confidential content. robots.txt explicitly allows GPTBot, ClaudeBot, OAI-SearchBot,
PerplexityBot, Google-Extended et al. Cloudflare's managed robots.txt was switched OFF on
2026-07-27, so our file is authoritative — verified live: 0 Disallow rules, 13 Allow
directives. If AI crawlers ever look blocked again, check that dashboard toggle first
(Overview → "Manage your robots.txt"); it injects rules above our file and silently wins.

Also shipped: JSON-LD (Organization/WebSite/ProfessionalService + OfferCatalog, verifiable
facts only), Twitter/OG cards, sitemap hreflang pairs, Google Search Console verification file
at `website/public/google61dfa7e628fa15c6.html` (must never be deleted — verification breaks).

Honest expectation set with founders: technical SEO makes the site *eligible* to rank, it does
not rank it. A four-hour-old domain with one page and no backlinks needs content, links and
time. Next real levers: Search Console sitemap submission, filled Impressum, Google Business
Profile, substantive articles.

## D-018 | 2026-07-27 | Pricing: one public price only | DECIDED — supersedes D-007
Founder decision. **P1 Prozess-Audit: 295 € Festpreis** (down from 1.900 €) — a low-friction
paid front door rather than a revenue line. **P2 and P3 carry no public price**: "Angebot nach
Umfang" / "Angebot nach Bedarf", costed from what the audit finds, with a fixed-price Angebot
before any build starts.

Rationale: scope is not knowable before the audit, and a published corridor (7.500–12.000 €)
gave buyers an anchor to argue against and scared off small engagements. One cheap, concrete
entry price is easier to say yes to and qualifies the lead by making them pay something.

Open: internal floor prices for P2/P3 must be agreed between the founders and kept in
docs/01-offer.md — not on the website — so both quote consistently. Also review whether P1's
advertised "1 Woche" duration still fits a 295 € engagement (see note in that D-entry's thread).

## D-019 | 2026-08-01 | Repo lives at C:\Users\manus\Projects\nexbridge-it | DECIDED
Moved out of `Downloads\klarfluss-kit\klarfluss\` — a folder named after a brand retired twice,
sitting next to four unrelated projects and 300 MB of installers, in the directory people bulk-
delete. The four siblings (jd-journey, jd-world, the-manush-run, spec) stay where they are; the
`klarfluss-website` entry was removed from their shared `.claude/launch.json` because it pointed
at a path that no longer exists.

Consequence: Claude Code keys session history by absolute path, so the old history is orphaned.
This costs nothing that matters — the knowledge lives in `docs/`, which moved with the repo. That
is the whole point of D-020. Git is unaffected; the remote was already `nexbridge-it.git`.

## D-020 | 2026-08-01 | Knowledge base is a generated graph; STATE.md is the bootstrap | DECIDED
Every doc in `docs/` carries frontmatter declaring `id`, `status`, `owner`, `updated`,
`depends_on` and the decisions it rests on. `npm run kb` builds `docs/INDEX.md` from those
declarations and **refuses to write when an edge is broken** — an unknown id, a cited D-number
that does not exist, or a doc citing a SUPERSEDED decision as if it were live. Deliberate
historical references use `cites_history:` instead.

Rationale: prose cross-references rot silently and ours already had. Four files disagreed about
our own domain — `02-brand.md` said nexbridge-it.de belonged to someone else, D-016 said it was
free, `README.md` said register the `.io`, and the site was live on `.com`. Declared edges cannot
drift without failing the build.

`DESIGN.md` and `PRODUCT.md` are graph nodes but carry **no frontmatter**: the impeccable skill
parses them as repo-root artifacts with format-specific parsers, and injecting YAML risks
breaking the detector. The generator declares them as external nodes instead.

`docs/STATE.md` is new: current state only, no history, read at the start of every session so a
fresh conversation knows where the venture stands without opening six files.

**Still unresolved, deliberately not papered over:** `docs/research/domain-availability.md`
recorded `nexbridge-it.com` as TAKEN on 2026-07-27, and the site went live on that exact domain
the next day. Both cannot be true. Which registration actually holds — and whether
`nexbridge-it.de` was ever secured — needs founder confirmation and a follow-up entry.
Owner: founders.

## D-021 | 2026-08-01 | Orchestration: tiered loop, gates, 3-iteration cap | DECIDED
Founder direction: "do not rush through things — assess the task, give work to different agents,
then quality-check the output against the goal." Implemented as protocol in `docs/06-agent-system.md`,
not as a framework, because `00-vision.md` lists building a custom multi-agent framework as a
non-goal and subagents cannot reliably supervise other subagents. The orchestrator is the main
session, which already has the context a spawned supervisor would have to re-derive.

Tiered on purpose: trivial and read-only work goes direct; UI, customer-facing German, `docs/`,
or multi-file work runs intake → lanes → parallel dispatch → integrate → gates → verdict.
`/ship` forces the loop. Gates are `design-critic` (UI), `copywriter-de` (German), `qa-reviewer`
(always), `kb-curator` (docs). Failures re-dispatch **only the failing findings**.

Hard cap of 3 iterations, then stop and ask the founder. A loop with no termination condition
does not converge — it burns budget rediscovering the same disagreement between two agents.
New agent: `kb-curator`, owning `docs/` consistency and the append-only rule on this log.

## D-022 | 2026-08-01 | Deploy target is a Cloudflare static-asset Worker, not Pages | DECIDED
Recorded retroactively. The move from Cloudflare Pages to a static-asset Worker happened in
commit `e45bc6e` and is visible in `website/wrangler.jsonc` (worker name `nexbridge-it-site`,
assets served from `./dist`, `not_found_handling: "404-page"`), but no decision entry was ever
written for it. The commit message and several documents cited **D-015** as the authority —
D-015 is about publishing a preview to a `*.pages.dev` URL and says the opposite. D-002 likewise
still says Pages, correctly, as history.

Consequence: custom domains are attached in the Cloudflare dashboard rather than via `routes`,
because the wrangler OAuth token lacks `dns_records:write`. Anything describing our deploy target
cites D-022 from here on. D-002 and D-015 stay untouched — they are history, and the log is
append-only.

Found by the knowledge-base audit that D-020 introduced, which is the point of it: a citation
whose target says the opposite of the claim is exactly the rot that prose cross-references hide.
Note the limit this exposes — the graph validates that a cited decision *exists* and is live, not
that its content supports the claim. That check remains human.

## D-023 | 2026-08-01 | Astro 7, not Astro 5 | DECIDED
`website/package.json` declares `astro ^7.1.3` and the lockfile resolves 7.1.3, but CLAUDE.md,
README.md, `03-website-spec.md`, `frontend-dev.md` and the new STATE.md all said "Astro 5",
inherited from D-002 and never revisited after the upgrade. Corrected in every state document.
D-002 keeps its original wording — it was true when written.

## Template
```
## D-0XX | YYYY-MM-DD | <decision> | DECIDED/PENDING/SUPERSEDED by D-0YY
<2–3 lines: rationale, consequences, owner>
```
