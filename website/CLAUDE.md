# website/ — NexBridge-IT marketing site

The repo constitution is `../CLAUDE.md` and the knowledge map is `../docs/INDEX.md`. Read
`../docs/STATE.md` for what is live and what is still open. This file covers only what is specific
to the Astro app.

## Four single sources — never work around them

| What | Where |
|---|---|
| Brand name, URLs, email, analytics + form config | `src/config/site.ts` |
| Design tokens (colours, type scale) | `src/styles/global.css` `@theme` |
| Every user-visible string, DE and EN | `src/i18n/ui.ts` |
| Teaser asset identity — file ids only, no strings, no codes, no film paths | `src/config/teasers.ts` (D-057) |

The English block cannot silently drift from the German one — but NOT because of the
`satisfies Record<Lang, Record<string, string>>`, which only requires string keys and let exactly
that drift ship once (D-058). What enforces it is the `AssertKeys` pair at the foot of `ui.ts`,
and it only speaks when you run `npm run check`. `astro build` does not typecheck. Add the key in
both blocks, never a hardcoded string in a component. The EN page shares the DE page's
components; it is not a copy.

## Commands

```
npm run dev      # localhost:4321
npm run build    # static output to dist/ — does NOT typecheck
npm run check    # astro check: types + the ui.ts DE/EN parity guard (D-058)
npm run preview  # serve the build
npm run dev:worker          # wrangler dev on :8787 — the build in dist/ plus the Worker (needs
                            # a build first; stats need .dev.vars + stats:migrate:local)
npm run stats:migrate       # apply worker/migrations/ to the remote D1 (D-063)
npm run stats:migrate:local # …to the local one under .wrangler/
```

`check` is not wired into `build` yet: it still reports four pre-existing errors in
`scripts/flowrail.ts`. Clear those first, then gate the build on it.

Deployed as a Cloudflare static-asset Worker (`wrangler.jsonc`), not Pages — D-022. Custom domains
are attached in the Cloudflare dashboard, not via `routes`. One script exists, `worker/index.js`,
and only two path sets go through it (`run_worker_first`): files under `/teaser/` — it serves the
videos as `206` slices via the Cache API because the asset store ignores `Range` and Safari will
not play without it (D-062), and passes the posters through — and `/api/*`, the two stats routes
in `worker/stats.js` (D-063): `POST /api/hit` from the beacon, `GET /api/stats` for `/statistik`
behind the `STATS_KEY` secret. Everything else is a plain asset. `worker/` is excluded from
`astro check`. Deploy checks after any change there: `curl -sI -H "Range: bytes=0-1" <film url>`
must say `206` and carry `x-nb-video`; `curl -s /api/stats` must say `401` — or `503` for as
long as the `STATS_KEY` secret is not set in the account (`worker/stats.js` refuses rather than
falling back to a default key).

The stats are **live** (D-064): `statsEnabled` in `site.ts` is `true` and the beacon ships
inline in every document. The flag and Datenschutz §10 are coupled — switching either without
the other makes the legal page wrong. Local testing: `npm run dev:worker` with a local build,
`.dev.vars` and `stats:migrate:local`; your own visits are excluded per browser via the checkbox
on `/statistik`.

## Rules that bite

- **German copy goes through the `copywriter-de` agent.** Sie-Form, no Title Case, no buzzwords.
- **Any UI change goes through `design-critic`** before commit. Rogue hex values are violations
  even when they match a brand colour — tokens exist for a reason.
- `public/google61dfa7e628fa15c6.html` is the Google Search Console verification file.
  **Deleting it breaks verification.**
- Motion honours `prefers-reduced-motion`, and `?snap` renders final states for static capture.
- Zero third-party requests is the current state and a GDPR asset. Adding one is a decision, not
  an implementation detail — log it.
