import {
  STEP_IDS,
  type Capture,
  type DialSettings,
  type Session,
  type StepId,
  type StepRecord,
} from './types';

export const SESSION_FORMAT = 'abb-welcome-wizard-session';

function emptySteps(): Record<StepId, StepRecord> {
  const steps = {} as Record<StepId, StepRecord>;
  for (const id of STEP_IDS) steps[id] = { skipped: false, captures: [] };
  return steps;
}

export function createSession(entity: string, now: Date = new Date()): Session {
  const iso = now.toISOString();
  return {
    format: SESSION_FORMAT,
    version: 1,
    entity,
    createdAt: iso,
    updatedAt: iso,
    dials: {},
    steps: emptySteps(),
  };
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
  return touch({ ...session, steps: { ...session.steps, [step]: update(session.steps[step]) } }, now);
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

/** Timestamp of the last frame recorded in any doorbell step, used for the "wait a few minutes" hint. */
export function lastRingTime(session: Session): Date | undefined {
  let last: number | undefined;
  for (const step of ['ring_gate', 'ring_house', 'ring_apartment', 'open_gate'] as StepId[]) {
    for (const c of session.steps[step].captures) {
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

/**
 * Parse and validate an exported session. Throws an Error with a German message on invalid input.
 * Unknown steps are ignored, missing steps are filled with empty records.
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
  if (raw.version !== 1) throw new Error(`Nicht unterstützte Sitzungsversion: ${String(raw.version)}.`);
  if (typeof raw.entity !== 'string') throw new Error('Sitzung ohne Entität.');

  const steps = emptySteps();
  const rawSteps = isObject(raw.steps) ? raw.steps : {};
  for (const id of STEP_IDS) {
    const step = rawSteps[id];
    if (!isObject(step)) continue;
    const captures = Array.isArray(step.captures) ? step.captures : [];
    steps[id] = {
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

  const dials = isObject(raw.dials) ? raw.dials : {};
  return {
    format: SESSION_FORMAT,
    version: 1,
    entity: raw.entity,
    createdAt: String(raw.createdAt ?? ''),
    updatedAt: String(raw.updatedAt ?? ''),
    dials: { station: optionalDial(dials.station), x10: optionalDial(dials.x10), x1: optionalDial(dials.x1) },
    ...(optionalDial(raw.indoorAddress) !== undefined ? { indoorAddress: raw.indoorAddress as number } : {}),
    steps,
  };
}
