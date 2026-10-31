// @vitest-environment happy-dom
import { analyzeSession } from '../src/analysis';
import { backupKey, loadStoredSession, sessionKey, storeSession } from '../src/storage';

const capture = (line: string) => ({
  startedAt: '2026-10-30T10:00:00.000Z',
  endedAt: '2026-10-30T10:00:10.000Z',
  lines: [{ time: '2026-10-30T10:00:01.000Z', line }],
});

/** Sessions exactly as earlier releases wrote them to localStorage. */
const V1_SESSION = {
  format: 'abb-welcome-wizard-session',
  version: 1,
  entity: 'sensor.doorbell_intercom',
  createdAt: '2026-10-30T09:00:00.000Z',
  updatedAt: '2026-10-30T10:00:10.000Z',
  dials: { station: 2, x10: 1, x1: 6 },
  steps: {
    baseline: { skipped: false, captures: [] },
    ring_gate: { skipped: false, captures: [capture('[2001 > 1016] Type: 01')] },
    ring_house: { skipped: true, captures: [] },
    ring_apartment: { skipped: false, captures: [capture('[1016 > 3001] Type: 11')] },
    open_gate: { skipped: false, captures: [] },
    open_house: { skipped: false, captures: [capture('[4002 > 1016] Type: 8D Data: 1C 41 68')] },
  },
};

const V2_SESSION = {
  format: 'abb-welcome-wizard-session',
  version: 2,
  entity: 'sensor.doorbell_intercom',
  createdAt: '2026-10-30T09:00:00.000Z',
  updatedAt: '2026-10-30T10:00:10.000Z',
  dials: { x10: 1, x1: 6 },
  indoorAddress: 0x1016,
  doors: [
    { key: 'haustuer', name: 'Haustür', type: 'outdoor', open: true, default: true },
    { key: 'wohnung', name: 'Wohnungstür', type: 'floor', open: false, default: false },
  ],
  steps: {
    'open:haustuer': { skipped: false, captures: [capture('[1016 > 4002] Type: 0D Data: 1C 41 68')] },
  },
};

describe('stored sessions', () => {
  const entity = 'sensor.doorbell_intercom';
  beforeEach(() => localStorage.clear());

  it('keeps the storage key of earlier versions', () => {
    expect(sessionKey(entity)).toBe('abb-welcome-wizard-card:session:sensor.doorbell_intercom');
  });

  it('migrates a version 1 session without losing recordings', () => {
    localStorage.setItem(sessionKey(entity), JSON.stringify(V1_SESSION));
    const session = loadStoredSession(entity)!;
    expect(session.version).toBe(3);
    expect(session.dials).toEqual({ station: 2, x10: 1, x1: 6 });
    expect(session.steps['ring:tor'].captures[0].lines[0].line).toBe('[2001 > 1016] Type: 01');
    expect(session.steps['ring:haustuer'].skipped).toBe(true);
    expect(session.steps['open:haustuer'].captures).toHaveLength(1);
    expect(session.overrides).toEqual({});

    const result = analyzeSession(session);
    expect(result.indoor).toMatchObject({ address: 0x1016, dialMatch: 'digits' });
    expect(result.opens.haustuer).toMatchObject({ destination: 0x4002, derived: true });

    // Written back in the current format under the same key, readable again.
    storeSession(session);
    expect(JSON.parse(localStorage.getItem(sessionKey(entity))!).version).toBe(3);
    expect(loadStoredSession(entity)).toEqual(session);
  });

  it('migrates a version 2 session including the manual indoor address', () => {
    localStorage.setItem(sessionKey(entity), JSON.stringify(V2_SESSION));
    const session = loadStoredSession(entity)!;
    expect(session.overrides).toEqual({ indoorAddress: 0x1016 });
    expect(session.doors.map((d) => d.key)).toEqual(['haustuer', 'wohnung']);
    expect(session.steps['open:haustuer'].captures).toHaveLength(1);
    expect(analyzeSession(session).indoor).toMatchObject({ address: 0x1016, method: 'manual' });
  });

  it('keeps a backup of a session it cannot read', () => {
    const unreadable = JSON.stringify({ ...V2_SESSION, version: 99 });
    localStorage.setItem(sessionKey(entity), unreadable);
    expect(loadStoredSession(entity)).toBeUndefined();
    expect(localStorage.getItem(backupKey(entity))).toBe(unreadable);
  });
});
