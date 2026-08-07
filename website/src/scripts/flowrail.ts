/**
 * Flowrail (D-044) — the hero schematic's exit arrow detaches and travels
 * the whole document. One signal line, stroke 2.5 (the action-line weight,
 * D-043), runs from the measured tip of the visible `.flow-arrow` into the
 * right-hand gutter, then down the page with small inward circuit-trace
 * jogs at each section seam, and plugs into the footer's title block. The
 * arrowhead rides the drawn tip, fully scrubbed — scroll back up and the
 * signal returns to the schematic.
 *
 * On route exit (the existing `flowfield:blast` event — no new dispatches)
 * the rail retracts and the arrowhead bursts into a shower of small
 * arrowheads that fly up and out, fall under Physics2D gravity OVER the
 * transition veil (the #arrow-burst container in SiteOverlays persists
 * through the swap), and vanish.
 *
 * Contracts: JS-built only — no-JS and `?snap` pages are byte-identical;
 * everything honors motionOff; token colors only; the rail never leaves
 * the 24px px-6 gutter, so it cannot underlie text at any width ≥ 360.
 * Signal ration: the rail IS the flow-line extended — where a section
 * brings its own signal vertical (Process, D-041's star), the rail yields
 * and dims. Homepage-only via the seams guard.
 */
import { gsap, ScrollTrigger, motionOff, onPage } from './motion';

const SVG_NS = 'http://www.w3.org/2000/svg';
const EPS = 0.0015; // detach threshold (~a dozen scrolled pixels)

/* ------------------------------------------------------------------ */
/* Burst — module-level and page-independent by design: the pieces     */
/* must animate across the DOM swap, so nothing here may touch         */
/* per-page state or appear in any page cleanup.                       */
/* ------------------------------------------------------------------ */
function spawnBurst(x: number, y: number, size: number): void {
  const host = document.getElementById('arrow-burst');
  // Spam cap: a second wave (rapid double-nav) may overlap; a third never
  // spawns. Everything self-removes via onComplete + the sweep below.
  if (!host || host.childElementCount > 32) return;

  const n = window.innerWidth < 768 ? 18 : 28;
  const wave: Element[] = [];
  for (let i = 0; i < n; i++) {
    const s = Math.round(size * gsap.utils.random(0.55, 1.1));
    const piece = document.createElementNS(SVG_NS, 'svg');
    piece.setAttribute('viewBox', '0 0 16 18');
    piece.setAttribute('width', String(s));
    piece.setAttribute('height', String(Math.round((s * 18) / 16)));
    piece.setAttribute('aria-hidden', 'true');
    piece.style.cssText = 'position:absolute;left:0;top:0;pointer-events:none;';
    const tri = document.createElementNS(SVG_NS, 'path');
    // The hero arrowhead's own proportions — debris of the same species.
    tri.setAttribute('d', 'M16 9 L0 0 L0 18 Z');
    tri.setAttribute('fill', 'var(--color-signal)');
    piece.append(tri);
    gsap.set(piece, { x, y, xPercent: -50, yPercent: -50, rotation: gsap.utils.random(0, 360) });
    host.append(piece);
    wave.push(piece);

    gsap.to(piece, {
      physics2D: {
        velocity: gsap.utils.random(300, 700),
        angle: gsap.utils.random(-150, -30), // y-down coords: up-and-outward fan
        gravity: 1500,
      },
      rotation: `+=${gsap.utils.random(-260, 260)}`,
      duration: 1.25,
      onComplete: () => piece.remove(),
    });
    // The vanish: most pieces have already fallen past the bottom edge.
    gsap.to(piece, { opacity: 0, duration: 0.45, delay: 0.75, ease: 'power1.in' });
  }
  // Belt and braces — a hidden tab or killed tween may never complete.
  window.setTimeout(() => wave.forEach((el) => el.isConnected && el.remove()), 2600);
}

/* ------------------------------------------------------------------ */
/* Rail                                                                */
/* ------------------------------------------------------------------ */
onPage(({ main }) => {
  if (motionOff) return;

  const kids = (Array.from(main.children) as HTMLElement[]).filter((n) => n.tagName !== 'SCRIPT');
  const contact = kids[8];
  if (kids.length < 9 || !contact || contact.id !== 'kontakt') return;

  const footer = document.querySelector<HTMLElement>('footer');
  if (!footer) return;

  // The overlay and all offsetTop measurements are main-local.
  main.style.position = 'relative';

  /** The visible hero schematic's arrowhead (desktop or mobile svg). */
  function heroArrowEl(): SVGGraphicsElement | null {
    for (const el of Array.from(main.querySelectorAll<SVGGraphicsElement>('.flow-arrow'))) {
      const svg = el.ownerSVGElement;
      if (svg && svg.getBoundingClientRect().width > 0) return el;
    }
    return null;
  }

  let heroArrow = heroArrowEl();
  if (!heroArrow) return;

  /* ---- overlay furniture ------------------------------------------ */
  const svg = document.createElementNS(SVG_NS, 'svg');
  svg.setAttribute('aria-hidden', 'true');
  svg.style.cssText = 'position:absolute;top:0;left:0;z-index:30;overflow:visible;pointer-events:none;';
  const g = document.createElementNS(SVG_NS, 'g');
  const path = document.createElementNS(SVG_NS, 'path');
  path.setAttribute('fill', 'none');
  path.setAttribute('stroke', 'var(--color-signal)');
  path.setAttribute('stroke-width', '2.5');
  path.setAttribute('stroke-linecap', 'butt');
  path.setAttribute('stroke-linejoin', 'miter');
  const head = document.createElementNS(SVG_NS, 'path');
  head.setAttribute('fill', 'var(--color-signal)');
  head.style.visibility = 'hidden';
  g.append(path, head);
  svg.append(g);
  main.append(svg);

  let len = 0;
  let headL = 14;
  let wasDetached: boolean | null = null;
  const state = { p: 0 };

  function rebuild(): void {
    const arrow = heroArrowEl();
    if (!arrow) return;
    if (arrow !== heroArrow) {
      // The md boundary swaps schematics; never leave the old arrow hidden
      // while toggling a no-longer-rendered one (gate finding).
      heroArrow.style.visibility = '';
      heroArrow = arrow;
      wasDetached = null;
    }
    const mainRect = main.getBoundingClientRect();
    const w = main.clientWidth;
    const r = arrow.getBoundingClientRect();
    const tipX = r.right - mainRect.left;
    const tipY = r.top + r.height / 2 - mainRect.top;
    headL = gsap.utils.clamp(10, 16, Math.round(r.width));

    // Lane geometry. Desktop rail center at w-16: it rides exactly ON the
    // hero DIN frame's border (inset-x-4) — the signal travels the drawing
    // frame's edge rather than fringing 1px beside it (gate finding).
    // Jogs go INWARD and their clamp budgets the ARROWHEAD's half-height,
    // not just the stroke, so no signal ink can touch the text column at
    // any width; where the 24px gutter cannot afford ≥5px of jog, the
    // rail runs straight — the jogs are garnish, the contract is not.
    const RAIL_X = w - (w < 768 ? 12 : 16);
    const freeGutter = (w - Math.min(w, 1200)) / 2 + 24;
    const headHalf = Math.ceil(headL * 0.56);
    const jog = Math.min(12, freeGutter - (w - RAIL_X) - headHalf - 1);
    const laneB = RAIL_X - jog;

    const boundaries =
      jog >= 5
        ? kids
            .slice(1)
            .map((s) => s.offsetTop)
            .filter((y) => y > tipY + 60)
            .sort((a, b) => a - b)
        : [];
    const endY = footer!.getBoundingClientRect().top - mainRect.top;

    let d = `M ${tipX.toFixed(1)} ${tipY.toFixed(1)} H ${RAIL_X}`;
    let lane = RAIL_X;
    for (const y of boundaries) {
      d += ` V ${y.toFixed(1)}`;
      lane = lane === RAIL_X ? laneB : RAIL_X;
      d += ` H ${lane}`;
    }
    if (lane !== RAIL_X) d += ` V ${(endY - 24).toFixed(1)} H ${RAIL_X}`;
    d += ` V ${endY.toFixed(1)}`; // the signal plugs into the Zeichnungskopf

    const svgH = Math.ceil(endY + 4);
    svg.setAttribute('width', String(w));
    svg.setAttribute('height', String(svgH));
    svg.setAttribute('viewBox', `0 0 ${w} ${svgH}`);
    path.setAttribute('d', d);
    head.setAttribute('d', `M0 0 L-${headL} -${Math.round(headL * 0.56)} L-${headL} ${Math.round(headL * 0.56)} Z`);
    len = path.getTotalLength();
    path.style.strokeDasharray = String(len);
    wasDetached = null; // force the visibility pair to re-apply
    render(state.p);
  }

  function render(p: number): void {
    if (!len) return;
    const drawn = p * len;
    path.style.strokeDashoffset = String(len - drawn);
    const pt = path.getPointAtLength(drawn);
    const pt2 = path.getPointAtLength(Math.min(len, drawn + 1));
    const deg = (Math.atan2(pt2.y - pt.y, pt2.x - pt.x) * 180) / Math.PI;
    gsap.set(head, { x: pt.x, y: pt.y, rotation: deg, transformOrigin: '0 0' });
    const detached = p > EPS;
    if (detached !== wasDetached) {
      // visibility, not opacity — the hero intro tweens the arrow's opacity
      // and must not be fought over the same property.
      heroArrow.style.visibility = detached ? 'hidden' : '';
      head.style.visibility = detached ? 'visible' : 'hidden';
      wasDetached = detached;
    }
  }

  rebuild();

  /* ---- scrub ------------------------------------------------------- */
  // Absolute-px start: the sticky header holds main.top at 64px, so a
  // 'top top' trigger would dead-zone the first 64px of scroll.
  gsap.to(state, {
    p: 1,
    ease: 'none',
    scrollTrigger: {
      id: 'flowrail',
      start: 0,
      end: () => ScrollTrigger.maxScroll(window),
      scrub: 0.5,
      onRefresh: rebuild,
    },
    onUpdate: () => render(state.p),
  });

  /* ---- signal ration: the rail yields where a section owns signal ---- */
  // 0.2, clearly an ember: two full-strength orange verticals in one
  // viewport is the device duplicated. Process owns its scroll line
  // (D-041's star); Contact owns the CTA + closing schematic. Demo's
  // sparkline is annotation-grade and consciously NOT yielded to (D-044).
  const dim = (to: number) =>
    gsap.to(g, { opacity: to, duration: 0.3, ease: 'power1.inOut', overwrite: 'auto' });
  for (const sel of ['#vorgehen', '#kontakt']) {
    ScrollTrigger.create({
      trigger: sel,
      start: 'top 75%',
      end: 'bottom 40%',
      onEnter: () => dim(0.2),
      onEnterBack: () => dim(0.2),
      onLeave: () => dim(1),
      onLeaveBack: () => dim(1),
    });
  }

  /* ---- route-exit burst -------------------------------------------- */
  const onBlast = () => {
    // One code path for every progress: the burst origin is the drawn tip
    // (at p≈0 that IS the hero arrow's own position).
    const mainRect = main.getBoundingClientRect();
    const pt = path.getPointAtLength(state.p * len);
    const x = gsap.utils.clamp(8, window.innerWidth - 8, mainRect.left + pt.x);
    const y = gsap.utils.clamp(8, window.innerHeight - 8, mainRect.top + pt.y);
    heroArrow.style.visibility = 'hidden';
    head.style.visibility = 'hidden';
    // Self-healing: if the navigation is aborted (D-039 rescue paths), the
    // next scrub tick re-applies the correct arrow visibility and redraw.
    wasDetached = null;
    gsap.to(path, { strokeDashoffset: len, duration: 0.3, ease: 'power2.in' }); // retract under the veil
    // 150ms after dispatch the veil sheet is already sweeping across, so
    // the debris falls over the drafting sheet, not over live copy (gate
    // finding). Closure over primitives only — the timer must survive the
    // swap and is deliberately NOT cleared by the page cleanup.
    const size = headL;
    window.setTimeout(() => spawnBurst(x, y, size), 150);
  };
  document.addEventListener('flowfield:blast', onBlast);

  return () => {
    document.removeEventListener('flowfield:blast', onBlast);
    // Retract + dim tweens are born in callbacks the page context never saw.
    gsap.killTweensOf([path, g]);
    heroArrow.style.visibility = '';
    svg.remove();
  };
});
