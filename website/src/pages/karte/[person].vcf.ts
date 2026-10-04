/**
 * vCard 3.0 endpoints behind the „Kontakt speichern" CTA — one .vcf per
 * card at /karte/<slug>.vcf, shared by both languages (contact data has no
 * language; TITLE carries the German role line, the card's home register).
 * Every value comes from site.ts / ui.ts — nothing is invented here.
 * CRLF line endings and UTF-8 are what iOS/Android contact importers
 * require; the Content-Type header applies in dev/preview, while in
 * production the static host derives the MIME type from the .vcf extension.
 */
import type { APIRoute, GetStaticPaths } from 'astro';
import { CARDS, type CardPerson } from '../../config/cards';
import { SITE } from '../../config/site';
import { useTranslations } from '../../i18n/ui';

export const getStaticPaths = (() =>
  CARDS.map((card) => ({ params: { person: card.slug }, props: { card } }))) satisfies GetStaticPaths;

/** RFC 2426 escaping for \ , ; — defensive; current data contains none. */
const esc = (v: string) => v.replace(/\\/g, '\\\\').replace(/([,;])/g, '\\$1');

export const GET: APIRoute<{ card: CardPerson }> = ({ props }) => {
  const { card } = props;
  const t = useTranslations('de');

  const lines = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `N:${esc(card.familyName)};${esc(card.givenName)};;;`,
    `FN:${esc(card.name)}`,
    `ORG:${esc(SITE.name)}`,
    `TITLE:${esc(t(card.roleKey))}`,
    `TEL;TYPE=CELL,VOICE:${card.phoneE164}`,
    `EMAIL;TYPE=INTERNET,WORK:${SITE.email}`,
    `URL:${SITE.url}`,
    /* ADR order: PO box; extended; street; locality; region; postal; country */
    `ADR;TYPE=WORK:;;${esc(SITE.street)};${esc(SITE.city)};;${SITE.zip};${esc(SITE.country)}`,
    'END:VCARD',
    '',
  ];

  return new Response(lines.join('\r\n'), {
    headers: { 'Content-Type': 'text/vcard; charset=utf-8' },
  });
};
