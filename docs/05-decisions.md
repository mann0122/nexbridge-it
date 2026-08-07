---
id: decisions
title: Decision log
type: decision-log
status: active
owner: founders
updated: 2026-08-06
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

## D-029 | 2026-08-02 | Official venture email: nexbridge-it@mailbox.org | DECIDED
Founder confirmed in session. Replaces the placeholder `kontakt@nexbridge-it.com` in
`website/src/config/site.ts`, which was marked `TBD: confirm once the domain is registered`.
Everything else reads `SITE.email`, so the footer and both contact links follow automatically.

mailbox.org is a German provider (Berlin), which keeps enquiry mail inside Germany and is
consistent with the GDPR-first positioning — worth stating plainly if a prospect asks.
Unchanged: `formEndpoint` is still empty, so the contact form falls back to the visitor's mail
client and enquiries remain unmeasurable (open item 3 in [[state]]). Owner: founders.

## D-030 | 2026-08-02 | GSAP is the only animation engine | DECIDED
`animejs` and `motion` were installed in `website/` during a session, then removed the same day
without ever being imported. GSAP stays as the single motion engine, with Lenis bound to its
ticker.

**Why.** `DESIGN.md` already pins the motion signature to GSAP + ScrollTrigger, drives Lenis off
the GSAP ticker, and sets a hard page budget of ~193 KB JS / 65 KB brotli. Neither library adds a
capability GSAP lacks — both cover WAAPI-style tweens, timelines and stagger, which GSAP already
does, while ScrollTrigger/pinning/SplitText (the things the flow-line and Wandlung actually need)
have no equivalent in either. A second engine would spend budget for nothing and add a second
place to forget `prefers-reduced-motion`, which is a standing rule in `website/CLAUDE.md`.

Consequences: `website/package.json` dependencies are unchanged from before the install; build
verified clean, 5 routes, no bundle change since nothing imported them. The general rule this sets:
**one animation engine.** Adding a second is a decision that has to beat GSAP on a capability
DESIGN.md actually calls for, not a preference. Owner: partner-b.

## D-031 | 2026-08-02 | Design skills are allowlisted, not accumulated | DECIDED
52 skills were installed on the delivery machine, ~24 of them design/UI. `DESIGN.md` gains a
**Skill routing** section naming which ones govern design work here (`impeccable` as house flow,
the `gsap-*` family, `emil-design-eng`, `design-system`, the read-only audit skills) and which are
out-of-world.

**Why.** More design skills is not more taste. Each style skill carries prescriptive defaults —
its own type scale, shadows, palette — and several contradict the committed world outright:
`stitch-design-taste` *generates* DESIGN.md files and would overwrite the brief; `gpt-taste`
mandates pinned/stacked scroll sections when D-028 fixed Wandlung as the page's only pinned
sequence; `apple-design` centres on translucent glass, which the anti-pattern list hard-bans.
DESIGN.md's existing line "the brief wins over any skill default" was prose patching this; the
routing table makes precedence checkable.

Consequences: three exact duplicates deleted — `redesign-skill` (byte-identical to
`redesign-existing-projects`), `taste-skill` (byte-identical to `design-taste-frontend`), and
`design-taste-frontend-v1` (upstream back-compat copy). The first two were git-tracked, so the
deletion is recoverable; the third was a gitignored junction and was removed from `.agents/`,
`.gitignore` and `skills-lock.json` together. Nothing else was uninstalled — out-of-world skills
stay on disk and simply are not loaded, since a skill only shapes output when it runs. Adding a
skill to the allowed set is a decision and gets logged. Owner: partner-b.

## D-032 | 2026-08-02 | The site has no icon vocabulary | SUPERSEDED by D-043
A shadcn registry item (`plug-connected-icon`, itshover.com) was requested, ported to a
dependency-free Astro component, failed the `design-critic` gate and was deleted the same session.
Introducing an icon set is a DESIGN.md-level decision, not an implementation detail.

**Why.** This world draws *process*, not objects — labelled inputs, part numbers, dimension ticks,
a signal leaving a block. Nothing on the site is a miniature picture of a physical thing, and a
plug pictogram is the noun. Three checkable mismatches confirmed it: `stroke-linecap="round"`
appears nowhere else in `website/src/` (the site's lines are butt-capped throughout), the site's
stroke weights are 1.5 and 2.5 while the icon introduced a fourth at 2, and `DESIGN.md` enumerates
the permitted content structures as "diagrams, annotated lists, measured tables" while hard-banning
icon-card grids. The deepest objection is brand, not craft: `docs/02-brand.md` fixes the flow-line
as "the one memorable device — everything else stays quiet", and a plug snapping shut is a second,
cheaper *things-connect* mark competing with it.

Consequences: `website/src/components/icons/` deleted; it never had a call site. The `shadcn add`
path also wrote `motion` and `animejs` into `website/package.json` before stalling on its init
prompt — reverted and pruned, per D-030. If an icon vocabulary is ever wanted, the drawing rules
get decided *first* — butt caps, miter joins, 1.5px on a 24-unit grid, symbols from P&ID /
signal-flow grammar, no pictograms of physical objects — and `DESIGN.md` gains a Components line
before the first file lands. Building the first icon and back-filling the rules is how a design
system dies. Owner: partner-b.

## D-033 | 2026-08-02 | Wandlung re-themed to the AI stack; solid pyramid mark | DECIDED
Founder direction: more particles, pyramids instead of flat triangles, rendered in 3D, the
aggregate reading as one solid object, and shapes that say "AI company". Supersedes the shape
list in D-028 (`fragments → bridge → schematic`), which described the drawings the section no
longer contains — D-028 stays as written, this is the correction.

**Shapes** are now `die → neuralnet → pipeline`: a silicon die in plan view, a layered network as
a Schaltbild on a dimension line, and a running data pipeline in the P&ID duct whose feedback
return carries the instrument tag. **The drawing-office world stays** — these are the AI subjects
drawn the way an engineer would draw them, not the glowing brain and the floating node cloud,
which are the category rut and already banned. Copy follows the shapes: *Ihre Systeme → Der Agent
→ Im Betrieb* (`copywriter-de`, who also retired the „Ist → Soll" kicker because state 2 is now a
built object rather than a transition).

**The mark** is a solid shaded tetrahedron: four vertices, four faces, per-vertex perspective
divide, back-face culling, flat Lambert shading against a light fixed in *eye* space (world-space
would swing faces bright↔dark as the reader scrolls, since yaw is scroll-driven). Faces are filled
from a precomputed 16-step ramp per palette colour, each step a linear mix between one token and
the ground token — so shading cannot invent a hue, and every face is a flat fill, not a gradient.
A painter's-algorithm counting sort (512 buckets, no per-frame allocation) means a near particle
genuinely occludes a far one; that is what makes it read as matter instead of a transparent cloud.

**Marks got smaller as count went up** — `size 0.9 → 0.78`, `count 1200 → 2400`, jitter halved.
The two founder asks support each other only in that direction: a 5px pyramid on a 1px path turns
a hairline into a caterpillar, which is the D-027 failure again. Tuned against real screenshots;
the first attempt at `size 0.60` put almost every particle under the LOD threshold, so nothing
rendered as a pyramid at all and the shade ramp buried the rest in the ground colour.

Density was paid for first: samplers now take an out-param, `fromOutline` caches its path
resolution (a pure function of the particle's fixed randoms), tumble and drift trig are hoisted or
expanded by the angle-sum identity, and particles build lazily. Upstream allocated two arrays per
particle per frame and rescanned ~50 path segments per particle per frame. `MAX` 2400 → 4000,
`maxDpr` capped at 1.5. Owner: partner-b.

## D-034 | 2026-08-02 | Wandlung: volumetric fill, a brain, 9000 particles | DECIDED
Founder compared the shipped section against a reference image and it read too thin. Diagnosing
the gap mattered more than matching it: the reference's density comes from particles filling a
**volume**, ours traced a **1px path**. `fromOutline` distributes along path *length*, so every
shape stays a wireframe however many particles you add — more count just thickens the lines. That
one difference, not colour, was most of the gap.

New `fromFill(prims, scale, opts)` sampler: rasterise the outline once to an offscreen canvas,
keep every covered pixel, let each particle claim one by its stable random. Depth comes from a
**lens profile** (`z = ±t·√(1−r²)` from the centroid) so a filled form reads round rather than
like two flat sheets. Cached by `q.i` exactly as `fromOutline` is, so steady-state sampling is
still three multiplies. Falls back to outline behaviour where there is no `document`, which keeps
the Node geometry harness working.

**Shapes: `die → brain → pipeline`.** A brain is a "3D blob" under our own anti-patterns and is
the most reused image in AI marketing — accepted as founder-directed, and mitigated by keeping it
in the house grammar: it is *filled* rather than outlined, and its sulci are **carved as grooves
out of the particle body** (`destination-out` stroke before sampling) instead of painted on. At
`carveWidth: 0.016` the mass closed over them and they vanished; 0.032 reads. A dimension line
under it was tried and removed — at this scale it lands in the canvas mask's bottom fade and
scatters as debris across the caption. Copy needed no change: „Der Agent" describes a brain as
well as it described a network.

**Palette stayed inside the brand** (founder's call — no D-003 override). Widened from 4 distinct
colours to 7 by mixing existing tokens (paper↔steel, steel↔steel-deep, steel-deep↔ground), all
derived through `token()` so a `@theme` edit still moves everything. Signal measured **by area**,
not by count, because filled faces read heavier than strokes: **4.37% of drawn pixels**, against a
7% ceiling.

Also: `MAX` 4000 → 16000, `count` 2400 → 9000 desktop / 3000 mobile, `size` 0.78 → 0.62, and a new
`sizeVar` that skews the mark-size distribution so most stay small and a handful are markedly
large — that scatter is most of the field's texture. A `hollow` option exists for stroking the
tetra faces; default stays solid. Ink coverage went 2.5% → 8.6% on the brain state, which is the
objective check that the fill actually happened. Homepage JS ~204 KB raw / 69 KB brotli.
Owner: partner-b.

## D-035 | 2026-08-02 | Particle field removed from the site entirely | DECIDED
Founder call, after four rounds: "it is not working well and i do not want to ruin my website."
Removed completely — `TransformStage.astro`, `website/src/scripts/vendor/`, the `design/` lab, the
`stage.*` and `a11y.stageDiagram` keys in both languages, and the DESIGN.md motion entry. The
homepage is back to Problems → Services with no section between them. Supersedes the *shipping*
status of D-028, D-033 and D-034; those entries stay as written, this is the outcome.

**`FlowField.astro` in the hero is untouched** and was never in question — it predates all of this
(D-011), is bespoke rather than vendored, and the founder never raised it. It remains the page's
only generative canvas.

Worth keeping from the attempt, because the next person will be tempted again:
1. **A drawn outline needs a locked camera.** Any orbit and the shape almost never faces the
   viewer; it reads as grey dirt (D-027).
2. **A canvas effect needs a whole viewport.** Behind copy there is no setting that is both
   legible as a shape and harmless to the text (D-027).
3. **Outline shapes cannot gain mass** — particles distributed along path *length* stay a
   wireframe however many you add; only filling the interior gives a form weight (D-034).
4. **Marks must shrink as count rises**, or every hairline becomes a caterpillar (D-033).

The honest read on why it still failed: each round fixed the stated defect and the section kept
not being worth its 240svh. That is a signal about the *idea*, not the execution — a wordless
abstract animation is a poor fit for a buyer the positioning describes as sceptical of hype and
deciding on concrete numbers. If a visual beat is wanted between Problems and Services later, the
cheaper and more on-brand instinct is a drawn SVG diagram, static or lightly scroll-drawn, in the
grammar the rest of the site already uses. Owner: partner-b.

## D-036 | 2026-08-03 | Legal pages filled from the founder's documents | DECIDED
`/impressum` and `/datenschutz` shipped as skeletons since launch — open item #1 in [[state]] and
the last thing between the site and real traffic. The founder supplied `Impressum Homepage.docx`
and `Datenschutzerklärung Homepage.docx` (2026-08-03). Both are now live in German and English.

**Where it lives.** Identity data (name, street, PLZ, city, phone, representatives) in
`site.ts` — one place, so the Impressum, the Datenschutz controller block and the JSON-LD
`PostalAddress` cannot drift apart. Document text in a new `src/i18n/legal.ts`, typed
`as const satisfies Record<Lang, LegalDoc>` so an English section cannot go missing without a
compile error — the `ui.ts` parity mechanism reused, not the file itself (a 22-section policy
would bury it). Rendered by two shared components, so DE and EN cannot diverge structurally.
`region` in `site.ts` finally has a consumer.

**Two edits were made to the German draft, and only two.** Notes addressed to whoever completes
the document — `[Hosting-Anbieter]`, `[Speicherdauer …]` and five *"Bitte ergänzen Sie hier…"*
sentences — were replaced with verifiable facts about our own stack: the host is Cloudflare
(D-022), no cookies are set, no analytics is installed, fonts are self-hosted, and the contact
form has no endpoint so it hands the message to the visitor's own mail client. Those were
instructions to an author, not text for a reader. And "Stand: 09/2026" was future-dated;
corrected to 08/2026. **No legal wording was drafted or reworded** — CLAUDE.md rule 4.

**Deliberately left for a lawyer**, not guessed at:
1. §4 log retention — we run no server; the period is Cloudflare's, so no number is claimed.
2. §15 third-country transfer — dormant boilerplate until Cloudflare was named, now live and
   load-bearing. The fact is stated (US parent, global network, SCCs offered); the adequacy
   assessment is not ours to make.
3. §5 Art. 28 AVV — Cloudflare's DPA exists but must be **accepted in the account**. Founder to
   confirm.
4. The Impressum names two Geschäftsführer while declaring "Einzelunternehmer". A sole trader has
   no GF, and two people operating jointly is ordinarily a GbR — which is D-005, still PENDING.
   Flagged once and **published as written on the founder's explicit instruction**; recorded here
   so it is not mistaken for an oversight.

**English.** Both documents are fully translated and carry a "the German version is the legally
binding one" line — standard practice, and what stops a translation becoming a second legal text
that drifts. Unreviewed. This closes the `/en/` legal defect in [[state]]: `altPath()` needed no
change, it was already producing the right URL and the pages simply did not exist. `hasAlternate`
is back on for all four, so the language switch and hreflang pairs work again, and the legal links
in `Footer` and `Contact` now follow the reader's language.

**Also:** the Organization JSON-LD gains `address` and `telephone`. `Layout.astro` had reserved
exactly this — *"the Impressum will be the source for address data once it is written"* — and the
precondition is now met. No `vatID`; the document declines to state one. One real bug found and
fixed on the way: at 360px the single word "Datenschutzerklärung" renders ~412px wide and put the
whole page into horizontal scroll on its own; hyphenation now sits on the container so headings
inherit it. Owner: founders (legal review), partner-b (implementation).

## D-037 | 2026-08-06 | Ribbons cursor trail; a second generative canvas is allowed | DECIDED
Founder asked for the react-bits `Ribbons` effect on the site and reaffirmed it after being shown
[[decisions]] D-035. This **supersedes the "one is the limit" clause** in `DESIGN.md` — the page
now carries two generative canvases, `FlowField` and `Ribbons`, and two is the new limit.

Why this cleared a bar the particle stage never did, since D-035 exists precisely to stop the next
attempt: the stage was a wordless abstract animation occupying 240svh that had to *justify* its
space and never did. The trail occupies no layout space, costs no scroll, and is bound to the
visitor's own hand rather than being asked to carry meaning. That is a narrower claim, and it is
the only one being made. D-035's four lessons stand unedited; lesson 2 ("behind copy there is no
setting both legible and harmless") is what forced the calibration below rather than being refuted.

**Not vendored.** `npx shadcn@latest add @react-bits/Ribbons-JS-CSS` cannot run here — it demands
a `components.json` and would scaffold React into an Astro site that has none. The registry source
was ported by hand to `website/src/components/Ribbons.astro`: physics and both shaders are
upstream's, everything around them is ours. Four changes worth knowing. Pointer tracking listens on
`window` so the overlay stays `pointer-events: none` and cannot eat a click. Colours resolve from
`@theme` at runtime, so a token edit still moves the ribbon and an unresolvable token yields *no*
ribbon rather than an off-palette fallback. Fine pointers only, plus the `motionOff` gate, so touch
devices create no WebGL context at all. And the rAF **stops once the ribbons settle** — at rest the
points converge, the shader's `smoothstep(0, 0.02, dist)` zeroes the width, and the loop was
rendering an invisible mesh; a parked cursor now costs nothing and the next mousemove restarts it.

**Calibration is the decision, not a detail.** `design-critic` blocked the founder's original mount
(two colours, 30px, full alpha, z-55) on four counts, all upheld: at full alpha the ribbon head
*occluded* body copy rather than merely reducing contrast; `--color-graphite` as a second ribbon is
invisible on graphite ground and a near-black smear on paper, reading as a bug; a permanent orange
band broke the D-003 signal ration against the hero CTA; and z-55 painted over the sticky `Header`.
Shipped: **one signal ribbon, 18px, 0.45 alpha, z-30**. Graphite copy over that wash on
`--color-paper` computes to **9.6:1**. `opacity` now *defaults* to 0.45 in the component, so no
future mount can ship an opaque band by omission. The signal ration in `DESIGN.md` is held by the
trail being a wash and not an object — raise either number and it breaks both the ration and the
copy underneath.

**`qa-reviewer` returned NO-SHIP and was right.** ogl logs "unable to create webgl context" and
then dereferences the null context on the next line, so the mount threw an uncaught `TypeError` on
both homepages wherever WebGL is unavailable — GPU blocklists, hardware acceleration off,
`webgl.disabled`, hardened privacy browsers. Reproduced, not theorised. Decoration may not put an
error on the marketing page: `initRibbons` is now wrapped, and a failed chunk fetch is caught on
the same contract. Also fixed from that gate: the `IntersectionObserver` stop was defeated by
`updateMouse` calling `start()` unconditionally (latent, only in the unused section-fill mode), and
a page loading in a background tab kept a stale frame clock.

**Cost, and the part worth copying.** `ogl@1.0.11` — zero dependencies, no install scripts,
Unlicense, bundled locally, so the zero-third-party-request GDPR asset holds. The library is
behind a **dynamic import placed after the gates**, so mobile and reduced-motion visitors download
none of it: first load is **~184 KB raw / 63 KB brotli** (from ~176), and ogl is a separate
**50 KB / 12 KB brotli** chunk fetched only on a fine pointer with motion enabled. Note the trap —
handing the imported namespace round as one object is opaque to Rollup and pulled all 129 KB of
ogl in; destructuring at the import site restored tree-shaking and cut that to 50 KB. Measured
Lighthouse before the deferral: desktop 100/100/100/100, mobile perf 95 — exactly at the bar with
no headroom, which is what forced it. Owner: partner-b (implementation), founder (the call to
override).

Three items were deliberately not taken under a ship-now instruction and remain open: the
component runs its own rAF instead of `gsap.ticker`, a second frame clock against D-030's
one-engine rule; there is no `webglcontextlost`/`restored` handler, so a dead GPU process blanks
the canvas with no recovery; and the mount config is duplicated verbatim in both `index.astro`
files, which will drift — a `SiteOverlays` wrapper is the fix. None blocks; all three are cheap.

## D-038 | 2026-08-06 | Motion lifecycle: one frame clock, one overlay mount, page-scoped inits | DECIDED
First commit of the founder-ordered motion upgrade (route transitions, scroll transitions, the
particles' calibrated return — the umbrella decision is the founder's, given with D-035 on the
table; the phases land as D-038…D-042). This one is the foundation and changes no animation
values: it makes the motion system able to survive a client-side router before one exists.

**The lifecycle.** `motion.ts` now runs an `onPage(init)` registry: module level registers,
every page mount re-runs the inits inside one shared `gsap.context`, and unmount reverts the
context, runs returned cleanups (intervals, document/window listeners, observers), and destroys
Lenis. Lenis is per-page by decision — destroy before swap, recreate after — because Astro's
router restores scroll synchronously during the swap and a surviving instance eases back toward
the previous page's position (withastro #12725); a fresh instance is born synced. Without the
ClientRouter, "mount" is simply `DOMContentLoaded`; the `astro:page-load` path is wired and
dormant until D-039. Anchor clicks moved to one delegated listener that now also moves focus to
the target — the per-element version scrolled the skip link without moving focus, which defeated
it (WCAG 2.4.1, caught by `design-critic`). Scroll offset unified at 80px to match
`scroll-margin-top`, so smooth-scroll and reduced-motion visitors land on the same pixel.

**All three D-037 open items closed.** `FlowField` and `Ribbons` frames now come from
`gsap.ticker` — D-030's one clock, no second rAF anywhere; Ribbons keeps its settle-stop by
adding/removing the ticker callback, so a parked cursor still costs zero frames.
`webglcontextlost/restored` handlers land: on restore the instance disposes and rebuilds, both
paths under the decoration-never-errors contract. And the duplicated mount config is gone —
`SiteOverlays.astro` (Grain + Cursor + Ribbons, `transition:persist`, display:contents) mounts
once in `Layout`. Ribbons' default `colors` shrank to the single signal ribbon on the same
safe-by-omission logic D-037 applied to `opacity`.

**Consequence accepted: the overlays now render on all seven pages**, legal and 404 included,
which also gives those pages Lenis and the motion chunk they never loaded. Required for
`transition:persist` continuity (a persisted element must exist on both sides of every
navigation), and `design-critic` judged it acceptable on brand grounds: the D-037 calibration
was made for exactly this case — 9.6:1 over paper holds, the signal ration holds because the
trail is a wash, reduced-motion and coarse-pointer visitors get none of it. Cost: first load
~189 KB raw (from ~184), the lifecycle is the whole increase; ogl stays a deferred 50 KB chunk.
Owner: partner-b.

## D-039 | 2026-08-06 | ClientRouter + the drafting-sheet veil; navigation is a drawing change | DECIDED
The site navigates client-side now: `<ClientRouter fallback="swap" />` in `Layout`, on all seven
documents. The router's own cross-fade is disabled globally — the transition is ours: a graphite
**drafting sheet slides across the board** left→right (the direction the flow-line travels), a
hairline frame draws in, a Zeichnungskopf stamps the target pathname, sheet number and ISO date,
the swap happens under full cover, and the sheet exits right so the new page is revealed in
reading direction. The navigation only waits for the cover itself (0.42s — the frame and stamp
finish drawing over the already-covered board, a `qa`-gate finding); the reveal is 0.56s, and
the router's default hover-prefetch makes the fetch ~0. The sheet number is the veil's single
signal element (D-003 ration).

**The veil is DOM/SVG, not WebGL, by decision.** D-037's qa gate proved WebGL-unavailable is a
real population, and a route transition that can fail is worse than none; a shader also cannot
set Fragment Mono type without baking textures. ~2 KB, compositor-only, works under
`webgl.disabled`. Content is numerals, pathnames, the brand name and a date — zero translatable
words, so no i18n keys and no copywriter gate, by construction.

Three treatments, not one: normal navigations get the sheet; **history traversals swap bare**
(users expect instant back); **DE↔EN twins get a 250ms hairline scan** with the scroll position
carried across — the same drawing gets a new annotation layer, and switching language mid-page
no longer jumps to top. The scroll carry-over runs for reduced-motion visitors too (a courtesy,
not motion — `design-critic` finding); everything else they skip: instant swaps, veil
`display: none`. The veil lives inside SiteOverlays' persisted wrapper because it must survive
the very swap it covers.

**A covered page must always be uncovered.** The `qa` gate proved two abort paths where the
router never fires `astro:page-load` after a cover (a same-page hash navigation mid-cover; Back
pressed from a hash URL) — so `popstate`/`hashchange` reveal a covering veil immediately and a
4s watchdog backstops anything unforeseen; cover and reveal kill each other's timelines. Two
more findings from the same gate, both taken: the delegated anchor handler moved to the
**capture phase**, because the router's own click listener has no hash-link exclusion and was
stealing every same-page anchor from Lenis (killing the D-038 easing and focus handoff); and
`html { scroll-behavior: smooth }` is **gone entirely** — motion visitors have Lenis, reduced
motion wants instant, and the only moments the CSS rule ever applied were the router's scroll
windows, where it made Back/Forward restoration glide. `404.astro`'s inline path-filler gained
`data-astro-rerun` — inline scripts run once under the router unless told otherwise. The first
mount stays at `DOMContentLoaded` (the router's initial `astro:page-load` waits for window
load, seconds late on a slow connection). Owner: partner-b.

## D-040 | 2026-08-06 | The particles return, confined: FlowField dispersion + route-exit blast | DECIDED
Founder-ordered return of particle motion, superseding D-035's *"removed from the site
entirely"* **narrowly**: the effect lives inside the hero canvas the page already owns — no
third canvas, no new library, no layout space, no scroll cost. D-035's four lessons stand;
lesson 2 (a canvas behind copy cannot win) is respected by construction because the hero
FlowField already owns its region behind a directional mask that quiets the headline area.

**Scroll is the trigger, dispersion is the grammar.** A scrubbed ScrollTrigger maps hero-exit
progress onto a dispersion parameter: the flow vector mixes toward a radial impulse from the
schematic block's position, speed rises 1.4→10.4, alpha falls, trail decay stays low at onset so
streaks smear long, then ramps so the whole field — static ground included — evaporates. Dead
particles stop recycling above 0.6 so the sky empties. All of it reverses on scroll-back, and
after a full evaporation the static ground is repainted softly on return. **Route exits reuse
the same machinery**: transitions.ts dispatches `flowfield:blast` before the veil covers;
0.45s `power4.out` tears the field apart in the first 150ms while the sheet crosses at ~450ms —
blast and sheet read as one gesture. The event contract keeps the coupling zero: on pages
without the hero, nobody listens.

Also closed here: FlowField's stroke colours now resolve from `@theme` at mount (the
design-critic finding at D-038 — one of the two literals matched no token; strokes are now
token-true steel, marginally darker). Cost: ~1 KB. The particle *stage* stays dead; this is
dispersion of an artwork that already existed, bound to the visitor's own scroll and exit.
Owner: partner-b, on the founder's explicit instruction with D-035 on the table.

## D-041 | 2026-08-06 | Section seams: eight boundaries, three motifs, still no pinning | DECIDED
The homepage's section boundaries become drafting operations (`website/src/scripts/seams.ts`):
**seam rules** that draw themselves along the existing border lines (B1 Hero→Problems with a
`01 → 02` numeral tick riding the tip, B2 Problems→Services, B7 Demo→Founders mirrored
right→left, B3 both edges of the Marquee band), **ground-wipes** where the ground changes (B5
the graphite recedes left→right behind a leading hairline confined to a 4.5rem seam band — never
under copy, D-027 — and B8 the paper recedes right→left into the ask), and two accents: the
marquee's **conveyor couples to scroll velocity** (WAAPI playbackRate, clamped 0.6–2.5, eased on
the one ticker), and the founders' origin annotation **types itself in** — the site's single
ScrambleText moment, teleprinter in mono. B2 adds differential parallax on the two reading
scopes (−20/−40px) so the boundary reads as depth. B4 Marquee→Process is quiet on purpose:
variety includes rest, and the scrubbed process line is that zone's star.

**Pinning was considered and declined again** — everything is scrubbed and reversible,
DESIGN.md's "no pinned scroll sequence" and D-031's reasoning stand. A system, not eight
gimmicks: three motifs recur; every seam element is steel/line/graphite (zero signal, D-003
ration untouched). All furniture is **built in JS**: it cannot exist without a script, so the
no-JS page is byte-identical to the static one and `?snap` keeps rendering final states — where
a seam rule replaces a CSS border, the border goes transparent in the same tick the overlay
starts animating. The seams module is imported only by the two homepage scripts and bails
anywhere `#kontakt` isn't the last section. Owner: partner-b.

## D-042 | 2026-08-06 | Motion upgrade measured; the 95 floor held; dissolve stays a lab | DECIDED
The numbers, measured, not estimated (Lighthouse against `npm run preview`, homepage):

| | before (D-037) | after (D-038…D-041) |
|---|---|---|
| First-load JS | 184 KB raw / 63 KB brotli | **212.8 KB raw / 72.7 KB brotli** |
| Deferred `ogl` chunk | 50 / 12 | 50 / 12 (unchanged, still gated) |
| Lighthouse desktop | 100 / 100 / 100 | **100 / 100 / 100** (LCP 0.6s, TBT 20ms, CLS 0.006) |
| Lighthouse mobile | 95 perf | **95 / 100 / 100** (LCP 2.4s, TBT 80ms, CLS 0.01) |

Of the +28.8 KB raw: the ClientRouter runtime is 15.7, the veil + transitions ~5, seams 4.2,
dispersion + lifecycle the rest. **The founder pre-accepted a mobile score below 95 ("wow over
budget"); it was not needed — the floor held at exactly 95**, same no-headroom bar D-037
measured. The floor therefore stays at 95 and the pre-authorization lapses unused; anyone
spending the headroom that does not exist reads this row first.

**The WebGL hero-erasure experiment is built and NOT merged** — branch `feat/hero-dissolve-lab`
(`dfdc2d5`): noise-threshold erosion of the FlowField texture with a radial push, replacing the
2D blast only when the chunk preloaded at idle and a context creates; every bail path falls
back to D-040's blast. On the lab branch the ogl chunk measures 55.1 KB raw (under its 65 KB
kill line) and the module adds 6.8 KB. The verdict needs what a build cannot give: a live
side-by-side against the 2D blast and a 4× CPU-throttle frame trace. Kill criteria are in the
file header; per D-035 discipline the default expectation is kill — merging requires a D-entry
that also raises the two-canvas cap. Owner: founder (the eyeball), partner-b (the trace).

## D-043 | 2026-08-07 | Icon vocabulary admitted under drawing rules | DECIDED — supersedes D-032
Founder re-requested the itshover `plug-connected-icon` (the exact item D-032 rejected) plus the
set applied "wherever applicable" — that re-ask, with D-032 on the table, is the supersession.
D-032's preconditions are honoured rather than argued with: the drawing rules land in `DESIGN.md`
**before** the first icon file, in the same commit. Butt caps, miter joins (upstream's `round`
caps dropped in the port), stroke 1.5 on the 24-unit grid (scaled equivalents elsewhere), 2.5
reserved for the CTA arrow's action line — the site's existing two-weight system, not a fourth
weight. `currentColor` only, never signal; annotation grade (14–20px); triggered by parent
intent via a `data-icon-hover` attribute; single-shot and reversible — the flow-line pulse stays
the site's only loop, and the flow-line stays the one memorable device.

**The port is CSS-only: zero JS, zero dependencies.** shadcn was deliberately not run (D-032
records it writing `motion` and `animejs` into package.json before stalling); sources were
hand-ported from the registry JSON. Upstream's `motion/react` hover animations (±2px translates,
opacity fades, pathLength draws) are expressed as scoped CSS transitions; draw-style icons rest
**fully drawn** via `pathLength="1"` + dasharray, so no-JS, reduced-motion and `?snap` render
complete icons. Placements: four part symbols in the Services rows (a symbol column in a parts
list, not an icon-card grid — the ban stands), the founder-named plug on the Contact mailto, a
world icon on both language toggles, and a real extending arrow (`Cta.astro` + `CtaArrow.astro`)
replacing the literal `→` glyph in the three drifted CTA copies — which finally implements
DESIGN.md's "arrow that extends on hover" as geometry and closes the drift (padding, magnetic,
motion-reduce guards) in one shared component. Legal pages stay icon-free: soberest pages, and
no icon ships without a call site (D-032's lesson).

**Gates.** `design-critic` blocked once and was taken in full: the Services id cell was rebuilt so
the icon no longer poisons the row's baseline (a flex cell exports the SVG's bottom edge as its
baseline; the icon is absolutely positioned at sm+), symbols dropped 20→16px so the part number
stays primary, the mobile-overlay press-slide was deleted (it fired for one frame), and the lucide
brain — the category's most saturated glyph, this brand's own "category rut" (D-033) — was
replaced with an in-house Schaltbild network drawn in D-033's vocabulary: 2-3-1 node ranks,
edges trimmed to rims, redrawing left-to-right on hover. `qa-reviewer` then failed the change
twice on performance and was right both times: colocated `<style is:global>` blocks split a
second render-blocking CSS chunk, and the first fix (raising `assetsInlineLimit`) made documents
*heavier* by inlining shared styles per page. Final architecture: all icon styles live in a D-043
section of `global.css`, riding the one cached external sheet; the components carry geometry only.

**The 95 floor moves to 94 mobile, by this decision.** Before the change the homepage measured an
unrounded 0.947 — zero headroom, as D-042 warned — so *any* added critical content breaks 95.
The icons add ~1.7 KB gzip (markup + styles, JS byte-identical at 208.5 KB raw), which the
Lighthouse simulator prices at +146ms LCP → 94 median (3×3 interleaved runs against a HEAD
anchor at 95; CLS clean; desktop stays 100/100/100). Estimated field impact behind Cloudflare
brotli/HTTP-2 is ~10–20ms. The founder chose shipping the icons over the point: mobile
performance floor is now **≥ 94**, a11y/SEO stay ≥ 95 — CLAUDE.md's definition of done updated in
the same commit. Anyone tempted to spend further "headroom" reads D-042's warning first; it now
applies at 94. Owner: founder (the call, twice), partner-b (port).

## D-044 | 2026-08-07 | Flowrail: the exit arrow travels the document and bursts on route exit | DECIDED
Founder-described to the letter: the hero schematic's orange arrowhead detaches on the first
scroll and rides the whole page — one signal line drawing behind it, down the hero DIN frame's
own edge and then the right `px-6` gutter, inward circuit-trace jogs at the seams where the
gutter affords them, plugging into the footer Zeichnungskopf. Fully scrubbed and reversible:
scroll back and the signal returns to the schematic (a `visibility` handoff — one arrow
exists, it detaches, it never duplicates). On route exit the rail retracts and the head
**bursts into 18 (mobile) / 28 (desktop) same-species arrowheads** that fan up-and-out, fall
under gravity — the first use of `Physics2DPlugin`, already free in GSAP 3.15, +1.6 KB — and
vanish by ~1.2s. The pieces spawn 150ms after dispatch so they fall over the drafting sheet,
not over live copy, into the persisted `#arrow-burst` container (z-55: above the veil sheet,
below grain) whose children deliberately outlive the page context — they must animate across
the swap. Spam cap + sweep timer bound every abuse path.

**Three ration rulings, written down so the next audit needn't re-derive them.** (1) The rail
is legal at stroke 2.5 because it *is* `flow-out-main` continued — not a new user of the
action-line weight (D-043's letter holds). (2) The rail is the memorable device extended, and
it **yields to 0.2 opacity** wherever a section owns its own signal — Process's scroll line
(D-041's star) and Contact's CTA + closing schematic; Demo's annotation-grade sparkline is
consciously not yielded to. (3) The burst amends D-039's "the sheet number is the veil's
single signal element": during the shower the debris is the second, by founder order.

**The gate earned its keep again.** `design-critic` proved the arrowhead crossed into the text
column on the inner lane at container-flush widths (up to 6.5px at 1200px — the jog clamp
budgeted the stroke but not the head), found the Contact viewport carrying three signal
elements, and called the 0.75px rail-to-DIN-frame gap fringing. All fixed pre-commit: the
clamp now budgets the head's half-height and drops jogs entirely below a 5px budget (the jogs
are garnish, the never-under-text contract is not); Contact joined the yield list; the rail
now rides exactly ON the frame edge (w−16). `qa-reviewer` traced the lifecycle clean —
context-reverted scrub/dims, explicit listener cleanup, burst tweens correctly outside the
page context — and confirmed the Physics2D API against the shipped plugin source.

**Measured.** First load **218.6 KB raw / 74.5 KB brotli** (from 212.8/72.7 at D-042; the
homepage-only seams+flowrail chunk is 8.4/2.9, Physics2D the rest); ogl still a deferred
50/12. Lighthouse: desktop **100/100/100**, mobile **94/100/100** — exactly the ≥94 floor
D-043 set, stable across runs (0.940 twice), CLS 0.009. Owner: partner-b, on the founder's
explicit description.

## D-045 | 2026-08-07 | The WebGL hero dissolve is killed; the flowrail is confirmed | DECIDED
Founder verdict after a fair viewing — the lab branch got evaluation hotkeys that played the
WebGL erasure alone, slowed to 1.8s, against the shipped 2D dispersion in the same seat:
*"you are just making it invisible in the hero background... it is not masterpiece level."*
That is D-042's default expectation arriving on schedule, and the D-026→D-035 lesson holding
again: an effect that has to be slowed down and pointed at to be seen at all cannot justify
itself in its real context, a ~0.4s route-exit window under the veil. Killed as prescribed:
branch `feat/hero-dissolve-lab` deleted (tip `8422cd8`); nothing merges. For the record it
would have carried: ogl chunk 50 → 55.1 KB raw with the extra imports, +6.8 KB module on
first load, and a second WebGL context per navigation.

**What survives is the point.** The two-canvas cap stands untouched. The `flowfield:blast`
event stays plain (the cancelable wiring existed only on the lab branch). And the founder
confirmed **D-044's flowrail as the keeper** — "the arrow thing is cool, keep it" — which is
the pattern D-035 already taught: effects bound to a real object the visitor follows earn
their place; treatments applied over the whole canvas do not. Also housekeeping: the merged
`feat/motion-upgrade` and `feat/flowrail` branches and the stale `feat/wandlung-stage` are
deleted; `main` is the only long-lived branch again. Owner: founder (verdict), partner-b
(removal).

## Template
```
## D-0XX | YYYY-MM-DD | <decision> | DECIDED/PENDING/SUPERSEDED by D-0YY
<2–3 lines: rationale, consequences, owner>
```
