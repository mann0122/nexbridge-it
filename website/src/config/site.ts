/**
 * Single source of brand identity. The name is provisional (D-010) —
 * a rename must only ever touch this file.
 */
export const SITE = {
  /** Lowercase brand name as used in the wordmark. */
  name: 'klarfluss',
  /** Canonical production origin. */
  url: 'https://klarfluss.eu',
  region: 'Baden-Württemberg',
  foundedYear: 2026,
  /** Where enquiries land. TBD: confirm before launch. */
  email: 'kontakt@klarfluss.eu',
  /**
   * Booking tool link (e.g. a self-hosted Cal.com instance — keeps the
   * GDPR-first positioning). Reserved: nothing reads this yet. Wiring the
   * CTAs to it is a follow-up once the founders pick a tool.
   */
  bookingUrl: '',
  /**
   * Endpoint that receives the contact form. Empty string = the form falls
   * back to opening a prefilled email, so it always works. Point this at a
   * Cloudflare Pages Function once the mail provider is configured.
   */
  formEndpoint: '',
} as const;
