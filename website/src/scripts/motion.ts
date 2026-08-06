/**
 * Shared motion system. One import per component <script>; plugins are
 * registered once. Every effect gates on `motionOff` (prefers-reduced-motion
 * or the ?snap capture flag) and renders a sane final state instead.
 *
 * GSAP 3.15 ships every former Club plugin free — SplitText, DrawSVG,
 * ScrambleText, MorphSVG — so the premium layer needs no paid dependency.
 *
 * Lifecycle: Astro hoisted module scripts execute once per site visit, so
 * module level is for registration only. Per-page work goes through
 * `onPage(init)`: every init re-runs on each page mount inside one shared
 * gsap.context, and the context is reverted before the document is swapped.
 * Without the ClientRouter a "mount" is simply the initial load; with it
 * (D-038) mounts follow astro:page-load / astro:before-swap. DOM queries
 * belong inside inits — an element reference held across pages is a leak.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { SplitText } from 'gsap/SplitText';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import Lenis from 'lenis';

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin, DrawSVGPlugin, SplitText, ScrambleTextPlugin);

export const motionOff =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
  new URLSearchParams(window.location.search).has('snap');

export const fine = window.matchMedia('(pointer: fine)').matches;

export { gsap, ScrollTrigger, SplitText };

/* ---------------------------------------------------------------------- */
/* Page lifecycle                                                          */
/* ---------------------------------------------------------------------- */

export interface PageContext {
  main: HTMLElement;
  lenis: Lenis | null;
}

type PageInit = (ctx: PageContext) => void | (() => void);

const inits: PageInit[] = [];

/**
 * Register per-page setup. Inits run on every page mount; each must bail
 * cheaply when its DOM is absent (legal pages run the homepage inits too).
 * GSAP work created synchronously inside is captured by the page context
 * and reverted on unmount. Return a cleanup for anything the context cannot
 * see: intervals, document/window listeners, observers, tweens created
 * later from timeline callbacks.
 */
export function onPage(init: PageInit): void {
  inits.push(init);
}

let lenis: Lenis | null = null;
let lenisTick: ((time: number) => void) | null = null;
let pageCtx: gsap.Context | null = null;
let cleanups: Array<() => void> = [];

/* Lenis drives ScrollTrigger off the GSAP ticker — the one frame clock
   (D-030). Destroyed before every swap and recreated after: Astro's router
   restores scroll synchronously during the swap, and a surviving instance
   would ease back toward the previous page's position (withastro #12725).
   The constructor reads the live scroll position, so a fresh instance is
   born already in sync. */
function createSmoothScroll(): void {
  if (motionOff) return;

  lenis = new Lenis({
    duration: 1.05,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.6,
  });

  lenis.on('scroll', ScrollTrigger.update);
  lenisTick = (time) => lenis?.raf(time * 1000);
  gsap.ticker.add(lenisTick);
  gsap.ticker.lagSmoothing(0);
}

function destroySmoothScroll(): void {
  if (lenisTick) gsap.ticker.remove(lenisTick);
  lenisTick = null;
  lenis?.destroy();
  lenis = null;
}

function mountPage(): void {
  createSmoothScroll();
  const main = document.getElementById('main') ?? document.body;
  pageCtx = gsap.context(() => {
    for (const init of inits) {
      const cleanup = init({ main, lenis });
      if (typeof cleanup === 'function') cleanups.push(cleanup);
    }
    // The global reveal pass. Lives here, not in page scripts: the DE and EN
    // pages would otherwise each register their own copy, and after one
    // language switch both would run against the same nodes.
    document.querySelectorAll('[data-reveal-scope]').forEach((scope) => {
      revealGroup(scope, Array.from(scope.querySelectorAll('[data-reveal]')));
    });
  });
  // Webfonts change layout heights; re-measure every trigger once settled.
  document.fonts?.ready.then(() => ScrollTrigger.refresh());
}

function unmountPage(): void {
  for (const cleanup of cleanups) cleanup();
  cleanups = [];
  pageCtx?.revert();
  pageCtx = null;
  destroySmoothScroll();
}

/* In-page anchors route through Lenis so the easing stays consistent.
   One delegated listener, registered once — per-element listeners would
   have to be rebound after every swap. Bails to native behavior when Lenis
   is off (reduced motion) or the link leaves the page. */
document.addEventListener('click', (e) => {
  if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
  if (!(e.target instanceof Element)) return;
  const a = e.target.closest<HTMLAnchorElement>('a[href*="#"]');
  if (!a || !lenis) return;
  const url = new URL(a.href, location.href);
  if (url.pathname !== location.pathname || !url.hash) return;
  const target = document.querySelector<HTMLElement>(url.hash);
  if (!target) return;
  e.preventDefault();
  // Keep the hash in the URL — native anchor clicks do, and deep links to
  // sections should survive a copy-paste of the address bar.
  if (location.hash !== url.hash) history.pushState(null, '', url.hash);
  // Native fragment navigation also moves the sequential-focus starting
  // point; without this the skip link scrolls but Tab resumes in the nav,
  // which defeats it (WCAG 2.4.1).
  if (target.tabIndex < 0 && !target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
  target.focus({ preventScroll: true });
  // -80 matches scroll-margin-top: 5rem, so smooth-scroll and reduced-motion
  // visitors land on the same pixel.
  lenis.scrollTo(target, { offset: -80 });
});

/* Mount wiring. With the ClientRouter present (its meta tag is in <head>),
   astro:page-load fires on the initial load too, so it is the only mount
   path needed. Without it, DOMContentLoaded fires after all module scripts
   have executed — every onPage registration is in by then. */
if (document.querySelector('meta[name="astro-view-transitions-enabled"]')) {
  document.addEventListener('astro:page-load', mountPage);
  document.addEventListener('astro:before-swap', unmountPage);
} else if (document.readyState === 'complete') {
  mountPage();
} else {
  document.addEventListener('DOMContentLoaded', mountPage, { once: true });
}

/* ---------------------------------------------------------------------- */
/* Helpers                                                                 */
/* ---------------------------------------------------------------------- */

/** Prepare an SVG stroke for a draw animation; returns its length. */
export function primeDraw(el: SVGGeometryElement): number {
  const len = el.getTotalLength();
  gsap.set(el, { strokeDasharray: len, strokeDashoffset: len });
  return len;
}

/**
 * Reveal a group when `trigger` scrolls in. Markup ships visible; we hide
 * here so a failed script leaves the page readable rather than blank.
 */
export function revealGroup(trigger: Element, els: Element[], vars: gsap.TweenVars = {}): void {
  if (motionOff || els.length === 0) return;
  gsap.set(els, { opacity: 0, y: 34, filter: 'blur(6px)' });
  gsap.to(els, {
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    duration: 1,
    ease: 'expo.out',
    stagger: 0.085,
    scrollTrigger: { trigger, start: 'top 80%' },
    ...vars,
  });
}

/** Draw SVG strokes when scrolled into view (optionally scrubbed). */
export function drawOnScroll(
  trigger: Element,
  paths: SVGGeometryElement[],
  opts: { scrub?: boolean; stagger?: number } = {},
): void {
  if (paths.length === 0 || motionOff) return;
  paths.forEach(primeDraw);
  gsap.to(paths, {
    strokeDashoffset: 0,
    duration: opts.scrub ? undefined : 1.2,
    ease: opts.scrub ? 'none' : 'expo.out',
    stagger: opts.stagger ?? 0.15,
    scrollTrigger: {
      trigger,
      start: 'top 72%',
      ...(opts.scrub ? { end: 'bottom 55%', scrub: 0.6 } : {}),
    },
  });
}

/** Count a number up from 0 when it scrolls into view. */
export function countUp(el: HTMLElement, target: number, locale: string): void {
  const fmt = new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-GB');
  if (motionOff) {
    el.textContent = fmt.format(target);
    return;
  }
  const state = { v: 0 };
  gsap.to(state, {
    v: target,
    duration: 1.8,
    ease: 'expo.out',
    scrollTrigger: { trigger: el, start: 'top 85%' },
    onUpdate: () => {
      el.textContent = fmt.format(Math.round(state.v));
    },
  });
}

/**
 * Send a pulse traveling along an SVG path, repeating — the process running.
 * Returns the tween: it is usually created from a timeline callback, which
 * the page context cannot see, so the caller must kill it in its cleanup.
 */
export function pulseAlong(path: SVGGeometryElement, dot: SVGElement, delay = 2): gsap.core.Tween | null {
  if (motionOff) {
    gsap.set(dot, { opacity: 0 });
    return null;
  }
  gsap.set(dot, { opacity: 0 });
  return gsap.to(dot, {
    motionPath: { path: path as SVGPathElement, align: path as SVGPathElement, alignOrigin: [0.5, 0.5] },
    duration: 2.2,
    ease: 'power1.inOut',
    repeat: -1,
    repeatDelay: 3.2,
    delay,
    onStart: () => gsap.set(dot, { opacity: 1 }),
    onRepeat: () => gsap.set(dot, { opacity: 1 }),
  });
}

/** Parallax: move an element against the scroll for depth. */
export function parallax(el: Element, distance = 60): void {
  if (motionOff) return;
  gsap.fromTo(
    el,
    { y: -distance / 2 },
    {
      y: distance / 2,
      ease: 'none',
      scrollTrigger: { trigger: el, start: 'top bottom', end: 'bottom top', scrub: 0.8 },
    },
  );
}
