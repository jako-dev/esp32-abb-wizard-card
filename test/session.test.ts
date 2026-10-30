import {
  addCapture,
  createSession,
  lastRingTime,
  parseSession,
  removeCapture,
  serializeSession,
  setDials,
  setIndoorAddress,
  setSkipped,
} from '../src/session';
import { STEP_IDS } from '../src/types';

const now = new Date('2026-10-30T12:00:00Z');
const capture = (endedAt: string, line = '[2001 > 1010] Type: 01') => ({
  startedAt: endedAt,
  endedAt,
  lines: [{ time: endedAt, line }],
});

describe('session', () => {
  it('creates an empty session with all steps', () => {
    const s = createSession('sensor.x', now);
    expect(Object.keys(s.steps)).toEqual([...STEP_IDS]);
    expect(s.createdAt).toBe('2026-10-30T12:00:00.000Z');
  });

  it('adds and removes captures immutably', () => {
    const s0 = createSession('sensor.x', now);
    const s1 = addCapture(
      setSkipped(s0, 'ring_gate', true, now),
      'ring_gate',
      capture('2026-10-30T12:01:00Z'),
      now,
    );
    const s2 = addCapture(s1, 'ring_gate', capture('2026-10-30T12:02:00Z'), now);
    expect(s0.steps.ring_gate.captures).toHaveLength(0);
    expect(s2.steps.ring_gate).toMatchObject({ skipped: false });
    expect(s2.steps.ring_gate.captures).toHaveLength(2);
    const s3 = removeCapture(s2, 'ring_gate', 0, now);
    expect(s3.steps.ring_gate.captures.map((c) => c.endedAt)).toEqual(['2026-10-30T12:02:00Z']);
  });

  it('round-trips through JSON', () => {
    let s = createSession('sensor.x', now);
    s = setDials(s, { station: 2, x10: 1, x1: 6 }, now);
    s = setIndoorAddress(s, 0x1010, now);
    s = addCapture(s, 'open_house', capture('2026-10-30T12:05:00Z', '[1010 > 4001] Type: 0D'), now);
    expect(parseSession(serializeSession(s))).toEqual(s);
    expect(setIndoorAddress(s, undefined, now).indoorAddress).toBeUndefined();
  });

  it('rejects foreign files with a German message', () => {
    expect(() => parseSession('nope')).toThrow('kein gültiges JSON');
    expect(() => parseSession('{"foo":1}')).toThrow('keine ABB-Welcome-Wizard-Sitzung');
    expect(() => parseSession('{"format":"abb-welcome-wizard-session","version":2}')).toThrow(
      'Sitzungsversion',
    );
  });

  it('tolerates incomplete sessions', () => {
    const s = parseSession(
      JSON.stringify({
        format: 'abb-welcome-wizard-session',
        version: 1,
        entity: 'sensor.x',
        steps: { ring_gate: { captures: [{ lines: [{ line: 'a' }, { nope: 1 }] }] }, bogus: {} },
      }),
    );
    expect(s.steps.ring_gate.captures[0].lines).toEqual([{ time: '', line: 'a' }]);
    expect(s.steps.baseline).toEqual({ skipped: false, captures: [] });
    expect(s.dials).toEqual({ station: undefined, x10: undefined, x1: undefined });
  });

  it('finds the last doorbell time', () => {
    let s = createSession('sensor.x', now);
    expect(lastRingTime(s)).toBeUndefined();
    s = addCapture(s, 'ring_gate', capture('2026-10-30T12:01:00Z'), now);
    s = addCapture(s, 'ring_apartment', capture('2026-10-30T12:03:00Z'), now);
    s = addCapture(s, 'baseline', capture('2026-10-30T12:09:00Z'), now);
    expect(lastRingTime(s)?.toISOString()).toBe('2026-10-30T12:03:00.000Z');
  });
});
