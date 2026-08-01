# website/ — NexBridge-IT marketing site

The repo constitution is `../CLAUDE.md` and the knowledge map is `../docs/INDEX.md`. Read
`../docs/STATE.md` for what is live and what is still open. This file covers only what is specific
to the Astro app.

## Three single sources — never work around them

| What | Where |
|---|---|
| Brand name, URLs, email, analytics + form config | `src/config/site.ts` |
| Design tokens (colours, type scale) | `src/styles/global.css` `@theme` |
| Every user-visible string, DE and EN | `src/i18n/ui.ts` |

`ui.ts` is typed `as const satisfies Record<Lang, Record<string, string>>`, so the English block
cannot silently drift from the German one — a missing key is a compile error. Add the key there,
never a hardcoded string in a component. The EN page shares the DE page's components; it is not a
copy.

## Commands

```
npm run dev      # localhost:4321
npm run build    # static output to dist/
npm run preview  # serve the build
```

Deployed as a Cloudflare static-asset Worker (`wrangler.jsonc`), not Pages — D-022. Custom domains
are attached in the Cloudflare dashboard, not via `routes`.

## Rules that bite

- **German copy goes through the `copywriter-de` agent.** Sie-Form, no Title Case, no buzzwords.
- **Any UI change goes through `design-critic`** before commit. Rogue hex values are violations
  even when they match a brand colour — tokens exist for a reason.
- `public/google61dfa7e628fa15c6.html` is the Google Search Console verification file.
  **Deleting it breaks verification.**
- Motion honours `prefers-reduced-motion`, and `?snap` renders final states for static capture.
- Zero third-party requests is the current state and a GDPR asset. Adding one is a decision, not
  an implementation detail — log it.
