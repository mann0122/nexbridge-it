/**
 * Impressum and Datenschutzerklärung — D-036.
 *
 * SOURCE OF TRUTH: the founder's documents (`Impressum Homepage.docx`,
 * `Datenschutzerklärung Homepage.docx`, 2026-08-03). The German text here is
 * verbatim from those files. CLAUDE.md rule 4 — legal wording is never
 * invented or "improved" here; final review belongs to a lawyer.
 *
 * Two kinds of edit were made to the German draft, and only these two:
 *
 *  1. Notes addressed to whoever completes the document ("Bitte ergänzen Sie
 *     hier…", "[Hosting-Anbieter]", "[Speicherdauer …]") are replaced with
 *     VERIFIABLE FACTS about this site's own stack — the host is Cloudflare
 *     (D-022), no cookies are set, no analytics is installed (`site.ts`
 *     `plausibleDomain` and `cfAnalyticsToken` are both empty), fonts are
 *     self-hosted via Fontsource, and the contact form has no endpoint so it
 *     hands the message to the visitor's own mail client. Those sentences are
 *     instructions to an author, not text for a reader; shipping them would
 *     have been worse than wrong.
 *  2. "Stand: 09/2026" was future-dated and is corrected to 08/2026.
 *
 * Still open for the lawyer, deliberately NOT resolved here — see D-036:
 *  · §4 log retention is our host's policy, not ours, so no number is claimed.
 *  · §15 third-country transfer is live the moment Cloudflare is named; the
 *    adequacy wording is a legal call.
 *  · §5 Art. 28 AVV — Cloudflare's DPA must be accepted in the account.
 *
 * The ENGLISH text is a convenience translation. It carries the standard
 * "German version prevails" clause, which is what stops a translation from
 * becoming a second, drifting legal text. It has not been lawyer-reviewed.
 *
 * Address, phone and representatives are NOT duplicated here — they come from
 * `site.ts` so there is exactly one place to change them.
 */
import type { Lang } from './ui';

export interface LegalSection {
  heading: string;
  body: string[];
}

export interface ImpressumDoc {
  title: string;
  basis: string;
  headings: {
    provider: string;
    represented: string;
    contact: string;
    vat: string;
    dispute: string;
    liability: string;
  };
  labels: { phone: string; email: string };
  vat: string;
  dispute: string;
  liability: string;
}

export interface DatenschutzDoc {
  title: string;
  controllerLead: string;
  sections: LegalSection[];
  revisionLabel: string;
}

export interface LegalDoc {
  impressum: ImpressumDoc;
  datenschutz: DatenschutzDoc;
  /** Rendered only on /en/ — names the German text as the binding one. */
  translationNote: string | null;
}

export const legal = {
  de: {
    impressum: {
      title: 'Impressum',
      basis: 'Angaben gemäß § 5 Digitale-Dienste-Gesetz (DDG)',
      headings: {
        provider: 'Diensteanbieter',
        represented: 'Vertreten durch',
        contact: 'Kontakt',
        vat: 'Umsatzsteuer-ID / Wirtschafts-ID',
        dispute: 'Verbraucherstreitbeilegung',
        liability: 'Haftungshinweis',
      },
      labels: { phone: 'Telefon', email: 'E-Mail' },
      vat: 'Wir arbeiten als Freelancer, Einzelunternehmer mit stetigem Sitz in Deutschland',
      dispute:
        'Wir sind nicht bereit und nicht verpflichtet, an Streitbeilegungsverfahren vor einer Verbraucherschlichtungsstelle teilzunehmen.',
      liability:
        'Trotz sorgfältiger inhaltlicher Kontrolle übernehmen wir keine Haftung für die Inhalte externer Links. Für den Inhalt verlinkter Seiten sind ausschließlich deren Betreiber verantwortlich.',
    },
    datenschutz: {
      title: 'Datenschutzerklärung',
      controllerLead:
        'Verantwortlich für die Verarbeitung personenbezogener Daten auf dieser Website ist:',
      revisionLabel: 'Stand',
      sections: [
        {
          heading: '2. Datenschutzbeauftragter',
          body: [
            'Sofern ein Datenschutzbeauftragter bestellt wurde, erreichen Sie diesen unter der oben genannten E-Mail-Adresse.',
          ],
        },
        {
          heading: '3. Allgemeine Hinweise zur Datenverarbeitung',
          body: [
            'Wir verarbeiten personenbezogene Daten nur, soweit dies zur Bereitstellung einer funktionsfähigen Website, zur Bearbeitung Ihrer Anfragen, zur Durchführung vorvertraglicher oder vertraglicher Maßnahmen, zur Erfüllung gesetzlicher Pflichten oder zur Wahrung berechtigter Interessen erforderlich ist.',
            'Rechtsgrundlagen der Verarbeitung sind insbesondere Art. 6 Abs. 1 lit. a DSGVO bei Einwilligungen, Art. 6 Abs. 1 lit. b DSGVO bei Vertrags- oder vorvertraglichen Maßnahmen, Art. 6 Abs. 1 lit. c DSGVO bei rechtlichen Verpflichtungen und Art. 6 Abs. 1 lit. f DSGVO bei berechtigten Interessen.',
          ],
        },
        {
          heading: '4. Bereitstellung der Website und Server-Logfiles',
          body: [
            'Beim Aufruf unserer Website erhebt und speichert der Webserver automatisch Informationen in sogenannten Server-Logfiles. Dazu können insbesondere folgende Daten gehören: IP-Adresse, Datum und Uhrzeit des Zugriffs, abgerufene Seite oder Datei, Referrer-URL, Browsertyp und Browserversion, verwendetes Betriebssystem, übertragene Datenmenge sowie der anfragende Provider.',
            'Die Verarbeitung erfolgt zur technischen Bereitstellung, Stabilität, Sicherheit und Optimierung der Website. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Unser berechtigtes Interesse liegt in einem sicheren, zuverlässigen und störungsfreien Betrieb unserer Website.',
            'Wir betreiben keine eigenen Server und führen keine eigenen Server-Logfiles. Erhebung, Speicherung und Löschung erfolgen durch unseren Hosting-Anbieter nach dessen Fristen, sofern keine längere Speicherung zur Aufklärung von Sicherheitsvorfällen erforderlich ist.',
          ],
        },
        {
          heading: '5. Hosting und Auftragsverarbeitung',
          body: [
            'Unsere Website wird bei Cloudflare, Inc. (101 Townsend Street, San Francisco, CA 94107, USA) gehostet. Der Hosting-Anbieter verarbeitet personenbezogene Daten, die beim Besuch der Website anfallen, in unserem Auftrag. Hierzu können insbesondere IP-Adressen, technische Zugriffsdaten und Kommunikationsdaten gehören.',
            'Wir haben mit dem Hosting-Anbieter einen Vertrag zur Auftragsverarbeitung gemäß Art. 28 DSGVO abgeschlossen, sofern dies datenschutzrechtlich erforderlich ist. Die Verarbeitung erfolgt auf Grundlage unseres berechtigten Interesses an einer sicheren und effizienten Bereitstellung unseres Online-Angebots gemäß Art. 6 Abs. 1 lit. f DSGVO.',
          ],
        },
        {
          heading: '6. Kontaktaufnahme per E-Mail, Telefon oder Kontaktformular',
          body: [
            'Wenn Sie uns per E-Mail, Telefon oder über ein Kontaktformular kontaktieren, verarbeiten wir die von Ihnen übermittelten personenbezogenen Daten, beispielsweise Name, E-Mail-Adresse, Telefonnummer, Betreff, Nachricht sowie weitere freiwillige Angaben.',
            'Das Kontaktformular auf dieser Website überträgt Ihre Angaben derzeit nicht an einen eigenen Server. Es öffnet eine vorbereitete E-Mail in Ihrem E-Mail-Programm; der Versand erfolgt anschließend über Ihren eigenen E-Mail-Anbieter.',
            'Die Verarbeitung erfolgt zur Bearbeitung Ihrer Anfrage und zur Kommunikation mit Ihnen. Soweit Ihre Anfrage auf den Abschluss oder die Durchführung eines Vertrags gerichtet ist, ist Art. 6 Abs. 1 lit. b DSGVO Rechtsgrundlage. In anderen Fällen erfolgt die Verarbeitung auf Grundlage unseres berechtigten Interesses an der sachgerechten Bearbeitung von Anfragen gemäß Art. 6 Abs. 1 lit. f DSGVO.',
            'Die Daten werden gelöscht, sobald Ihre Anfrage abschließend bearbeitet wurde und keine gesetzlichen Aufbewahrungspflichten entgegenstehen.',
          ],
        },
        {
          heading: '7. Leistungen von NexBridge-IT und Kundenkommunikation',
          body: [
            'Im Rahmen unserer IT-Dienstleistungen, Beratung, Projektanbahnung, Angebotserstellung, Vertragsdurchführung und Kundenbetreuung verarbeiten wir personenbezogene Daten von Interessenten, Kunden, Ansprechpartnern und Geschäftspartnern. Dazu können insbesondere Kontaktdaten, Kommunikationsdaten, Vertragsdaten, Projektinformationen, Abrechnungsdaten und technische Informationen gehören, die für die jeweilige Leistung erforderlich sind.',
            'Rechtsgrundlagen sind Art. 6 Abs. 1 lit. b DSGVO, soweit die Verarbeitung zur Durchführung vorvertraglicher Maßnahmen oder eines Vertrags erforderlich ist, Art. 6 Abs. 1 lit. c DSGVO, soweit gesetzliche Pflichten bestehen, und Art. 6 Abs. 1 lit. f DSGVO, soweit wir ein berechtigtes Interesse an effizienter Geschäftsorganisation, Kundenpflege und rechtssicherer Dokumentation haben.',
          ],
        },
        {
          heading: '8. Cookies und ähnliche Technologien',
          body: [
            'Derzeit setzen wir auf dieser Website keine Cookies ein – weder technisch notwendige noch Analyse-, Marketing- oder Tracking-Cookies.',
            'Sollten künftig Cookies eingesetzt werden, gilt: Technisch notwendige Cookies dienen der Bereitstellung grundlegender Funktionen der Website und können ohne Einwilligung eingesetzt werden, soweit sie für den Betrieb erforderlich sind. Für nicht notwendige Cookies holen wir vorab Ihre Einwilligung ein. Rechtsgrundlage für den Zugriff auf Informationen auf Ihrem Endgerät ist § 25 TDDDG. Die anschließende Verarbeitung personenbezogener Daten erfolgt bei Einwilligung auf Grundlage von Art. 6 Abs. 1 lit. a DSGVO. Sie können eine erteilte Einwilligung jederzeit mit Wirkung für die Zukunft widerrufen.',
          ],
        },
        {
          heading: '9. Consent-Management-Tool',
          body: [
            'Da wir keine einwilligungspflichtigen Dienste einsetzen, verwenden wir derzeit kein Consent-Management-Tool.',
            'Sofern wir künftig ein solches Tool einsetzen, dient dieses der Einholung, Verwaltung und Dokumentation Ihrer Einwilligungen. Dabei können Informationen wie Einwilligungsstatus, Zeitpunkt der Einwilligung, Browser- und Geräteinformationen sowie eine gekürzte oder pseudonymisierte IP-Adresse verarbeitet werden. Rechtsgrundlage ist Art. 6 Abs. 1 lit. c DSGVO, soweit die Verarbeitung zur Erfüllung gesetzlicher Nachweispflichten erforderlich ist, sowie Art. 6 Abs. 1 lit. f DSGVO aufgrund unseres berechtigten Interesses an einer rechtssicheren Verwaltung von Einwilligungen.',
          ],
        },
        {
          heading: '10. Webanalyse und Reichweitenmessung',
          body: [
            'Derzeit setzen wir keine Webanalyse- oder Reichweitenmessungsdienste ein. Es findet keine Auswertung Ihres Nutzungsverhaltens statt.',
            'Sofern wir künftig Analyse-Tools einsetzen, erfolgt der Einsatz einwilligungspflichtiger Tools nur nach Ihrer Einwilligung gemäß Art. 6 Abs. 1 lit. a DSGVO und § 25 Abs. 1 TDDDG. Sofern eine datenschutzfreundliche Analyse ohne Cookies und ohne Einwilligungspflicht eingesetzt wird, erfolgt die Verarbeitung auf Grundlage von Art. 6 Abs. 1 lit. f DSGVO.',
          ],
        },
        {
          heading: '11. Externe Schriftarten, Karten, Videos und eingebundene Inhalte',
          body: [
            'Auf dieser Website sind alle Schriftarten lokal eingebunden. Es werden keine Karten, Videos, Social-Media-Elemente oder sonstigen Inhalte Dritter geladen. Beim Aufruf dieser Website werden keine Verbindungen zu Drittanbietern hergestellt.',
            'Sofern künftig externe Inhalte eingebunden werden, können dabei personenbezogene Daten, insbesondere IP-Adresse und technische Zugriffsdaten, an die jeweiligen Anbieter übermittelt werden. Die Einbindung erfolgt, soweit erforderlich, nur nach Ihrer Einwilligung gemäß Art. 6 Abs. 1 lit. a DSGVO und § 25 Abs. 1 TDDDG. Bei technisch erforderlichen oder lokal eingebundenen Diensten kann die Verarbeitung auf Art. 6 Abs. 1 lit. f DSGVO gestützt werden.',
          ],
        },
        {
          heading: '12. Social-Media-Präsenzen',
          body: [
            'Wir können Unternehmensprofile auf sozialen Netzwerken oder beruflichen Plattformen betreiben, beispielsweise LinkedIn, XING, Facebook, Instagram oder vergleichbare Dienste. Wenn Sie unsere Profile besuchen oder mit uns über diese Plattformen interagieren, können personenbezogene Daten durch uns und durch den jeweiligen Plattformbetreiber verarbeitet werden.',
            'Die Verarbeitung erfolgt zur Außendarstellung, Kommunikation, Bewerber- und Kundenansprache sowie zur Information über unsere Leistungen. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO. Für die Datenverarbeitung durch die jeweiligen Plattformbetreiber gelten zusätzlich deren Datenschutzhinweise.',
          ],
        },
        {
          heading: '13. Bewerbungen',
          body: [
            'Wenn Sie sich bei uns bewerben, verarbeiten wir die von Ihnen übermittelten Bewerbungsdaten, insbesondere Kontaktdaten, Lebenslauf, Qualifikationen, Zeugnisse und weitere Unterlagen, zur Durchführung des Bewerbungsverfahrens.',
            'Rechtsgrundlage ist § 26 BDSG in Verbindung mit Art. 6 Abs. 1 lit. b DSGVO. Erfolgt eine Aufnahme in einen Bewerberpool, geschieht dies nur auf Grundlage Ihrer Einwilligung gemäß Art. 6 Abs. 1 lit. a DSGVO. Bewerbungsdaten werden nach Abschluss des Verfahrens gelöscht, sofern keine gesetzlichen Aufbewahrungspflichten oder berechtigten Interessen, beispielsweise zur Rechtsverteidigung, entgegenstehen.',
          ],
        },
        {
          heading: '14. Empfänger personenbezogener Daten',
          body: [
            'Personenbezogene Daten können an interne Stellen sowie an externe Dienstleister übermittelt werden, soweit dies zur Erfüllung der genannten Zwecke erforderlich ist. Dazu können insbesondere IT-Dienstleister, Hosting-Anbieter, Kommunikationsdienstleister, Zahlungs- und Buchhaltungsdienstleister, Steuerberater, Rechtsberater sowie Behörden im Rahmen gesetzlicher Pflichten gehören.',
            'Mit Dienstleistern, die personenbezogene Daten in unserem Auftrag verarbeiten, schließen wir, soweit erforderlich, Verträge zur Auftragsverarbeitung gemäß Art. 28 DSGVO.',
          ],
        },
        {
          heading: '15. Datenübermittlung in Drittländer',
          body: [
            'Eine Übermittlung personenbezogener Daten in Staaten außerhalb der Europäischen Union oder des Europäischen Wirtschaftsraums erfolgt nur, wenn hierfür eine geeignete Rechtsgrundlage besteht. Dies kann insbesondere ein Angemessenheitsbeschluss der Europäischen Kommission, geeignete Garantien wie Standardvertragsklauseln oder Ihre ausdrückliche Einwilligung sein.',
            'Unser Hosting-Anbieter Cloudflare, Inc. hat seinen Sitz in den USA. Die Auslieferung dieser Website erfolgt über das globale Netzwerk des Anbieters; ein Zugriff aus einem Drittland lässt sich daher nicht vollständig ausschließen. Cloudflare stellt für Übermittlungen in Drittländer Standardvertragsklauseln der Europäischen Kommission bereit.',
          ],
        },
        {
          heading: '16. Speicherdauer',
          body: [
            'Wir speichern personenbezogene Daten nur so lange, wie dies für die jeweiligen Zwecke erforderlich ist oder gesetzliche Aufbewahrungspflichten bestehen. Entfallen die Zwecke der Verarbeitung oder läuft eine gesetzliche Aufbewahrungsfrist ab, werden die Daten gelöscht oder gesperrt, sofern keine andere Rechtsgrundlage für eine weitere Verarbeitung besteht.',
          ],
        },
        {
          heading: '17. Ihre Rechte',
          body: [
            'Sie haben im Rahmen der gesetzlichen Voraussetzungen folgende Rechte: Recht auf Auskunft gemäß Art. 15 DSGVO, Recht auf Berichtigung gemäß Art. 16 DSGVO, Recht auf Löschung gemäß Art. 17 DSGVO, Recht auf Einschränkung der Verarbeitung gemäß Art. 18 DSGVO, Recht auf Datenübertragbarkeit gemäß Art. 20 DSGVO sowie Recht auf Widerspruch gemäß Art. 21 DSGVO.',
            'Wenn die Verarbeitung auf Ihrer Einwilligung beruht, haben Sie das Recht, diese Einwilligung jederzeit mit Wirkung für die Zukunft zu widerrufen. Die Rechtmäßigkeit der bis zum Widerruf erfolgten Verarbeitung bleibt unberührt.',
          ],
        },
        {
          heading: '18. Widerspruchsrecht nach Art. 21 DSGVO',
          body: [
            'Wenn wir personenbezogene Daten auf Grundlage von Art. 6 Abs. 1 lit. e oder lit. f DSGVO verarbeiten, haben Sie das Recht, aus Gründen, die sich aus Ihrer besonderen Situation ergeben, jederzeit Widerspruch gegen die Verarbeitung einzulegen. Wir verarbeiten die betroffenen Daten dann nicht mehr, es sei denn, wir können zwingende schutzwürdige Gründe für die Verarbeitung nachweisen oder die Verarbeitung dient der Geltendmachung, Ausübung oder Verteidigung von Rechtsansprüchen.',
          ],
        },
        {
          heading: '19. Beschwerderecht bei einer Aufsichtsbehörde',
          body: [
            'Sie haben das Recht, sich bei einer Datenschutzaufsichtsbehörde zu beschweren, wenn Sie der Ansicht sind, dass die Verarbeitung Ihrer personenbezogenen Daten gegen Datenschutzrecht verstößt. Zuständig kann insbesondere die Aufsichtsbehörde Ihres Aufenthaltsorts, Ihres Arbeitsplatzes oder des Orts des mutmaßlichen Verstoßes sein.',
            'Für NexBridge-IT mit Sitz in Baden-Württemberg kann insbesondere der Landesbeauftragte für den Datenschutz und die Informationsfreiheit Baden-Württemberg zuständig sein.',
          ],
        },
        {
          heading: '20. Pflicht zur Bereitstellung personenbezogener Daten',
          body: [
            'Die Bereitstellung personenbezogener Daten ist teilweise erforderlich, um unsere Website nutzen, mit uns kommunizieren oder vertragliche Leistungen in Anspruch nehmen zu können. Ohne die erforderlichen Daten können wir bestimmte Anfragen oder Leistungen gegebenenfalls nicht bearbeiten oder erbringen.',
          ],
        },
        {
          heading: '21. Automatisierte Entscheidungsfindung',
          body: [
            'Eine automatisierte Entscheidungsfindung einschließlich Profiling im Sinne von Art. 22 DSGVO findet auf unserer Website nicht statt, sofern in dieser Datenschutzerklärung nichts Abweichendes angegeben ist.',
          ],
        },
        {
          heading: '22. Aktualität und Änderung dieser Datenschutzerklärung',
          body: [
            'Wir behalten uns vor, diese Datenschutzerklärung anzupassen, wenn sich unsere Website, unsere Datenverarbeitungen oder die rechtlichen Anforderungen ändern. Es gilt jeweils die auf dieser Website veröffentlichte aktuelle Fassung.',
          ],
        },
      ],
    },
    translationNote: null,
  },

  en: {
    impressum: {
      title: 'Imprint',
      basis: 'Information pursuant to § 5 of the German Digital Services Act (DDG)',
      headings: {
        provider: 'Service provider',
        represented: 'Represented by',
        contact: 'Contact',
        vat: 'VAT ID / business ID',
        dispute: 'Consumer dispute resolution',
        liability: 'Liability for links',
      },
      labels: { phone: 'Phone', email: 'Email' },
      vat: 'We work as freelancers, sole traders with a permanent place of business in Germany.',
      dispute:
        'We are neither willing nor obliged to take part in dispute resolution proceedings before a consumer arbitration board.',
      liability:
        'Despite careful review of the content, we accept no liability for the content of external links. The operators of linked pages are solely responsible for their content.',
    },
    datenschutz: {
      title: 'Privacy policy',
      controllerLead:
        'The controller for the processing of personal data on this website is:',
      revisionLabel: 'Version',
      sections: [
        {
          heading: '2. Data protection officer',
          body: [
            'If a data protection officer has been appointed, you can reach them at the email address given above.',
          ],
        },
        {
          heading: '3. General information on data processing',
          body: [
            'We process personal data only where this is necessary to provide a functioning website, to handle your enquiries, to carry out pre-contractual or contractual measures, to comply with legal obligations, or to protect legitimate interests.',
            'The legal bases for processing are, in particular, Art. 6(1)(a) GDPR for consent, Art. 6(1)(b) GDPR for contractual or pre-contractual measures, Art. 6(1)(c) GDPR for legal obligations, and Art. 6(1)(f) GDPR for legitimate interests.',
          ],
        },
        {
          heading: '4. Provision of the website and server log files',
          body: [
            'When you access our website, the web server automatically collects and stores information in what are known as server log files. This may include: IP address, date and time of access, page or file requested, referrer URL, browser type and version, operating system used, volume of data transferred, and the requesting provider.',
            'Processing serves the technical provision, stability, security and optimisation of the website. The legal basis is Art. 6(1)(f) GDPR. Our legitimate interest lies in the secure, reliable and uninterrupted operation of our website.',
            'We do not operate our own servers and keep no server log files of our own. Collection, storage and deletion are carried out by our hosting provider according to its retention periods, unless longer storage is required to investigate security incidents.',
          ],
        },
        {
          heading: '5. Hosting and processing on our behalf',
          body: [
            'Our website is hosted by Cloudflare, Inc. (101 Townsend Street, San Francisco, CA 94107, USA). The hosting provider processes personal data arising from your visit to the website on our behalf. This may include IP addresses, technical access data and communication data.',
            'We have concluded a data processing agreement with the hosting provider pursuant to Art. 28 GDPR, where this is required under data protection law. Processing is based on our legitimate interest in the secure and efficient provision of our online offering pursuant to Art. 6(1)(f) GDPR.',
          ],
        },
        {
          heading: '6. Contact by email, telephone or contact form',
          body: [
            'If you contact us by email, telephone or via a contact form, we process the personal data you provide, for example name, email address, telephone number, subject, message and any further voluntary information.',
            'The contact form on this website does not currently transmit your details to a server of ours. It opens a prepared email in your own email program; the message is then sent via your own email provider.',
            'Processing serves to handle your enquiry and to communicate with you. Where your enquiry is directed at concluding or performing a contract, Art. 6(1)(b) GDPR is the legal basis. In other cases, processing is based on our legitimate interest in handling enquiries properly pursuant to Art. 6(1)(f) GDPR.',
            'The data is deleted once your enquiry has been dealt with conclusively and no statutory retention obligations prevent deletion.',
          ],
        },
        {
          heading: '7. NexBridge-IT services and client communication',
          body: [
            'In the course of our IT services, consulting, project initiation, quotation, contract performance and client support, we process personal data of prospects, clients, contact persons and business partners. This may include contact data, communication data, contract data, project information, billing data and technical information required for the respective service.',
            'The legal bases are Art. 6(1)(b) GDPR where processing is necessary for pre-contractual measures or a contract, Art. 6(1)(c) GDPR where legal obligations exist, and Art. 6(1)(f) GDPR where we have a legitimate interest in efficient business organisation, client care and legally sound documentation.',
          ],
        },
        {
          heading: '8. Cookies and similar technologies',
          body: [
            'We currently set no cookies on this website — neither technically necessary ones nor analytics, marketing or tracking cookies.',
            'Should cookies be used in future, the following applies: technically necessary cookies serve to provide basic website functions and may be used without consent where they are required for operation. For non-essential cookies we obtain your consent in advance. The legal basis for accessing information on your device is § 25 TDDDG. Subsequent processing of personal data takes place, where consent is given, on the basis of Art. 6(1)(a) GDPR. You may withdraw consent at any time with effect for the future.',
          ],
        },
        {
          heading: '9. Consent management tool',
          body: [
            'As we use no services requiring consent, we currently do not use a consent management tool.',
            'Should we use such a tool in future, it will serve to obtain, manage and document your consents. Information such as consent status, time of consent, browser and device information and a shortened or pseudonymised IP address may be processed. The legal basis is Art. 6(1)(c) GDPR where processing is required to meet statutory documentation obligations, and Art. 6(1)(f) GDPR based on our legitimate interest in legally sound consent management.',
          ],
        },
        {
          heading: '10. Web analytics and reach measurement',
          body: [
            'We currently use no web analytics or reach measurement services. Your usage behaviour is not evaluated.',
            'Should we use analytics tools in future, tools requiring consent will be used only after your consent pursuant to Art. 6(1)(a) GDPR and § 25(1) TDDDG. Where privacy-friendly analytics without cookies and without a consent requirement is used, processing is based on Art. 6(1)(f) GDPR.',
          ],
        },
        {
          heading: '11. External fonts, maps, videos and embedded content',
          body: [
            'All fonts on this website are embedded locally. No maps, videos, social media elements or other third-party content are loaded. No connections to third-party providers are established when this website is accessed.',
            'Should external content be embedded in future, personal data — in particular IP address and technical access data — may be transmitted to the respective providers. Where required, embedding takes place only after your consent pursuant to Art. 6(1)(a) GDPR and § 25(1) TDDDG. For technically necessary or locally embedded services, processing may be based on Art. 6(1)(f) GDPR.',
          ],
        },
        {
          heading: '12. Social media presences',
          body: [
            'We may operate company profiles on social networks or professional platforms, for example LinkedIn, XING, Facebook, Instagram or comparable services. If you visit our profiles or interact with us via these platforms, personal data may be processed by us and by the respective platform operator.',
            'Processing serves external presentation, communication, addressing applicants and clients, and providing information about our services. The legal basis is Art. 6(1)(f) GDPR. The respective platform operators’ own privacy notices additionally apply to their data processing.',
          ],
        },
        {
          heading: '13. Job applications',
          body: [
            'If you apply to us, we process the application data you submit, in particular contact data, CV, qualifications, references and further documents, in order to carry out the application procedure.',
            'The legal basis is § 26 BDSG in conjunction with Art. 6(1)(b) GDPR. Inclusion in an applicant pool takes place only on the basis of your consent pursuant to Art. 6(1)(a) GDPR. Application data is deleted after the procedure has concluded, unless statutory retention obligations or legitimate interests, for example legal defence, prevent deletion.',
          ],
        },
        {
          heading: '14. Recipients of personal data',
          body: [
            'Personal data may be transmitted to internal bodies and to external service providers where this is necessary to fulfil the purposes stated. This may include IT service providers, hosting providers, communication service providers, payment and accounting service providers, tax advisers, legal advisers and public authorities within the scope of statutory obligations.',
            'Where service providers process personal data on our behalf, we conclude data processing agreements pursuant to Art. 28 GDPR where required.',
          ],
        },
        {
          heading: '15. Transfer of data to third countries',
          body: [
            'Personal data is transferred to countries outside the European Union or the European Economic Area only where an appropriate legal basis exists. This may in particular be an adequacy decision of the European Commission, appropriate safeguards such as standard contractual clauses, or your explicit consent.',
            'Our hosting provider Cloudflare, Inc. is based in the USA. This website is delivered via that provider’s global network, so access from a third country cannot be entirely ruled out. Cloudflare provides European Commission standard contractual clauses for transfers to third countries.',
          ],
        },
        {
          heading: '16. Storage period',
          body: [
            'We store personal data only for as long as is necessary for the respective purposes or as statutory retention obligations require. Where the purposes of processing cease to apply or a statutory retention period expires, the data is deleted or blocked, unless another legal basis exists for further processing.',
          ],
        },
        {
          heading: '17. Your rights',
          body: [
            'Within the statutory requirements you have the following rights: right of access pursuant to Art. 15 GDPR, right to rectification pursuant to Art. 16 GDPR, right to erasure pursuant to Art. 17 GDPR, right to restriction of processing pursuant to Art. 18 GDPR, right to data portability pursuant to Art. 20 GDPR, and right to object pursuant to Art. 21 GDPR.',
            'Where processing is based on your consent, you have the right to withdraw that consent at any time with effect for the future. The lawfulness of processing carried out up to the withdrawal remains unaffected.',
          ],
        },
        {
          heading: '18. Right to object pursuant to Art. 21 GDPR',
          body: [
            'Where we process personal data on the basis of Art. 6(1)(e) or (f) GDPR, you have the right to object to that processing at any time on grounds relating to your particular situation. We will then no longer process the data concerned, unless we can demonstrate compelling legitimate grounds for the processing, or the processing serves to establish, exercise or defend legal claims.',
          ],
        },
        {
          heading: '19. Right to lodge a complaint with a supervisory authority',
          body: [
            'You have the right to lodge a complaint with a data protection supervisory authority if you consider that the processing of your personal data infringes data protection law. The competent authority may in particular be that of your place of residence, your place of work or the place of the alleged infringement.',
            'For NexBridge-IT, based in Baden-Württemberg, the State Commissioner for Data Protection and Freedom of Information of Baden-Württemberg may be competent in particular.',
          ],
        },
        {
          heading: '20. Obligation to provide personal data',
          body: [
            'Providing personal data is in part necessary in order to use our website, communicate with us or make use of contractual services. Without the required data we may be unable to process or provide certain enquiries or services.',
          ],
        },
        {
          heading: '21. Automated decision-making',
          body: [
            'Automated decision-making, including profiling within the meaning of Art. 22 GDPR, does not take place on our website unless stated otherwise in this privacy policy.',
          ],
        },
        {
          heading: '22. Currency and amendment of this privacy policy',
          body: [
            'We reserve the right to amend this privacy policy if our website, our data processing or the legal requirements change. The current version published on this website applies in each case.',
          ],
        },
      ],
    },
    translationNote:
      'This is a convenience translation. The legally binding version of this document is the German one.',
  },
} as const satisfies Record<Lang, LegalDoc>;

export function useLegal(lang: Lang): LegalDoc {
  return legal[lang];
}
