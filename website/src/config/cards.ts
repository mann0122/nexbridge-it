/**
 * The two digital business cards — the NB-VK register (part-number prefix
 * per docs/02-brand.md). Slugs are FIXED: printed NFC/QR cards point at
 * /karte/<slug>, so renaming one breaks physical cards in the field.
 *
 * Contact values live in site.ts (the single source, D-010); this module
 * only maps the representatives listed there onto card documents. Role
 * lines are ui.ts keys so the copywriter-de gate refines them in one place.
 */
import { SITE } from './site';
import type { UiKey } from '../i18n/ui';

export interface CardPerson {
  /** URL slug — printed on physical cards, never rename. */
  slug: string;
  /** Full name exactly as listed in SITE.representatives. */
  name: string;
  /** Split for the vCard N field. */
  givenName: string;
  familyName: string;
  /** ui.ts key for the role line (German draft → copywriter-de). */
  roleKey: UiKey;
  /** Drawing number carried by the Zeichnungskopf. */
  partNo: string;
  /**
   * Personal mobile in E.164 — founder-supplied. Falls back to the venture
   * line (SITE.phoneE164) when a person has no own number on file.
   */
  phoneE164: string;
}

/** Register designation for the card series — stamps the index page's title block. */
export const CARD_REGISTER = 'NB-VK';

/**
 * Revision stamped on the NB-VK cards, digital and print (the print master's
 * Stand cells carry the same value). Deliberately independent of
 * SITE.legalRevision: a Datenschutz/Impressum text bump must not restamp
 * cards that are already printed.
 */
export const CARD_REVISION = '08/2026';

/** "Peter Knopp" → given/family for the vCard N field. */
function splitName(full: string): { givenName: string; familyName: string } {
  const i = full.lastIndexOf(' ');
  return { givenName: full.slice(0, i), familyName: full.slice(i + 1) };
}

const [partnerA, partnerB] = SITE.representatives;

export const CARDS: readonly CardPerson[] = [
  {
    slug: 'peter-knopp',
    name: partnerA,
    ...splitName(partnerA),
    roleKey: 'card.1.role',
    partNo: 'NB-VK-01',
    phoneE164: SITE.phoneE164, // venture line (Impressum) — no personal number on file
  },
  {
    slug: 'manush-vaghani',
    name: partnerB,
    ...splitName(partnerB),
    roleKey: 'card.2.role',
    partNo: 'NB-VK-02',
    phoneE164: '+4917685919025', // founder-supplied, 2026-08-23
  },
];
