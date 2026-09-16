/**
 * Stats beacon (D-063).
 *
 * Self-hosted and cookieless: every page view and a handful of named clicks
 * go to our own Worker at /api/hit on this origin. What travels is the path,
 * the referrer, the document language and the viewport width — no agent
 * string, no screen fingerprint, no id of any kind. Two hits from the same
 * visitor cannot be joined, which is the point, and nothing is ever written
 * to the visitor's browser: no cookie, no storage.
 *
 * Inert unless Analytics.astro rendered its meta tag (the site.ts flag), and
 * inert for anyone who has said no in a way a browser can carry — Global
 * Privacy Control, Do Not Track — for automation (Lighthouse and headless
 * runs would otherwise be our most loyal visitors) and for a founder who has
 * opted their own browser out. Inert means nothing is registered at all and
 * `track` is a no-op, so callers never check the flag themselves.
 *
 * Hoisted module: evaluates once per site visit. The ClientRouter (D-039)
 * swaps the document underneath it without re-running it, so the page view
 * rides astro:page-load — fired on the initial load and after every swap —
 * and the click listener is delegated to the document, never to elements.
 *
 * Nobody imports this file. Beacon.astro is its only entry, and it is not
 * rendered while the flag is off — so an `import { track }` from a component
 * that ships on every page would drag the chunk back in for every visitor.
 * Scripts report through a `nb:track` CustomEvent on the document instead
 * (`detail: { e, v }`), which costs nothing when there is nobody listening.
 */

/* GPC is not in lib.dom yet; this widening is the file's only cast. */
const nav = navigator as Navigator & { globalPrivacyControl?: boolean };

const on =
  !!document.querySelector('meta[name="nb:stats"]') &&
  !nav.globalPrivacyControl &&
  nav.doNotTrack !== '1' &&
  !nav.webdriver;

/* The founders' own browsers — checked per event, not once, so the tick on
   the dashboard takes effect on the very next click rather than after a
   reload. Storage throws outright in some privacy modes; a throw reads as
   "not opted out", never as an error. Read only — this module writes
   nothing, anywhere. */
function optedOut(): boolean {
  try {
    return localStorage.getItem('nb.stats.off') === '1';
  } catch {
    return false;
  }
}

/* The path of the last reported view. The browser's referrer is right for
   the first view only — after a client-side swap it still names whoever sent
   the visitor here, not the page they just left. The Worker reduces either
   form to a host and drops our own. */
let prev = '';

/** Report a named event with an optional value (cut to 80 characters). */
export function track(e: string, v?: string): void {
  // The dashboard does not count itself — not its views, not its clicks:
  // its only readers are the two people reading the numbers.
  if (!on || optedOut() || document.querySelector('[data-stats-scope]')) return;
  const body = JSON.stringify({
    e,
    v: v?.slice(0, 80), // JSON.stringify drops an undefined value
    p: location.pathname,
    r: prev ? location.origin + prev : document.referrer,
    l: document.documentElement.lang,
    // A document loaded into a not-yet-sized pane reports 0; the screen is
    // the honest fallback for the device class and nothing finer.
    w: innerWidth || screen.width,
  });
  // sendBeacon outlives the unload a click usually causes; keepalive fetch is
  // the same promise where it is missing or its queue is full. Neither is
  // awaited and neither may throw — stats never cost the visitor anything.
  try {
    if (navigator.sendBeacon('/api/hit', new Blob([body], { type: 'application/json' }))) return;
  } catch { /* no sendBeacon here */ }
  fetch('/api/hit', {
    method: 'POST', body, keepalive: true, headers: { 'Content-Type': 'application/json' },
  }).catch(() => {});
}

if (on) {
  /* Without the router there is exactly one view: this document. A module
     script runs before DOMContentLoaded by definition, so listening for it is
     enough — there is no "already complete" case to cover here. */
  const router = document.querySelector('meta[name="astro-view-transitions-enabled"]');
  document.addEventListener(router ? 'astro:page-load' : 'DOMContentLoaded', () => {
    track('pageview');
    prev = location.pathname;
  });

  /* The import-free entry for Contact.astro and scripts/teaser.ts. */
  document.addEventListener('nb:track', (ev) => {
    const d = (ev as CustomEvent<{ e?: unknown; v?: unknown }>).detail;
    if (typeof d?.e === 'string') track(d.e, typeof d.v === 'string' ? d.v : undefined);
  });

  /* Bubble phase on purpose. Lenis claims same-page anchors in capture and
     prevents their default (motion.ts), and the router prevents the default
     of every internal link — both still bubble, and both must still count:
     the hero CTA is a #kontakt anchor. Only the main button counts; modifier
     keys open a new tab, which is still the click the visitor meant. */
  document.addEventListener('click', (ev) => {
    if (ev.button || !(ev.target instanceof Element)) return;
    const tag = ev.target.closest('[data-track]')?.getAttribute('data-track');
    if (tag) {
      // "event" or "event:value" — split at the first colon only; a value may
      // carry more. The capture group keeps the remainder in one piece.
      const [e, v] = tag.split(/:(.*)/);
      track(e, v);
      return;
    }
    // Outbound: a link that resolves to another host. mailto: and tel: have
    // no host at all, so they fall through here by themselves.
    const host = ev.target.closest<HTMLAnchorElement>('a')?.host;
    if (host && host !== location.host) track('outbound', host);
  });
}
