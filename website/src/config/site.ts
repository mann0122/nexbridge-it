/**
 * Single source of brand identity. Renaming the venture touches this file
 * and nothing else in the component tree (D-010).
 */
export const SITE = {
  /** Brand name as used in the wordmark. */
  name: 'NexBridge-IT',
  /** Canonical production origin. Preview until the domain is registered. */
  url: 'https://nexbridge-it-site.silky-plough.workers.dev',
  region: 'Baden-Württemberg',
  foundedYear: 2026,
  /** Where enquiries land. TBD: confirm once the domain is registered. */
  email: 'kontakt@nexbridge-it.io',
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
