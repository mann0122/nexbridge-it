/**
 * Shared motion system. One import per component <script>; GSAP plugins are
 * registered once. Every effect honors prefers-reduced-motion and the ?snap
 * query (static captures) by rendering final states with no animation.
 */
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);

export const motionOff =
  window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
  new URLSearchParams(window.location.search).has('snap');

export { gsap, ScrollTrigger };

/** Prepare an SVG stroke for a draw animation; returns its length. */
export function primeDraw(el: SVGGeometryElement): number {
  const len = el.getTotalLength();
  gsap.set(el, { strokeDasharray: len, strokeDashoffset: len });
  return len;
}

/**
 * Reveal a group of elements when `trigger` scrolls into view.
 * Elements stay visible without JS; we hide them here first (.will-reveal
 * pattern) so a broken script never blanks content.
 */
export function revealGroup(
  trigger: Element,
  els: Element[],
  vars: gsap.TweenVars = {},
): void {
  if (motionOff || els.length === 0) return;
  gsap.set(els, { opacity: 0, y: 28 });
  gsap.to(els, {
    opacity: 1,
    y: 0,
    duration: 0.9,
    ease: 'expo.out',
    stagger: 0.09,
    scrollTrigger: { trigger, start: 'top 78%' },
    ...vars,
  });
}

/** Draw SVG strokes when scrolled into view (optionally scrubbed). */
export function drawOnScroll(
  trigger: Element,
  paths: SVGGeometryElement[],
  opts: { scrub?: boolean; stagger?: number } = {},
): void {
  if (paths.length === 0) return;
  if (motionOff) return;
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

/** Count a number up from 0 when it scrolls into view (de/en formatting). */
export function countUp(el: HTMLElement, target: number, locale: string): void {
  const fmt = new Intl.NumberFormat(locale === 'de' ? 'de-DE' : 'en-GB');
  if (motionOff) {
    el.textContent = fmt.format(target);
    return;
  }
  const state = { v: 0 };
  gsap.to(state, {
    v: target,
    duration: 1.6,
    ease: 'expo.out',
    scrollTrigger: { trigger: el, start: 'top 85%' },
    onUpdate: () => {
      el.textContent = fmt.format(Math.round(state.v));
    },
  });
}

/**
 * Send a small pulse traveling along an SVG path repeatedly — the process
 * running by itself. Call after the line has drawn.
 */
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
    onRepeat: () => gsap.set(dot, { opacity: 1 }),
    onStart: () => gsap.set(dot, { opacity: 1 }),
  });
}
