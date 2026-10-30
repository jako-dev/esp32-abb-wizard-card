import {
  captureFinished,
  captureLine,
  lineFromEvent,
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
    let c = startCapture(10, false, 1000);
    expect(c.phase).toBe('recording');
    c = captureLine(c, line, 10, 2000);
    expect(c.lines).toEqual([line]);
    expect(captureFinished(c, 10_999)).toBe(false);
    expect(captureFinished(c, 11_000)).toBe(true);
  });

  it('starts the countdown with the first frame when armed', () => {
    const line = { time: 't', line: 'x' };
    let c = startCapture(10, true, 1000);
    expect(c.phase).toBe('armed');
    expect(captureFinished(c, 1_000_000)).toBe(false);
    c = captureLine(c, line, 10, 50_000);
    expect(c).toMatchObject({ phase: 'recording', endsAt: 60_000, lines: [line] });
  });
});
