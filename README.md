# ABB-Welcome Cards

Zwei Lovelace-Karten für Home Assistant rund um die **Busch-Welcome / ABB-Welcome** 2-Draht-Gegensprechanlage –
in einer Datei, mit einer HACS-Installation:

- **ABB-Welcome Wizard** (`custom:abb-welcome-wizard-card`) führt dich Schritt für Schritt durch das Einmessen:
  Du klingelst und drückst die Schlüssel-Taste, die Karte schneidet die Bus-Frames mit, wertet sie automatisch aus
  und erzeugt eine fertige **ESPHome-Konfiguration** mit Klingel-Sensoren und Türöffnern.
- **ABB-Welcome Türen** (`custom:abb-welcome-door-card`) ist die Karte für den Alltag: Türen öffnen und
  verriegeln, mit Klingel-Anzeige – für die eingemessenen Türen und jedes andere Schloss (z. B. Aqara).

> **Der Wizard liest nur mit:** Beim Einmessen sendet er nichts auf den Bus; Türen öffnen sich nur, wenn du selbst
> die Schlüssel-Taste drückst. Einzige Ausnahme ist der **„Testen“**-Button im Ergebnis – nur auf deinen Klick,
> mit Rückfrage und nur für Administratoren.

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
3. „ABB-Welcome Cards“ suchen, herunterladen und den Browser neu laden.

HACS legt die Dashboard-Ressource automatisch an.

### Manuell

1. `dist/abb-welcome-wizard-card.js` herunterladen und nach `/config/www/abb-welcome-wizard-card.js` kopieren.
2. **Einstellungen → Dashboards → ⋮ → Ressourcen → Ressource hinzufügen**
   - URL: `/local/abb-welcome-wizard-card.js?v=0.8.0`
   - Typ: **JavaScript-Modul**
3. Browser neu laden (bei Updates die Versionsnummer in der URL erhöhen).

> Die Ressourcen-Verwaltung ist nur im erweiterten Modus sichtbar (Profil → Erweiterter Modus).

## Konfiguration

Dashboard bearbeiten → **Karte hinzufügen** → „ABB-Welcome Wizard“ wählen. Im visuellen Editor den
Debug-Textsensor auswählen – fertig. Alternativ per YAML:

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
| `doors`           | nein    | Tor, Haustür, Wohnungstür | Vorgabe der Türen für neue Sitzungen (siehe unten). Normalerweise richtest du die Türen in der Karte ein.      |

Nichts ist auf eine bestimmte Anlage festgelegt: Die Adresse der Innenstation, die Außenstationen, Türcodes und
die Adresslänge werden aus deinen Aufnahmen ermittelt. Die Drehregler deiner Innenstation (STATION, X10, X1) trägst
du optional auf der Startseite ein. Sie dienen nur zur Kontrolle. Anlagen lesen die Regler unterschiedlich: bei
manchen stehen die Ziffern direkt in der Adresse (X10=1, X1=6 → `0x1016`), bei anderen wird dezimal umgerechnet
(16 → `0x1010`). Die Karte vergleicht beide Lesarten mit der gemessenen Adresse und zeigt die passende an.

### Türen einrichten

Auf der Startseite der Karte unter **„Türen deiner Anlage“** legst du fest, welche Türen deine Anlage hat –
mit eigenen Namen, beliebig viele (bis zu 8):

- **Außentür** – Tür mit eigener Außenstation, z. B. Tor, Haustür, Garage.
- **Wohnungstür (Etagenruf)** – Klingeltaster, der direkt an der Innenstation hängt. Hat keinen Öffner.
- **Türöffner** – die Schlüssel-Taste der Innenstation kann diese Tür öffnen.
- **Standard-Tür** – die Tür, die die Schlüssel-Taste auch _ohne_ vorheriges Klingeln öffnet (meist die Haustür).

Vorgabe ist Tor, Haustür (Standard-Tür) und Wohnungstür. Wer z. B. kein Tor hat, löscht es einfach. Die Türen werden
mit der Sitzung gespeichert und exportiert. Optional lässt sich eine eigene Vorgabe in der Karten-Konfiguration
setzen:

```yaml
doors:
  - name: Haustür
    default: true # öffnet ohne Klingeln
  - name: Garage
    open: false # nur Klingel, kein Öffner
    icon: mdi:garage
  - name: Wohnungstür
    type: floor # Etagenruf
```

## Ablauf

| Schritt          | Was du tust                                                                                                |
| ---------------- | ---------------------------------------------------------------------------------------------------------- |
| **Start**        | Prüfen, ob der Sensor Frames liefert. Türen einrichten, optional die Drehregler eintragen.                 |
| **Baseline**     | Ohne Klingeln eine Sprechverbindung zur Außenstation öffnen und wieder beenden.                            |
| **Je Tür**       | An der Tür klingeln bzw. den Etagenruf auslösen (2–3 Wiederholungen).                                      |
| **Je Öffner**    | An der Tür klingeln, dann die Schlüssel-Taste drücken. Die Tür öffnet sich dabei.                          |
| **Standard-Tür** | Einige Minuten nach dem letzten Klingeln die Schlüssel-Taste drücken (ohne Klingeln). Die Tür öffnet sich. |
| **Ergebnis**     | Auswertung ansehen, ESPHome-YAML kopieren oder herunterladen.                                              |

Jeder Schritt zeigt eine kurze Anleitung, einen Countdown und die eingehenden Frames live an.
Mit **Wiederholen** nimmst du eine weitere Aufnahme auf, mit **Verwerfen** löschst du die letzte. Schritte lassen
sich überspringen. Bei den Klingel-Schritten startet die Aufnahme standardmäßig erst mit dem ersten Frame, damit du
in Ruhe zur Tür gehen kannst.

### Auswertung

- **Innenstation:** die Quelle der Öffnen-Frames (Typ `0D`/`0E`) bzw. das Ziel ihrer Bestätigung; ohne
  Öffnen-Aufnahme die häufigste Adresse `10XX`/`0001XX`. Passt sie zu keiner Lesart der Drehregler, gibt es eine
  Warnung.
- **Baseline-Abzug:** Frames, die identisch auch bei der normalen Sprechverbindung auftreten, werden ignoriert.
- **Nachbarn:** Frames ohne Bezug zur eigenen Innenstation (weder Quelle, Ziel noch in den Daten) werden verworfen.
- **Klingeln:** Typ `01`/`81`/`0A` (Außenstation) bzw. `11`/`91` (Etagenruf). Zuverlässig ist ein Kandidat,
  der in allen Wiederholungen vorkommt. Mehrere Außentüren werden über die Adresse ihrer Außenstation unterschieden.
- **Öffnen:** der `0D`/`0E`-Frame der Innenstation (Ziel, Typ, Türcode) und die passende Bestätigung `8D`/`8E`.
  Kam nur die Bestätigung an (z. B. `[4002 > 1016] Type: 8D Data: 1C 41 68`), wird der Befehl daraus abgeleitet
  (`[1016 > 4002] Type: 0D Data: 1C 41 68`) und als **„abgeleitet – unbestätigt“** markiert – bitte testen.
- **Adresslänge:** 6-stellige Adressen bedeuten 3-Byte-Adressen (`three_byte_address: true`).

### Werte von Hand eintragen

Auf der Ergebnisseite lässt sich jeder Wert mit dem Stift bearbeiten: Innenstationsadresse, Adresslänge,
Außenstationsadressen, Klingel-Bedingungen (Typ / Quelle / Ziel / Data, hinzufügen und entfernen) und der
Öffnen-Frame jeder Tür (Ziel, Typ, Data). Eingaben werden als Hex geprüft. Manuelle Werte sind mit „manuell“
markiert, haben Vorrang vor der Auswertung und bleiben auch bei neuen Aufnahmen erhalten; „Analyse verwenden“ nimmt
sie wieder zurück. Ein Türöffner lässt sich so auch ganz ohne Aufnahme anlegen, wenn die Werte bekannt sind.

### Öffner live testen

Im Ergebnis hat jeder Türöffner einen Button **„Testen“**. Er sendet genau den angezeigten Öffnen-Frame über die
Aktion `send_frame` des ESP32 auf den Bus, wartet bis zu 6 s auf die Bestätigung `8D`/`8E` der Tür und zeigt das
Ergebnis an. So lassen sich auch abgeleitete und manuell eingetragene Werte prüfen, bevor man sich auf das Schloss
verlässt.

- Nur für Administratoren, mit Rückfrage („… öffnet sich wirklich“).
- Voraussetzung: Die **komplette Datei** aus dem Export ist auf dem ESP32 – sie enthält die Aktion
  `send_frame(source, destination, message_type, data, three_byte)` (in Home Assistant
  `esphome.<gerät>_send_frame`). Fehlt sie, erklärt die Karte, was zu tun ist.

### Export

Auf der Ergebnisseite gibt es die ESPHome-Konfiguration in zwei Varianten (Kopieren oder Herunterladen):

- **Komplette Datei** (Standard): vollständige Gerätekonfiguration auf Basis der Demo-Firmware – im ESPHome
  Device Builder beim Gerät auf **Bearbeiten**, den gesamten Inhalt ersetzen und **Installieren** (drahtlos).
  Gerätename, Anzeigename und Name des Debug-Sensors schlägt die Karte aus Home Assistant vor. Der Gerätename muss
  zum bestehenden Gerät passen, sonst ist es per OTA nicht mehr erreichbar. In `secrets.yaml` werden `wifi_ssid`,
  `wifi_password`, `api_encryption_key`, `ota_password` und `ap_password` erwartet – den API-Schlüssel aus der
  bisherigen Datei übernehmen. Die Option `name_add_mac_suffix` ist wie in der Demo-Firmware aus; passt der Name
  nicht zum Gerät in Home Assistant, warnt die Karte. `api: batch_delay: 0ms` ist gesetzt.
- **Nur geänderte Abschnitte**: ersetzt in der bestehenden Konfiguration nur `esphome.on_boot`,
  `remote_receiver.on_abbwelcome`, `binary_sensor` und `lock`.

Ergebnis in Home Assistant:

- je Tür ein Binary-Sensor „Klingel _Name_“ (ESPHome-id `klingel_<name>`, z. B. `klingel_haustuer`)
- je Tür mit Öffner ein Schloss „_Name_“ (id `<name>`, z. B. `haustuer`) – auch für abgeleitete und manuelle
  Frames –, öffnet per `remote_transmitter.transmit_abbwelcome`; die Bestätigung `8D`/`8E` vom Bus setzt das
  Schloss für 3 s auf „Wird entriegelt“ (ohne Aufnahme der Bestätigung wird sie von der Tür angenommen)
- Türen ohne Öffner (z. B. die Wohnungstür) bekommen nur den Klingel-Sensor.

Die Firmware wird mit `esp32: framework: type: esp-idf` gebaut (in beiden Varianten berücksichtigt).

### Sitzung speichern

Die Sitzung wird automatisch im Browser (`localStorage`) zwischengespeichert. Über die Symbole oben rechts lässt
sie sich als JSON-Datei **exportieren** und wieder **importieren**, z. B. um auf einem anderen Gerät
weiterzumachen oder die Aufnahmen für eine Fehlersuche aufzubewahren. Manuelle Werte und Export-Einstellungen
gehören zur Sitzung.

Updates übernehmen bestehende Sitzungen: Der Speicherort bleibt gleich, ältere Sitzungsformate werden beim Laden
automatisch umgewandelt. Sollte eine gespeicherte Sitzung einmal nicht lesbar sein, legt die Karte vorher eine
Sicherung im Browser an (`abb-welcome-wizard-card:backup:<entity>`).

## Tür-Karte

Dashboard bearbeiten → **Karte hinzufügen** → „ABB-Welcome Türen“. Im Editor **„Türen automatisch finden“**
übernimmt die Klingel-Sensoren und Schlösser aus dem Wizard (und alle anderen Schlösser, z. B. Aqara).

- **Kachel pro Tür** mit Status (verriegelt, wird entriegelt, offen …) und „klingelte vor 5 min“. Bei den
  ABB-Welcome-Türen ist „wird entriegelt“ die echte Bestätigung vom Bus.
- **Klingel-Modus:** Klingelt es, wird die Tür hervorgehoben, nach oben sortiert und zeigt „jetzt öffnen“ mit
  Countdown – passend dazu, dass die Anlage nur kurz nach dem Klingeln öffnet.
- **Öffnen bestätigen:** zum Öffnen schieben, gedrückt halten, mit Rückfrage oder einmal tippen – pro Tür.
  Ohne Angabe passend zur Darstellung (Schieberegler; bei Schlüssel-Knöpfen und Statusleiste gedrückt halten).
- **Verriegeln:** für Schlösser, die offen bleiben (z. B. Aqara), erscheint ein kleiner Schloss-Knopf.
- **Kamera (optional):** Bild beim Klingeln oder dauerhaft.
- **Berechtigung (optional):** Öffnen nur für bestimmte Benutzer. Das ist Bedienkomfort, kein Schutz – wer Zugriff
  auf Home Assistant hat, kann Schlösser auch anders auslösen.
- **Vier Darstellungen** (`layout`):
  - `tiles` – **Kacheln** fürs Tablet; die klingelnde Tür wird breit und farbig.
  - `rows` – **Liste** fürs Handy mit kleinen Reglern; die klingelnde Tür bekommt einen großen.
  - `buttons` – **Schlüssel-Knöpfe** fürs Wandtablet: große runde Knöpfe, beim Halten läuft ein Ring voll.
  - `bar` – **Statusleiste**: kompakte Chips; beim Klingeln erscheint darüber ein großes Feld mit
    Schieberegler und „Ignorieren“.

```yaml
type: custom:abb-welcome-door-card
title: Türen
layout: tiles # tiles | rows | buttons | bar
ring_window: 60 # Sekunden "es klingelt"-Hinweis
doors:
  - name: Tor
    icon: mdi:gate
    lock: lock.abb_welcome_demo_tor
    doorbell: binary_sensor.abb_welcome_demo_klingel_tor
  - name: Haustür
    lock: lock.abb_welcome_demo_haustuer
    doorbell: binary_sensor.abb_welcome_demo_klingel_haustuer
  - name: Wohnungstür
    lock: lock.aqara_wohnungstuer # jedes Schloss möglich
    doorbell: binary_sensor.abb_welcome_demo_klingel_wohnungstuer
    confirm: dialog # slide | hold | dialog | tap
    # action: open    # lock.open statt lock.unlock (Schlösser mit Falle)
    # camera: camera.flur
    # camera_view: ring # ring | always
    # users: [abc123] # Benutzer-IDs, die öffnen dürfen
```

| Option        | Standard | Beschreibung                                                       |
| ------------- | -------- | ------------------------------------------------------------------ |
| `title`       | –        | Überschrift                                                        |
| `layout`      | `tiles`  | `tiles`, `rows`, `buttons`, `bar`                                  |
| `ring_window` | `60`     | Wie lange eine Tür nach dem Klingeln hervorgehoben wird (s)        |
| `hold_time`   | `800`    | Wie lange gedrückt gehalten werden muss (ms)                       |
| `doors`       | –        | Liste der Türen: `name`, `lock` und/oder `doorbell`, Rest optional |

## Datenschutz: Türcode

Die Daten der Öffnen-Frames sind der **Türcode** deiner Anlage. Er bleibt in deinem Browser bzw. in Dateien, die
du selbst exportierst. Die Karte überträgt ihn nirgendwohin. In der Ergebnisansicht ist er standardmäßig verdeckt.
Teile die exportierte Sitzung oder die YAML nicht öffentlich; für Forenbeiträge die Option **Türcode maskieren**
verwenden.

## Verbindungsabbrüche (z. B. im Fahrstuhl)

Die Karte kommt mit Funklöchern zurecht – du kannst einfach weitermachen:

- Fertige Aufnahmen und die Sitzung liegen im Browser und überstehen auch einen Neustart der App.
- Bricht die Verbindung **während** einer Aufnahme ab (auch wenn die App im Hintergrund war oder neu geladen
  wurde), zeichnet Home Assistant die Frames trotzdem auf. Sobald die Verbindung zurück ist, holt die Karte die
  verpassten Frames aus dem **Verlauf** (Recorder) nach und schließt die Aufnahme dann ab. Das dauert nach der
  Wiederverbindung einige Sekunden, weil der Recorder Zustände nur alle paar Sekunden speichert.
- Bei „Erst mit dem ersten Frame starten“ funktioniert das auch, wenn du unten klingelst, während das Handy noch
  kein Netz hat: Der Beginn der Aufnahme wird aus dem Verlauf bestimmt.
- Eine unterbrochene Aufnahme wird nach dem Neuladen bis zu 15 Minuten lang fortgesetzt.

Voraussetzung: Der Debug-Sensor ist nicht vom Recorder ausgeschlossen (Standard). Die Karte liest dafür nur den
Verlauf, sie sendet nichts.

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
- **Tür-Karte:** PIN, Klingel-Verlauf, „Klingelton beenden“, Blueprints (Push-Nachricht mit Öffnen-Button,
  Paketmodus).

## Danksagung

Frame-Format, Adress- und Nachrichtentypen basieren auf der Arbeit von
[Mat931/esp32-doorbell-bus-interface](https://github.com/Mat931/esp32-doorbell-bus-interface) und der
ESPHome-Komponente `remote_receiver`/`abbwelcome`.

## Lizenz

MIT
