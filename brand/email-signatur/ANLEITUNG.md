# E-Mail-Signatur — NexBridge-IT

Zwei Dateien, eine pro Person:

- `signatur-peter-knopp.html`
- `signatur-manush-vaghani.html`

Das animierte Logo liegt auf unserer eigenen Domain:
`https://nexbridge-it.com/brand/nb-signature.gif` (70 KB).
Es wird **nicht** in die Mail eingebettet — E-Mail-Programme laden es von dort.
Deshalb darf die Datei auf dem Server nicht gelöscht oder umbenannt werden.

## Einbauen

**Gmail (Web)**
1. HTML-Datei im Browser öffnen (Doppelklick).
2. Alles markieren (Strg/Cmd + A), kopieren (Strg/Cmd + C).
3. Gmail → Einstellungen (Zahnrad) → *Alle Einstellungen ansehen* → Reiter
   *Allgemein* → *Signatur* → *Neu erstellen* → in das Feld einfügen.
4. Unten *Änderungen speichern*.

**Outlook (Web / neues Outlook)**
Gleicher Weg: Datei im Browser öffnen, alles kopieren, dann
Einstellungen → *E-Mail* → *Verfassen und antworten* → Signatur einfügen.

**Apple Mail (Mac)**
1. Mail → Einstellungen → *Signaturen* → mit **+** eine neue anlegen,
   irgendeinen Platzhaltertext eintippen, Einstellungen schließen.
2. HTML-Datei im Browser öffnen, alles kopieren.
3. Zurück in *Signaturen*, den Platzhalter markieren und einfügen.
   Wichtig: „Immer auf Standardschrift setzen" muss **aus** sein.

**iPhone / iPad**
Signatur im Browser (Safari) öffnen, alles markieren, kopieren, dann
Einstellungen → *Apps* → *Mail* → *Signatur* → einfügen. iOS behält die
Formatierung nur beim Einfügen aus Safari, nicht aus der Dateien-App.

## Was zu erwarten ist

- **Outlook für Windows** zeigt bei GIFs nur das erste Bild. Das ist
  eingeplant: Bild 1 ist bereits das fertige Logo, es steht dort einfach still.
- Manche Programme laden Bilder erst nach Klick auf „Bilder anzeigen".
  Ohne Bild bleibt die Signatur vollständig lesbar — der Text steht als
  echter Text da, nicht im Bild.
- Der Name steht bewusst allein, ohne Funktionsbezeichnung.
- Schrift ist Arial, nicht Archivo: E-Mail-Programme können keine eigenen
  Schriften laden, und ein Fallback würde die Signatur verschieben. Die
  Markenschrift steckt im Logo-Bild.

## Ändern

Telefonnummern, Namen und Links stehen direkt im HTML — mit einem
Texteditor änderbar. Wenn sich das Logo ändert, muss nur
`website/public/brand/nb-signature.gif` neu erzeugt und deployt werden;
alle Signaturen ziehen automatisch nach.
