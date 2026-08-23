/**
 * Wordmark drop (D-047) — once per page-load the header wordmark's signal
 * period lifts off, indexes across the name like a measuring probe (constant
 * hop height, constant rhythm — the letters never move), then descends the
 * hero copy in a short staircase — one bounce per text line (H1 lines, the
 * subline; founder-directed) — and lands exactly where the signal line
 * begins. There it BECOMES the first pulse: the brand's own punctuation
 * enters the process and runs it — the hero's promise, enacted.
 *
 * Ownership: Hero.astro dispatches a cancelable `flowline:ready` when the
 * schematic finishes drawing. Claiming it (preventDefault) transfers the
 * first pulse to this module; every exit path — merge, scroll bail, page
 * unmount — leaves exactly one pulse loop running or hands ownership back.
 * Declining leaves Hero byte-identical to before this module existed.
 *
 * Ration note (for the next audit): the in-flight dot REPLACES the resting
 * period 1:1 — the original sits at opacity 0 while the clone lives — so the
 * signal element count never rises. The copy crossings stand on their own
 * accounting, NOT on D-044's debris (that debris is a logged second element,
 * gate-ordered off live copy — the inverse case): here it is the sanctioned
 * element in transit, ~5px of ink against display glyphs, contacts at
 * line-box tops, under half a second per crossing, single-shot. No new
 * loop: the pulse this hands off to remains the site's only one (D-043).
 */
import { gsap, motionOff, pulseAlong, onPage } from './motion';

interface FlowlineDetail {
  path: SVGPathElement;
  dot: SVGCircleElement;
}

/** Per-glyph rhythm. A metronome, not ball physics: no decay, no stretch.
 *  0.2s per glyph on founder direction ("too fast" at 0.12 — the motion
 *  must be watchable, not subliminal). */
const HOP_S = 0.2;

/* Once per browser page-load. Router remounts decline the claim, so DE↔EN
   twins and return navigations get Hero's normal 0.4s-delay pulse — 2.7s of
   theatre on every homepage return would read as a toy by the third time. */
let played = false;

onPage(() => {
  if (motionOff) return;
  const period = document.querySelector<HTMLElement>('[data-wordmark-dot]');
  if (!period) return;

  /* Everything below is born from the event callback, seconds after mount —
     the page gsap.context cannot see any of it (D-038), so it is tracked
     here and killed by the returned cleanup. */
  let tl: gsap.core.Timeline | null = null;
  let pulse: gsap.core.Tween | null = null;
  let clone: HTMLDivElement | null = null;
  let bailCleanup: (() => void) | null = null;
  let trailBox: HTMLDivElement | null = null;
  let trailTick: (() => void) | null = null;

  /* Graceful stop: live ghosts finish their fade, then the container goes. */
  const stopTrail = () => {
    if (trailTick) gsap.ticker.remove(trailTick);
    trailTick = null;
    if (trailBox) {
      const box = trailBox;
      trailBox = null;
      window.setTimeout(() => box.remove(), 450);
    }
  };

  const dispose = () => {
    bailCleanup?.();
    bailCleanup = null;
    if (trailTick) gsap.ticker.remove(trailTick);
    trailTick = null;
    if (trailBox) {
      gsap.killTweensOf(Array.from(trailBox.children));
      trailBox.remove();
      trailBox = null;
    }
    tl?.kill();
    tl = null;
    if (clone) gsap.killTweensOf(clone);
    gsap.killTweensOf(period);
    clone?.remove();
    clone = null;
    period.style.opacity = '';
  };

  const onReady = (e: Event) => {
    const detail = (e as CustomEvent<FlowlineDetail>).detail;
    if (played || !detail) return; // decline — Hero keeps the pulse
    if (window.scrollY > 8) return;

    const { path, dot } = detail;
    const svg = path.ownerSVGElement;
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return;

    // The merge point must be on stage. On a small phone the schematic sits
    // below the fold — decline honestly rather than drop the dot off-screen.
    const origin = path.getPointAtLength(0).matrixTransform(ctm);
    if (origin.y < 96 || origin.y > window.innerHeight - 24) return;

    // Per-glyph rects via a Range — zero DOM mutation in the sticky header,
    // no SplitText, no layout risk. The text node carries Astro's rendered
    // indentation, so whitespace positions are skipped.
    const link = period.closest('a');
    const textNode = link
      ? (Array.from(link.childNodes).find(
          (n): n is Text => n.nodeType === Node.TEXT_NODE && /\S/.test(n.textContent ?? ''),
        ) ?? null)
      : null;
    if (!textNode) return;
    const text = textNode.textContent ?? '';
    const range = document.createRange();
    const glyphs: Array<{ x: number; top: number }> = [];
    for (let i = 0; i < text.length; i++) {
      if (/\s/.test(text.charAt(i))) continue;
      range.setStart(textNode, i);
      range.setEnd(textNode, i + 1);
      const r = range.getBoundingClientRect();
      if (r.width > 0) glyphs.push({ x: r.left + r.width / 2, top: r.top });
    }
    const first = glyphs[0];
    const last = glyphs[glyphs.length - 1];
    if (glyphs.length < 2 || !first || !last) return;

    /* ---- claim: from here on this module owns the first pulse. ---- */
    e.preventDefault();
    played = true;

    const fs = parseFloat(getComputedStyle(period).fontSize) || 22;
    const pr = period.getBoundingClientRect();
    const r0 = Math.max(2, pr.width * 0.45); // the period's ink, not its line box
    const startX = pr.left + pr.width / 2;
    const startY = pr.bottom - fs * 0.2 - r0; // the ink sits on the baseline
    const endR = (parseFloat(dot.getAttribute('r') ?? '') || 4.5) * ctm.a;
    const endScale = endR / r0;
    const hop = fs * 0.55; // constant — a probe indexing, not a ball decaying
    const contactY = (g: { top: number }) => g.top - r0;

    clone = document.createElement('div');
    clone.setAttribute('data-wordmark-clone', '');
    clone.setAttribute('aria-hidden', 'true');
    clone.style.cssText =
      'position:fixed;left:0;top:0;z-index:45;pointer-events:none;' +
      `width:${r0 * 2}px;height:${r0 * 2}px;border-radius:50%;` +
      'background:var(--color-signal);will-change:transform;';
    document.body.append(clone);
    gsap.set(clone, { xPercent: -50, yPercent: -50, x: startX, y: startY });
    // opacity, not visibility: the link keeps its accessible name for
    // screen readers while its period is visibly elsewhere.
    period.style.opacity = '0';

    /* The trail (founder-directed): a fading afterimage under the dot —
       ghost elements spawned on the ONE frame clock (D-030), every other
       tick, each fading out and removing itself. Quiet by construction:
       alpha starts at 0.32 and only falls, so the trail is an afterimage
       of the sanctioned element, not a second signal object — the same
       argument that holds the Ribbons wash under the ration (D-037). */
    trailBox = document.createElement('div');
    trailBox.setAttribute('data-wordmark-trail', '');
    trailBox.setAttribute('aria-hidden', 'true');
    trailBox.style.cssText = 'position:fixed;left:0;top:0;z-index:44;pointer-events:none;';
    document.body.append(trailBox);
    let everyOther = false;
    const baseD = r0 * 2;
    trailTick = () => {
      everyOther = !everyOther;
      if (everyOther || !clone || !trailBox) return;
      // Tween state, not getBoundingClientRect: zero forced layout per
      // spawn (design-critic improvement — the 94 floor has no headroom).
      const cx = Number(gsap.getProperty(clone, 'x'));
      const cy = Number(gsap.getProperty(clone, 'y'));
      const sc = Number(gsap.getProperty(clone, 'scaleX')) || 1;
      const d0 = Math.max(3, baseD * sc * 0.8);
      const ghost = document.createElement('div');
      ghost.style.cssText = `position:absolute;left:0;top:0;width:${d0}px;height:${d0}px;border-radius:50%;background:var(--color-signal);will-change:transform,opacity;`;
      trailBox.append(ghost);
      gsap.fromTo(
        ghost,
        { x: cx - d0 / 2, y: cy - d0 / 2, opacity: 0.32, scale: 1 },
        { opacity: 0, scale: 0.35, duration: 0.38, ease: 'power1.out', onComplete: () => ghost.remove() },
      );
    };
    gsap.ticker.add(trailTick);

    const merge = () => {
      bailCleanup?.();
      bailCleanup = null;
      stopTrail(); // ghosts finish fading on their own
      pulse = pulseAlong(path, dot, 0); // the clone becomes the pulse
      if (clone) {
        const c = clone;
        gsap.to(c, { opacity: 0, duration: 0.12, onComplete: () => c.remove() });
        clone = null;
      }
      // The period returns while every eye follows the traveling pulse.
      gsap.fromTo(
        period,
        { opacity: 0 },
        { opacity: 1, duration: 0.3, delay: 0.15, onComplete: () => (period.style.opacity = '') },
      );
    };

    /* Stepping stones for the descent (founder direction): the dot does not
       fall straight to the line — it descends the hero copy in a short
       staircase, one contact per text line, moving rightward toward the
       merge point. Stones: the H1's two line tops, then the subline. Each
       is filtered to "actually between the wordmark and the merge point",
       so any layout where a stone is missing simply shortens the stair. */
    const stones: Array<{ x: number; top: number }> = [];
    const h1 = document.getElementById('hero-h1');
    if (h1) {
      const hr = h1.getBoundingClientRect();
      const lh = parseFloat(getComputedStyle(h1).lineHeight) || hr.height;
      const lines = Math.max(1, Math.min(2, Math.round(hr.height / lh)));
      for (let l = 0; l < lines; l++) stones.push({ x: 0, top: hr.top + l * lh });
    }
    const sub = document.querySelector<HTMLElement>('#hero-h1 + .hero-stage');
    if (sub) {
      const sr = sub.getBoundingClientRect();
      if (sr.width > 0) stones.push({ x: 0, top: sr.top });
    }
    const usable = stones
      .filter((s) => s.top > pr.bottom + 20 && s.top < origin.y - 40)
      .sort((a, b) => a.top - b.top);
    // x walks from the launch glyph toward the merge point, one even step
    // per stone, so the staircase reads as one path and never doubles back.
    usable.forEach((s, i) => {
      s.x = last.x + ((origin.x - last.x) * (i + 1)) / (usable.length + 1);
    });

    /* Choreography — one timeline, a running cursor for positions. */
    tl = gsap.timeline({ onComplete: merge });
    let t = 0;
    // lift off the baseline
    tl.to(clone, { y: startY - fs * 0.9, duration: 0.35, ease: 'power2.out' }, t);
    t += 0.35;
    // carry arc right→left to above the first glyph — the wind-up; the hops
    // then travel left→right, the reading and flow-line direction.
    tl.to(clone, { x: first.x, duration: 0.55, ease: 'power1.inOut' }, t);
    tl.to(clone, { y: first.top - hop * 1.5, duration: 0.28, ease: 'power2.out' }, t);
    tl.to(clone, { y: contactY(first), duration: 0.27, ease: 'power2.in' }, t + 0.28);
    t += 0.55;
    // the probe indexes the name — one contact per glyph, constant rhythm
    for (let i = 1; i < glyphs.length; i++) {
      const g = glyphs[i];
      const prev = glyphs[i - 1];
      if (!g || !prev) continue;
      tl.to(clone, { x: g.x, duration: HOP_S, ease: 'none' }, t);
      tl.to(clone, { y: Math.min(prev.top, g.top) - hop, duration: HOP_S / 2, ease: 'power2.out' }, t);
      tl.to(clone, { y: contactY(g), duration: HOP_S / 2, ease: 'power2.in' }, t + HOP_S / 2);
      t += HOP_S;
    }
    // the staircase: off the last glyph, one bounce per hero text line,
    // hop time scaled to the drop so long falls do not look snatched
    let prevContact = contactY(last);
    for (const s of usable) {
      const drop = Math.max(0, s.top - r0 - prevContact);
      const dur = gsap.utils.clamp(0.3, 0.5, 0.24 + drop * 0.0006);
      tl.to(clone, { x: s.x, duration: dur, ease: 'none' }, t);
      tl.to(clone, { y: prevContact - fs * 1.2, duration: dur * 0.45, ease: 'power2.out' }, t);
      tl.to(clone, { y: s.top - r0, duration: dur * 0.55, ease: 'power2.in' }, t + dur * 0.45);
      t += dur;
      prevContact = s.top - r0;
    }
    // final fall onto the signal line's origin, growing to the pulse's size
    tl.to(clone, { x: origin.x, duration: 0.45, ease: 'none' }, t);
    tl.to(clone, { y: prevContact - fs * 1.2, duration: 0.18, ease: 'power2.out' }, t);
    tl.to(clone, { y: origin.y, duration: 0.27, ease: 'power2.in' }, t + 0.18);
    tl.to(clone, { scale: endScale, duration: 0.45, ease: 'power1.in' }, t);
    t += 0.45;
    // one restrained contact tick — a probe touch, not a cartoon squash
    tl.to(clone, { scaleY: endScale * 0.8, duration: 0.05, ease: 'power1.in' }, t);
    tl.to(clone, { scaleY: endScale, duration: 0.07 }, t + 0.05);

    /* Bail: any event that invalidates the captured geometry or covers the
       stage — real scroll, a resize/rotation (all coordinates were measured
       once at claim), or the mobile menu opening (fixed inset-0 at z-40
       with scroll locked, so the scroll bail alone can never fire there —
       design-critic finding). The moment has passed: restore the period at
       once and hand the line its pulse, so the loop always exists. */
    const bail = () => {
      dispose();
      pulse = pulseAlong(path, dot, 0.2);
    };
    const y0 = window.scrollY;
    const onScrollE = () => {
      if (Math.abs(window.scrollY - y0) > 6) bail();
    };
    const onResizeE = () => bail();
    const menuBtn = document.getElementById('menu-toggle');
    const onMenuE = () => bail();
    window.addEventListener('scroll', onScrollE, { passive: true });
    window.addEventListener('resize', onResizeE);
    window.addEventListener('orientationchange', onResizeE);
    menuBtn?.addEventListener('click', onMenuE);
    bailCleanup = () => {
      window.removeEventListener('scroll', onScrollE);
      window.removeEventListener('resize', onResizeE);
      window.removeEventListener('orientationchange', onResizeE);
      menuBtn?.removeEventListener('click', onMenuE);
    };
  };

  document.addEventListener('flowline:ready', onReady);

  return () => {
    document.removeEventListener('flowline:ready', onReady);
    dispose();
    pulse?.kill();
    pulse = null;
  };
});
