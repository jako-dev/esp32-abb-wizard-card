import type { StepId } from './types';

export interface StepDefinition {
  id: StepId;
  title: string;
  short: string;
  icon: string;
  /** What the user has to do, in order. */
  todo: string[];
  /** Background shown in a collapsible "Warum?" section. */
  why: string;
  /** Recommended number of repetitions. */
  repetitions: number;
  /** Arm the capture by default (wait for the first frame), useful when the user has to walk to a door. */
  waitForFrame: boolean;
}

export const STEPS: readonly StepDefinition[] = [
  {
    id: 'baseline',
    title: 'Baseline: Sprechverbindung ohne Klingeln',
    short: 'Baseline',
    icon: 'mdi:phone-outline',
    todo: [
      'Auf „Aufnahme starten“ tippen.',
      'An der Innenstation ohne vorheriges Klingeln die Sprech- bzw. Lautsprecher-Taste drücken (oder Hörer abnehmen).',
      'Kurz warten und die Verbindung wieder beenden.',
    ],
    why: 'Frames, die schon bei einer normalen Sprechverbindung auftreten, eignen sich nicht als Klingel-Erkennung. Sie werden später von den Klingel-Aufnahmen abgezogen.',
    repetitions: 1,
    waitForFrame: false,
  },
  {
    id: 'ring_gate',
    title: 'Klingeln am Tor',
    short: 'Klingel Tor',
    icon: 'mdi:gate',
    todo: [
      'Auf „Aufnahme starten“ tippen – die Aufnahme beginnt erst, wenn der erste Frame ankommt.',
      'Zum Tor gehen und einmal klingeln. Nicht abheben, nicht öffnen.',
      'Für eine zuverlässige Erkennung 2–3 Mal wiederholen (jeweils neue Aufnahme).',
    ],
    why: 'Frames, die in jeder Wiederholung auftauchen, sind zuverlässige Kandidaten für den Klingel-Sensor. Über die Adresse der Außenstation werden Tor und Haustür unterschieden.',
    repetitions: 3,
    waitForFrame: true,
  },
  {
    id: 'ring_house',
    title: 'Klingeln an der Haustür',
    short: 'Klingel Haustür',
    icon: 'mdi:door',
    todo: [
      'Auf „Aufnahme starten“ tippen.',
      'An der Haustür (unten) einmal klingeln. Nicht abheben, nicht öffnen.',
      '2–3 Mal wiederholen.',
    ],
    why: 'Die Haustür hat in der Regel eine eigene Außenstation (z. B. 0x2002). Nur so lassen sich Tor und Haustür als getrennte Sensoren abbilden.',
    repetitions: 3,
    waitForFrame: true,
  },
  {
    id: 'ring_apartment',
    title: 'Klingeln an der Wohnungstür',
    short: 'Klingel Wohnung',
    icon: 'mdi:door-closed',
    todo: [
      'Auf „Aufnahme starten“ tippen.',
      'Den Klingeltaster an der Wohnungstür (Etagenruf) drücken.',
      '2–3 Mal wiederholen.',
    ],
    why: 'Der Etagenruf ist direkt an die Innenstation angeschlossen. Sie meldet ihn mit Typ 11 auf dem Bus, die Antwort hat Typ 91.',
    repetitions: 3,
    waitForFrame: true,
  },
  {
    id: 'open_gate',
    title: 'Tor öffnen (Schlüssel-Taste nach Klingeln)',
    short: 'Öffnen Tor',
    icon: 'mdi:key-variant',
    todo: [
      'Am Tor klingeln (lassen).',
      'Sofort danach auf „Aufnahme starten“ tippen.',
      'An der Innenstation die Schlüssel-Taste drücken – das Tor wird dabei wirklich geöffnet.',
    ],
    why: 'Nach einem Klingeln öffnet die Schlüssel-Taste die rufende Außenstation. Gesucht wird der Frame vom Typ 0D/0E von deiner Innenstation und die Bestätigung 8D/8E.',
    repetitions: 2,
    waitForFrame: false,
  },
  {
    id: 'open_house',
    title: 'Haustür öffnen (Schlüssel-Taste ohne Klingeln)',
    short: 'Öffnen Haustür',
    icon: 'mdi:key-outline',
    todo: [
      'Einige Minuten nach dem letzten Klingeln warten.',
      'Auf „Aufnahme starten“ tippen.',
      'An der Innenstation die Schlüssel-Taste drücken – die Haustür wird dabei wirklich geöffnet.',
    ],
    why: 'Ohne vorheriges Klingeln öffnet die Schlüssel-Taste die Standard-Außenstation. Liegt das letzte Klingeln zu kurz zurück, würde sie noch das Tor öffnen.',
    repetitions: 2,
    waitForFrame: false,
  },
];

/** Minimum pause after the last doorbell before the "open house door" step, in minutes. */
export const OPEN_HOUSE_PAUSE_MINUTES = 3;
