/**
 * Section seam system (D-041) — the homepage's eight section boundaries
 * treated as drafting operations. Three motifs plus two accents, zero
 * pinning, everything scrubbed and reversible:
 *
 *   B1 Hero→Problems      seam rule draws left→right, numeral tick riding
 *                         its tip (the FlowField dispersion above it is the
 *                         real transition — D-040)
 *   B2 Problems→Services  seam rule (left→right) + differential parallax
 *                         between the two reading blocks
 *   B3 Services→Marquee   the conveyor engages: band borders draw, track
 *                         speed couples to scroll velocity
 *   B4 Marquee→Process    deliberately quiet — the scrubbed process line
 *                         is this zone's star, variety includes rest
 *   B5 Process→Story      ground-wipe: the graphite recedes left→right
 *                         behind a leading hairline in the seam band
 *   B6 Story→Demo         the demo sheet's border draws itself as the
 *                         document is laid on the desk
 *   B7 Demo→Founders      seam rule, right→left (the B2 motif mirrored)
 *   B8 Founders→Contact   ground-wipe mirrored (paper recedes right→left)
 *                         + a teleprinter scramble on the origin annotation
 *
 * All furniture is built HERE, in JS: it cannot exist without a script, so
 * the no-JS page is byte-identical to today's and `?snap` renders the
 * static state. Every element is aria-hidden and pointer-events:none.
 * Colors come from the @theme tokens only. Where a seam rule replaces an
 * existing CSS border, the border goes transparent in the same tick the
 * overlay starts animating — a failed script leaves the original border.
 * Signal ration: every seam element is steel/line/graphite; no signal.
 */
import { gsap, ScrollTrigger, motionOff, onPage, parallax } from './motion';

const MONO =
  'font-family:var(--font-mono);font-size:0.6875rem;letter-spacing:0.08em;text-transform:uppercase;';

function el(tag: string, css: string, text = ''): HTMLElement {
  const node = document.createElement(tag);
  node.setAttribute('aria-hidden', 'true');
  node.style.cssText = `pointer-events:none;${css}`;
  if (text) node.textContent = text;
  return node;
}

/** A 1px rule drawn along a section's edge, replacing a CSS border. */
function seamRule(
  section: HTMLElement,
  opts: { origin: 'left' | 'right'; color: string; replace?: HTMLElement; edge?: 'top' | 'bottom'; tick?: string },
): void {
  const line = el(
    'span',
    `position:absolute;left:0;${opts.edge === 'bottom' ? 'bottom' : 'top'}:-1px;width:100%;height:1px;` +
      `background:${opts.color};transform:scaleX(0);transform-origin:${opts.origin};`,
  );
  section.style.position = 'relative';
  section.append(line);

  let tick: HTMLElement | null = null;
  if (opts.tick) {
    tick = el(
      'span',
      // -1.25rem: clear of the hero DIN frame's bottom coordinate label.
      `position:absolute;top:-1.25rem;left:0;${MONO}color:var(--color-steel);opacity:0;white-space:nowrap;`,
      opts.tick,
    );
    section.append(tick);
  }

  (opts.replace ?? section).style.borderColor = 'transparent';

  let w = section.clientWidth;
  ScrollTrigger.create({
    trigger: section,
    start: 'top 88%',
    end: 'top 55%',
    scrub: 0.6,
    onRefresh: () => (w = section.clientWidth),
    onUpdate: (self) => {
      const p = self.progress;
      gsap.set(line, { scaleX: p });
      if (tick) {
        const travel = Math.max(0, w - 72);
        gsap.set(tick, {
          x: opts.origin === 'left' ? p * travel : (1 - p) * travel,
          opacity: p <= 0 ? 0 : 1 - Math.max(0, (p - 0.85) / 0.15),
        });
      }
    },
  });
}

/** The previous ground receding across the entering section's seam band.
    The boundary's CSS border (the section's own or the neighbour's) hands
    over to a drawn rule that grows with the wipe — mid-wipe there is no
    static line contradicting the illusion, at rest the line is back. */
function groundWipe(
  section: HTMLElement,
  opts: { ground: 'graphite' | 'paper'; dir: 'ltr' | 'rtl'; tick: string; replace: HTMLElement },
): void {
  section.style.position = 'relative';
  const graphite = opts.ground === 'graphite';
  const strip = el(
    'div',
    `position:absolute;top:0;left:0;right:0;height:4.5rem;` +
      `background:${graphite ? 'var(--color-graphite)' : 'var(--color-paper)'};`,
  );

  // Edge + tick live OUTSIDE the strip so the clip never eats them.
  const edge = el(
    'span',
    'position:absolute;top:0;height:4.5rem;width:1px;left:0;background:var(--color-steel-deep);opacity:0;',
  );
  const tick = el(
    'span',
    `position:absolute;top:1rem;left:0;${MONO}` +
      // The tick trails on the revealed ground; pick the color legible there.
      `color:${graphite ? 'var(--color-steel-deep)' : 'var(--color-steel)'};opacity:0;`,
    opts.tick,
  );
  const rule = el(
    'span',
    `position:absolute;left:0;top:-1px;width:100%;height:1px;background:var(--color-steel-soft);` +
      `transform:scaleX(0);transform-origin:${opts.dir === 'ltr' ? 'left' : 'right'};`,
  );
  section.prepend(strip);
  section.append(edge, tick, rule);
  opts.replace.style.borderColor = 'transparent';

  let w = section.clientWidth;
  ScrollTrigger.create({
    trigger: section,
    start: 'top 92%',
    end: 'top 45%',
    scrub: 0.6,
    onRefresh: () => (w = section.clientWidth),
    onUpdate: (self) => {
      const p = self.progress;
      const fade = p <= 0 ? 0 : 1 - Math.max(0, (p - 0.88) / 0.12);
      gsap.set(rule, { scaleX: p });
      if (opts.dir === 'ltr') {
        strip.style.clipPath = `inset(0% 0% 0% ${p * 100}%)`;
        gsap.set(edge, { x: p * w, opacity: fade });
        gsap.set(tick, { x: Math.max(0, p * w - 56), opacity: fade });
      } else {
        strip.style.clipPath = `inset(0% ${p * 100}% 0% 0%)`;
        gsap.set(edge, { x: (1 - p) * w, opacity: fade });
        gsap.set(tick, { x: Math.min(w - 8, (1 - p) * w + 12), opacity: fade });
      }
    },
  });
}

onPage(({ main, lenis }) => {
  if (motionOff) return;

  // Scripts filtered out: a stray is:inline child of <main> made the
  // original index guard bail sitewide (D-041 gate finding).
  const kids = (Array.from(main.children) as HTMLElement[]).filter((n) => n.tagName !== 'SCRIPT');
  const [hero, problems, services, marquee, process, story, demo, founders, contact] = kids;
  // Homepage only: nine sections ending in #kontakt. Legal pages and the
  // 404 walk away here.
  if (kids.length < 9 || !contact || contact.id !== 'kontakt') return;

  /* B1 — the hero's steel-soft border hands over to a drawn rule. */
  seamRule(problems, {
    origin: 'left',
    color: 'var(--color-steel-soft)',
    replace: hero,
    tick: '01 → 02',
  });

  /* B2 — seam rule + differential parallax: the two reading blocks drift
     at different rates, so the boundary reads as depth, not a wall.
     Scopes, not reveal targets — revealGroup owns those y-tweens. */
  seamRule(services, { origin: 'left', color: 'var(--color-line)' });
  const problemsScope = problems.querySelector('[data-reveal-scope]');
  const servicesScope = services.querySelector('[data-reveal-scope]');
  if (problemsScope) parallax(problemsScope, -20);
  if (servicesScope) parallax(servicesScope, -40);

  /* B3 — the conveyor engages. Band borders draw (top from the left, bottom
     from the right); the track's CSS animation couples to Lenis velocity,
     clamped so it never stalls and never blurs. Reduced motion has no
     animation to couple to. */
  let cleanup: (() => void) | undefined;
  seamRule(marquee, { origin: 'left', color: 'var(--color-steel-soft)' });
  // Process's own border-t occupies the marquee's bottom pixel row — it must
  // hand over too, or the "undrawn" state never exists (gate finding).
  seamRule(marquee, { origin: 'right', color: 'var(--color-steel-soft)', edge: 'bottom', replace: process });
  const track = marquee.querySelector<HTMLElement>('.marquee-track');
  const anim = track?.getAnimations()[0];
  if (anim && lenis) {
    let target = 1;
    lenis.on('scroll', (e: { velocity: number }) => {
      target = Math.min(2.5, Math.max(0.6, 1 + Math.abs(e.velocity) * 0.03));
    });
    const ease = () => {
      target += (1 - target) * 0.02;
      anim.playbackRate += (target - anim.playbackRate) * 0.08;
    };
    gsap.ticker.add(ease);
    cleanup = () => gsap.ticker.remove(ease);
  }

  /* B4 — quiet on purpose. */

  /* B5 — fresh sheet pulled across the board: graphite recedes. Process's
     bottom border (already transparent via the B3 handover) is replaced by
     the wipe's own growing rule. */
  groundWipe(story, { ground: 'graphite', dir: 'ltr', tick: '06', replace: process });

  /* B6 — the demo document is laid on the desk: its border draws itself. */
  const sheet = demo.querySelector<HTMLElement>('#demo-sheet');
  if (sheet) {
    sheet.style.position = 'relative';
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'none');
    svg.setAttribute('aria-hidden', 'true');
    svg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;overflow:visible;pointer-events:none;';
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
    rect.setAttribute('x', '0');
    rect.setAttribute('y', '0');
    rect.setAttribute('width', '100');
    rect.setAttribute('height', '100');
    rect.setAttribute('fill', 'none');
    rect.setAttribute('stroke', 'var(--color-line)');
    rect.setAttribute('stroke-width', '1');
    rect.setAttribute('vector-effect', 'non-scaling-stroke');
    svg.append(rect);
    sheet.append(svg);
    sheet.style.borderColor = 'transparent';
    const len = rect.getTotalLength();
    gsap.set(rect, { strokeDasharray: len, strokeDashoffset: len });
    gsap.to(rect, {
      strokeDashoffset: 0,
      duration: 1.2,
      ease: 'expo.out',
      // After the sheet's own reveal has mostly landed — the border draws
      // onto a document already on the desk.
      scrollTrigger: { trigger: sheet, start: 'top 72%' },
    });
  }

  /* B7 — the B2 motif mirrored: rule draws right→left. */
  seamRule(founders, { origin: 'right', color: 'var(--color-line)' });

  /* B8 — paper recedes into the graphite ask… */
  groundWipe(contact, { ground: 'paper', dir: 'rtl', tick: '09', replace: contact });

  /* …and the origin annotation types itself in on the way — the one
     ScrambleText moment on the site, teleprinter in mono. Fires once,
     early enough (88%) not to pile onto the B8 wipe at the ask. */
  const origin = founders.querySelector<HTMLElement>('[data-seam-scramble]');
  let scramble: gsap.core.Tween | null = null;
  if (origin && origin.textContent) {
    const text = origin.textContent;
    ScrollTrigger.create({
      trigger: origin,
      start: 'top 88%',
      once: true,
      onEnter: () => {
        scramble = gsap.to(origin, {
          duration: 0.9,
          scrambleText: { text, chars: '0123456789/·—×', speed: 0.4 },
        });
      },
    });
  }

  return () => {
    cleanup?.();
    // Born in an onEnter callback the page context never saw.
    scramble?.kill();
  };
});
