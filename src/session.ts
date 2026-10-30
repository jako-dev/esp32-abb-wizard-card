import {
  BASELINE_STEP,
  DEFAULT_DOORS,
  doorsFromSession,
  openStepId,
  ringStepId,
  sanitizeDoors,
} from './doors';
import type { Capture, DialSettings, Door, Session, StepId, StepRecord } from './types';

export const SESSION_FORMAT = 'abb-welcome-wizard-session';
export const SESSION_VERSION = 2;

const EMPTY_STEP: StepRecord = Object.freeze({ skipped: false, captures: [] }) as StepRecord;

/** Step ids used by version 1 sessions (fixed gate / house door / apartment setup). */
const LEGACY_STEPS: Record<string, StepId> = {
  baseline: BASELINE_STEP,
  ring_gate: ringStepId('tor'),
  ring_house: ringStepId('haustuer'),
  ring_apartment: ringStepId('wohnung'),
  open_gate: openStepId('tor'),
  open_house: openStepId('haustuer'),
};

export function createSession(
  entity: string,
  doors: readonly Door[] = DEFAULT_DOORS,
  now: Date = new Date(),
): Session {
  const iso = now.toISOString();
  return {
    format: SESSION_FORMAT,
    version: SESSION_VERSION,
    entity,
    createdAt: iso,
    updatedAt: iso,
    dials: {},
    doors: sanitizeDoors(doors),
    steps: {},
  };
}

/** Record of a step; steps without captures need not exist in the session. */
export function stepRecord(session: Session, step: StepId): StepRecord {
  return session.steps[step] ?? EMPTY_STEP;
}

function touch(session: Session, now: Date): Session {
  return { ...session, updatedAt: now.toISOString() };
}

function updateStep(
  session: Session,
  step: StepId,
  update: (record: StepRecord) => StepRecord,
  now: Date,
): Session {
  return touch({ ...session, steps: { ...session.steps, [step]: update(stepRecord(session, step)) } }, now);
}

export function addCapture(
  session: Session,
  step: StepId,
  capture: Capture,
  now: Date = new Date(),
): Session {
  return updateStep(session, step, (r) => ({ skipped: false, captures: [...r.captures, capture] }), now);
}

export function removeCapture(
  session: Session,
  step: StepId,
  index: number,
  now: Date = new Date(),
): Session {
  return updateStep(
    session,
    step,
    (r) => ({ ...r, captures: r.captures.filter((_, i) => i !== index) }),
    now,
  );
}

export function setSkipped(
  session: Session,
  step: StepId,
  skipped: boolean,
  now: Date = new Date(),
): Session {
  return updateStep(session, step, (r) => ({ ...r, skipped }), now);
}

export function setIndoorAddress(
  session: Session,
  address: number | undefined,
  now: Date = new Date(),
): Session {
  const next = touch({ ...session }, now);
  if (address === undefined) delete next.indoorAddress;
  else next.indoorAddress = address;
  return next;
}

export function setDials(session: Session, dials: DialSettings, now: Date = new Date()): Session {
  return touch({ ...session, dials: { ...dials } }, now);
}

/**
 * Replace the door list. Captures of removed doors and open steps of doors that can no longer open are dropped,
 * captures of remaining doors are kept (they are keyed by the stable door key).
 */
export function setDoors(session: Session, doors: readonly Door[], now: Date = new Date()): Session {
  const sanitized = sanitizeDoors(doors);
  const valid = new Set<StepId>([BASELINE_STEP]);
  for (const door of sanitized) {
    valid.add(ringStepId(door));
    if (door.open) valid.add(openStepId(door));
  }
  const steps = Object.fromEntries(Object.entries(session.steps).filter(([id]) => valid.has(id)));
  return touch({ ...session, doors: sanitized, steps }, now);
}

/** Number of captures that would be lost by removing a door. */
export function doorCaptureCount(session: Session, door: Door): number {
  return (
    stepRecord(session, ringStepId(door)).captures.length +
    stepRecord(session, openStepId(door)).captures.length
  );
}

/**
 * End of the last capture in which a doorbell rang (doorbell steps and opening after a doorbell).
 * Used for the "wait a few minutes" hint before opening the default door.
 */
export function lastRingTime(session: Session): Date | undefined {
  const steps: StepId[] = session.doors.flatMap((d) =>
    d.open && !d.default ? [ringStepId(d), openStepId(d)] : [ringStepId(d)],
  );
  let last: number | undefined;
  for (const step of steps) {
    for (const c of stepRecord(session, step).captures) {
      const t = Date.parse(c.endedAt);
      if (!Number.isNaN(t) && (last === undefined || t > last)) last = t;
    }
  }
  return last === undefined ? undefined : new Date(last);
}

export function serializeSession(session: Session): string {
  return JSON.stringify(session, null, 2);
}

const isObject = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null;
const optionalDial = (v: unknown) => (typeof v === 'number' && Number.isInteger(v) ? v : undefined);

function parseStep(step: Record<string, unknown>): StepRecord {
  const captures = Array.isArray(step.captures) ? step.captures : [];
  return {
    skipped: step.skipped === true,
    captures: captures.filter(isObject).map((c) => ({
      startedAt: String(c.startedAt ?? ''),
      endedAt: String(c.endedAt ?? ''),
      lines: (Array.isArray(c.lines) ? c.lines : [])
        .filter(isObject)
        .filter((l) => typeof l.line === 'string')
        .map((l) => ({ time: String(l.time ?? ''), line: l.line as string })),
    })),
  };
}

/**
 * Parse and validate an exported session. Throws an Error with a German message on invalid input.
 * Version 1 sessions (fixed doors) are migrated; steps of unknown doors are dropped.
 */
export function parseSession(json: string): Session {
  let raw: unknown;
  try {
    raw = JSON.parse(json);
  } catch {
    throw new Error('Datei ist kein gültiges JSON.');
  }
  if (!isObject(raw) || raw.format !== SESSION_FORMAT) {
    throw new Error('Datei ist keine ABB-Welcome-Wizard-Sitzung.');
  }
  if (raw.version !== 1 && raw.version !== SESSION_VERSION) {
    throw new Error(`Nicht unterstützte Sitzungsversion: ${String(raw.version)}.`);
  }
  if (typeof raw.entity !== 'string') throw new Error('Sitzung ohne Entität.');

  const legacy = raw.version === 1;
  const doors = (!legacy && doorsFromSession(raw.doors)) || sanitizeDoors(DEFAULT_DOORS);
  const steps: Record<StepId, StepRecord> = {};
  for (const [id, step] of Object.entries(isObject(raw.steps) ? raw.steps : {})) {
    const target = legacy ? LEGACY_STEPS[id] : id;
    if (target && isObject(step)) steps[target] = parseStep(step);
  }

  const dials = isObject(raw.dials) ? raw.dials : {};
  const session: Session = {
    format: SESSION_FORMAT,
    version: SESSION_VERSION,
    entity: raw.entity,
    createdAt: String(raw.createdAt ?? ''),
    updatedAt: String(raw.updatedAt ?? ''),
    dials: { station: optionalDial(dials.station), x10: optionalDial(dials.x10), x1: optionalDial(dials.x1) },
    doors,
    steps,
  };
  if (optionalDial(raw.indoorAddress) !== undefined) session.indoorAddress = raw.indoorAddress as number;
  // Drop steps of doors that do not exist (any more) without touching updatedAt.
  return { ...setDoors(session, doors), updatedAt: session.updatedAt };
}
