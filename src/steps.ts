import { BASELINE_STEP, doorIcon, openStepId, ringStepId } from './doors';
import type { Door, StepId } from './types';

export type StepKind = 'baseline' | 'ring' | 'open';

export interface StepDefinition {
  id: StepId;
  kind: StepKind;
  door?: Door;
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
  /** Opening the default door without a preceding doorbell: show the pause hint. */
  needsPause: boolean;
}

/** Minimum pause after the last doorbell before opening the default door, in minutes. */
export const OPEN_DEFAULT_PAUSE_MINUTES = 3;

const quoted = (door: Door) => `„${door.name}“`;

function ringStep(door: Door, outdoorCount: number): StepDefinition {
  const floor = door.type === 'floor';
  return {
    id: ringStepId(door),
    kind: 'ring',
    door,
    title: `Klingeln: ${door.name}`,
    short: door.name,
    icon: doorIcon(door),
    todo: [
      'Auf „Aufnahme starten“ tippen – die Aufnahme beginnt erst, wenn der erste Frame ankommt.',
      floor
        ? `Den Klingeltaster an ${quoted(door)} (Etagenruf) drücken.`
        : `Zu ${quoted(door)} gehen und einmal klingeln. Nicht abheben, nicht öffnen.`,
      'Für eine zuverlässige Erkennung 2–3 Mal wiederholen (jeweils neue Aufnahme).',
    ],
    why: floor
      ? 'Der Etagenruf ist direkt an die Innenstation angeschlossen. Sie meldet ihn mit Typ 11 auf dem Bus, die Antwort hat Typ 91.'
      : 'Frames, die in jeder Wiederholung auftauchen, sind zuverlässige Kandidaten für den Klingel-Sensor.' +
        (outdoorCount > 1
          ? ' Jede Außentür hat in der Regel eine eigene Außenstation – darüber werden die Türen unterschieden.'
          : ''),
    repetitions: 3,
    waitForFrame: true,
    needsPause: false,
  };
}

function openStep(door: Door): StepDefinition {
  const base = {
    id: openStepId(door),
    kind: 'open' as const,
    door,
    title: `Öffnen: ${door.name}`,
    short: `${door.name} öffnen`,
    icon: 'mdi:key-variant',
    repetitions: 2,
    waitForFrame: false,
  };
  if (door.default) {
    return {
      ...base,
      todo: [
        `Einige Minuten nach dem letzten Klingeln warten.`,
        'Auf „Aufnahme starten“ tippen.',
        `An der Innenstation die Schlüssel-Taste drücken – ${quoted(door)} wird dabei wirklich geöffnet.`,
      ],
      why: `Ohne vorheriges Klingeln öffnet die Schlüssel-Taste die Standard-Außenstation (${quoted(door)}). Liegt das letzte Klingeln zu kurz zurück, würde sie noch die zuletzt rufende Tür öffnen.`,
      needsPause: true,
    };
  }
  return {
    ...base,
    todo: [
      `An ${quoted(door)} klingeln – oder klingeln lassen. Allein: klingeln und zügig zur Innenstation gehen.`,
      'Erst an der Innenstation auf „Aufnahme starten“ tippen (das Klingeln muss nicht mit aufgenommen werden).',
      `Sofort die Schlüssel-Taste drücken, solange der Ruf noch aktiv ist – ${quoted(door)} wird dabei wirklich geöffnet.`,
    ],
    why: 'Nach einem Klingeln öffnet die Schlüssel-Taste die rufende Außenstation – aber nur, solange der Ruf an der Innenstation noch aktiv ist. Ist er schon abgelaufen, öffnet sie die Standard-Tür; die Auswertung warnt dann. Gesucht wird der Frame vom Typ 0D/0E deiner Innenstation und die Bestätigung 8D/8E.',
    needsPause: false,
  };
}

/** Wizard steps for a door list: baseline, one doorbell step per door, one open step per door with opener. */
export function buildSteps(doors: readonly Door[]): StepDefinition[] {
  const outdoorCount = doors.filter((d) => d.type === 'outdoor').length;
  const openable = doors.filter((d) => d.open);
  return [
    {
      id: BASELINE_STEP,
      kind: 'baseline',
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
      needsPause: false,
    },
    ...doors.map((d) => ringStep(d, outdoorCount)),
    // Doors opened after a doorbell first, the default door (needs a pause after ringing) last.
    ...openable.filter((d) => !d.default).map(openStep),
    ...openable.filter((d) => d.default).map(openStep),
  ];
}
