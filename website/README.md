# NexBridge-IT — website

Marketing site for NexBridge-IT. Astro 7 + Tailwind 4, static output, deployed as a Cloudflare
static-asset Worker. Bilingual: German at `/`, English at `/en/`.

Its one job: turn a visiting Mittelstand decision-maker into an Erstgespräch. Every section serves
that. Agent instructions live in [CLAUDE.md](CLAUDE.md); the spec is
[../docs/03-website-spec.md](../docs/03-website-spec.md).

## Run

```
npm install
npm run dev       # localhost:4321
npm run build     # -> dist/
npm run preview   # serve the build
npm run dev:worker  # the build + the Worker under wrangler on :8787 (stats routes, videos)
```

Node >= 22.12. From the repo root, `npm run site` and `npm run site:build` do the same thing.

## Routes

| Route | File |
|---|---|
| `/` | `src/pages/index.astro` |
| `/en/` | `src/pages/en/index.astro` |
| `/impressum`, `/en/impressum` | `src/pages/impressum.astro`, `en/impressum.astro` — text from the founder's documents via `src/i18n/legal.ts` (D-036); lawyer review still open |
| `/datenschutz`, `/en/datenschutz` | `src/pages/datenschutz.astro`, `en/datenschutz.astro` — same source, same open review |
| `/teaser`, `/en/teaser` | `src/pages/teaser.astro`, `en/teaser.astro` — gated films (D-056) |
| `/karte/…`, `/en/card/…` | `src/pages/karte/`, `en/card/` — NFC business cards (D-049), noindex |
| `/statistik`, `/en/stats` | `src/pages/statistik.astro`, `en/stats.astro` — founders' stats board (D-063), noindex, key-gated |
| `/api/hit`, `/api/stats` | `worker/stats.js` — not pages: the beacon's POST and the board's feed |
| 404 | `src/pages/404.astro` -> `dist/404.html`, wired via `wrangler.jsonc` |

`/leistungen`, `/vorgehen`, `/ueber-uns` and `/kontakt` are **homepage anchors, not pages** — see
`src/components/Header.astro:19`. The spec lists them as planned.

## Structure

```
src/
  config/site.ts      Brand name, URLs, email, analytics + form config. Single source.
  styles/global.css   @theme design tokens. Single source. No hex in components.
  i18n/ui.ts          Every user-visible string, DE + EN. Single source.
  layouts/            Layout.astro — head, JSON-LD, OG, hreflang, skip link
  components/         29 components + icons/; the EN pages reuse all of them
  pages/              The routes above + 404
  scripts/motion.ts   GSAP + Lenis motion layer
  scripts/beacon.ts   The stats beacon (D-063) — inert unless site.ts enables it
  scripts/stats.ts    The /statistik board: fetch, key gate, inline-SVG chart
public/               favicon.svg + logo-mark.svg + apple-touch-icon.png (the D-050
                      mark), og.png, robots.txt, GSC verification file
worker/               index.js (videos as 206, D-062) + stats.js (the two /api routes,
                      D-063) + migrations/ (the D1 schema)
```

`ui.ts` is typed so the English block cannot drift from the German one — a missing key is an
error in `npm run check` (D-058), not a silent fallback in production. `npm run build` does not
run that check yet.

## Things that will bite you

- **Never hardcode a user-visible string.** Add the key to `ui.ts` in both languages.
- **Never hardcode a colour.** Tokens live in `global.css` `@theme`.
- **German copy goes through the `copywriter-de` agent**, UI changes through `design-critic`.
- `public/google61dfa7e628fa15c6.html` is the Google Search Console verification file. Deleting it
  breaks verification.
- Motion honours `prefers-reduced-motion`. `?snap` renders final states for static capture.
- The site currently makes **zero third-party requests**. That is a GDPR position, not an
  oversight — adding one is a decision to log, not an implementation detail. The stats beacon
  is first-party and live; `statsEnabled` in `site.ts` is coupled to the Datenschutz §10 text
  (D-063/D-064) — not a switch to flip for a test.

## Deploy

```
npx wrangler deploy
```

Custom domains are attached in the Cloudflare dashboard, not via `routes` — the wrangler OAuth
token lacks `dns_records:write`. See D-022 in `../docs/05-decisions.md`.
