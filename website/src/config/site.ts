/**
 * Single source of brand identity. Renaming the venture touches this file
 * and nothing else in the component tree (D-010).
 */
export const SITE = {
  /** Brand name as used in the wordmark. */
  name: 'NexBridge-IT',
  /** Canonical production origin. Domain registered to us — D-025. */
  url: 'https://nexbridge-it.com',
  region: 'Baden-Württemberg',
  foundedYear: 2026,
  /** Where enquiries land. Official venture mailbox, confirmed by the founder — D-029. */
  email: 'nexbridge-it@mailbox.org',

  /* ---------------------------------------------------------------------
   * Legal identity — D-036. Verbatim from the founder's Impressum document
   * (2026-08-03). This block is the single source for the Impressum page,
   * the JSON-LD PostalAddress, and anywhere else the entity is named.
   * Do not edit these to "fix" them: § 5 DDG data is the founder's and
   * their adviser's to change, not ours.
   * ------------------------------------------------------------------- */
  /** § 5 DDG Diensteanbieter. */
  legalName: 'Peter Knopp',
  street: 'Gartenstr. 22',
  zip: '68799',
  city: 'Reilingen',
  country: 'Deutschland',
  countryCode: 'DE',
  /** As printed in the Impressum. `phoneE164` is what a tel: href needs. */
  phone: '01739044077',
  phoneE164: '+491739044077',
  representatives: ['Peter Knopp', 'Manush Vaghani'],
  /** "Stand" date carried by the legal pages. Bump when either text changes. */
  legalRevision: '08/2026',
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
  /**
   * Plausible: set this to the domain registered in your Plausible account
   * (e.g. 'nexbridge-it.com') and the cookieless script is injected on every
   * page. Empty = no analytics, no third-party request at all.
   * Plausible Cloud is a paid service; self-hosting is free.
   */
  plausibleDomain: '',
  /**
   * Cloudflare Web Analytics token — the free, cookieless alternative.
   * Get it in the Cloudflare dashboard under Analytics → Web Analytics.
   * Only one of the two should be set.
   */
  cfAnalyticsToken: '',
} as const;
