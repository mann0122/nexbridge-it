/**
 * Teaser gate (D-049).
 *
 * The full film's URL is *derived from the code*, never stored:
 *
 *     /teaser/<sha256(code + ':' + teaserId) sliced to 16 hex>.mp4
 *
 * ops/scripts/build-teaser-assets.mjs names the file by the same derivation, so
 * a correct code computes a URL that exists and a wrong one computes a URL that
 * 404s. The 404 *is* the validation — there is no password, no stored hash and
 * no film path anywhere in this bundle, and the URL only enters the DOM once
 * someone gets the code right.
 *
 * Be honest about what that buys: four digits is 10,000 combinations, so this
 * is a courtesy gate, not access control. It stops casual sharing, scraping and
 * search indexing. It does not stop anyone willing to write a loop, and nothing
 * confidential belongs behind it.
 *
 * Registered through onPage: ClientRouter is live (D-039), so an observer or a
 * playing <video> left bound would ride into the next page as a leak.
 */
import { onPage, motionOff, fine } from './motion';

/** Long enough that the 10,000 candidate names do not collide. */
const HASH_CHARS = 16;
const SESSION_PREFIX = 'nb.teaser.';

/** Derived film URL, or null where SubtleCrypto is unavailable. */
async function resolveFilm(code: string, id: string): Promise<string | null> {
  // crypto.subtle is undefined on insecure origins — a plain-HTTP LAN dev host,
  // say. HTTPS and localhost both have it, so production is never affected.
  if (!globalThis.crypto?.subtle) {
    console.warn('[teaser] crypto.subtle unavailable — the gate needs HTTPS or localhost.');
    return null;
  }
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(`${code}:${id}`));
  const hex = Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
  return `/teaser/${hex.slice(0, HASH_CHARS)}.mp4`;
}

/* sessionStorage throws outright in some privacy modes, so every access is
   guarded. Losing it costs one re-entry of the code — never an error. */
function remember(id: string, src: string): void {
  try {
    sessionStorage.setItem(SESSION_PREFIX + id, src);
  } catch {
    /* not worth surfacing */
  }
}

function recall(id: string): string | null {
  try {
    return sessionStorage.getItem(SESSION_PREFIX + id);
  } catch {
    return null;
  }
}

onPage(({ lenis }) => {
  const foundScope = document.querySelector<HTMLElement>('[data-teaser-scope]');
  const foundDialog = document.querySelector<HTMLDialogElement>('[data-teaser-dialog]');
  if (!foundScope || !foundDialog) return; // every other page
  // Rebound after the guard so the non-null type reaches the handlers below.
  const scope = foundScope;
  const dialog = foundDialog;

  const labels = {
    locked: scope.dataset.labelLocked ?? '',
    unlocked: scope.dataset.labelUnlocked ?? '',
    pending: scope.dataset.labelPending ?? '',
    checking: scope.dataset.labelChecking ?? '',
    error: scope.dataset.labelError ?? '',
  };

  /** A card whose film is open this session: status, lock and hint all move. */
  function markUnlocked(card: HTMLButtonElement): void {
    card.dataset.teaserUnlocked = 'true';
    const status = card.querySelector<HTMLElement>('[data-teaser-status]');
    const hint = card.querySelector<HTMLElement>('[data-teaser-hint]');
    if (status && labels.unlocked) status.textContent = labels.unlocked;
    // Leaving "Code eingeben" on a card that now opens straight into the film
    // is a lie about what the next click does.
    const unlockedHint = card.dataset.labelHintUnlocked;
    if (hint && unlockedHint) hint.textContent = unlockedHint;
  }

  const cards = Array.from(scope.querySelectorAll<HTMLButtonElement>('[data-teaser]'));
  const digits = Array.from(dialog.querySelectorAll<HTMLInputElement>('[data-teaser-digit]'));
  const found = {
    form: dialog.querySelector<HTMLFormElement>('[data-teaser-form]'),
    errorBox: dialog.querySelector<HTMLElement>('[data-teaser-error]'),
    player: dialog.querySelector<HTMLElement>('[data-teaser-player]'),
    film: dialog.querySelector<HTMLVideoElement>('[data-teaser-full]'),
    submit: dialog.querySelector<HTMLButtonElement>('[data-teaser-submit]'),
    submitLabel: dialog.querySelector<HTMLElement>('[data-teaser-submit-label]'),
  };
  if (
    !found.form ||
    !found.errorBox ||
    !found.player ||
    !found.film ||
    !found.submit ||
    !found.submitLabel
  ) {
    return;
  }
  /* Re-bound through one object *after* the guard so the non-null types
     survive into the handlers below. A bare `const x = querySelector(...)`
     widens back to `| null` inside a hoisted function — TS cannot prove the
     guard ran before the call — which is what `astro check` caught. */
  const { form, errorBox, player, film, submit, submitLabel } = found;

  const dialogName = dialog.querySelector<HTMLElement>('[data-teaser-dialog-name]');
  const dialogPart = dialog.querySelector<HTMLElement>('[data-teaser-dialog-part]');
  const closeBtn = dialog.querySelector<HTMLButtonElement>('[data-teaser-close]');

  const submitIdle = submitLabel.textContent ?? '';
  let activeId: string | null = null;
  let observer: IntersectionObserver | null = null;

  /* ------------------------------------------------------------------ */
  /* Preview loops                                                       */
  /* ------------------------------------------------------------------ */

  const previews = new Map<HTMLButtonElement, HTMLVideoElement>();
  /** Card per teaser id, so unlocking does not re-query the DOM. */
  const cardsById = new Map<string, HTMLButtonElement>();

  for (const card of cards) {
    const preview = card.querySelector<HTMLVideoElement>('[data-teaser-preview]');
    const status = card.querySelector<HTMLElement>('[data-teaser-status]');
    const id = card.dataset.teaser ?? '';
    if (!preview) continue;
    previews.set(card, preview);
    if (id) cardsById.set(id, card);

    // Assets land after this code does. Until they do, say so on the card
    // rather than showing an empty frame with a confident "locked".
    //
    // A <video> reports a missing file and an undecodable one with the same
    // error code, so ask the server which it was: "Film folgt" is a lie to a
    // visitor whose browser simply cannot play H.264, and that visitor's
    // teaser is still locked, not still coming.
    preview.addEventListener('error', () => {
      fetch(preview.src, { method: 'HEAD' })
        .then((res) => {
          if (res.ok) return; // decodable-by-someone, just not here
          card.dataset.assetMissing = 'true';
          if (status && labels.pending) status.textContent = labels.pending;
        })
        .catch(() => {
          /* offline: the status stays as it is, which is still true */
        });
    });

    // A code already entered this session skips straight past the gate.
    if (id && recall(id)) markUnlocked(card);
  }

  function play(video: HTMLVideoElement): void {
    // preload="none" means this is also the fetch. Autoplay can still be
    // refused; muted+playsinline makes that rare and a refusal is harmless.
    video.play().catch(() => {});
  }

  function rewind(video: HTMLVideoElement): void {
    video.pause();
    video.currentTime = 0;
  }

  if (!motionOff) {
    if (fine) {
      for (const [card, preview] of previews) {
        card.addEventListener('mouseenter', () => play(preview));
        card.addEventListener('mouseleave', () => rewind(preview));
        // A keyboard user gets the same glimpse as a mouse user.
        card.addEventListener('focus', () => play(preview));
        card.addEventListener('blur', () => rewind(preview));
      }
    } else {
      /* No hover to work with, so the card previews itself when it scrolls
         into view — ONCE, not on a loop. An indefinite auto-started animation
         is the SC 2.2.2 case with no pause control to offer, and two blurred
         videos looping forever is also the mobile-perf case on a floor with no
         headroom. One pass, then the card rests on its first frame. */
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const card = entry.target as HTMLButtonElement;
            const preview = previews.get(card);
            if (!preview || !entry.isIntersecting) continue;
            preview.loop = false;
            preview.addEventListener('ended', () => rewind(preview), { once: true });
            play(preview);
            observer?.unobserve(card); // one pass per page view
          }
        },
        { threshold: 0.5 },
      );
      for (const card of previews.keys()) observer.observe(card);
    }
  }

  /* ------------------------------------------------------------------ */
  /* Dialog                                                              */
  /* ------------------------------------------------------------------ */

  /* Unhide before writing: a live region mutated while still `hidden` is
     announced unreliably by NVDA and JAWS. */
  function showError(message: string): void {
    errorBox.hidden = false;
    errorBox.textContent = message;
  }

  function clearError(): void {
    errorBox.hidden = true;
    errorBox.textContent = '';
  }

  function resetDigits(): void {
    for (const input of digits) input.value = '';
    digits[0]?.focus();
  }

  /** Swap the dialog to the player. Playback starts separately — a <video>
      inside a closed <dialog> is not yet laid out. */
  function mountFilm(src: string): void {
    film.src = src;
    form.hidden = true;
    player.hidden = false;
    // The submit button was holding focus and has just been hidden. Without
    // this, focus falls to <body> inside an open modal and a keyboard or
    // screen-reader user is given no sign the film replaced the form.
    film.focus();
  }

  function openDialog(card: HTMLButtonElement): void {
    activeId = card.dataset.teaser ?? null;
    if (!activeId) return;

    if (dialogName) dialogName.textContent = card.dataset.teaserName ?? '';
    if (dialogPart) dialogPart.textContent = card.dataset.teaserPart ?? '';

    clearError();
    const known = recall(activeId);
    if (known) {
      mountFilm(known);
    } else {
      form.hidden = false;
      player.hidden = true;
      for (const input of digits) input.value = '';
    }

    dialog.showModal();
    // Lenis keeps scrolling the page behind an open modal; the overflow lock
    // alone does not reach it. Both are needed — reduced motion has no Lenis.
    lenis?.stop();
    document.body.style.overflow = 'hidden';
    if (known) film.play().catch(() => {});
    else digits[0]?.focus();
  }

  function closeDialog(): void {
    // Blanking src stops the download as well as the playback.
    film.pause();
    film.removeAttribute('src');
    film.load();
    form.hidden = false;
    player.hidden = true;
    lenis?.start();
    document.body.style.overflow = '';
  }

  for (const card of cards) {
    card.addEventListener('click', () => openDialog(card));
  }

  closeBtn?.addEventListener('click', () => dialog.close());
  // Covers Esc and the close button alike — both end in a `close` event.
  dialog.addEventListener('close', closeDialog);

  // Clicking the backdrop closes. The sheet stops the event, so this only
  // fires for the dialog element itself.
  dialog.addEventListener('click', (event) => {
    if (event.target === dialog) dialog.close();
  });

  /* ------------------------------------------------------------------ */
  /* Code entry                                                          */
  /* ------------------------------------------------------------------ */

  digits.forEach((input, i) => {
    input.addEventListener('input', () => {
      // Strip anything non-numeric rather than rejecting the keystroke, so a
      // paste or an IME insertion behaves the same as typing.
      input.value = input.value.replace(/\D/g, '').slice(-1);
      clearError();
      if (input.value) digits[i + 1]?.focus();
    });

    input.addEventListener('keydown', (event) => {
      if (event.key === 'Backspace' && !input.value && i > 0) {
        event.preventDefault();
        digits[i - 1]!.value = '';
        digits[i - 1]!.focus();
      }
      if (event.key === 'ArrowLeft' && i > 0) digits[i - 1]!.focus();
      if (event.key === 'ArrowRight') digits[i + 1]?.focus();
    });

    input.addEventListener('paste', (event) => {
      const text = event.clipboardData?.getData('text')?.replace(/\D/g, '') ?? '';
      if (!text) return;
      event.preventDefault();
      // Fill from the field that received the paste, not always from zero.
      for (let n = 0; n < text.length && i + n < digits.length; n++) {
        digits[i + n]!.value = text[n]!;
      }
      clearError();
      digits[Math.min(i + text.length, digits.length - 1)]?.focus();
    });

    input.addEventListener('focus', () => input.select());
  });

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!activeId) return;

    const code = digits.map((d) => d.value).join('');
    if (!/^\d{4}$/.test(code)) {
      showError(labels.error);
      resetDigits();
      return;
    }

    submit.disabled = true;
    submitLabel.textContent = labels.checking;
    clearError();

    try {
      const src = await resolveFilm(code, activeId);
      // HEAD keeps a wrong guess to response headers instead of a video body.
      const found = src ? await fetch(src, { method: 'HEAD' }).then((r) => r.ok) : false;

      if (src && found) {
        remember(activeId, src);
        const card = cardsById.get(activeId);
        if (card) markUnlocked(card);
        mountFilm(src);
        film.play().catch(() => {});
      } else {
        showError(labels.error);
        resetDigits();
      }
    } catch {
      // Offline, or the request was blocked. Same message: from where the
      // visitor sits, the film did not open and the next move is the same.
      showError(labels.error);
      resetDigits();
    } finally {
      submit.disabled = false;
      submitLabel.textContent = submitIdle;
    }
  });

  /* ------------------------------------------------------------------ */

  return () => {
    observer?.disconnect();
    observer = null;
    for (const preview of previews.values()) preview.pause();
    film.pause();
    film.removeAttribute('src');
    film.load(); // same teardown as closeDialog — drops the buffered stream
    if (dialog.open) dialog.close();
    // A route can be swapped with the dialog open; neither the scroll lock
    // nor a stopped Lenis may survive onto the next page.
    document.body.style.overflow = '';
    lenis?.start();
  };
});
