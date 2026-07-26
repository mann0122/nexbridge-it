/**
 * All customer-facing strings live here — no hardcoded copy in components (D-010).
 * German copy passes through the copywriter-de agent before shipping.
 * Founder direction 2026-07-26: hero speaks at solution-category level, not
 * tool-specific pains — specifics live further down the page.
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
    'a11y.flowDiagram': 'Schema: manuelle Abläufe werden zu einem automatischen Prozess',
    'a11y.processDiagram': 'Ablauf: drei Phasen von der Analyse bis zum laufenden Betrieb',
    'a11y.legalNav': 'Rechtliches',

    'nav.leistungen': 'Leistungen',
    'nav.vorgehen': 'Vorgehen',
    'nav.ueberUns': 'Über uns',
    'nav.kontakt': 'Kontakt',

    'hero.kicker': 'Automatisierung · KI-Agenten · Dashboards · Individualsoftware',
    'hero.h1a': 'Prozesse, die',
    'hero.h1b': 'von selbst laufen.',
    'hero.sub':
      'Wir bauen die Software, die Ihnen wiederkehrende Arbeit abnimmt – von der Automatisierung bis zum KI-Agenten. Gebaut in Deutschland, DSGVO-konform, übergabefertig dokumentiert.',
    'hero.ctaPrimary': 'Erstgespräch vereinbaren',
    'hero.ctaSecondary': 'Leistungen ansehen',
    'flow.in1': 'Manuelle Abläufe',
    'flow.in2': 'Verstreute Daten',
    'flow.in3': 'Wiederkehrende Aufgaben',
    'flow.out': 'läuft von selbst',

    'tb.loc.label': 'Standort',
    'tb.loc.value': 'Baden-Württemberg',
    'tb.privacy.label': 'Datenschutz',
    'tb.privacy.value': 'Ihre Daten bleiben in Deutschland',
    'tb.rev.label': 'Stand',
    'tb.rev.value': '07/2026',

    'marquee.gdpr': 'DSGVO-konform',
    'marquee.handover': 'Übergabefertig dokumentiert',
    'marquee.origin': 'Gebaut in Deutschland',
    'marquee.fixed': 'Einstieg zum Festpreis',

    'problems.kicker': 'Positionsliste · bekannte Störstellen',
    'problems.title': 'Woran es im Alltag hängt.',
    'problems.col.pos': 'Pos.',
    'problems.col.title': 'Störstelle',
    'problems.col.note': 'Folge',
    'problems.1.pos': 'Pos. A',
    'problems.1.title': 'Wissen steckt in Köpfen und Dateien',
    'problems.1.note': 'Fällt eine Person aus, steht der Ablauf.',
    'problems.2.pos': 'Pos. B',
    'problems.2.title': 'Systeme reden nicht miteinander',
    'problems.2.note': 'Daten werden von Hand übertragen – jeden Tag aufs Neue.',
    'problems.3.pos': 'Pos. C',
    'problems.3.title': 'Zahlen kommen zu spät',
    'problems.3.note': 'Bis der Bericht fertig ist, ist er veraltet.',

    'services.kicker': 'Leistungen · KF-01–KF-04',
    'services.title': 'Vier Wege, ein Ergebnis: weniger Handarbeit.',
    'services.1.id': 'KF-01',
    'services.1.title': 'Automatisierung',
    'services.1.note': 'Wiederkehrende Aufgaben laufen ohne Ihr Zutun – zuverlässig, nachvollziehbar, dokumentiert.',
    'services.2.id': 'KF-02',
    'services.2.title': 'KI-Agenten',
    'services.2.note': 'Assistenten, die mit Ihren Daten arbeiten: sortieren, beantworten, vorbereiten.',
    'services.3.id': 'KF-03',
    'services.3.title': 'Dashboards',
    'services.3.note': 'Ihre Kennzahlen live auf einem Bildschirm – statt in zwanzig Dateien.',
    'services.4.id': 'KF-04',
    'services.4.title': 'Individualsoftware',
    'services.4.note': 'Wenn Standardsoftware nicht passt: Werkzeuge, exakt für Ihren Ablauf gebaut.',

    'process.kicker': 'Vorgehen · Phase 1→3',
    'process.title': 'Drei Phasen. Einstieg zum Festpreis.',
    'process.1.phase': 'Phase 1',
    'process.1.title': 'Prozess-Audit',
    'process.1.duration': '1 Woche',
    'process.1.note': 'Wir nehmen 3–5 Abläufe auf, beziffern die verlorenen Stunden und liefern einen Umsetzungsplan mit Prioritäten.',
    'process.1.price': '1.900 € Festpreis',
    'process.2.phase': 'Phase 2',
    'process.2.title': 'Umsetzungs-Sprint',
    'process.2.duration': '2–4 Wochen',
    'process.2.note': 'Wir setzen den wichtigsten Punkt aus dem Plan komplett um – inklusive Einführung und Dokumentation.',
    'process.2.price': '7.500–12.000 € nach Umfang',
    'process.3.phase': 'Phase 3',
    'process.3.title': 'Betrieb & Ausbau',
    'process.3.duration': 'laufend',
    'process.3.note': 'Wir überwachen, pflegen und erweitern – Ihre Prozesse bleiben in Bewegung.',
    'process.3.price': '1.200 €/Monat',
    'process.priceNote': 'Alle Preise netto zzgl. USt. · Phase 3: Mindestlaufzeit drei Monate',

    'demo.kicker': 'Demo · Musterfirma GmbH · fiktive Daten',
    'demo.title': 'So sieht das aus, wenn es läuft.',
    'demo.sub': 'Ein Beispiel-Dashboard, wie es bei Ihnen aussehen könnte – die Zahlen aktualisieren sich von selbst.',
    'demo.kpi1.label': 'Automatisierte Vorgänge/Monat',
    'demo.kpi1.value': '1482',
    'demo.kpi2.label': 'Eingesparte Stunden/Monat',
    'demo.kpi2.value': '214',
    'demo.kpi3.label': 'Übertragungsfehler',
    'demo.kpi3.value': '0',
    'demo.live.label': 'Vorgänge je Stunde · laufend',
    'demo.live.badge': 'live',
    'demo.chart.label': 'Durchlaufzeit je Auftrag · Minuten',
    'demo.chart.before': 'vorher',
    'demo.chart.after': 'nachher',

    'founders.kicker': 'Über uns · gegründet 2026',
    'founders.title': 'Zwei Gründer, ein Prinzip: erst verstehen, dann bauen.',
    'founders.1.role': 'Vertrieb & Prozessverständnis',
    'founders.1.note': 'Kennt den Mittelstand von innen – und übersetzt Ihren Alltag in klare Anforderungen.',
    'founders.2.role': 'Entwicklung & Betrieb',
    'founders.2.note': 'Baut die Lösung, dokumentiert sie übergabefertig und bleibt ansprechbar.',
    'founders.origin': 'Gegründet 2026 in Baden-Württemberg.',

    'closing.title': 'Sprechen wir über Ihre Prozesse.',
    'closing.sub': 'Im Erstgespräch klären wir in 30 Minuten, wo Automatisierung bei Ihnen am meisten bewirkt. Unverbindlich.',
    'closing.cta': 'Erstgespräch vereinbaren',

    'footer.project': 'Projekt',
    'footer.contact': 'Kontakt',
    'footer.legal.impressum': 'Impressum',
    'footer.legal.datenschutz': 'Datenschutz',
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
    'a11y.flowDiagram': 'Diagram: manual workflows become one automated process',
    'a11y.processDiagram': 'Flow: three phases from analysis to steady operation',
    'a11y.legalNav': 'Legal',

    'nav.leistungen': 'Services',
    'nav.vorgehen': 'Approach',
    'nav.ueberUns': 'About',
    'nav.kontakt': 'Contact',

    'hero.kicker': 'Automation · AI agents · Dashboards · Custom software',
    'hero.h1a': 'Processes that',
    'hero.h1b': 'run themselves.',
    'hero.sub':
      'We build the software that takes recurring work off your plate — from automation to AI agents. Built in Germany, GDPR-first, documented for handover.',
    'hero.ctaPrimary': 'Book an intro call',
    'hero.ctaSecondary': 'See services',
    'flow.in1': 'Manual workflows',
    'flow.in2': 'Scattered data',
    'flow.in3': 'Recurring tasks',
    'flow.out': 'runs by itself',

    'tb.loc.label': 'Location',
    'tb.loc.value': 'Baden-Württemberg',
    'tb.privacy.label': 'Data privacy',
    'tb.privacy.value': 'Your data stays in Germany',
    'tb.rev.label': 'Revision',
    'tb.rev.value': '07/2026',

    'marquee.gdpr': 'GDPR-compliant',
    'marquee.handover': 'Documented for handover',
    'marquee.origin': 'Built in Germany',
    'marquee.fixed': 'Fixed-price entry',

    'problems.kicker': 'Item list · known friction points',
    'problems.title': 'Where daily work gets stuck.',
    'problems.col.pos': 'Item',
    'problems.col.title': 'Friction point',
    'problems.col.note': 'Consequence',
    'problems.1.pos': 'Item A',
    'problems.1.title': 'Knowledge lives in heads and files',
    'problems.1.note': 'When one person is out, the process stops.',
    'problems.2.pos': 'Item B',
    'problems.2.title': 'Systems don’t talk to each other',
    'problems.2.note': 'Data is moved by hand — every single day.',
    'problems.3.pos': 'Item C',
    'problems.3.title': 'Numbers arrive too late',
    'problems.3.note': 'By the time the report is done, it’s outdated.',

    'services.kicker': 'Services · KF-01–KF-04',
    'services.title': 'Four routes, one result: less manual work.',
    'services.1.id': 'KF-01',
    'services.1.title': 'Automation',
    'services.1.note': 'Recurring workflows run without intervention — reliable, traceable, documented.',
    'services.2.id': 'KF-02',
    'services.2.title': 'AI agents',
    'services.2.note': 'Assistants that work on your data: sorting, answering, preparing.',
    'services.3.id': 'KF-03',
    'services.3.title': 'Dashboards',
    'services.3.note': 'Your key figures live on one screen — instead of twenty files.',
    'services.4.id': 'KF-04',
    'services.4.title': 'Custom software',
    'services.4.note': 'When off-the-shelf doesn’t fit: tools built exactly for your workflow.',

    'process.kicker': 'Approach · Phase 1→3',
    'process.title': 'Three phases. Fixed-price entry.',
    'process.1.phase': 'Phase 1',
    'process.1.title': 'Process audit',
    'process.1.duration': '1 week',
    'process.1.note': 'We map 3–5 workflows, quantify the hours lost and deliver a prioritised implementation plan.',
    'process.1.price': '€1,900 fixed',
    'process.2.phase': 'Phase 2',
    'process.2.title': 'Implementation sprint',
    'process.2.duration': '2–4 weeks',
    'process.2.note': 'The most important item from the plan, implemented end to end — including rollout and documentation.',
    'process.2.price': '€7,500–12,000 by scope',
    'process.3.phase': 'Phase 3',
    'process.3.title': 'Operations & growth',
    'process.3.duration': 'ongoing',
    'process.3.note': 'We monitor, maintain and extend — your processes keep moving.',
    'process.3.price': '€1,200/month',
    'process.priceNote': 'All prices net of VAT · Phase 3: three-month minimum term',

    'demo.kicker': 'Demo · Musterfirma GmbH · fictional data',
    'demo.title': 'What it looks like when it runs.',
    'demo.sub': 'A sample dashboard the way yours could look — the numbers update themselves.',
    'demo.kpi1.label': 'Automated operations/month',
    'demo.kpi1.value': '1482',
    'demo.kpi2.label': 'Hours saved/month',
    'demo.kpi2.value': '214',
    'demo.kpi3.label': 'Transfer errors',
    'demo.kpi3.value': '0',
    'demo.live.label': 'Operations per hour · running',
    'demo.live.badge': 'live',
    'demo.chart.label': 'Lead time per order · minutes',
    'demo.chart.before': 'before',
    'demo.chart.after': 'after',

    'founders.kicker': 'About us · founded 2026',
    'founders.title': 'Two founders, one principle: understand first, then build.',
    'founders.1.role': 'Sales & process understanding',
    'founders.1.note': 'Knows the Mittelstand from the inside — and turns your day-to-day into clear requirements.',
    'founders.2.role': 'Engineering & delivery',
    'founders.2.note': 'Builds the solution, documents it for handover and stays reachable.',
    'founders.origin': 'Founded 2026 in Baden-Württemberg.',

    'closing.title': 'Let’s talk about your processes.',
    'closing.sub': 'In a 30-minute intro call we find out where automation moves the needle most for you. No strings attached.',
    'closing.cta': 'Book an intro call',

    'footer.project': 'Project',
    'footer.contact': 'Contact',
    'footer.legal.impressum': 'Imprint',
    'footer.legal.datenschutz': 'Privacy',
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
