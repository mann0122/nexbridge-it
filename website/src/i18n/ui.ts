/**
 * All customer-facing strings live here — no hardcoded copy in components (D-010).
 * German copy passes through the copywriter-de agent before shipping.
 */
export const languages = { de: 'Deutsch', en: 'English' } as const;
export type Lang = keyof typeof languages;
export const defaultLang: Lang = 'de';

export const ui = {
  de: {
    'meta.title': 'klarfluss – Prozesse, die von selbst laufen',
    'meta.description':
      'Automatisierung, KI-Agenten, Dashboards und Individualsoftware für den Mittelstand. Gebaut in Deutschland, DSGVO-konform, übergabefertig dokumentiert.',
    'a11y.skip': 'Zum Inhalt springen',
    'a11y.menuOpen': 'Menü öffnen',
    'a11y.menuClose': 'Menü schließen',
    'a11y.langSwitch': 'Switch to English',
    'a11y.mainNav': 'Hauptnavigation',
    'a11y.flowDiagram': 'Schema: drei manuelle Datenquellen werden zu einem automatischen Prozess',
    'nav.leistungen': 'Leistungen',
    'nav.vorgehen': 'Vorgehen',
    'nav.ueberUns': 'Über uns',
    'nav.kontakt': 'Kontakt',
    'hero.kicker': 'Automatisierung · KI-Agenten · Dashboards · Individualsoftware',
    'hero.h1a': 'Prozesse, die',
    'hero.h1b': 'von selbst laufen.',
    'hero.sub':
      'Ihr Team kopiert keine Daten mehr zwischen Excel, E-Mail und ERP – das übernimmt Software. Gebaut in Deutschland, DSGVO-konform, übergabefertig dokumentiert.',
    'hero.ctaPrimary': 'Erstgespräch vereinbaren',
    'hero.ctaSecondary': 'Leistungen ansehen',
    'flow.in1': 'Excel-Listen',
    'flow.in2': 'E-Mail-Postfach',
    'flow.in3': 'ERP/CRM',
    'flow.out': 'läuft von selbst',
    'tb.loc.label': 'Standort',
    'tb.loc.value': 'Baden-Württemberg',
    'tb.privacy.label': 'Datenschutz',
    'tb.privacy.value': 'Ihre Daten bleiben in Deutschland',
    'tb.rev.label': 'Stand',
    'tb.rev.value': '07/2026',
  },
  en: {
    'meta.title': 'klarfluss — Processes that run themselves',
    'meta.description':
      'Automation, AI agents, dashboards and custom software for Germany’s Mittelstand. Built in Germany, GDPR-first, documented for handover.',
    'a11y.skip': 'Skip to content',
    'a11y.menuOpen': 'Open menu',
    'a11y.menuClose': 'Close menu',
    'a11y.langSwitch': 'Zu Deutsch wechseln',
    'a11y.mainNav': 'Main navigation',
    'a11y.flowDiagram': 'Diagram: three manual data sources become one automated process',
    'nav.leistungen': 'Services',
    'nav.vorgehen': 'Approach',
    'nav.ueberUns': 'About',
    'nav.kontakt': 'Contact',
    'hero.kicker': 'Automation · AI agents · Dashboards · Custom software',
    'hero.h1a': 'Processes that',
    'hero.h1b': 'run themselves.',
    'hero.sub':
      'Your team stops copying data between Excel, email and ERP — software takes over. Built in Germany, GDPR-first, documented for handover.',
    'hero.ctaPrimary': 'Book an intro call',
    'hero.ctaSecondary': 'See services',
    'flow.in1': 'Excel sheets',
    'flow.in2': 'Email inbox',
    'flow.in3': 'ERP/CRM',
    'flow.out': 'runs by itself',
    'tb.loc.label': 'Location',
    'tb.loc.value': 'Baden-Württemberg',
    'tb.privacy.label': 'Data privacy',
    'tb.privacy.value': 'Your data stays in Germany',
    'tb.rev.label': 'Revision',
    'tb.rev.value': '07/2026',
  },
} as const satisfies Record<Lang, Record<string, string>>;

export type UiKey = keyof (typeof ui)['de'];

export function useTranslations(lang: Lang) {
  return function t(key: UiKey): string {
    return ui[lang][key] ?? ui[defaultLang][key];
  };
}

/** Path of the same page in the other language (only `/` ↔ `/en/` for now). */
export function altPath(lang: Lang, path: string): string {
  if (lang === 'de') return path === '/' ? '/en/' : `/en${path}`;
  const stripped = path.replace(/^\/en\/?/, '/');
  return stripped === '' ? '/' : stripped;
}
