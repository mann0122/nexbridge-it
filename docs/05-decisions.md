---
id: decisions
title: Decision log
type: decision-log
status: active
owner: founders
updated: 2026-08-02
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

## D-024 | 2026-08-01 | 404 page: German-only, noindex, reports the requested path | DECIDED
`wrangler.jsonc` has always set `not_found_handling: "404-page"`, but no `404.astro` existed, so
`dist/404.html` was never built and the setting was inert. Now built.

**German-only, deliberately.** Cloudflare serves one `dist/404.html` for every unmatched path, so
a language-specific 404 is not possible without a route plus path-prefix handling. `/` is the
German site and a wrong URL carries no language signal, so German is the honest default; the
English start page gets an explicit link. The `en` block of `notFound.*` in `i18n/ui.ts` exists
only to satisfy the type constraint and is never rendered — noted in a comment there so nobody
spends time tuning copy that does not ship.

**`noindex` suppresses more than the robots tag.** A 404 answers under *every* wrong address, so
`Layout.astro` now gates the canonical, `og:url` **and** the JSON-LD graph behind the same flag.
Without that, every mistyped URL published our `ProfessionalService` + `OfferCatalog` markup as
though it were a real offer page. Found by `design-critic`; the first implementation gated only
the canonical.

The signature device is the Zeichnungskopf (status + requested path), not the hero's DIN frame —
the frame is `hidden lg:block` and mistyped URLs mostly arrive on a phone. The path is written
with `textContent`, never `innerHTML`: it is attacker-controlled.

## D-025 | 2026-08-01 | nexbridge-it.com is registered to us | DECIDED
Founder confirmed in session: the domain the site runs on is purchased, invoice on file. This
closes the contradiction D-020 flagged — `docs/research/domain-availability.md` recorded
`nexbridge-it.com` as TAKEN via RDAP on 2026-07-27, one day before the site went live on it.
Whether that reading was wrong or the domain was acquired afterwards is moot and not worth
chasing; the founder holds it either way.

Consequence: `site.ts` no longer describes the URL as a preview, and "registration unconfirmed"
is gone from [[state]] and [[brand]]. Still unrecorded: whether `nexbridge-it.de` was also
secured — D-016 recommended it as the stronger choice for Mittelstand buyers. Not blocking
anything; log it if and when it happens. Owner: founders.

## D-026 | 2026-08-02 | Particle field adopted for the Vorgehen section only | SUPERSEDED by D-027
A vendored scroll-morphing particle field (`design/particle-field/`, studied in its `STUDY.md`)
now backs the three phases in `Process.astro`. Chosen because the library authors shapes as
line/arc outlines extruded with `twin()` — the same drawing grammar as the rest of the site — so
it extends the world rather than importing a different one. Custom shapes map to the copy:
Phase 1 *beziffert* → a dimensioned part, Phase 2 builds → the bridge, Phase 3 *überwacht* →
a signal-flow schematic whose feedback loop is the monitoring.

**Rejected for the hero.** `FlowField.astro` is already there, is bespoke, carries the "Fluss"
metaphor and paints synchronously so the artwork survives throttled rAF. Two generative particle
systems in one viewport is two focal points and a blown signal ration.

Consequences: upstream's teal/amber palette and `glow: true` were replaced in the vendored
production copy (`website/src/scripts/vendor/particle-field.js`, three marked `NEXBRIDGE PATCH`
blocks that also add off-screen pause and a debounced resize — both gaps FlowField already
handled). Homepage JS moves from ~178 KB to ~192 KB raw (65.1 KB brotli); DESIGN.md's stated
~176 KB budget is updated to match. `ParticleField.reveal()` is banned — it re-hides sections on
scroll-out, breaking the no-JS-safe contract. Owner: partner-b.

## D-027 | 2026-08-02 | Particle field reverted from the homepage; needs its own layout | DECIDED
D-026 was built, rendered in a headless browser, reviewed against the screenshots and reverted the
same day. The homepage is back to its prior state and the DESIGN.md motion section with it. The
field stays a `design/` proposal until there is a page laid out around it.

**Why it failed:** the Vorgehen section's copy spans the full grid — title, note and price column
— so there is no empty region to park artwork in. Every setting was one of two failures: faint
enough to leave the copy alone and it reads as dirt on the screen, or strong enough to read as a
shape and it crawls across the price column. `295 € Festpreis` is the only price on the site;
degrading it for a background effect is a bad trade. The placement was chosen as the smallest,
safest change, which turned out not to mean suitable.

**Two findings worth keeping.** First, *lock the camera*: upstream orbits continuously
(`spinSpeed` drives yaw), so at section scale a drawn outline almost never faces the viewer and
reads as a cloud of specks. `spinSpeed: 0` makes the shapes legible while scroll still turns them,
because yaw is also a function of stage position. This is not optional and is not in the upstream
docs. Second, *the effect needs a layout designed around it* — an empty column or half-viewport —
which is what a dedicated `/vorgehen` page would give it. Retrofitting it behind dense copy does
not work at any setting.

Artefacts kept in `design/particle-field/`: the brand preset and custom shapes, the tuned demo,
and `particle-field.production.js` — the patched library (pause/resume, debounced resize,
brand-safe defaults) ready to drop in when the page exists. Owner: partner-b.

## D-028 | 2026-08-02 | Wandlung: the particle field gets its own pinned stage | DECIDED
D-027 said the effect needs a layout built around it. Rather than wait for a `/vorgehen` subpage,
we built that layout on the homepage as a new section between Problems and Services
(`TransformStage.astro`, `#wandlung`): a pinned full-viewport sheet, 240svh of scroll, where one
object rearranges through three drawn states — *Ist-Zustand* (separate assemblies) → *Übergang*
(the bridge) → *Soll-Zustand* (a signal-flow schematic whose feedback loop is the monitoring).

**Why here.** Problems states the chaos and Services states what we build; the page asserted the
transformation between them but never showed it. This is the page's one authored focal moment,
and giving the field a whole viewport is what D-027 proved it needs — the earlier failure was
never the effect, it was asking it to share space with copy.

Consequences: homepage JS ~193 KB raw / 65 KB brotli (DESIGN.md's ~176 KB line updated); page
height 7100 → 9260 px at 1440×900. New i18n keys `stage.*` and `a11y.stageDiagram` in both
languages. A custom `fragments` shape was added to the preset because the stock
`scatter` disperses across the whole viewport, reads as dust and lands on the caption. Verified
in a headless browser at 1440×900 and 360×740, plus reduced-motion and `?snap`.

**Both gates ran and both found real defects.** `copywriter-de` replaced the „Wandlung" kicker
with „Ablaufschema" (every other kicker names a document; „Wandlung" was the one consulting-
register word, and it carries a Kaufrecht reading), rewrote `stage.3.note` because
„überwacht sich selbst" contradicted `process.3.note` and promised a mechanism the offer does not,
and fixed the EN false friend „Actual" → „Current". The section id `#wandlung` survives as the
internal name only. `design-critic` blocked on three: the scale bar was a second signal carrier in
a viewport the field already owns (now steel); the DIN frame was drawn three-sided because
`top-2` sat under the 4rem sticky header for the whole pin (now `top-[4.5rem]`); and reduced
motion removed the *argument*, not just the motion — states 1 and 2 stayed at `opacity: 0`, so a
reduced-motion visitor scrolled 240svh to read only the conclusion. Reduced motion now collapses
the section to 100svh and stacks all three captions. Also fixed: the palette is read from the
`@theme` custom properties instead of hardcoded hex, so a token edit actually moves the field.
Owner: partner-b.

## Template
```
## D-0XX | YYYY-MM-DD | <decision> | DECIDED/PENDING/SUPERSEDED by D-0YY
<2–3 lines: rationale, consequences, owner>
```
