# 05 — Decision Log

Format: `D-### | date | decision | status | rationale`. Append-only; supersede, don't delete.

## D-001 | 2026-07-26 | Name: Klarfluss | DECIDED (verification pending)
Klarheit + Fluss; German-credible, describes the product. PENDING sub-items: klarfluss.de via
DENIC, DPMA trademark search, handle availability. Do not print/publish before verification.

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

## D-006 | 2026-07-26 | Domain: klarfluss.eu | DECIDED
klarfluss.de is TAKEN (parked/squatted — see docs/research/domain-availability.md). Founders chose
klarfluss.eu as primary domain. Free as of 2026-07-26; registration action: founders. Optional
later: klarfluss-software.de as defensive secondary/redirect.

## D-007 | 2026-07-26 | v1 package prices | DECIDED
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
in the header. Supersedes the "EN later" line in 03-website-spec.md. Brand name "klarfluss"
stays provisional until founders review the demo design — name lives in ONE config constant
(site.ts) so a rename is a one-line change. Domain registration deferred until name is final.

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

## Template
```
## D-0XX | YYYY-MM-DD | <decision> | DECIDED/PENDING/SUPERSEDED by D-0YY
<2–3 lines: rationale, consequences, owner>
```
