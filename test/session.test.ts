import { DEFAULT_DOORS } from '../src/doors';
import {
  addCapture,
  createSession,
  doorCaptureCount,
  lastRingTime,
  parseSession,
  removeCapture,
  serializeSession,
  setDials,
  setDoors,
  setExportSettings,
  setIndoorAddress,
  setOverrides,
  setSkipped,
  stepRecord,
} from '../src/session';

const now = new Date('2026-10-30T12:00:00Z');
const capture = (endedAt: string, line = '[2001 > 1010] Type: 01') => ({
  startedAt: endedAt,
  endedAt,
  lines: [{ time: endedAt, line }],
});

describe('session', () => {
  it('creates an empty session with the default doors', () => {
    const s = createSession('sensor.x', undefined, now);
    expect(s.doors.map((d) => d.key)).toEqual(['tor', 'haustuer', 'wohnung']);
    expect(s.steps).toEqual({});
    expect(stepRecord(s, 'ring:tor')).toEqual({ skipped: false, captures: [] });
    expect(s.createdAt).toBe('2026-10-30T12:00:00.000Z');
  });

  it('adds and removes captures immutably', () => {
    const s0 = createSession('sensor.x', undefined, now);
    const s1 = addCapture(
      setSkipped(s0, 'ring:tor', true, now),
      'ring:tor',
      capture('2026-10-30T12:01:00Z'),
      now,
    );
    const s2 = addCapture(s1, 'ring:tor', capture('2026-10-30T12:02:00Z'), now);
    expect(stepRecord(s0, 'ring:tor').captures).toHaveLength(0);
    expect(s2.steps['ring:tor']).toMatchObject({ skipped: false });
    expect(s2.steps['ring:tor'].captures).toHaveLength(2);
    const s3 = removeCapture(s2, 'ring:tor', 0, now);
    expect(s3.steps['ring:tor'].captures.map((c) => c.endedAt)).toEqual(['2026-10-30T12:02:00Z']);
  });

  it('round-trips through JSON', () => {
    let s = createSession('sensor.x', undefined, now);
    s = setDials(s, { station: 2, x10: 1, x1: 6 }, now);
    s = setIndoorAddress(s, 0x1010, now);
    s = addCapture(s, 'open:haustuer', capture('2026-10-30T12:05:00Z', '[1010 > 4001] Type: 0D'), now);
    expect(parseSession(serializeSession(s))).toEqual(s);
    expect(setIndoorAddress(s, undefined, now).overrides.indoorAddress).toBeUndefined();
  });

  it('keeps captures of remaining doors when the doors change', () => {
    let s = createSession('sensor.x', undefined, now);
    s = addCapture(s, 'ring:tor', capture('2026-10-30T12:01:00Z'), now);
    s = addCapture(s, 'open:tor', capture('2026-10-30T12:02:00Z'), now);
    s = addCapture(s, 'ring:haustuer', capture('2026-10-30T12:03:00Z'), now);
    expect(doorCaptureCount(s, DEFAULT_DOORS[0])).toBe(2);

    // Rename the gate and remove its opener, drop the house door.
    s = setDoors(s, [{ ...DEFAULT_DOORS[0], name: 'Einfahrt', open: false }, DEFAULT_DOORS[2]], now);
    expect(s.doors.map((d) => d.name)).toEqual(['Einfahrt', 'Wohnungstür']);
    expect(Object.keys(s.steps)).toEqual(['ring:tor']);
  });

  it('allows only one default door and no opener for floor doors', () => {
    const s = setDoors(createSession('sensor.x', undefined, now), [
      { key: 'a', name: 'A', type: 'outdoor', open: true, default: true },
      { key: 'b', name: 'B', type: 'outdoor', open: true, default: true },
      { key: 'c', name: 'C', type: 'floor', open: true, default: true },
    ]);
    expect(s.doors.map((d) => [d.open, d.default])).toEqual([
      [true, true],
      [true, false],
      [false, false],
    ]);
  });

  it('migrates version 1 sessions with fixed doors', () => {
    const s = parseSession(
      JSON.stringify({
        format: 'abb-welcome-wizard-session',
        version: 1,
        entity: 'sensor.x',
        steps: {
          ring_gate: { captures: [{ lines: [{ line: 'a' }] }] },
          open_house: { skipped: true, captures: [] },
        },
      }),
    );
    expect(s.version).toBe(3);
    expect(s.doors.map((d) => d.key)).toEqual(['tor', 'haustuer', 'wohnung']);
    expect(s.steps['ring:tor'].captures[0].lines).toEqual([{ time: '', line: 'a' }]);
    expect(s.steps['open:haustuer'].skipped).toBe(true);
  });

  it('rejects foreign files with a German message', () => {
    expect(() => parseSession('nope')).toThrow('kein gültiges JSON');
    expect(() => parseSession('{"foo":1}')).toThrow('keine ABB-Welcome-Wizard-Sitzung');
    expect(() => parseSession('{"format":"abb-welcome-wizard-session","version":9,"entity":"x"}')).toThrow(
      'Sitzungsversion',
    );
  });

  it('tolerates incomplete sessions and drops steps of unknown doors', () => {
    const s = parseSession(
      JSON.stringify({
        format: 'abb-welcome-wizard-session',
        version: 2,
        entity: 'sensor.x',
        doors: [{ key: 'garage', name: 'Garage', type: 'outdoor', open: false }, { bogus: true }],
        steps: {
          'ring:garage': { captures: [{ lines: [{ line: 'a' }, { nope: 1 }] }] },
          'ring:tor': { captures: [] },
        },
      }),
    );
    expect(s.doors).toEqual([
      { key: 'garage', name: 'Garage', type: 'outdoor', open: false, default: false },
    ]);
    expect(Object.keys(s.steps)).toEqual(['ring:garage']);
    expect(s.steps['ring:garage'].captures[0].lines).toEqual([{ time: '', line: 'a' }]);
    expect(s.dials).toEqual({ station: undefined, x10: undefined, x1: undefined });
  });

  it('finds the last doorbell time', () => {
    let s = createSession('sensor.x', undefined, now);
    expect(lastRingTime(s)).toBeUndefined();
    s = addCapture(s, 'ring:tor', capture('2026-10-30T12:01:00Z'), now);
    s = addCapture(s, 'open:tor', capture('2026-10-30T12:03:00Z'), now);
    s = addCapture(s, 'open:haustuer', capture('2026-10-30T12:08:00Z'), now);
    s = addCapture(s, 'baseline', capture('2026-10-30T12:09:00Z'), now);
    expect(lastRingTime(s)?.toISOString()).toBe('2026-10-30T12:03:00.000Z');
  });

  it('round-trips manual values and export settings', () => {
    let s = createSession('sensor.x', undefined, now);
    s = setOverrides(s, {
      indoorAddress: 0x1016,
      threeByte: false,
      rings: { tor: { outdoorAddress: 0x2001, conditions: [{ type: 0x01, src: 0x2001, dst: 0x1016 }] } },
      opens: { haustuer: { destination: 0x4002, messageType: 0x0d, data: [0x1c, 0x41, 0x68] } },
    });
    s = setExportSettings(s, {
      mode: 'full',
      name: 'abb-welcome-demo',
      nameAddMacSuffix: true,
      friendlyName: '',
    });
    const parsed = parseSession(serializeSession(s));
    expect(parsed).toEqual(s);
    expect(parsed.exportSettings).toEqual({ mode: 'full', name: 'abb-welcome-demo', nameAddMacSuffix: true });
  });

  it('drops manual values of removed doors', () => {
    let s = setOverrides(createSession('sensor.x', undefined, now), {
      opens: { tor: { destination: 0x2001, messageType: 0x0d, data: [] } },
      rings: { tor: { outdoorAddress: 0x2001 } },
    });
    s = setDoors(s, [DEFAULT_DOORS[1], DEFAULT_DOORS[2]], now);
    expect(s.overrides).toEqual({});
  });

  it('migrates the manual indoor address of version 2 sessions', () => {
    const s = parseSession(
      JSON.stringify({
        format: 'abb-welcome-wizard-session',
        version: 2,
        entity: 'sensor.x',
        indoorAddress: 0x1016,
      }),
    );
    expect(s.overrides).toEqual({ indoorAddress: 0x1016 });
    expect(s.exportSettings).toEqual({});
  });

  it('ignores invalid manual values', () => {
    const s = parseSession(
      JSON.stringify({
        format: 'abb-welcome-wizard-session',
        version: 3,
        entity: 'sensor.x',
        overrides: {
          indoorAddress: 'x',
          rings: { tor: { conditions: [{ type: 0x01, src: 0x2001 }, { type: 999 }] } },
          opens: { haustuer: { destination: 0x4002, messageType: 0x0d, data: [1, 300] } },
        },
      }),
    );
    expect(s.overrides).toEqual({
      rings: { tor: { conditions: [{ type: 0x01, src: 0x2001 }] } },
      opens: { haustuer: { destination: 0x4002, messageType: 0x0d, data: [] } },
    });
  });
});
