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
    'meta.title': 'NexBridge-IT – Prozesse, die von selbst laufen',
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
    'nav.teaser': 'Teaser',

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
    'tb.rev.value': '08/2026',

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

    'services.kicker': 'Leistungen · NB-01–NB-04',
    'services.title': 'Vier Wege, ein Ergebnis: weniger Handarbeit.',
    'services.1.id': 'NB-01',
    'services.1.title': 'Automatisierung',
    'services.1.note': 'Wiederkehrende Aufgaben laufen ohne Ihr Zutun – zuverlässig, nachvollziehbar, dokumentiert.',
    'services.2.id': 'NB-02',
    'services.2.title': 'KI-Agenten',
    'services.2.note': 'Assistenten, die mit Ihren Daten arbeiten: sortieren, beantworten, vorbereiten.',
    'services.3.id': 'NB-03',
    'services.3.title': 'Dashboards',
    'services.3.note': 'Ihre Kennzahlen live auf einem Bildschirm – statt in zwanzig Dateien.',
    'services.4.id': 'NB-04',
    'services.4.title': 'Individualsoftware',
    'services.4.note': 'Wenn Standardsoftware nicht passt: Werkzeuge, exakt für Ihren Ablauf gebaut.',

    'process.kicker': 'Vorgehen · Phase 1→3',
    'process.title': 'Drei Phasen. Einstieg zum Festpreis.',
    'process.1.phase': 'Phase 1',
    'process.1.title': 'Prozess-Audit',
    'process.1.duration': '1 Woche',
    'process.1.note': 'Wir nehmen 3–5 Abläufe auf, beziffern die verlorenen Stunden und liefern einen Umsetzungsplan mit Prioritäten.',
    'process.1.price': '295 € Festpreis',
    'process.2.phase': 'Phase 2',
    'process.2.title': 'Umsetzungs-Sprint',
    'process.2.duration': '2–4 Wochen',
    'process.2.note': 'Wir setzen den wichtigsten Punkt aus dem Plan komplett um – inklusive Einführung und Dokumentation.',
    'process.2.price': 'Angebot nach Umfang',
    'process.3.phase': 'Phase 3',
    'process.3.title': 'Betrieb & Ausbau',
    'process.3.duration': 'laufend',
    'process.3.note': 'Wir überwachen, pflegen und erweitern – Ihre Prozesse bleiben in Bewegung.',
    'process.3.price': 'Angebot nach Bedarf',
    'process.priceNote':
      'Preis netto zzgl. USt. Phase 2 und 3 kalkulieren wir nach dem Ergebnis des Audits – Sie bekommen ein Festpreisangebot, bevor etwas gebaut wird.',

    // Projektverlauf — the narrative. Answers "what do I get" and the fear
    // nobody says out loud: "how much of MY time does this cost?"
    'story.kicker': 'Projektverlauf · vom Erstgespräch bis zum Betrieb',
    'story.title': 'Was passiert, wenn Sie sich melden.',
    'story.col.step': 'Schritt',
    'story.col.get': 'Sie erhalten',
    'story.col.effort': 'Ihr Aufwand',
    'story.1.marker': '01 · 30 Minuten',
    'story.1.title': 'Wir hören zu',
    'story.1.text':
      'Sie schildern, wo es klemmt. Wir sagen Ihnen, ob sich Automatisierung lohnt – auch wenn die Antwort nein lautet.',
    'story.1.get': 'Ehrliche Einschätzung',
    'story.1.effort': '30 Minuten',
    'story.2.marker': '02 · 1 Woche',
    'story.2.title': 'Wir sehen uns Ihre Abläufe an',
    'story.2.text':
      'Wir schauen dort hin, wo die Arbeit entsteht, und rechnen nach: Welcher Schritt kostet wie viel Zeit? Am Ende steht kein Konzept, sondern ein Plan mit Zahlen.',
    'story.2.get': 'Umsetzungsplan mit Zahlen',
    'story.2.effort': 'rund 3 Stunden',
    'story.3.marker': '03 · 2–4 Wochen',
    'story.3.title': 'Wir bauen – Sie sehen jede Woche den Stand',
    'story.3.text':
      'Wir bauen um Ihre bestehenden Systeme herum. Kein Systemwechsel, kein Stillstand im Tagesgeschäft. Ihre Daten bleiben dort, wo sie heute liegen.',
    'story.3.get': 'Lauffähige Zwischenstände',
    'story.3.effort': 'rund 1 Stunde pro Woche',
    'story.4.marker': '04 · 1 Tag',
    'story.4.title': 'Wir übergeben, Sie übernehmen',
    'story.4.text':
      'Sie bekommen alle Zugänge, den Quellcode und eine Dokumentation auf Deutsch. Danach können Sie mit uns weiterarbeiten – müssen es aber nicht.',
    'story.4.get': 'Zugänge, Quellcode, Dokumentation, Einweisung',
    'story.4.effort': '1 Termin, rund 30 Minuten',
    'story.4.effortShort': 'rund 30 Minuten',
    'story.5.marker': '05 · laufend',
    'story.5.title': 'Es läuft – wir bleiben erreichbar',
    'story.5.text':
      'Wir überwachen den Betrieb und erweitern, wenn Sie es brauchen. Wenn nicht, läuft Ihre Lösung auch ohne uns weiter.',
    'story.5.get': 'Betrieb & Ausbau',
    'story.5.effort': 'keiner',
    'story.note':
      'Ihre Daten bleiben in Ihren Systemen. Was wir selbst verarbeiten, hosten wir standardmäßig in Deutschland – Ausnahmen klären wir vor Projektstart.',

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
    'closing.sub':
      '30 Minuten, kostenlos, kein Verkaufsgespräch. Danach wissen Sie, was sich in Ihrem Fall automatisieren lässt – und was besser so bleibt, wie es ist.',
    'closing.cta': 'Erstgespräch vereinbaren',
    'form.name': 'Name',
    'form.company': 'Unternehmen',
    'form.email': 'E-Mail',
    'form.message': 'Worum geht es?',
    'form.messagePlaceholder': 'Welcher Ablauf kostet Sie gerade am meisten Zeit?',
    'form.consent':
      'Ich bin damit einverstanden, dass meine Angaben zur Beantwortung meiner Anfrage verarbeitet werden.',
    'form.consentMore': 'Mehr dazu in der',
    'form.consentLink': 'Datenschutzerklärung',
    'form.submit': 'Anfrage senden',
    'form.sending': 'Wird gesendet …',
    'form.required': 'Bitte tragen Sie Ihren Namen ein.',
    'form.invalidEmail': 'Bitte geben Sie eine gültige E-Mail-Adresse an.',
    'form.consentRequired':
      'Bitte setzen Sie noch den Haken – ohne Zustimmung dürfen wir Ihre Anfrage nicht bearbeiten.',
    'form.success': 'Danke – Ihre Anfrage ist unterwegs. Wir melden uns innerhalb eines Werktags.',
    'form.fallbackNote':
      'Ihr E-Mail-Programm öffnet sich mit der fertigen Nachricht. Bitte einmal abschicken – dann ist sie bei uns.',
    'form.orMail': 'Lieber direkt schreiben?',
    'form.noscript': 'Dieses Formular braucht JavaScript. Schreiben Sie uns gern direkt an',
    // Used to build the fallback email itself — never shown on the page.
    'form.mailSubject': 'Anfrage über die Website',
    'form.mailMessageLabel': 'Nachricht',
    'form.mailEmpty': '–',
    'trust.response': 'Antwort innerhalb eines Werktags',
    'trust.noSales': 'Kein Verkaufsgespräch',
    'trust.dataStays': 'Ihre Angaben bleiben bei uns',

    'footer.project': 'Projekt',
    'footer.contact': 'Kontakt',
    'footer.legal.impressum': 'Impressum',
    'footer.legal.datenschutz': 'Datenschutz',

    /*
     * Teaser page (D-056). The cards carry the name, the part number and the
     * status — nothing about what the films show. Nobody has watched them in a
     * build session, and CLAUDE.md rule 1 forbids inventing the content; a
     * description line gets added here once the founder writes one.
     */
    'teaser.meta.title': 'Teaser – NexBridge-IT',
    'teaser.meta.description':
      'Zwei Filme von NexBridge-IT. Den vollständigen Film sehen Sie mit einem vierstelligen Code, den Sie von uns bekommen.',
    'teaser.kicker': 'Filme · Zugang mit Code',
    'teaser.title': 'Zwei Filme.',
    /* "Diese beiden Filme zeigen wir nicht öffentlich" was false: the page, the
       cards and the blurred loops are public — only the full films are not. */
    'teaser.intro':
      'Die vollständigen Filme zeigen wir nicht öffentlich. Den vierstelligen Code bekommen Sie von uns – im Gespräch oder per E-Mail.',
    'teaser.1.name': 'Teaser 1',
    'teaser.2.name': 'Teaser 2',
    /* "Film-Nr.", not "Teil-Nr.": a film is not a part in a Stückliste. */
    'teaser.field.part': 'Film-Nr.',
    'teaser.field.status': 'Status',
    /* gesperrt / freigegeben is the Freigabevermerk pair from a real
       Zeichnungskopf — the metaphor the card is built on. "frei" would read
       as vacant or free of charge. */
    'teaser.locked': 'gesperrt',
    'teaser.unlocked': 'freigegeben',
    'teaser.hint': 'Code eingeben',
    'teaser.hintUnlocked': 'Film ansehen',
    'teaser.pending': 'Film folgt',
    'teaser.dialog.intro': 'Bitte geben Sie die vier Ziffern ein, die Sie von uns bekommen haben.',
    'teaser.dialog.label': 'Vierstelliger Code',
    'teaser.dialog.submit': 'Film öffnen',
    'teaser.dialog.checking': 'Wird geprüft …',
    /* Stays true when the network, not the visitor, is at fault — the same
       message fires from the catch branch in scripts/teaser.ts. */
    'teaser.dialog.error':
      'Der Film lässt sich mit diesem Code nicht öffnen. Bitte prüfen Sie die vier Ziffern.',
    'teaser.dialog.close': 'Schließen',
    'teaser.noJs': 'Die Filme brauchen JavaScript. Bitte aktivieren Sie es, um sie anzusehen.',
    'a11y.teaserDigit': 'Ziffer',
    'a11y.teaserPlayer': 'Vollständiger Film',

    /*
     * Statistik (/statistik — D-063). An internal datasheet for the two
     * founders: the self-hosted, cookieless visit counts. Not in the nav,
     * noindex, behind a key. German is DRAFT for the copywriter-de gate.
     * The numbers themselves never pass through here — scripts/stats.ts
     * formats them with Intl from the API's JSON.
     */
    'stats.meta.title': 'Statistik – NexBridge-IT',
    'stats.meta.description': 'Interne Besuchsstatistik von nexbridge-it.com.',
    'stats.kicker': 'Statistik · intern',
    'stats.title': 'Wer war da.',
    'stats.intro':
      'Besuche auf nexbridge-it.com: wie viele kommen, klicken, bis zum Ende scrollen und anfragen – dazu welche Seiten, woher und womit. Ohne Cookies. IP-Adressen speichern wir nicht.',
    'stats.noJs': 'Diese Seite braucht JavaScript. Bitte aktivieren Sie es, um die Zahlen zu sehen.',
    'stats.key.label': 'Schlüssel',
    'stats.key.submit': 'Zahlen anzeigen',
    'stats.key.checking': 'Wird geprüft …',
    'stats.key.wrong': 'Dieser Schlüssel passt nicht. Bitte prüfen Sie die Eingabe.',
    'stats.key.forget': 'Abmelden',
    'stats.range.label': 'Zeitraum',
    'stats.range.7': '7 Tage',
    'stats.range.30': '30 Tage',
    'stats.range.90': '90 Tage',
    'stats.refresh': 'Aktualisieren',
    'stats.exclude': 'Eigene Besuche in diesem Browser nicht zählen',
    'stats.head.fetched': 'Stand',
    'stats.kpi.views': 'Aufrufe',
    'stats.kpi.visitors': 'Besucher',
    /* The visitor hash rotates daily, so this is a sum of daily uniques —
       the label has to say so, or the number reads as more than it is. */
    'stats.kpi.visitorsNote': 'je Tag eindeutig, summiert',
    'stats.kpi.events': 'Aktionen',
    'stats.chart.title': 'Aufrufe und Besucher je Tag',
    'stats.chart.empty': 'Noch keine Aufrufe in diesem Zeitraum.',
    'stats.table.pages': 'Seiten',
    'stats.table.referrers': 'Herkunft',
    'stats.table.countries': 'Länder',
    'stats.table.devices': 'Geräte',
    'stats.table.langs': 'Sprachen',
    'stats.table.events': 'Aktionen',
    'stats.table.days': 'Tage',
    'stats.table.daysToggle': 'Als Tabelle',
    'stats.table.funnelToggle': 'Stufen als Tabelle',
    'stats.col.path': 'Pfad',
    'stats.col.views': 'Aufrufe',
    'stats.col.visitors': 'Besucher',
    'stats.col.ref': 'Quelle',
    'stats.col.country': 'Land',
    'stats.col.device': 'Gerät',
    'stats.col.lang': 'Sprache',
    'stats.col.event': 'Aktion',
    'stats.col.count': 'Anzahl',
    'stats.col.day': 'Tag',
    'stats.direct': 'direkt',
    'stats.device.mobile': 'Mobilgerät',
    'stats.device.tablet': 'Tablet',
    'stats.device.desktop': 'Desktop',
    'stats.device.unknown': 'unbekannt',
    'stats.error.network': 'Die Zahlen lassen sich gerade nicht laden. Bitte versuchen Sie es noch einmal.',
    'stats.loading': 'Wird geladen …',
    /* Mechanism, not a Datenschutz clause. "IP-Adressen speichern wir nicht"
       is the honest form: the Worker hashes the IP under a daily salt and
       keeps neither (worker/stats.js), so "ohne IP-Adressen" overstated it. */
    'stats.note':
      'Wir zählen Seitenaufrufe, Klicks auf einzelne Schaltflächen und Links sowie das Absenden des Kontaktformulars. Außerdem erfassen wir, ob eine Seite bis zum Ende gescrollt wurde. Cookies setzen wir nicht, IP-Adressen speichern wir nicht. Besucher unterscheiden wir über eine Kennung, die täglich wechselt – wer an zwei Tagen kommt, zählt zweimal. Mit dem Häkchen oben nehmen Sie Ihre eigenen Besuche in diesem Browser aus der Zählung.',
    'a11y.statsChart': 'Pegel: Aufrufe und Besucher je Tag im gewählten Zeitraum',
    /* The opt-out control under Datenschutz §10 (D-064). Not legal text: a
       button label and three status lines about this browser. */
    'legal.optOut.disable': 'Messung in diesem Browser abschalten',
    'legal.optOut.enable': 'Messung in diesem Browser wieder einschalten',
    'legal.optOut.stateOn': 'Die Messung ist in diesem Browser aktiv.',
    'legal.optOut.stateOff': 'Die Messung ist in diesem Browser abgeschaltet.',
    'legal.optOut.stateBrowser':
      'Die Messung ist in diesem Browser bereits durch Ihre Browser-Einstellung abgeschaltet.',
    'a11y.statsKey': 'Schlüssel für die Statistik',
    /*
     * Strom (D-066): the funnel as a river of light. This block passed
     * copywriter-de on 2026-09-16 (the stage names already had, as the
     * Messbank's, D-065). Placeholders: {s} = seconds to the next poll,
     * {k} = visitors per particle — scripts/stats.ts substitutes both.
     * The scale line uses '=' — the German dot-density legend form — because
     * '≙' is not in Fragment Mono and fell back to a foreign glyph at 11px.
     * "Pegel" and "Zuläufe" carry no article: labels, not titles.
     */
    'stats.datum.next': 'nächste Aktualisierung in {s} s',
    'stats.strom.title': 'Vom Besuch zur Anfrage',
    'stats.strom.stage.visitors': 'Besucher',
    'stats.strom.stage.engaged': 'Geklickt',
    'stats.strom.stage.end': 'Bis zum Ende',
    'stats.strom.stage.enquiries': 'Anfragen',
    'stats.strom.arrow': '→',
    'stats.strom.scaleOne': '1 Punkt = 1 Besucher',
    'stats.strom.scaleMany': '1 Punkt = {k} Besucher',
    'stats.pegel.title': 'Pegel',
    'stats.ledgers.title': 'Zuläufe',
    'stats.table.funnel': 'Vom Besuch zur Anfrage',
    'stats.col.stage': 'Stufe',
    'stats.col.share': 'Anteil',
    'stats.col.step': 'Zur Vorstufe',
    'stats.chart.today': 'heute',
    /* "Besucherstrom", not "Strom": heard cold, "Strom" is electricity. */
    'a11y.statsStrom':
      'Besucherstrom: vier Stufen vom Besuch zur Anfrage im gewählten Zeitraum – Besucher, davon geklickt, bis zum Ende gescrollt, angefragt. Alle Zahlen stehen in der Tabelle darunter.',

    /*
     * Digital business cards (/karte/<slug> — the NB-VK register). All German
     * card copy is DRAFT for the copywriter-de gate; names, numbers and the
     * address come from site.ts via config/cards.ts, never from here.
     */
    'card.meta.description': 'Digitale Visitenkarte. Kontakt speichern, anrufen oder direkt schreiben.',
    'card.1.role': 'Vertrieb & Partnerschaften',
    'card.2.role': 'Technik & Umsetzung',
    'card.row.phone': 'Telefon',
    'card.row.email': 'E-Mail',
    'card.row.web': 'Website',
    'card.row.address': 'Anschrift',
    'card.save': 'Kontakt speichern',
    'card.call': 'Anrufen',
    'card.mail': 'E-Mail schreiben',
    'card.share': 'Karte teilen',
    'card.shareCopied': 'Link kopiert',
    'card.a11y.vcard': 'vCard herunterladen',
    'cardIndex.meta.title': 'Kartenverzeichnis – NexBridge-IT',
    'cardIndex.meta.description': 'Verzeichnis der digitalen Visitenkarten von NexBridge-IT.',
    'cardIndex.kicker': 'Verzeichnis · NB-VK',
    'cardIndex.title': 'Kartenverzeichnis',

    /*
     * The `en` twins of these keys are required by the type constraint but are
     * never rendered: 404.astro is German-only, because Cloudflare serves one
     * dist/404.html for every unmatched path — English included. Keep them
     * correct, do not spend time tuning them until an English 404 route exists.
     */
    'notFound.meta.title': 'Seite nicht gefunden – NexBridge-IT',
    'notFound.meta.description': 'Diese Adresse existiert nicht. Zurück zur Startseite.',
    'notFound.heading': 'Diese Seite gibt es nicht.',
    'notFound.body':
      'Entweder stimmt die Adresse nicht, oder die Seite ist umgezogen. Auf der Startseite finden Sie Leistungen, Vorgehen und Kontakt.',
    'notFound.labelStatus': 'Status',
    'notFound.labelPath': 'Adresse',
    'notFound.cta': 'Zur Startseite',
    'notFound.ctaEn': 'Switch to English',
  },
  en: {
    'meta.title': 'NexBridge-IT — Processes that run themselves',
    'meta.description':
      'Automation, AI agents, dashboards and custom applications for Germany’s Mittelstand. Built in Germany, GDPR-first, documented for handover.',
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
    'nav.teaser': 'Teaser',

    'hero.kicker': 'Automation · AI agents · Dashboards · Custom applications',
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
    'tb.rev.value': '08/2026',

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

    'services.kicker': 'Services · NB-01–NB-04',
    'services.title': 'Four routes, one result: less manual work.',
    'services.1.id': 'NB-01',
    'services.1.title': 'Automation',
    'services.1.note': 'Recurring workflows run without intervention — reliable, traceable, documented.',
    'services.2.id': 'NB-02',
    'services.2.title': 'AI agents',
    'services.2.note': 'Assistants that work on your data: sorting, answering, preparing.',
    'services.3.id': 'NB-03',
    'services.3.title': 'Dashboards',
    'services.3.note': 'Your key figures live on one screen — instead of twenty files.',
    'services.4.id': 'NB-04',
    'services.4.title': 'Custom applications',
    'services.4.note': 'When off-the-shelf doesn’t fit: tools built exactly for your workflow.',

    'process.kicker': 'Approach · Phase 1→3',
    'process.title': 'Three phases. Fixed-price entry.',
    'process.1.phase': 'Phase 1',
    'process.1.title': 'Process audit',
    'process.1.duration': '1 week',
    'process.1.note': 'We map 3–5 workflows, quantify the hours lost and deliver a prioritised implementation plan.',
    'process.1.price': '€295 fixed',
    'process.2.phase': 'Phase 2',
    'process.2.title': 'Implementation sprint',
    'process.2.duration': '2–4 weeks',
    'process.2.note': 'The most important item from the plan, implemented end to end — including rollout and documentation.',
    'process.2.price': 'Quoted by scope',
    'process.3.phase': 'Phase 3',
    'process.3.title': 'Operations & growth',
    'process.3.duration': 'ongoing',
    'process.3.note': 'We monitor, maintain and extend — your processes keep moving.',
    'process.3.price': 'Quoted by need',
    'process.priceNote':
      'Price net of VAT. Phases 2 and 3 are costed from what the audit finds — you get a fixed-price quote before anything is built.',

    'story.kicker': 'Project log · from first call to steady operation',
    'story.title': 'What happens when you get in touch.',
    'story.col.step': 'Step',
    'story.col.get': 'You receive',
    'story.col.effort': 'Your time',
    'story.1.marker': '01 · 30 minutes',
    'story.1.title': 'We listen',
    'story.1.text':
      'You describe where things get stuck. We tell you whether automation is worth it — including when the answer is no.',
    'story.1.get': 'An honest assessment',
    'story.1.effort': '30 minutes',
    'story.2.marker': '02 · 1 week',
    'story.2.title': 'We look at how you actually work',
    'story.2.text':
      'We go where the work happens and do the arithmetic: which step costs how much time? What you get is not a concept, but a plan with numbers.',
    'story.2.get': 'Implementation plan with numbers',
    'story.2.effort': 'about 3 hours',
    'story.3.marker': '03 · 2–4 weeks',
    'story.3.title': 'We build — you see progress every week',
    'story.3.text':
      'We build around your existing systems. No migration, no standstill in daily business. Your data stays exactly where it is today.',
    'story.3.get': 'Working increments',
    'story.3.effort': 'about 1 hour per week',
    'story.4.marker': '04 · 1 day',
    'story.4.title': 'We hand over, you take ownership',
    'story.4.text':
      'You get every access, the source code and documentation in German. After that you can keep working with us — but you do not have to.',
    'story.4.get': 'Access, source code, documentation, training',
    'story.4.effort': '1 session, about 30 minutes',
    'story.4.effortShort': 'about 30 minutes',
    'story.5.marker': '05 · ongoing',
    'story.5.title': 'It runs — we stay reachable',
    'story.5.text':
      'We monitor operations and extend when you need it. If you do not, your solution keeps running without us.',
    'story.5.get': 'Operations & growth',
    'story.5.effort': 'none',
    'story.note':
      'Your data stays in your systems. What we process ourselves we host in Germany by default — any exception is agreed with you before the project starts.',

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
    'closing.sub':
      '30 minutes, free, no sales pitch. Afterwards you will know what can be automated in your case — and what is better left alone.',
    'closing.cta': 'Book an intro call',
    'form.name': 'Name',
    'form.company': 'Company',
    'form.email': 'Email',
    'form.message': 'What is this about?',
    'form.messagePlaceholder': 'Which workflow costs you the most time right now?',
    'form.consent': 'I agree that my details may be processed in order to answer my enquiry.',
    'form.consentMore': 'More on this in our',
    'form.consentLink': 'privacy policy',
    'form.submit': 'Send enquiry',
    'form.sending': 'Sending …',
    'form.required': 'Please enter your name.',
    'form.invalidEmail': 'Please enter a valid email address.',
    'form.consentRequired':
      'Please tick the box — without your consent we are not allowed to process your enquiry.',
    'form.success': 'Thank you — your enquiry is on its way. We reply within one working day.',
    'form.fallbackNote':
      'Your email client will open with the message ready to send. Please hit send once — then it reaches us.',
    'form.orMail': 'Prefer to write directly?',
    'form.noscript': 'This form needs JavaScript. You are welcome to write to us directly at',
    // Used to build the fallback email itself — never shown on the page.
    'form.mailSubject': 'Enquiry via the website',
    'form.mailMessageLabel': 'Message',
    'form.mailEmpty': '–',
    'trust.response': 'Reply within one working day',
    'trust.noSales': 'No sales pitch',
    'trust.dataStays': 'Your details stay with us',

    'footer.project': 'Project',
    'footer.contact': 'Contact',
    'footer.legal.impressum': 'Imprint',
    'footer.legal.datenschutz': 'Privacy',

    /* Teaser page (D-056) — English twin. */
    'teaser.meta.title': 'Teaser — NexBridge-IT',
    'teaser.meta.description':
      'Two films from NexBridge-IT. The full film plays with a four-digit code you get from us.',
    'teaser.kicker': 'Films · access by code',
    'teaser.title': 'Two films.',
    'teaser.intro':
      'We do not show the full films publicly. You get the four-digit code from us — in conversation or by email.',
    'teaser.1.name': 'Teaser 1',
    'teaser.2.name': 'Teaser 2',
    'teaser.field.part': 'Film no.',
    'teaser.field.status': 'Status',
    'teaser.locked': 'locked',
    'teaser.unlocked': 'released',
    'teaser.hint': 'Enter code',
    'teaser.hintUnlocked': 'Watch film',
    'teaser.pending': 'Film to follow',
    'teaser.dialog.intro': 'Please enter the four digits you received from us.',
    'teaser.dialog.label': 'Four-digit code',
    'teaser.dialog.submit': 'Open film',
    'teaser.dialog.checking': 'Checking …',
    'teaser.dialog.error': 'The film will not open with this code. Please check the four digits.',
    'teaser.dialog.close': 'Close',
    'teaser.noJs': 'The films need JavaScript. Please switch it on to watch them.',
    'a11y.teaserDigit': 'Digit',
    'a11y.teaserPlayer': 'Full film',

    /* Statistics page (D-063) — English twin. */
    'stats.meta.title': 'Statistics — NexBridge-IT',
    'stats.meta.description': 'Internal visit statistics for nexbridge-it.com.',
    'stats.kicker': 'Statistics · internal',
    'stats.title': 'Who was here.',
    'stats.intro':
      'Visits to nexbridge-it.com: how many come, click, scroll to the end and enquire — plus which pages, from where and on what. No cookies. We do not store IP addresses.',
    'stats.noJs': 'This page needs JavaScript. Please switch it on to see the numbers.',
    'stats.key.label': 'Key',
    'stats.key.submit': 'Show numbers',
    'stats.key.checking': 'Checking …',
    'stats.key.wrong': 'This key does not match. Please check what you typed.',
    'stats.key.forget': 'Sign out',
    'stats.range.label': 'Range',
    'stats.range.7': '7 days',
    'stats.range.30': '30 days',
    'stats.range.90': '90 days',
    'stats.refresh': 'Refresh',
    'stats.exclude': 'Do not count my own visits in this browser',
    'stats.head.fetched': 'As of',
    'stats.kpi.views': 'Views',
    'stats.kpi.visitors': 'Visitors',
    'stats.kpi.visitorsNote': 'unique per day, summed',
    'stats.kpi.events': 'Actions',
    'stats.chart.title': 'Views and visitors per day',
    'stats.chart.empty': 'No views in this range yet.',
    'stats.table.pages': 'Pages',
    'stats.table.referrers': 'Sources',
    'stats.table.countries': 'Countries',
    'stats.table.devices': 'Devices',
    'stats.table.langs': 'Languages',
    'stats.table.events': 'Actions',
    'stats.table.days': 'Days',
    'stats.table.daysToggle': 'As a table',
    'stats.table.funnelToggle': 'Stages as a table',
    'stats.col.path': 'Path',
    'stats.col.views': 'Views',
    'stats.col.visitors': 'Visitors',
    'stats.col.ref': 'Source',
    'stats.col.country': 'Country',
    'stats.col.device': 'Device',
    'stats.col.lang': 'Language',
    'stats.col.event': 'Action',
    'stats.col.count': 'Count',
    'stats.col.day': 'Day',
    'stats.direct': 'direct',
    'stats.device.mobile': 'Mobile device',
    'stats.device.tablet': 'Tablet',
    'stats.device.desktop': 'Desktop',
    'stats.device.unknown': 'unknown',
    'stats.error.network': 'The numbers will not load right now. Please try again.',
    'stats.loading': 'Loading …',
    'stats.note':
      'We count page views, clicks on individual buttons and links, and the sending of the contact form. We also record whether a page was scrolled to its end. We set no cookies and store no IP addresses. Visitors are told apart by a token that changes daily — someone who comes on two days counts twice. Tick the box above to leave your own visits in this browser out of the count.',
    'a11y.statsChart': 'Water level: views and visitors per day in the selected range',
    'legal.optOut.disable': 'Switch off measurement in this browser',
    'legal.optOut.enable': 'Switch measurement in this browser back on',
    'legal.optOut.stateOn': 'Measurement is active in this browser.',
    'legal.optOut.stateOff': 'Measurement is switched off in this browser.',
    'legal.optOut.stateBrowser':
      'Measurement is already switched off in this browser by your browser setting.',
    'a11y.statsKey': 'Key for the statistics',
    /* Strom (D-066) — English twin. */
    'stats.datum.next': 'next refresh in {s} s',
    'stats.strom.title': 'From visit to enquiry',
    'stats.strom.stage.visitors': 'Visitors',
    'stats.strom.stage.engaged': 'Clicked',
    'stats.strom.stage.end': 'To the end',
    'stats.strom.stage.enquiries': 'Enquiries',
    'stats.strom.arrow': '→',
    'stats.strom.scaleOne': '1 dot = 1 visitor',
    'stats.strom.scaleMany': '1 dot = {k} visitors',
    'stats.pegel.title': 'Water level',
    'stats.ledgers.title': 'Inflows',
    'stats.table.funnel': 'From visit to enquiry',
    'stats.col.stage': 'Stage',
    'stats.col.share': 'Share',
    'stats.col.step': 'vs. previous stage',
    'stats.chart.today': 'today',
    'a11y.statsStrom':
      'Visitor stream: four stages from visit to enquiry over the selected range — visitors, of whom clicked, scrolled to the end, enquired. All numbers are in the table below.',

    'card.meta.description': 'Digital business card. Save the contact, call or write directly.',
    'card.1.role': 'Sales & Partnerships',
    'card.2.role': 'Engineering & Delivery',
    'card.row.phone': 'Phone',
    'card.row.email': 'Email',
    'card.row.web': 'Website',
    'card.row.address': 'Address',
    'card.save': 'Save contact',
    'card.call': 'Call',
    'card.mail': 'Write an email',
    'card.share': 'Share card',
    'card.shareCopied': 'Link copied',
    'card.a11y.vcard': 'download vCard',
    'cardIndex.meta.title': 'Card index — NexBridge-IT',
    'cardIndex.meta.description': 'Directory of NexBridge-IT’s digital business cards.',
    'cardIndex.kicker': 'Index · NB-VK',
    'cardIndex.title': 'Card index',

    'notFound.meta.title': 'Page not found — NexBridge-IT',
    'notFound.meta.description': 'This page does not exist. Head back to the home page.',
    'notFound.heading': 'This page does not exist.',
    'notFound.body':
      'The address may contain a typo, or the page has moved. Services, approach and contact are all on the home page.',
    'notFound.labelStatus': 'Status',
    'notFound.labelPath': 'Address',
    'notFound.cta': 'Back to the home page',
    'notFound.ctaEn': 'Zu Deutsch wechseln',
  },
} as const satisfies Record<Lang, Record<string, string>>;

export type UiKey = keyof (typeof ui)['de'];

/**
 * Real parity guard between the two blocks.
 *
 * `satisfies Record<Lang, Record<string, string>>` above does NOT enforce it —
 * both blocks only have to have string keys — and `UiKey` derives from German
 * alone, so a key present in `de` and missing from `en` type-checks, builds
 * clean, and makes `t()` silently serve German on the English page. That is
 * not hypothetical: it happened while the teaser page was being built, and the
 * build stayed green (qa gate, D-056).
 *
 * These two lines fail `npm run check` the moment either block gains or loses
 * a key the other does not have. They cost nothing at runtime — they are types.
 */
type AssertKeys<T extends Record<K, string>, K extends string> = T;
type _EnCoversDe = AssertKeys<(typeof ui)['en'], UiKey>;
type _DeCoversEn = AssertKeys<(typeof ui)['de'], keyof (typeof ui)['en']>;

export function useTranslations(lang: Lang) {
  return function t(key: UiKey): string {
    return ui[lang][key] ?? ui[defaultLang][key];
  };
}

/**
 * Path of the same page in the other language. Mostly `/x` ↔ `/en/x`; two
 * first segments are translated: `/karte/*` ↔ `/en/card/*` (both slugs fixed
 * because printed QR codes point at them) and `/statistik` ↔ `/en/stats`
 * (D-063). Only the first segment is mapped, and only as a whole word —
 * `/stats` does not match `/statistik`.
 */
const SEGMENT_DE_EN = { karte: 'card', statistik: 'stats' } as const;
const SEGMENT_EN_DE = { card: 'karte', stats: 'statistik' } as const;

export function altPath(lang: Lang, path: string): string {
  if (lang === 'de') {
    if (path === '/') return '/en/';
    return `/en${path.replace(
      /^\/(karte|statistik)(?=\/|$)/,
      (_, seg: keyof typeof SEGMENT_DE_EN) => `/${SEGMENT_DE_EN[seg]}`,
    )}`;
  }
  const stripped = path
    .replace(/^\/en\/?/, '/')
    .replace(/^\/(card|stats)(?=\/|$)/, (_, seg: keyof typeof SEGMENT_EN_DE) => `/${SEGMENT_EN_DE[seg]}`);
  return stripped === '' ? '/' : stripped;
}
