/**
 * Shared motion system. One import per component <script>; plugins are
 * registered once. Every effect gates on `motionOff` (prefers-reduced-motion
 * or the ?snap capture flag) and renders a sane final state instead.
 *
 * GSAP 3.15 ships every former Club plugin free — SplitText, DrawSVG,
 * ScrambleText, MorphSVG — so the premium layer needs no paid dependency.
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
/* Smooth scroll — the single biggest difference between a clean site and  */
/* one that feels engineered. Lenis drives ScrollTrigger off the same RAF. */
/* ---------------------------------------------------------------------- */
export function initSmoothScroll(): Lenis | null {
  if (motionOff) return null;

  const lenis = new Lenis({
    duration: 1.05,
    easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    smoothWheel: true,
    touchMultiplier: 1.6,
  });

  lenis.on('scroll', ScrollTrigger.update);
  gsap.ticker.add((time) => lenis.raf(time * 1000));
  gsap.ticker.lagSmoothing(0);

  // In-page anchors route through Lenis so the easing stays consistent.
  document.querySelectorAll<HTMLAnchorElement>('a[href*="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const url = new URL(a.href, location.href);
      if (url.pathname !== location.pathname || !url.hash) return;
      const target = document.querySelector(url.hash);
      if (!target) return;
      e.preventDefault();
      lenis.scrollTo(target as HTMLElement, { offset: -72 });
    });
  });

  return lenis;
}

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

/** Send a pulse traveling along an SVG path, repeating — the process running. */
export function pulseAlong(path: SVGGeometryElement, dot: SVGElement, delay = 2): void {
  if (motionOff) {
    gsap.set(dot, { opacity: 0 });
    return;
  }
  gsap.set(dot, { opacity: 0 });
  gsap.to(dot, {
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
