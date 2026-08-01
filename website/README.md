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
```

Node >= 22.12. From the repo root, `npm run site` and `npm run site:build` do the same thing.

## Routes

| Route | File |
|---|---|
| `/` | `src/pages/index.astro` |
| `/en/` | `src/pages/en/index.astro` |
| `/impressum` | `src/pages/impressum.astro` — skeleton, awaiting legal text |
| `/datenschutz` | `src/pages/datenschutz.astro` — skeleton, awaiting legal text |
| 404 | `src/pages/404.astro` -> `dist/404.html`, wired via `wrangler.jsonc` |

`/leistungen`, `/vorgehen`, `/ueber-uns` and `/kontakt` are **homepage anchors, not pages** — see
`src/components/Header.astro:17`. The spec lists them as planned.

## Structure

```
src/
  config/site.ts      Brand name, URLs, email, analytics + form config. Single source.
  styles/global.css   @theme design tokens. Single source. No hex in components.
  i18n/ui.ts          Every user-visible string, DE + EN. Single source.
  layouts/            Layout.astro — head, JSON-LD, OG, hreflang, skip link
  components/         15 components; the EN page reuses all of them
  pages/              The four routes above + 404
  scripts/motion.ts   GSAP + Lenis motion layer
public/               favicon, og.png, robots.txt, GSC verification file
```

`ui.ts` is typed so the English block cannot drift from the German one — a missing key is a
compile error, not a silent fallback in production.

## Things that will bite you

- **Never hardcode a user-visible string.** Add the key to `ui.ts` in both languages.
- **Never hardcode a colour.** Tokens live in `global.css` `@theme`.
- **German copy goes through the `copywriter-de` agent**, UI changes through `design-critic`.
- `public/google61dfa7e628fa15c6.html` is the Google Search Console verification file. Deleting it
  breaks verification.
- Motion honours `prefers-reduced-motion`. `?snap` renders final states for static capture.
- The site currently makes **zero third-party requests**. That is a GDPR position, not an
  oversight — adding one is a decision to log, not an implementation detail.

## Deploy

```
npx wrangler deploy
```

Custom domains are attached in the Cloudflare dashboard, not via `routes` — the wrangler OAuth
token lacks `dns_records:write`. See D-022 in `../docs/05-decisions.md`.
