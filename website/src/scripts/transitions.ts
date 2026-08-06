/**
 * Route-transition choreography (D-039). Drives the TransitionVeil around
 * Astro's ClientRouter lifecycle:
 *
 *   astro:before-preparation — decide the treatment. Traversals (back/
 *   forward) swap bare: users expect instant history. Language twins get a
 *   250ms hairline scan with the scroll position carried over — same
 *   drawing, new annotation layer. Everything else fires the FlowField
 *   blast (a no-op off the homepages) and wraps the router's loader so the
 *   sheet is fully across the board before the swap may happen — the frame
 *   and title block finish drawing over the already-covered board and never
 *   delay the navigation.
 *
 *   astro:page-load — the new page is mounted (motion.ts runs first; module
 *   evaluation order guarantees it), so the sheet slides off to the right
 *   and the content is revealed in reading direction.
 *
 * A covered page MUST always be uncovered. The router can abort a covered
 * navigation without ever firing astro:page-load (a same-page hash
 * navigation, Back pressed from a hash URL mid-cover), so three rescue
 * paths exist: popstate and hashchange reveal a covering veil immediately,
 * and a watchdog reveals it if nothing has within 4s. Cover and reveal
 * kill each other's timelines, so rapid re-navigation cannot strand a
 * half-state.
 *
 * Registered once per site visit; the veil node persists inside
 * SiteOverlays, so references taken here stay valid across swaps. Under
 * motionOff only the twin scroll carry-over registers — that is a
 * courtesy, not motion — and swaps are instant with the veil display:none.
 */
import { gsap, motionOff } from './motion';

interface BeforePreparationEvent extends Event {
  from: URL;
  to: URL;
  navigationType: string;
  loader: () => Promise<void>;
}

const veil = document.getElementById('transition-veil');
const sheet = veil?.querySelector<HTMLElement>('[data-veil-sheet-layer]') ?? null;
const block = veil?.querySelector<HTMLElement>('[data-veil-block]') ?? null;
const pathEl = veil?.querySelector<HTMLElement>('[data-veil-path]') ?? null;
const sheetEl = veil?.querySelector<HTMLElement>('[data-veil-sheet]') ?? null;
const dateEl = veil?.querySelector<HTMLElement>('[data-veil-date]') ?? null;
const scan = veil?.querySelector<HTMLElement>('[data-veil-scan]') ?? null;
const lines = veil ? Array.from(veil.querySelectorAll<SVGLineElement>('.veil-line')) : [];

/** /en/impressum → /impressum, trailing slash dropped — one id per document. */
function norm(path: string): string {
  let p = path.replace(/^\/en(?=\/|$)/, '');
  if (p === '' || p === '/') return '/';
  if (p.endsWith('/')) p = p.slice(0, -1);
  return p;
}

/* The site's sheet register. Three documents exist; anything else is the
   404 and stamps 00. Grows when dedicated subpages do. */
const SHEET: Record<string, string> = { '/': '01', '/impressum': '02', '/datenschutz': '03' };
const sheetOf = (path: string) => `${SHEET[norm(path)] ?? '00'} / 03`;

const isTwin = (from: URL, to: URL) =>
  norm(from.pathname) === norm(to.pathname) && from.pathname !== to.pathname;

let covering = false;
let activeTl: gsap.core.Timeline | null = null;
let watchdog = 0;

function show() {
  if (!veil) return;
  veil.style.visibility = 'visible';
  veil.style.pointerEvents = 'auto';
}

function hide() {
  if (!veil) return;
  veil.style.visibility = 'hidden';
  veil.style.pointerEvents = 'none';
}

/** Sheet in from the left; resolves as soon as the board is covered. */
function veilCover(to: URL): Promise<void> {
  if (!sheet) return Promise.resolve();
  covering = true;
  activeTl?.kill();
  clearTimeout(watchdog);
  watchdog = window.setTimeout(() => veilReveal(), 4000);

  if (pathEl) pathEl.textContent = to.pathname;
  if (sheetEl) sheetEl.textContent = sheetOf(to.pathname);
  if (dateEl) dateEl.textContent = new Date().toISOString().slice(0, 10);

  show();
  lines.forEach((line) => {
    const len = line.getTotalLength();
    gsap.set(line, { strokeDasharray: len, strokeDashoffset: len, autoAlpha: 1 });
  });
  gsap.set(block, { autoAlpha: 0 });

  const tl = gsap.timeline();
  activeTl = tl;
  tl.fromTo(
    sheet,
    { clipPath: 'inset(0% 100% 0% 0%)' },
    { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.42, ease: 'power3.inOut' },
  )
    .to(lines, { strokeDashoffset: 0, duration: 0.3, ease: 'power2.out', stagger: 0.05 }, '-=0.12')
    .fromTo(
      block,
      { autoAlpha: 0, scale: 1.06 },
      { autoAlpha: 1, scale: 1, duration: 0.25, ease: 'expo.out' },
      '<0.05',
    );
  // The swap only needs the cover; frame and stamp finish over it.
  return new Promise((resolve) => tl.call(() => resolve(), [], 0.42));
}

/** Sheet off to the right — content appears in reading direction. */
function veilReveal(): void {
  if (!covering || !sheet) return;
  covering = false;
  clearTimeout(watchdog);
  activeTl?.kill();

  const tl = gsap.timeline({
    onComplete: () => {
      hide();
      gsap.set([sheet, block, ...lines], { clearProps: 'all' });
    },
  });
  activeTl = tl;
  tl.to([block, ...lines], { autoAlpha: 0, duration: 0.18, ease: 'power1.out' }, 0).to(
    sheet,
    { clipPath: 'inset(0% 0% 0% 100%)', duration: 0.5, ease: 'power3.inOut' },
    0.06,
  );
}

/* DE↔EN scroll carry-over. A courtesy, not motion — it runs for everyone,
   reduced motion included. The listener is named and cleared on the next
   navigation so an aborted twin swap cannot scroll a later page to a
   stale position. */
let pendingRestore: (() => void) | null = null;

function clearPendingRestore() {
  if (!pendingRestore) return;
  document.removeEventListener('astro:after-swap', pendingRestore);
  pendingRestore = null;
}

function carryScroll() {
  clearPendingRestore();
  const y = window.scrollY;
  pendingRestore = () => {
    pendingRestore = null;
    window.scrollTo({ top: y, behavior: 'instant' as ScrollBehavior });
  };
  document.addEventListener('astro:after-swap', pendingRestore, { once: true });
}

/** DE↔EN: no sheet — a hairline scans down while the annotation layer swaps. */
function scanSweep(): void {
  if (!scan) return;
  show();
  gsap.fromTo(
    scan,
    { y: 0, autoAlpha: 1 },
    {
      y: window.innerHeight,
      autoAlpha: 0,
      duration: 0.25,
      ease: 'power2.in',
      onComplete: () => {
        if (!covering) hide();
        gsap.set(scan, { clearProps: 'all' });
      },
    },
  );
}

if (veil) {
  document.addEventListener('astro:before-preparation', (e) => {
    const ev = e as BeforePreparationEvent;
    clearPendingRestore();
    if (ev.navigationType === 'traverse') return;
    if (isTwin(ev.from, ev.to)) {
      carryScroll();
      if (!motionOff) scanSweep();
      return;
    }
    if (motionOff) return;
    document.dispatchEvent(new CustomEvent('flowfield:blast'));
    const loader = ev.loader;
    ev.loader = async () => {
      await Promise.all([loader(), veilCover(ev.to)]);
    };
  });

  document.addEventListener('astro:page-load', () => veilReveal());

  /* Rescue paths: the router can abort a covered navigation via a hash-only
     move (no astro:page-load ever fires). Cheap, idempotent, no-ops while
     not covering. */
  window.addEventListener('popstate', () => veilReveal());
  window.addEventListener('hashchange', () => veilReveal());
}
