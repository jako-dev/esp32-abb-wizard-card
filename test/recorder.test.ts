import { historyToLines } from '../src/history';
import {
  applyHistory,
  captureFinished,
  captureLine,
  COMMIT_DELAY_MS,
  historyWindow,
  lineFromEvent,
  markMissed,
  markReconnected,
  mergeLines,
  parseAddressInput,
  startCapture,
} from '../src/recorder';
import type { HassEvent, StateChangedData } from '../src/ha-types';

const event = (entity_id: string, state: string | null): HassEvent<StateChangedData> => ({
  event_type: 'state_changed',
  time_fired: '2026-10-30T12:00:00.123Z',
  data: {
    entity_id,
    old_state: null,
    new_state:
      state === null ? null : { entity_id, state, last_changed: '', last_updated: '', attributes: {} },
  },
});

describe('recorder', () => {
  it('extracts lines of the configured entity only', () => {
    expect(lineFromEvent(event('sensor.a', '[2001 > 1010] Type: 01'), 'sensor.a')).toEqual({
      time: '2026-10-30T12:00:00.123Z',
      line: '[2001 > 1010] Type: 01',
    });
    expect(lineFromEvent(event('sensor.b', '[2001 > 1010] Type: 01'), 'sensor.a')).toBeNull();
  });

  it('ignores unavailable, unknown and removed states', () => {
    for (const state of ['unavailable', 'unknown', '', null]) {
      expect(lineFromEvent(event('sensor.a', state), 'sensor.a')).toBeNull();
    }
  });

  it('parses address inputs', () => {
    expect(parseAddressInput('0x1010')).toBe(0x1010);
    expect(parseAddressInput(' 1010 ')).toBe(0x1010);
    expect(parseAddressInput('0x000110')).toBe(0x110);
    expect(parseAddressInput(4112)).toBe(0x1010);
    expect(parseAddressInput('10')).toBeUndefined();
    expect(parseAddressInput('xyz')).toBeUndefined();
    expect(parseAddressInput(undefined)).toBeUndefined();
  });

  it('records immediately for a fixed window', () => {
    const line = { time: 't', line: 'x' };
    let c = startCapture('ring:tor', 10, false, 1000);
    expect(c.phase).toBe('recording');
    c = captureLine(c, line, 10, 2000);
    expect(c.lines).toEqual([line]);
    expect(captureFinished(c, 10_999)).toBe(false);
    expect(captureFinished(c, 11_000)).toBe(true);
  });

  it('starts the countdown with the first frame when armed', () => {
    const line = { time: 't', line: 'x' };
    let c = startCapture('ring:tor', 10, true, 1000);
    expect(c.phase).toBe('armed');
    expect(captureFinished(c, 1_000_000)).toBe(false);
    c = captureLine(c, line, 10, 50_000);
    expect(c).toMatchObject({ phase: 'recording', endsAt: 60_000, lines: [line] });
  });

  const at = (ms: number) => new Date(ms).toISOString();
  const T = Date.parse('2026-10-30T12:00:00Z');

  it('merges lines without duplicates', () => {
    const a = [{ time: at(T + 1000), line: 'x' }];
    const b = [
      { time: at(T + 1200), line: 'x' },
      { time: at(T + 500), line: 'y' },
      { time: at(T + 5000), line: 'x' },
    ];
    expect(mergeLines(a, b).map((l) => [l.line, Date.parse(l.time) - T])).toEqual([
      ['y', 500],
      ['x', 1000],
      ['x', 5000],
    ]);
  });

  it('waits for the recorder before giving up on missed frames', () => {
    let c = markMissed(startCapture('ring:tor', 10, false, T));
    expect(c.missed).toBe(true);
    expect(captureFinished(c, T + 20_000)).toBe(false);
    c = markReconnected(c, T + 30_000);
    expect(c.syncAfter).toBe(T + 30_000 + COMMIT_DELAY_MS);

    const history = [{ time: at(T + 3000), line: '[2001 > 1010] Type: 01' }];
    expect(historyWindow(c, T + 31_000)).toEqual({ start: T - 2000, end: T + 12_000 });
    c = applyHistory(c, history, 10, T + 31_000);
    expect(c.lines).toEqual(history);
    expect(c.missed).toBe(true); // recorder may not have written everything yet

    c = applyHistory(c, history, 10, T + 36_000);
    expect(c.missed).toBe(false);
    expect(c.lines).toHaveLength(1);
    expect(captureFinished(c, T + 36_000)).toBe(true);
  });

  it('starts an armed capture with the first frame found in the history', () => {
    let c = markReconnected(markMissed(startCapture('ring:haustuer', 10, true, T)), T + 60_000);
    const history = [
      { time: at(T - 30_000), line: 'old frame before arming' },
      { time: at(T + 40_000), line: '[2002 > 1010] Type: 01' },
      { time: at(T + 41_000), line: '[1010 > 2002] Type: 81' },
      { time: at(T + 55_000), line: 'too late' },
    ];
    c = applyHistory(c, history, 10, T + 70_000);
    expect(c).toMatchObject({
      phase: 'recording',
      startedAt: at(T + 40_000),
      endsAt: T + 50_000,
      missed: false,
    });
    expect(c.lines.map((l) => l.line)).toEqual(['[2002 > 1010] Type: 01', '[1010 > 2002] Type: 81']);
  });

  it('converts recorder history to lines', () => {
    const lines = historyToLines(
      {
        'sensor.a': [
          { s: '[2001 > 1010] Type: 01', lu: T / 1000 + 1.5 },
          { s: 'unavailable', lu: T / 1000 + 2 },
        ],
      },
      'sensor.a',
    );
    expect(lines).toEqual([{ time: at(T + 1500), line: '[2001 > 1010] Type: 01' }]);
    expect(historyToLines(null, 'sensor.a')).toEqual([]);
  });
});
