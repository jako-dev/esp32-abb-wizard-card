import { readFileSync } from 'node:fs';
import { analyzeSession, matchRingRule } from '../src/analysis';
import { addCapture, createSession, parseSession, setIndoorAddress, setSkipped } from '../src/session';
import type { RingCandidate, Session, StepId } from '../src/types';

export function loadFixture(name: string): Session {
  return parseSession(readFileSync(new URL(`./fixtures/${name}`, import.meta.url), 'utf8'));
}

const summary = (c: RingCandidate[]) => c.map((x) => x.key);
const codes = (r: ReturnType<typeof analyzeSession>) => r.warnings.map((w) => w.code);

/** Build a session from plain debug-sensor lines; each inner array is one capture. */
function sessionFrom(steps: Partial<Record<StepId, string[][]>>, dials = {}): Session {
  let s = createSession('sensor.test', new Date('2026-01-01T00:00:00Z'));
  s = { ...s, dials };
  for (const [step, captures] of Object.entries(steps) as [StepId, string[][]][]) {
    for (const lines of captures) {
      s = addCapture(s, step, {
        startedAt: '2026-01-01T00:00:00Z',
        endedAt: '2026-01-01T00:00:10Z',
        lines: lines.map((line) => ({ time: '2026-01-01T00:00:01Z', line })),
      });
    }
  }
  return s;
}

describe('analyzeSession – Mat931 example system', () => {
  const result = analyzeSession(loadFixture('mat931-example.json'));

  it('finds the indoor station from the open frames and matches the dials', () => {
    expect(result.indoor).toEqual({
      address: 0x100c,
      method: 'open',
      count: 2,
      expected: 0x100c,
      matchesExpected: true,
    });
    expect(result.threeByte).toBe(false);
  });

  it('finds all three outdoor doorbell candidates as reliable', () => {
    const gate = result.rings.ring_gate;
    expect(gate.captures).toBe(3);
    expect(summary(gate.selected)).toEqual(['01|2001|100c|*', '81|100c|2001|*', '0A|2001|3001|01100C']);
    expect(gate.selected.every((c) => c.reliable && c.score === 1)).toBe(true);
    expect(gate.outdoorAddress).toBe(0x2001);
    expect(gate.selected[2].data).toEqual([0x01, 0x10, 0x0c]);
  });

  it('finds the indoor (apartment) doorbell', () => {
    expect(summary(result.rings.ring_apartment.selected)).toEqual(['11|100c|*|*', '91|*|100c|*']);
  });

  it('finds the door opener and its confirmation', () => {
    expect(result.opens.open_gate).toMatchObject({
      destination: 0x4001,
      messageType: 0x0d,
      data: [0xab, 0xcd, 0xef],
      occurrences: 2,
      score: 1,
      confirmation: { source: 0x4001, messageType: 0x8d, occurrences: 2, destination: 0x100c },
    });
    expect(result.opens.open_house).toBeNull();
  });

  it('reports skipped steps but no real problems', () => {
    expect(result.warnings.filter((w) => w.severity !== 'info')).toEqual([]);
    expect(codes(result)).toContain('step_skipped');
    expect(result.stats.unparsedLines).toEqual([]);
  });
});

describe('analyzeSession – two outdoor stations with neighbours', () => {
  const result = analyzeSession(loadFixture('two-outdoor-neighbours.json'));

  it('finds indoor station 0x1010 matching dials 1/6', () => {
    expect(result.indoor).toMatchObject({
      address: 0x1010,
      method: 'open',
      expected: 0x1010,
      matchesExpected: true,
    });
  });

  it('distinguishes gate and house door by outdoor station', () => {
    expect(result.rings.ring_gate.outdoorAddress).toBe(0x2001);
    expect(result.rings.ring_house.outdoorAddress).toBe(0x2002);
    expect(codes(result)).not.toContain('gate_house_indistinguishable');
  });

  it('only selects candidates present in every gate capture', () => {
    const gate = result.rings.ring_gate;
    expect(summary(gate.selected)).toEqual(['01|2001|1010|*', '0A|2001|3001|011010']);
    const reply = gate.candidates.find((c) => c.type === 0x81)!;
    expect(reply).toMatchObject({ occurrences: 2, reliable: false });
    expect(reply.score).toBeCloseTo(2 / 3);
  });

  it('removes frames that also occur in the baseline', () => {
    const house = result.rings.ring_house;
    expect(summary(house.selected)).toEqual(['01|2002|1010|*', '81|1010|2002|*']);
    expect(house.candidates.some((c) => c.type === 0x0a)).toBe(false);
    expect(result.stats.baselineFiltered).toBeGreaterThan(0);
  });

  it('ignores neighbour frames', () => {
    const all = Object.values(result.rings).flatMap((r) => r.candidates);
    for (const c of all) {
      expect([c.src, c.dst].filter((a) => a === 0x1011 || a === 0x100f)).toEqual([]);
    }
    expect(summary(result.rings.ring_apartment.selected)).toEqual(['11|1010|*|*', '91|*|1010|*']);
    expect(result.stats.neighbourFiltered).toBeGreaterThan(0);
  });

  it('finds different open frames for gate and house door', () => {
    expect(result.opens.open_gate).toMatchObject({
      destination: 0x2001,
      messageType: 0x0d,
      data: [0x12, 0x34, 0x56],
      confirmation: { source: 0x2001, messageType: 0x8d },
    });
    expect(result.opens.open_house).toMatchObject({
      destination: 0x4001,
      messageType: 0x0d,
      data: [0xab, 0xcd, 0xef],
      confirmation: { source: 0x4001, messageType: 0x8d },
    });
    expect(codes(result)).not.toContain('gate_house_same_open');
  });

  it('collects unparsable lines instead of dropping them', () => {
    expect(result.stats.unparsedLines).toEqual(['unavailable', '55.FF.00.41.10 [Invalid]']);
    expect(codes(result)).toContain('unparsed_lines');
  });

  it('warns about unstable candidates only as information', () => {
    expect(result.warnings.filter((w) => w.severity !== 'info')).toEqual([]);
  });
});

describe('analyzeSession – three-byte addresses', () => {
  const result = analyzeSession(loadFixture('three-byte.json'));

  it('detects three-byte addressing', () => {
    expect(result.threeByte).toBe(true);
    expect(result.indoor).toMatchObject({ address: 0x000110, expected: 0x000110, matchesExpected: true });
    expect(result.rings.ring_gate.outdoorAddress).toBe(0x000201);
    expect(result.opens.open_house).toMatchObject({
      destination: 0x000401,
      messageType: 0x0e,
      confirmation: { source: 0x000401, messageType: 0x8e },
    });
  });
});

describe('analyzeSession – edge cases', () => {
  it('reports an error if no indoor station is found', () => {
    const result = analyzeSession(sessionFrom({ ring_gate: [['[2001 > 3001] Type: 0A']] }));
    expect(result.indoor).toBeNull();
    expect(result.warnings.find((w) => w.code === 'no_indoor')?.severity).toBe('error');
  });

  it('falls back to the most frequent indoor address', () => {
    const result = analyzeSession(
      sessionFrom({
        ring_gate: [['[2001 > 1010] Type: 01', '[1010 > 2001] Type: 81', '[2001 > 1011] Type: 01']],
      }),
    );
    expect(result.indoor).toMatchObject({ address: 0x1010, method: 'frequency' });
    expect(codes(result)).toContain('indoor_by_frequency');
  });

  it('warns if the detected address does not match the dials', () => {
    const result = analyzeSession(
      sessionFrom({ open_house: [['[1011 > 4001] Type: 0D Data: 01 02 03']] }, { x10: 1, x1: 6 }),
    );
    expect(result.indoor).toMatchObject({ address: 0x1011, expected: 0x1010, matchesExpected: false });
    expect(codes(result)).toContain('indoor_mismatch');
  });

  it('uses a manually configured indoor address', () => {
    const lines = [['[2001 > 1010] Type: 01', '[2001 > 1011] Type: 01', '[2001 > 1011] Type: 01']];
    let session = sessionFrom({ ring_gate: lines });
    expect(analyzeSession(session).indoor?.address).toBe(0x1011);

    session = setIndoorAddress(session, 0x1010);
    const result = analyzeSession(session);
    expect(result.indoor).toMatchObject({ address: 0x1010, method: 'manual' });
    expect(summary(result.rings.ring_gate.selected)).toEqual(['01|2001|1010|*']);

    expect(analyzeSession(session, { indoorAddress: 0x1011 }).indoor?.address).toBe(0x1011);
  });

  it('warns if a manual indoor address never occurs', () => {
    const session = setIndoorAddress(sessionFrom({ ring_gate: [['[2001 > 1010] Type: 01']] }), 0x1020);
    expect(codes(analyzeSession(session))).toContain('manual_indoor_unseen');
  });

  it('warns if gate and house doorbell cannot be distinguished', () => {
    const ring = ['[2001 > 1010] Type: 01', '[1010 > 2001] Type: 81'];
    const result = analyzeSession(
      sessionFrom({
        ring_gate: [ring, ring],
        ring_house: [ring, ring],
        open_house: [['[1010 > 4001] Type: 0D Data: 01']],
      }),
    );
    expect(codes(result)).toContain('gate_house_indistinguishable');
  });

  it('drops candidates shared by gate and house if both stay distinguishable', () => {
    const shared = '[3001 > 2001] Type: 0A Data: 01 10 10';
    const result = analyzeSession(
      sessionFrom({
        ring_gate: [['[2001 > 1010] Type: 01', shared]],
        ring_house: [['[2002 > 1010] Type: 01', shared]],
        open_house: [['[1010 > 4001] Type: 0D Data: 01']],
      }),
    );
    expect(summary(result.rings.ring_gate.selected)).toEqual(['01|2001|1010|*']);
    expect(summary(result.rings.ring_house.selected)).toEqual(['01|2002|1010|*']);
    expect(codes(result)).toContain('gate_house_shared_removed');
    expect(codes(result)).not.toContain('gate_house_indistinguishable');
  });

  it('uses the best candidates with a warning if none is stable', () => {
    const result = analyzeSession(
      sessionFrom({
        ring_apartment: [['[1010 > 3001] Type: 11'], ['[3001 > 1010] Type: 91'], ['[1010 > 3001] Type: 11']],
        open_house: [['[1010 > 4001] Type: 0D Data: 01']],
      }),
    );
    expect(summary(result.rings.ring_apartment.selected)).toEqual(['11|1010|*|*']);
    expect(codes(result)).toContain('unstable_candidates');
  });

  it('warns if no open frame was recorded', () => {
    const result = analyzeSession(
      sessionFrom({
        ring_gate: [['[2001 > 1010] Type: 01']],
        open_gate: [['[1010 > 2001] Type: 12']],
      }),
    );
    expect(result.opens.open_gate).toBeNull();
    expect(codes(result)).toContain('no_open_frame');
  });

  it('warns if gate and house open the same door', () => {
    const open = ['[1010 > 4001] Type: 0D Data: 01 02', '[4001 > 1010] Type: 8D'];
    const result = analyzeSession(sessionFrom({ open_gate: [open], open_house: [open] }));
    expect(codes(result)).toContain('gate_house_same_open');
  });

  it('reports missing and skipped steps', () => {
    let session = sessionFrom({ open_house: [['[1010 > 4001] Type: 0D Data: 01']] });
    session = setSkipped(session, 'ring_gate', true);
    const result = analyzeSession(session);
    const byStep = Object.fromEntries(result.warnings.filter((w) => w.step).map((w) => [w.step, w.code]));
    expect(byStep.ring_gate).toBe('step_skipped');
    expect(byStep.ring_house).toBe('step_missing');
    expect(codes(result)).toContain('no_baseline');
  });
});

describe('matchRingRule', () => {
  const frame = { src: 0, dst: 0, type: 0, data: [], threeByte: false, retransmission: false };

  it('does not match frames of other indoor stations', () => {
    expect(matchRingRule('ring_gate', { ...frame, type: 0x01, src: 0x2001, dst: 0x1011 }, 0x1010)).toBeNull();
    expect(matchRingRule('ring_apartment', { ...frame, type: 0x11, src: 0x1011 }, 0x1010)).toBeNull();
  });

  it('requires the indoor address in the data of type 0A', () => {
    const call = { ...frame, type: 0x0a, src: 0x2001, dst: 0x3001 };
    expect(matchRingRule('ring_gate', { ...call, data: [1, 0x10, 0x10] }, 0x1010)).toMatchObject({
      outdoor: 0x2001,
    });
    expect(matchRingRule('ring_gate', { ...call, data: [1, 0x10, 0x11] }, 0x1010)).toBeNull();
  });
});
