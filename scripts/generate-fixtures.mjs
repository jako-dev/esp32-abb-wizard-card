// Generates the session fixtures in test/fixtures/ from compact scenario descriptions.
// Lines are formatted like ESPHome's ABBWelcomeData::format_to() (raw dump, checksum included),
// so the fixtures exercise the parser exactly as the debug text sensor would.
// Usage: node scripts/generate-fixtures.mjs
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'test', 'fixtures');

// Port of ABBWelcomeData::calc_cs_().
function checksum(bytes) {
  let cs = 0;
  for (const b of bytes) {
    const t = (cs ^ b) & 0xffff;
    let x = t;
    for (let s = 0x11; s <= 0x17; s++) x ^= ((t << s) >>> 0x10) & 0xffff;
    cs = (x & 0xfe) ^ ((x >> 8) & 1);
  }
  return ~cs & 0xff;
}

const hex = (n, w = 2) => n.toString(16).toUpperCase().padStart(w, '0');
let messageId = 0x3a;

/**
 * f('2001 > 1010', 0x01, [0x01, 0x10, 0x10], { retransmission, style })
 * style 'current': `<raw> [SRC > DST] Type: XX, Data: XX.XX` (ESPHome >= 2025)
 * style 'legacy':  `<raw> (len) [SRC > DST] Type: XX Data: XX XX` (format from how_to_customize)
 * style 'bare':    `[SRC > DST] Type: XX Data: XX XX` (no raw dump)
 */
function f(route, type, data = [], { retransmission = false, style = 'current' } = {}) {
  const [srcHex, dstHex] = route.split(/\s*>\s*/);
  const threeByte = srcHex.length === 6;
  const width = threeByte ? 6 : 4;
  const src = parseInt(srcHex, 16);
  const dst = parseInt(dstHex, 16);
  const addr = (a) =>
    threeByte ? [(a >> 16) & 0xff, (a >> 8) & 0xff, a & 0xff] : [(a >> 8) & 0xff, a & 0xff];
  if (!retransmission) messageId = (messageId * 37 + 11) & 0xff;
  const flags = (retransmission ? 0x80 : 0) | (threeByte ? 0x40 : 0) | data.length;
  const bytes = [0x55, 0xff, flags, type, ...addr(dst), ...addr(src), messageId, ...data];
  bytes.push(checksum(bytes));
  const raw = bytes.map((b) => hex(b)).join('.');
  const arrow = retransmission ? '»' : '>';
  const head = `[${hex(src, width)} ${arrow} ${hex(dst, width)}] Type: ${hex(type)}`;
  if (style === 'legacy') {
    return `${raw} (${bytes.length}) ${head}${data.length ? ' Data: ' + data.map((b) => hex(b)).join(' ') : ''}`;
  }
  if (style === 'bare') return `${head}${data.length ? ' Data: ' + data.map((b) => hex(b)).join(' ') : ''}`;
  return `${raw} ${head}${data.length ? ', Data: ' + data.map((b) => hex(b)).join('.') : ''}`;
}

let clock = Date.parse('2026-10-30T10:00:00.000Z');
function capture(lines) {
  clock += 60_000;
  const startedAt = new Date(clock).toISOString();
  const recorded = lines.map((line, i) => ({ time: new Date(clock + 500 + i * 120).toISOString(), line }));
  return { startedAt, endedAt: new Date(clock + 10_000).toISOString(), lines: recorded };
}

const DEFAULT_DOORS = [
  { key: 'tor', name: 'Tor', type: 'outdoor', open: true, default: false, icon: 'mdi:gate' },
  { key: 'haustuer', name: 'Haustür', type: 'outdoor', open: true, default: true, icon: 'mdi:door' },
  {
    key: 'wohnung',
    name: 'Wohnungstür',
    type: 'floor',
    open: false,
    default: false,
    icon: 'mdi:door-closed',
  },
];

/** steps: { baseline | 'ring:<door key>' | 'open:<door key>': captures[] | 'skip' } */
function session(entity, dials, doors, steps) {
  const createdAt = '2026-10-30T10:00:00.000Z';
  const result = {
    format: 'abb-welcome-wizard-session',
    version: 2,
    entity,
    createdAt,
    updatedAt: createdAt,
    dials,
    doors,
    steps: Object.fromEntries(
      Object.entries(steps).map(([id, captures]) => [
        id,
        captures === 'skip'
          ? { skipped: true, captures: [] }
          : { skipped: false, captures: captures.map(capture) },
      ]),
    ),
  };
  result.updatedAt = new Date(clock + 20_000).toISOString();
  return result;
}

function write(name, data) {
  writeFileSync(join(outDir, name), JSON.stringify(data, null, 2) + '\n');
  console.log('wrote', name);
}

// --- Scenario 1: example system from Mat931 how_to_customize -------------------------------------
// Indoor station #12 (0x100c), one outdoor station (0x2001), gateway (0x3001), door actuator (0x4001).
{
  const legacy = { style: 'legacy' };
  const ringOutdoor = (extra = []) => [
    f('2001 > 100C', 0x01, [], legacy),
    f('2001 > 3001', 0x0a, [0x01, 0x10, 0x0c], legacy),
    f('100C > 2001', 0x81, [], legacy),
    f('100C > 3001', 0x12, [], legacy),
    f('3001 > 100C', 0x92, [], legacy),
    ...extra,
  ];
  write(
    'mat931-example.json',
    session(
      'sensor.doorbell_intercom',
      { x10: 1, x1: 2 },
      [
        { key: 'haustuer', name: 'Haustür', type: 'outdoor', open: true, default: true },
        { key: 'wohnung', name: 'Wohnungstür', type: 'floor', open: false, default: false },
      ],
      {
        baseline: [
          [
            f('100C > 2001', 0x04, [], legacy),
            f('2001 > 100C', 0x84, [], legacy),
            f('100C > 3001', 0x12, [], legacy),
            f('3001 > 100C', 0x92, [], legacy),
            f('100C > 2001', 0x02, [0x00], legacy),
            f('2001 > 100C', 0x82, [], legacy),
          ],
        ],
        'ring:haustuer': [
          ringOutdoor(),
          ringOutdoor([f('2001 > 100C', 0x01, [], { ...legacy, retransmission: true })]),
          ringOutdoor(),
        ],
        'ring:wohnung': [
          [f('100C > 3001', 0x11, [], legacy), f('3001 > 100C', 0x91, [], legacy)],
          [f('100C > 3001', 0x11, [], legacy), f('3001 > 100C', 0x91, [], legacy)],
        ],
        'open:haustuer': [
          [f('100C > 4001', 0x0d, [0xab, 0xcd, 0xef], legacy), f('4001 > 100C', 0x8d, [], legacy)],
          [
            f('100C > 3001', 0x12, [], legacy),
            f('100C > 4001', 0x0d, [0xab, 0xcd, 0xef], legacy),
            f('4001 > 100C', 0x8d, [], legacy),
          ],
        ],
      },
    ),
  );
}

// --- Scenario 2: two outdoor stations, neighbours, baseline overlap -------------------------------
// Indoor station #16 (0x1010, dials STATION 2 / X10 1 / X1 6), gate (0x2001), house door (0x2002),
// gateway (0x3001), door actuator (0x4001). Neighbours 0x1011 and 0x100f share the bus.
{
  const ringGate = (withReply = true) => [
    f('2001 > 1010', 0x01),
    f('2001 > 3001', 0x0a, [0x01, 0x10, 0x10]),
    ...(withReply ? [f('1010 > 2001', 0x81)] : []),
    f('1010 > 3001', 0x12),
    f('3001 > 1010', 0x92),
  ];
  const ringHouse = () => [
    f('2002 > 1010', 0x01),
    // Identical to a frame of the baseline (manual call to the default outdoor station).
    f('2002 > 3001', 0x0a, [0x01, 0x10, 0x10]),
    f('1010 > 2002', 0x81),
    f('1010 > 3001', 0x12),
    f('3001 > 1010', 0x92),
  ];
  write(
    'two-outdoor-neighbours.json',
    session('sensor.abb_welcome_last_frame', { station: 2, x10: 1, x1: 6 }, DEFAULT_DOORS, {
      baseline: [
        [
          f('1010 > 2002', 0x04),
          f('2002 > 1010', 0x84),
          f('2002 > 3001', 0x0a, [0x01, 0x10, 0x10]),
          f('1010 > 3001', 0x12),
          f('3001 > 1010', 0x92),
          f('2001 > 1011', 0x01),
          f('1011 > 2001', 0x81),
          f('1010 > 2002', 0x02, [0x00]),
          f('2002 > 1010', 0x82),
        ],
        [
          f('1010 > 2002', 0x04),
          f('2002 > 1010', 0x84),
          f('2002 > 3001', 0x0a, [0x01, 0x10, 0x10]),
          f('1010 > 2002', 0x02, [0x00]),
          f('2002 > 1010', 0x82),
        ],
      ],
      'ring:tor': [
        ringGate(),
        // 81 reply lost (e.g. dropped duplicate state in HA).
        [...ringGate(false), f('1011 > 3001', 0x12)],
        [
          ...ringGate(),
          f('2002 > 100F', 0x01),
          f('100F > 2002', 0x81),
          f('2002 > 3001', 0x0a, [0x01, 0x10, 0x0f]),
          'unavailable',
          '55.FF.00.41.10 [Invalid]',
        ],
      ],
      'ring:haustuer': [ringHouse(), [...ringHouse(), f('2002 > 1010', 0x01, [], { retransmission: true })]],
      'ring:wohnung': [
        [f('1010 > 3001', 0x11), f('3001 > 1010', 0x91)],
        [f('1011 > 3001', 0x11), f('3001 > 1011', 0x91), f('1010 > 3001', 0x11), f('3001 > 1010', 0x91)],
      ],
      'open:tor': [
        [...ringGate(), f('1010 > 2001', 0x0d, [0x12, 0x34, 0x56]), f('2001 > 1010', 0x8d)],
        [
          ...ringGate(),
          f('1011 > 4001', 0x0d, [0x99, 0x88, 0x77]),
          f('4001 > 1011', 0x8d),
          f('1010 > 2001', 0x0d, [0x12, 0x34, 0x56]),
          f('2001 > 1010', 0x8d),
        ],
      ],
      'open:haustuer': [
        [f('1010 > 3001', 0x12), f('1010 > 4001', 0x0d, [0xab, 0xcd, 0xef]), f('4001 > 1010', 0x8d)],
        [f('1010 > 4001', 0x0d, [0xab, 0xcd, 0xef]), f('4001 > 1010', 0x8d)],
      ],
    }),
  );
}

// --- Scenario 3: system with three-byte addresses ------------------------------------------------
// Indoor station #16 (0x000110), outdoor station (0x000201), door actuator (0x000401).
{
  const bare = { style: 'bare' };
  write(
    'three-byte.json',
    session('sensor.doorbell_intercom', { x10: 1, x1: 6 }, DEFAULT_DOORS, {
      baseline: 'skip',
      'ring:tor': [
        [f('000201 > 000110', 0x01), f('000110 > 000201', 0x81)],
        [f('000201 > 000110', 0x01, [], bare), f('000110 > 000201', 0x81, [], bare)],
      ],
      'ring:haustuer': 'skip',
      'ring:wohnung': 'skip',
      'open:tor': 'skip',
      'open:haustuer': [
        [f('000110 > 000401', 0x0e, [0x01, 0x02, 0x03]), f('000401 > 000110', 0x8e)],
        [f('000110 > 000401', 0x0e, [0x01, 0x02, 0x03]), f('000401 > 000110', 0x8e)],
      ],
    }),
  );
}

// --- Scenario 4: custom doors, no gate ----------------------------------------------------------
// Indoor station #7 (0x1007), house door (0x2001, default, opener 0x4001), garage with its own outdoor
// station but no opener (0x2003), apartment doorbell named „Wohnung oben“.
{
  const ring = (outdoor) => [
    f(`${outdoor} > 1007`, 0x01),
    f(`1007 > ${outdoor}`, 0x81),
    f('1007 > 3001', 0x12),
    f('3001 > 1007', 0x92),
  ];
  write(
    'custom-doors.json',
    session(
      'sensor.doorbell_intercom',
      { x10: 0, x1: 7 },
      [
        { key: 'haustuer', name: 'Haustür', type: 'outdoor', open: true, default: true },
        { key: 'garage', name: 'Garage', type: 'outdoor', open: false, default: false, icon: 'mdi:garage' },
        { key: 'wohnung_oben', name: 'Wohnung oben', type: 'floor', open: false, default: false },
      ],
      {
        baseline: [
          [f('1007 > 2001', 0x04), f('2001 > 1007', 0x84), f('1007 > 3001', 0x12), f('3001 > 1007', 0x92)],
        ],
        'ring:haustuer': [ring('2001'), ring('2001')],
        'ring:garage': [ring('2003'), [...ring('2003'), f('2001 > 1008', 0x01)]],
        'ring:wohnung_oben': [
          [f('1007 > 3001', 0x11), f('3001 > 1007', 0x91)],
          [f('1007 > 3001', 0x11), f('3001 > 1007', 0x91)],
        ],
        'open:haustuer': [
          [f('1007 > 4001', 0x0d, [0x11, 0x22, 0x33]), f('4001 > 1007', 0x8d)],
          [f('1007 > 4001', 0x0d, [0x11, 0x22, 0x33]), f('4001 > 1007', 0x8d)],
        ],
      },
    ),
  );
}
