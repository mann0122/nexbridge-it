/**
 * Teaser manifest — asset identity only (D-050). Human-readable copy lives in
 * src/i18n/ui.ts like every other string; this file names files, not sentences.
 *
 * What is deliberately NOT here: the 4-digit codes, and the full films' paths.
 * The full film's URL is derived at runtime from the code the visitor types
 * (see src/scripts/teaser.ts), so it is absent from the HTML and from the JS
 * bundle until someone gets the code right. Putting either in this file would
 * ship them to every visitor and defeat the gate — D-049.
 */
export const TEASERS = [
  { id: 'teaser-1', partNo: 'NB-T01', source: 'NBIT1' },
  { id: 'teaser-2', partNo: 'NB-T02', source: 'NBG1' },
] as const;

export type Teaser = (typeof TEASERS)[number];
export type TeaserId = Teaser['id'];

/** Directory every generated teaser asset lands in, served from public/. */
export const TEASER_DIR = '/teaser';

/**
 * Low-resolution, silent hover loop. Public on purpose: it is 320px wide and
 * shown under a scrim, so it leaks nothing the poster does not already.
 */
export const previewSrc = (id: TeaserId) => `${TEASER_DIR}/${id}-preview.mp4`;

/** Still frame, the only teaser asset fetched before any interaction. */
export const posterSrc = (id: TeaserId) => `${TEASER_DIR}/${id}-poster.webp`;
