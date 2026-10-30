# ABB-Welcome Wizard Card

Eine Lovelace-Karte für Home Assistant, die dich Schritt für Schritt durch das Einmessen deiner
**Busch-Welcome / ABB-Welcome** 2-Draht-Gegensprechanlage führt: Du klingelst und drückst die Schlüssel-Taste,
die Karte schneidet die Bus-Frames mit, wertet sie automatisch aus und erzeugt eine fertige
**ESPHome-Konfiguration** mit Klingel-Sensoren und Türöffnern.

> **Nur lesen:** Die Karte sendet nichts auf den Bus und ruft keine Home-Assistant-Aktionen auf.
> Türen öffnen sich nur, wenn du selbst die Schlüssel-Taste an der Innenstation drückst.

## Voraussetzungen

- Ein [ESP32 Doorbell Bus Interface](https://github.com/Mat931/esp32-doorbell-bus-interface) parallel am Bus
  (a1/b1), mit der ABB-Welcome-Demo-Firmware geflasht und über die ESPHome-Integration in Home Assistant eingebunden.
- Der **Debug-Textsensor** der Firmware ist aktiv. Je nach Version heißt er „Doorbell Intercom“,
  „ABB Welcome Bus Activity“ oder „ABB Welcome Last Frame“. Jeder empfangene Frame erscheint als Zustand
  dieses Sensors, z. B. `55.FF.… [2001 > 1010] Type: 01, Data: 01.10.10`.
- Empfohlen in der Firmware: `api: batch_delay: 0ms`, damit Home Assistant jeden Frame einzeln erhält.

## Installation

### Über HACS (benutzerdefiniertes Repository)

1. HACS öffnen → Menü (⋮) → **Benutzerdefinierte Repositories**.
2. Repository `https://github.com/jako-dev/esp32-abb-wizard-card` mit Typ **Dashboard** hinzufügen.
3. „ABB-Welcome Wizard Card“ suchen, herunterladen und den Browser neu laden.

HACS legt die Dashboard-Ressource automatisch an.

### Manuell

1. `dist/abb-welcome-wizard-card.js` herunterladen und nach `/config/www/abb-welcome-wizard-card.js` kopieren.
2. **Einstellungen → Dashboards → ⋮ → Ressourcen → Ressource hinzufügen**
   - URL: `/local/abb-welcome-wizard-card.js?v=0.1.0`
   - Typ: **JavaScript-Modul**
3. Browser neu laden (bei Updates die Versionsnummer in der URL erhöhen).

> Die Ressourcen-Verwaltung ist nur im erweiterten Modus sichtbar (Profil → Erweiterter Modus).

## Konfiguration

Karte zu einem Dashboard hinzufügen (am besten in einer eigenen Ansicht im Panel- oder Abschnitts-Layout):

```yaml
type: custom:abb-welcome-wizard-card
entity: sensor.doorbell_intercom # Debug-Textsensor
capture_seconds: 10 # optional
```

| Option            | Pflicht | Standard                  | Beschreibung                                                                                                   |
| ----------------- | ------- | ------------------------- | -------------------------------------------------------------------------------------------------------------- |
| `entity`          | ja      | –                         | Debug-Textsensor des ESP32.                                                                                    |
| `capture_seconds` | nein    | `10`                      | Länge eines Aufnahmefensters in Sekunden (2–120).                                                              |
| `indoor_address`  | nein    | automatisch               | Adresse der eigenen Innenstation, z. B. `"0x1010"` oder `"0x000110"`. Überschreibt die automatische Erkennung. |
| `title`           | nein    | `ABB-Welcome Einrichtung` | Überschrift der Karte.                                                                                         |

Nichts ist auf eine bestimmte Anlage festgelegt: Die Adresse der Innenstation, die Außenstationen, Türcodes und
die Adresslänge werden aus deinen Aufnahmen ermittelt. Die Drehregler deiner Innenstation (STATION, X10, X1) trägst
du optional auf der Startseite ein. Sie dienen nur zur Kontrolle: Aus X10/X1 ergibt sich die Wohnungsnummer, die
in den letzten beiden Stellen der Adresse steht (Wohnung 16 → `0x1010`, Wohnung 12 → `0x100c`). Bei Bedarf lässt
sich die Adresse dort auch manuell festlegen.

## Ablauf

| Schritt                     | Was du tust                                                                                          |
| --------------------------- | ---------------------------------------------------------------------------------------------------- |
| **Start**                   | Prüfen, ob der Sensor existiert und Frames ankommen. Optional die Drehregler eintragen.              |
| **1 · Baseline**            | Ohne Klingeln eine Sprechverbindung zur Außenstation öffnen und wieder beenden.                      |
| **2 · Klingel Tor**         | Am Tor klingeln (2–3 Wiederholungen).                                                                |
| **3 · Klingel Haustür**     | An der Haustür klingeln (2–3 Wiederholungen).                                                        |
| **4 · Klingel Wohnungstür** | Etagenruf an der Wohnungstür auslösen (2–3 Wiederholungen).                                          |
| **5 · Öffnen Tor**          | Am Tor klingeln, dann die Schlüssel-Taste drücken. Das Tor öffnet sich dabei.                        |
| **6 · Öffnen Haustür**      | Einige Minuten nach dem letzten Klingeln die Schlüssel-Taste drücken. Die Haustür öffnet sich dabei. |
| **Ergebnis**                | Auswertung ansehen, ESPHome-YAML kopieren oder herunterladen.                                        |

Jeder Schritt zeigt eine kurze Anleitung, einen Countdown und die eingehenden Frames live an.
Mit **Wiederholen** nimmst du eine weitere Aufnahme auf, mit **Verwerfen** löschst du die letzte. Schritte lassen
sich überspringen, wenn deine Anlage z. B. kein Tor hat. Bei den Klingel-Schritten startet die Aufnahme
standardmäßig erst mit dem ersten Frame, damit du in Ruhe zur Tür gehen kannst.

Die Wohnungstür hat keinen elektrischen Öffner und wird deshalb nur als Klingel erfasst.

### Auswertung

- **Innenstation:** die Quelle der Öffnen-Frames (Typ `0D`/`0E`); ohne Öffnen-Aufnahme die häufigste Adresse
  `10XX`/`0001XX`. Weicht sie von den Drehreglern ab, gibt es eine Warnung.
- **Baseline-Abzug:** Frames, die identisch auch bei der normalen Sprechverbindung auftreten, werden ignoriert.
- **Nachbarn:** Frames ohne Bezug zur eigenen Innenstation (weder Quelle, Ziel noch in den Daten) werden verworfen.
- **Klingeln:** Typ `01`/`81`/`0A` (Außenstation) bzw. `11`/`91` (Etagenruf). Zuverlässig ist ein Kandidat,
  der in allen Wiederholungen vorkommt. Tor und Haustür werden über die Adresse der Außenstation unterschieden.
- **Öffnen:** der `0D`/`0E`-Frame der Innenstation (Ziel, Typ, Türcode) und die passende Bestätigung `8D`/`8E`.
- **Adresslänge:** 6-stellige Adressen bedeuten 3-Byte-Adressen (`three_byte_address: true`).

### Export

Die erzeugte YAML ersetzt in der ESPHome-Konfiguration deines ESP32 die gleichnamigen Abschnitte der
Demo-Firmware (`esphome.on_boot`, `remote_receiver.on_abbwelcome`, `binary_sensor`, `lock`):

- `binary_sensor.klingel_tor`, `binary_sensor.klingel_haustuer`, `binary_sensor.klingel_wohnung`
- `lock.tor`, `lock.haustuer` (öffnen per `remote_transmitter.transmit_abbwelcome`; die Bestätigung vom Bus
  setzt das Schloss kurz auf „Wird entriegelt“)

Danach im ESPHome Device Builder installieren (OTA). Die Firmware muss mit `esp32: framework: type: esp-idf`
gebaut werden (in der Demo-Firmware bereits so eingestellt).

### Sitzung speichern

Die Sitzung wird automatisch im Browser (`localStorage`) zwischengespeichert. Über die Symbole oben rechts lässt
sie sich als JSON-Datei **exportieren** und wieder **importieren**, z. B. um auf einem anderen Gerät
weiterzumachen oder die Aufnahmen für eine Fehlersuche aufzubewahren.

## Datenschutz: Türcode

Die Daten der Öffnen-Frames sind der **Türcode** deiner Anlage. Er bleibt in deinem Browser bzw. in Dateien, die
du selbst exportierst. Die Karte überträgt ihn nirgendwohin. In der Ergebnisansicht ist er standardmäßig verdeckt.
Teile die exportierte Sitzung oder die YAML nicht öffentlich; für Forenbeiträge die Option **Türcode maskieren**
verwenden.

## Bekannte Einschränkungen

- Home Assistant meldet nur **Änderungen** eines Sensors. Zwei identische Frames direkt hintereinander erscheinen
  als einer, Wiederholungen (`»`) können also fehlen. Die Auswertung hängt deshalb nicht von exakten
  Wiederholungszahlen ab. (Da jeder Frame eine zufällige Nachrichten-ID im Rohdaten-Dump trägt, betrifft das in der
  Praxis fast nur Firmwares ohne Rohdaten-Ausgabe.)
- Firmwares, die Frames bündeln (ohne `api: batch_delay: 0ms`), können Frames verschlucken.
- Ob das Tor auch **ohne** vorheriges Klingeln per Funkbefehl öffnet, hängt von der Anlage ab und wird erst mit
  dem Live-Test (Phase 3) geprüft.
- Bei unbekannten Anlagen-Varianten kann die Erkennung danebenliegen. Dann helfen die Hinweise auf der
  Ergebnisseite, die manuelle Innenstationsadresse und die Rohdaten in der exportierten Sitzung.

## Entwicklung

```bash
npm install
npm test          # Vitest (Parser, Analyse, Export mit Golden Files, Card-Smoke-Test)
npm run lint      # ESLint + Prettier
npm run typecheck
npm run build     # erzeugt dist/abb-welcome-wizard-card.js
```

- Testsitzungen liegen in `test/fixtures/` und werden mit `node scripts/generate-fixtures.mjs` erzeugt
  (inklusive Rohdaten und Prüfsummen wie bei ESPHome).
- Golden Files des Exports: `test/golden/`. Nach gewollten Änderungen mit `UPDATE_GOLDEN=1 npm test` aktualisieren.
- `dist/` wird eingecheckt, damit HACS die Karte direkt laden kann. Die CI prüft, dass der Build aktuell ist.

## Ausblick

- **Phase 2:** generische Firmware, die jeden Frame als Event `esphome.abb_frame` meldet (keine verlorenen
  Wiederholungen) und eine Aktion `send_frame` anbietet.
- **Phase 3:** Live-Test in der Karte: Tor/Haustür öffnen (nur nach Bestätigung, nur für Admins) und Klingel-Test.

## Danksagung

Frame-Format, Adress- und Nachrichtentypen basieren auf der Arbeit von
[Mat931/esp32-doorbell-bus-interface](https://github.com/Mat931/esp32-doorbell-bus-interface) und der
ESPHome-Komponente `remote_receiver`/`abbwelcome`.

## Lizenz

MIT
