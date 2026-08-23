/**
 * The card-object interaction (D-049): pointer tilt, touch tilt, and the
 * card page's ONE idle loop — the sheen drift. Called from CardPage's
 * onPage init, synchronously, so every tween and the loop timeline are
 * owned by the page's gsap.context and revert on route swap — no manual
 * kill. Under motionOff the mount returns an inert handle: the CSS default
 * (sheen parked, card flat) already IS the finished still-life.
 *
 * Touch contract: vertical scroll stays native (touch-action: pan-y on the
 * card + passive listeners, never preventDefault on pointer events). A
 * horizontal drag past the 12px tap threshold tilts the card and swallows
 * the click that would otherwise download the vCard; a tap navigates.
 * No gyroscope — the iOS permission prompt is unacceptable on a handout.
 */
import { gsap, motionOff, fine } from './motion';

export interface CardObjectHandle {
  /** Re-cache the scene rect after resize or webfont settle. */
  refit: () => void;
  /** Start the idle sheen drift — the card page's one loop. */
  idle: () => void;
  /** Remove DOM listeners. GSAP state is context-owned and reverts itself. */
  destroy: () => void;
}

const INERT: CardObjectHandle = { refit() {}, idle() {}, destroy() {} };

const TILT_FINE = 6; /* deg — hover tilt */
const TILT_TOUCH = 8; /* deg — drag tilt */
const TAP_SLOP = 12; /* px — below this a touch is a tap, not a drag */

export function mountCardObject(card: HTMLElement, scene: HTMLElement): CardObjectHandle {
  if (motionOff) return INERT;

  const tilt = scene.querySelector<HTMLElement>('.card-tilt');
  const sheen = card.querySelector<HTMLElement>('.card-sheen');
  const shadow = scene.querySelector<HTMLElement>('.card-shadow');
  if (!tilt) return INERT;

  let rect = scene.getBoundingClientRect();

  /* GSAP parses the sheen's CSS parked transform (translateX(120%)) from
     the computed matrix as `x` in px. Re-express it as xPercent ONCE so the
     loop owns xPercent (full -120→120 passes) while the tilt slides `x` a
     few px against the light — independent components, same visual park.
     Context-owned: reverting restores the pure CSS default. */
  if (sheen) gsap.set(sheen, { x: 0, xPercent: 120 });
  /* The shadow rests at translateY(20px); tilt offsets are relative to it. */
  const shadowRestY = shadow ? Number(gsap.getProperty(shadow, 'y')) : 0;

  /* One quickTo per animated property (Cursor.astro grammar): pointer events
     fire faster than tween churn should. */
  const rx = gsap.quickTo(tilt, 'rotationX', { duration: 0.45, ease: 'expo.out' });
  const ry = gsap.quickTo(tilt, 'rotationY', { duration: 0.45, ease: 'expo.out' });
  const sheenX = sheen ? gsap.quickTo(sheen, 'x', { duration: 0.45, ease: 'expo.out' }) : null;
  const shadowX = shadow ? gsap.quickTo(shadow, 'x', { duration: 0.45, ease: 'expo.out' }) : null;
  const shadowY = shadow ? gsap.quickTo(shadow, 'y', { duration: 0.45, ease: 'expo.out' }) : null;

  const rest = () => {
    rx(0);
    ry(0);
    sheenX?.(0);
    shadowX?.(0);
    shadowY?.(shadowRestY);
  };

  /* Fine pointers: hover tilt from the cached-rect normalized offset. The
     shadow counter-translates (the floor stays put) and the sheen slides
     against the light — what sells the metal. */
  const onMove = (e: PointerEvent) => {
    if (e.pointerType === 'touch') return;
    const nx = gsap.utils.clamp(-1, 1, ((e.clientX - rect.left) / rect.width) * 2 - 1);
    const ny = gsap.utils.clamp(-1, 1, ((e.clientY - rect.top) / rect.height) * 2 - 1);
    ry(nx * TILT_FINE);
    rx(-ny * TILT_FINE);
    sheenX?.(nx * -26);
    shadowX?.(nx * -14);
    shadowY?.(shadowRestY + ny * -10);
  };

  /* Touch: horizontal drag only. A mostly-vertical move is a scroll — hand
     the pointer back and never touch it again this gesture. */
  let touchId = -1;
  let downX = 0;
  let downY = 0;
  let dragging = false;
  let dragged = false;

  const onDown = (e: PointerEvent) => {
    if (e.pointerType !== 'touch') return;
    touchId = e.pointerId;
    downX = e.clientX;
    downY = e.clientY;
    dragging = false;
    dragged = false;
  };
  const onTouchMove = (e: PointerEvent) => {
    if (e.pointerType !== 'touch' || e.pointerId !== touchId) return;
    const dx = e.clientX - downX;
    const dy = e.clientY - downY;
    if (!dragging) {
      if (Math.abs(dx) < TAP_SLOP) return;
      if (Math.abs(dy) > Math.abs(dx)) {
        touchId = -1; /* a scroll, not a drag */
        return;
      }
      dragging = true;
      dragged = true;
    }
    const n = gsap.utils.clamp(-1, 1, dx / (rect.width / 2));
    ry(n * TILT_TOUCH);
    sheenX?.(n * -26);
    shadowX?.(n * -14);
  };
  const onUp = (e: PointerEvent) => {
    if (e.pointerType === 'touch' && e.pointerId !== touchId) return;
    touchId = -1;
    dragging = false;
    rest();
  };
  /* After a deliberate drag the trailing click must not download the vCard —
     that is the whole point of the tap threshold. preventDefault on click
     never affects scrolling; the pointer listeners above stay passive. */
  const onClick = (e: MouseEvent) => {
    if (dragged) {
      e.preventDefault();
      dragged = false;
    }
  };

  if (fine) {
    scene.addEventListener('pointermove', onMove, { passive: true });
    scene.addEventListener('pointerleave', onUp, { passive: true });
  }
  card.addEventListener('pointerdown', onDown, { passive: true });
  card.addEventListener('pointermove', onTouchMove, { passive: true });
  card.addEventListener('pointerup', onUp, { passive: true });
  card.addEventListener('pointercancel', onUp, { passive: true });
  card.addEventListener('click', onClick);

  /* The one idle loop: every 9s a quiet 2.4s sheen pass at 0.10 peak,
     returning to the parked 0.08 — the CSS rest state. Created paused,
     synchronously (context-owned); started by the entrance timeline's
     final beat via handle.idle(). */
  let loop: gsap.core.Timeline | null = null;
  if (sheen) {
    loop = gsap.timeline({ paused: true, repeat: -1 });
    loop
      .set(sheen, { xPercent: -120, opacity: 0.1 }, 6.6)
      .to(sheen, { xPercent: 120, duration: 2.4, ease: 'power2.inOut' }, 6.6)
      .set(sheen, { opacity: 0.08 }, 9);
  }

  return {
    refit: () => {
      rect = scene.getBoundingClientRect();
    },
    idle: () => {
      loop?.play(0);
    },
    destroy: () => {
      if (fine) {
        scene.removeEventListener('pointermove', onMove);
        scene.removeEventListener('pointerleave', onUp);
      }
      card.removeEventListener('pointerdown', onDown);
      card.removeEventListener('pointermove', onTouchMove);
      card.removeEventListener('pointerup', onUp);
      card.removeEventListener('pointercancel', onUp);
      card.removeEventListener('click', onClick);
    },
  };
}
