import {
  BASELINE_STEP,
  DEFAULT_DOORS,
  doorsFromSession,
  openStepId,
  ringStepId,
  sanitizeDoors,
} from './doors';
import type {
  Capture,
  DialSettings,
  Door,
  ExportSettings,
  OpenOverride,
  Overrides,
  RingCondition,
  Session,
  StepId,
  StepRecord,
} from './types';

export const SESSION_FORMAT = 'abb-welcome-wizard-session';
/**
 * Schema history: 1 = fixed doors (ring_gate …), 2 = configurable doors, 3 = manual overrides and export
 * settings (the manual indoor address moved from `indoorAddress` to `overrides.indoorAddress`).
 */
export const SESSION_VERSION = 3;

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
    overrides: {},
    exportSettings: {},
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
  return setOverrides(session, { ...session.overrides, indoorAddress: address }, now);
}

/** Replace the manual values; undefined / empty entries are dropped. */
export function setOverrides(session: Session, overrides: Overrides, now: Date = new Date()): Session {
  return touch({ ...session, overrides: cleanOverrides(overrides) }, now);
}

export function setExportSettings(
  session: Session,
  settings: ExportSettings,
  now: Date = new Date(),
): Session {
  const clean = Object.fromEntries(Object.entries(settings).filter(([, v]) => v !== undefined && v !== ''));
  return touch({ ...session, exportSettings: clean }, now);
}

function cleanOverrides(overrides: Overrides): Overrides {
  const result: Overrides = {};
  if (overrides.indoorAddress !== undefined) result.indoorAddress = overrides.indoorAddress;
  if (overrides.threeByte !== undefined) result.threeByte = overrides.threeByte;
  const rings = Object.entries(overrides.rings ?? {}).filter(
    ([, r]) => r.outdoorAddress !== undefined || r.conditions !== undefined,
  );
  if (rings.length > 0) result.rings = Object.fromEntries(rings);
  if (overrides.opens && Object.keys(overrides.opens).length > 0) result.opens = { ...overrides.opens };
  return result;
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
  // Manual values of removed doors go as well; the rest is kept.
  const keys = new Set(sanitized.map((d) => d.key));
  const openKeys = new Set(sanitized.filter((d) => d.open).map((d) => d.key));
  const { rings, opens } = session.overrides;
  const overrides = cleanOverrides({
    ...session.overrides,
    rings: rings && Object.fromEntries(Object.entries(rings).filter(([k]) => keys.has(k))),
    opens: opens && Object.fromEntries(Object.entries(opens).filter(([k]) => openKeys.has(k))),
  });
  return touch({ ...session, doors: sanitized, steps, overrides }, now);
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
const isAddress = (v: unknown): v is number =>
  typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 0xffffff;
const isByte = (v: unknown): v is number =>
  typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= 0xff;
const bytesOf = (v: unknown): number[] | undefined =>
  Array.isArray(v) && v.length <= 15 && v.every(isByte) ? [...v] : undefined;

function parseCondition(raw: unknown): RingCondition | undefined {
  if (!isObject(raw) || !isByte(raw.type)) return undefined;
  const condition: RingCondition = { type: raw.type };
  if (isAddress(raw.src)) condition.src = raw.src;
  if (isAddress(raw.dst)) condition.dst = raw.dst;
  const data = bytesOf(raw.data);
  if (data) condition.data = data;
  return condition;
}

function parseOpenOverride(raw: unknown): OpenOverride | undefined {
  if (!isObject(raw) || !isAddress(raw.destination) || !isByte(raw.messageType)) return undefined;
  return { destination: raw.destination, messageType: raw.messageType, data: bytesOf(raw.data) ?? [] };
}

/** Lenient: invalid entries are dropped, everything valid is kept. */
function parseOverrides(raw: unknown): Overrides {
  if (!isObject(raw)) return {};
  const overrides: Overrides = {};
  if (isAddress(raw.indoorAddress)) overrides.indoorAddress = raw.indoorAddress;
  if (typeof raw.threeByte === 'boolean') overrides.threeByte = raw.threeByte;
  if (isObject(raw.rings)) {
    overrides.rings = {};
    for (const [key, value] of Object.entries(raw.rings)) {
      if (!isObject(value)) continue;
      const ring: { outdoorAddress?: number; conditions?: RingCondition[] } = {};
      if (isAddress(value.outdoorAddress)) ring.outdoorAddress = value.outdoorAddress;
      if (Array.isArray(value.conditions)) {
        ring.conditions = value.conditions.map(parseCondition).filter((c): c is RingCondition => !!c);
      }
      overrides.rings[key] = ring;
    }
  }
  if (isObject(raw.opens)) {
    overrides.opens = {};
    for (const [key, value] of Object.entries(raw.opens)) {
      const open = parseOpenOverride(value);
      if (open) overrides.opens[key] = open;
    }
  }
  return cleanOverrides(overrides);
}

function parseExportSettings(raw: unknown): ExportSettings {
  if (!isObject(raw)) return {};
  const settings: ExportSettings = {};
  if (raw.mode === 'full' || raw.mode === 'snippet') settings.mode = raw.mode;
  for (const key of ['name', 'friendlyName', 'debugSensorName', 'useAddress'] as const) {
    if (typeof raw[key] === 'string' && raw[key] !== '') settings[key] = raw[key] as string;
  }
  if (typeof raw.nameAddMacSuffix === 'boolean') settings.nameAddMacSuffix = raw.nameAddMacSuffix;
  if (typeof raw.allowPlaintextUpload === 'boolean') settings.allowPlaintextUpload = raw.allowPlaintextUpload;
  return settings;
}

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
 * Parse and validate an exported or stored session. Throws an Error with a German message on invalid input.
 * Sessions of schema version 1 and 2 are migrated to the current version; steps of unknown doors are dropped.
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
  if (raw.version !== 1 && raw.version !== 2 && raw.version !== SESSION_VERSION) {
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
    overrides: parseOverrides(raw.overrides),
    exportSettings: parseExportSettings(raw.exportSettings),
  };
  // Version 2 kept the manual indoor address at the top level.
  if (raw.version === 2 && isAddress(raw.indoorAddress)) {
    session.overrides = { ...session.overrides, indoorAddress: raw.indoorAddress };
  }
  // Drop steps of doors that do not exist (any more) without touching updatedAt.
  return { ...setDoors(session, doors), updatedAt: session.updatedAt };
}
