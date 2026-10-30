import {
  apartmentFromDials,
  dataContainsAddress,
  describeAddress,
  expectedIndoorAddress,
  formatAddress,
  formatBytesPlain,
  involvesAddress,
  isIndoor,
  isOutdoor,
} from './address';
import { parseFrame } from './parser';
import type {
  Frame,
  IndoorResult,
  OpenResult,
  OpenStepId,
  RingCandidate,
  RingResult,
  RingStepId,
  Session,
  StepId,
  Warning,
  WizardResult,
} from './types';

export const RING_STEPS: readonly RingStepId[] = ['ring_gate', 'ring_house', 'ring_apartment'];
export const OPEN_STEPS: readonly OpenStepId[] = ['open_gate', 'open_house'];

export const TYPE_RING_OUTDOOR = 0x01;
export const TYPE_CALL = 0x0a;
export const TYPE_RING_INDOOR = 0x11;
export const TYPE_DOOR_BUZZER = 0x0d;
export const TYPE_DOOR_SLIDING = 0x0e;
export const REPLY_FLAG = 0x80;

/** Rule order, used to sort candidates the same way as the examples in Mat931's how_to_customize. */
const RULE_ORDER = [0x01, 0x81, 0x0a, 0x11, 0x91];

export const STEP_LABELS: Record<StepId, string> = {
  baseline: 'Baseline',
  ring_gate: 'Klingeln Tor',
  ring_house: 'Klingeln Haustür',
  ring_apartment: 'Klingeln Wohnungstür',
  open_gate: 'Öffnen Tor',
  open_house: 'Öffnen Haustür',
};

type ParsedSteps = Record<StepId, Frame[][]>;

export interface AnalysisOptions {
  /** Overrides the apartment number derived from the session's dial settings. */
  expectedApartment?: number;
  /** Manually configured indoor station address; skips auto-detection. */
  indoorAddress?: number;
}

const hex2 = (n: number) => n.toString(16).toUpperCase().padStart(2, '0');

/** Identity of a frame regardless of message id / retransmission: (src, dst, type, data). */
export const frameKey = (f: Frame): string => `${f.src}|${f.dst}|${f.type}|${f.data.join(',')}`;

function candidateKey(c: Pick<RingCandidate, 'type' | 'src' | 'dst' | 'data'>): string {
  const opt = (v: number | undefined) => (v === undefined ? '*' : v.toString(16));
  return `${hex2(c.type)}|${opt(c.src)}|${opt(c.dst)}|${c.data ? c.data.map(hex2).join('') : '*'}`;
}

function mostFrequent<T>(counts: Map<T, number>, tieBreak?: (a: T, b: T) => number): [T, number] | null {
  let best: [T, number] | null = null;
  for (const entry of counts) {
    if (
      !best ||
      entry[1] > best[1] ||
      (entry[1] === best[1] && tieBreak && tieBreak(entry[0], best[0]) < 0)
    ) {
      best = entry;
    }
  }
  return best;
}

function increment<T>(map: Map<T, number>, key: T, by = 1): void {
  map.set(key, (map.get(key) ?? 0) + by);
}

function parseSteps(session: Session, unparsed: string[]): { steps: ParsedSteps; total: number } {
  let total = 0;
  const steps = {} as ParsedSteps;
  for (const [id, record] of Object.entries(session.steps) as [StepId, Session['steps'][StepId]][]) {
    steps[id] = record.captures.map((capture) =>
      capture.lines.flatMap((entry) => {
        total++;
        const result = parseFrame(entry.line);
        if (result.ok) return [result.frame];
        unparsed.push(entry.line);
        return [];
      }),
    );
  }
  return { steps, total };
}

function determineIndoor(steps: ParsedSteps, preferred?: number): Omit<IndoorResult, 'expected'> | null {
  const byOpen = new Map<number, number>();
  for (const id of OPEN_STEPS) {
    for (const frames of steps[id]) {
      for (const f of frames) {
        if ((f.type === TYPE_DOOR_BUZZER || f.type === TYPE_DOOR_SLIDING) && isIndoor(f.src, f.threeByte)) {
          increment(byOpen, f.src);
        }
      }
    }
  }
  // Ties: prefer the address matching the dials, then the lowest address (deterministic).
  const tieBreak = (a: number, b: number) => (a === preferred ? -1 : b === preferred ? 1 : a - b);
  const open = mostFrequent(byOpen, tieBreak);
  if (open) return { address: open[0], method: 'open', count: open[1] };

  const byFrequency = new Map<number, number>();
  for (const captures of Object.values(steps)) {
    for (const frames of captures) {
      for (const f of frames) {
        if (isIndoor(f.src, f.threeByte)) increment(byFrequency, f.src);
        if (isIndoor(f.dst, f.threeByte) && f.dst !== f.src) increment(byFrequency, f.dst);
      }
    }
  }
  const freq = mostFrequent(byFrequency, tieBreak);
  return freq ? { address: freq[0], method: 'frequency', count: freq[1] } : null;
}

type RuleMatch = Pick<RingCandidate, 'type' | 'src' | 'dst' | 'data' | 'outdoor'>;

/** Doorbell rules from Mat931's how_to_customize. */
export function matchRingRule(step: RingStepId, f: Frame, indoor: number): RuleMatch | null {
  const outdoorOf = (address: number) => (isOutdoor(address, f.threeByte) ? address : undefined);
  if (step === 'ring_apartment') {
    if (f.type === TYPE_RING_INDOOR && f.src === indoor) return { type: f.type, src: f.src };
    if (f.type === (TYPE_RING_INDOOR | REPLY_FLAG) && f.dst === indoor) return { type: f.type, dst: f.dst };
    return null;
  }
  if (f.type === TYPE_RING_OUTDOOR && f.dst === indoor) {
    return { type: f.type, src: f.src, dst: f.dst, outdoor: outdoorOf(f.src) };
  }
  if (f.type === (TYPE_RING_OUTDOOR | REPLY_FLAG) && f.src === indoor) {
    return { type: f.type, src: f.src, dst: f.dst, outdoor: outdoorOf(f.dst) };
  }
  if (f.type === TYPE_CALL && dataContainsAddress(f, indoor)) {
    return { type: f.type, src: f.src, dst: f.dst, data: [...f.data], outdoor: outdoorOf(f.src) };
  }
  return null;
}

function compareCandidates(a: RingCandidate, b: RingCandidate): number {
  return (
    b.score - a.score ||
    RULE_ORDER.indexOf(a.type) - RULE_ORDER.indexOf(b.type) ||
    (a.key < b.key ? -1 : a.key > b.key ? 1 : 0)
  );
}

interface Context {
  session: Session;
  steps: ParsedSteps;
  indoor: number;
  threeByte: boolean;
  baseline: Set<string>;
  warnings: Warning[];
  stats: WizardResult['stats'];
}

function warnMissingStep(ctx: Context, step: StepId): void {
  const skipped = ctx.session.steps[step].skipped;
  ctx.warnings.push({
    code: skipped ? 'step_skipped' : 'step_missing',
    severity: 'info',
    step,
    message: `${STEP_LABELS[step]}: ${skipped ? 'übersprungen' : 'keine Aufnahme vorhanden'}.`,
  });
}

function analyzeRing(ctx: Context, step: RingStepId): RingResult {
  const captures = ctx.steps[step];
  const found = new Map<string, { match: RuleMatch; in: Set<number> }>();
  const other = new Map<string, Frame>();

  captures.forEach((frames, index) => {
    for (const f of frames) {
      if (ctx.baseline.has(frameKey(f))) {
        ctx.stats.baselineFiltered++;
        continue;
      }
      if (!involvesAddress(f, ctx.indoor)) {
        ctx.stats.neighbourFiltered++;
        continue;
      }
      const match = matchRingRule(step, f, ctx.indoor);
      if (!match) {
        if (!other.has(frameKey(f))) other.set(frameKey(f), f);
        continue;
      }
      const key = candidateKey(match);
      const entry = found.get(key) ?? { match, in: new Set<number>() };
      entry.in.add(index);
      found.set(key, entry);
    }
  });

  const candidates: RingCandidate[] = [...found].map(([key, { match, in: seen }]) => ({
    key,
    ...match,
    occurrences: seen.size,
    score: seen.size / captures.length,
    reliable: seen.size === captures.length,
  }));
  candidates.sort(compareCandidates);

  let selected = candidates.filter((c) => c.reliable);
  if (captures.length === 0) {
    warnMissingStep(ctx, step);
  } else if (candidates.length === 0) {
    ctx.warnings.push({
      code: 'no_ring_candidates',
      severity: 'warning',
      step,
      message: `${STEP_LABELS[step]}: keine passenden Frames gefunden (erwartet: ${
        step === 'ring_apartment' ? 'Typ 11/91' : 'Typ 01/81/0A'
      } mit Bezug zu ${formatAddress(ctx.indoor, ctx.threeByte)}).`,
    });
  } else {
    if (selected.length === 0) {
      const best = candidates[0].score;
      selected = candidates.filter((c) => c.score === best);
      ctx.warnings.push({
        code: 'unstable_candidates',
        severity: 'warning',
        step,
        message: `${STEP_LABELS[step]}: kein Kandidat kam in allen ${captures.length} Aufnahmen vor; verwende die besten (${Math.round(best * 100)} %).`,
      });
    }
    if (captures.length === 1) {
      ctx.warnings.push({
        code: 'single_capture',
        severity: 'info',
        step,
        message: `${STEP_LABELS[step]}: nur eine Aufnahme – Stabilität nicht prüfbar. 2–3 Wiederholungen empfohlen.`,
      });
    }
  }

  return {
    step,
    captures: captures.length,
    candidates,
    selected,
    outdoorAddress: outdoorAddressOf(selected),
    otherFrames: [...other.values()],
  };
}

function outdoorAddressOf(candidates: RingCandidate[]): number | undefined {
  const counts = new Map<number, number>();
  for (const c of candidates) if (c.outdoor !== undefined) increment(counts, c.outdoor);
  return mostFrequent(counts, (a, b) => a - b)?.[0];
}

/** Gate and house doorbells must be distinguishable; drop candidates both steps share. */
function separateGateAndHouse(ctx: Context, gate: RingResult, house: RingResult): void {
  if (gate.selected.length === 0 || house.selected.length === 0) return;
  const houseKeys = new Set(house.selected.map((c) => c.key));
  const shared = new Set(gate.selected.filter((c) => houseKeys.has(c.key)).map((c) => c.key));

  const gateOnly = gate.selected.filter((c) => !shared.has(c.key));
  const houseOnly = house.selected.filter((c) => !shared.has(c.key));
  const indistinguishable =
    gateOnly.length === 0 ||
    houseOnly.length === 0 ||
    (gate.outdoorAddress !== undefined && gate.outdoorAddress === house.outdoorAddress);

  if (indistinguishable) {
    ctx.warnings.push({
      code: 'gate_house_indistinguishable',
      severity: 'warning',
      message:
        'Tor und Haustür nicht unterscheidbar: beide Klingeln erzeugen dieselben Frames' +
        (gate.outdoorAddress !== undefined && gate.outdoorAddress === house.outdoorAddress
          ? ` (Außenstation ${formatAddress(gate.outdoorAddress, ctx.threeByte)})`
          : '') +
        '. Beide Klingel-Sensoren würden gemeinsam auslösen.',
    });
    return;
  }
  if (shared.size > 0) {
    gate.selected = gateOnly;
    house.selected = houseOnly;
    gate.outdoorAddress = outdoorAddressOf(gateOnly);
    house.outdoorAddress = outdoorAddressOf(houseOnly);
    ctx.warnings.push({
      code: 'gate_house_shared_removed',
      severity: 'info',
      message: `${shared.size} Kandidat(en) kamen bei Tor und Haustür vor und wurden nicht verwendet.`,
    });
  }
}

function analyzeOpen(ctx: Context, step: OpenStepId): OpenResult | null {
  const captures = ctx.steps[step];
  if (captures.length === 0) {
    warnMissingStep(ctx, step);
    return null;
  }

  const seen = new Map<string, { frame: Frame; in: Set<number> }>();
  captures.forEach((frames, index) => {
    for (const f of frames) {
      if (f.src !== ctx.indoor || (f.type !== TYPE_DOOR_BUZZER && f.type !== TYPE_DOOR_SLIDING)) continue;
      const key = `${f.dst}|${f.type}|${f.data.join(',')}`;
      const entry = seen.get(key) ?? { frame: f, in: new Set<number>() };
      entry.in.add(index);
      seen.set(key, entry);
    }
  });

  let best: { frame: Frame; in: Set<number> } | undefined;
  for (const entry of seen.values()) if (!best || entry.in.size > best.in.size) best = entry;
  if (!best) {
    ctx.warnings.push({
      code: 'no_open_frame',
      severity: 'warning',
      step,
      message: `${STEP_LABELS[step]}: kein 0D/0E-Frame von ${formatAddress(ctx.indoor, ctx.threeByte)} gefunden.`,
    });
    return null;
  }
  if (seen.size > 1) {
    ctx.warnings.push({
      code: 'multiple_open_frames',
      severity: 'info',
      step,
      message: `${STEP_LABELS[step]}: ${seen.size} verschiedene Öffnen-Frames gefunden, verwende den häufigsten.`,
    });
  }
  if (best.in.size < captures.length) {
    ctx.warnings.push({
      code: 'unstable_open',
      severity: 'warning',
      step,
      message: `${STEP_LABELS[step]}: Öffnen-Frame nur in ${best.in.size} von ${captures.length} Aufnahmen.`,
    });
  }

  const { frame } = best;
  const result: OpenResult = {
    step,
    captures: captures.length,
    destination: frame.dst,
    messageType: frame.type,
    data: [...frame.data],
    occurrences: best.in.size,
    score: best.in.size / captures.length,
  };

  const confirmType = frame.type | REPLY_FLAG;
  const replies = [...best.in].map((index) => captures[index].filter((f) => f.type === confirmType));
  // Replies addressed to our own indoor station rule out confirmations of a neighbour's door opener.
  const toIndoor = replies.some((frames) => frames.some((f) => f.dst === ctx.indoor));
  const sources = new Map<number, number>();
  for (const frames of replies) {
    const inCapture = new Set(frames.filter((f) => !toIndoor || f.dst === ctx.indoor).map((f) => f.src));
    for (const src of inCapture) increment(sources, src);
  }
  // Prefer the device that was addressed by the open frame, otherwise the most frequent responder.
  const confirm = sources.has(frame.dst)
    ? ([frame.dst, sources.get(frame.dst)!] as [number, number])
    : mostFrequent(sources, (a, b) => a - b);
  if (confirm) {
    result.confirmation = {
      source: confirm[0],
      messageType: confirmType,
      occurrences: confirm[1],
      ...(toIndoor ? { destination: ctx.indoor } : {}),
    };
  } else {
    ctx.warnings.push({
      code: 'no_confirmation',
      severity: 'info',
      step,
      message: `${STEP_LABELS[step]}: keine Bestätigung (${hex2(confirmType)}) gefunden – das Schloss meldet dann keinen Status.`,
    });
  }
  return result;
}

function emptyRing(step: RingStepId): RingResult {
  return { step, captures: 0, candidates: [], selected: [], otherFrames: [] };
}

export function analyzeSession(session: Session, options: AnalysisOptions = {}): WizardResult {
  const unparsed: string[] = [];
  const { steps, total } = parseSteps(session, unparsed);
  const warnings: Warning[] = [];
  const stats: WizardResult['stats'] = {
    totalLines: total,
    parsedFrames: total - unparsed.length,
    unparsedLines: unparsed,
    baselineFiltered: 0,
    neighbourFiltered: 0,
  };

  const allFrames = Object.values(steps).flat(2);
  const apartment = options.expectedApartment ?? apartmentFromDials(session.dials);
  const majorityThreeByte = allFrames.filter((f) => f.threeByte).length * 2 > allFrames.length;
  const preferred = apartment !== undefined ? expectedIndoorAddress(apartment, majorityThreeByte) : undefined;

  if (unparsed.length > 0) {
    warnings.push({
      code: 'unparsed_lines',
      severity: 'info',
      message: `${unparsed.length} Zeile(n) konnten nicht als Frame gelesen werden.`,
    });
  }

  const manual = options.indoorAddress ?? session.indoorAddress;
  const found: Omit<IndoorResult, 'expected'> | null =
    manual !== undefined
      ? { address: manual, method: 'manual', count: 0 }
      : determineIndoor(steps, preferred);
  const result: WizardResult = {
    indoor: null,
    threeByte: majorityThreeByte,
    rings: {
      ring_gate: emptyRing('ring_gate'),
      ring_house: emptyRing('ring_house'),
      ring_apartment: emptyRing('ring_apartment'),
    },
    opens: { open_gate: null, open_house: null },
    warnings,
    stats,
  };

  if (!found) {
    warnings.push({
      code: 'no_indoor',
      severity: 'error',
      message: 'Keine Innenstationsadresse (10XX / 0001XX) gefunden. Wurden Frames aufgenommen?',
    });
    return result;
  }

  const indoorFrames = allFrames.filter((f) => involvesAddress(f, found.address));
  const threeByte =
    indoorFrames.length > 0
      ? indoorFrames.some((f) => f.threeByte)
      : found.address > 0xffff || majorityThreeByte;
  if (found.method === 'manual' && indoorFrames.length === 0 && allFrames.length > 0) {
    warnings.push({
      code: 'manual_indoor_unseen',
      severity: 'warning',
      message: `Die eingestellte Innenstation ${formatAddress(found.address, threeByte)} kommt in keinem aufgenommenen Frame vor.`,
    });
  }
  if (indoorFrames.some((f) => f.threeByte !== threeByte)) {
    warnings.push({
      code: 'mixed_address_length',
      severity: 'warning',
      message: 'Gemischte 2- und 3-Byte-Adressen gefunden – bitte Aufnahmen prüfen.',
    });
  }
  result.threeByte = threeByte;

  const indoor: IndoorResult = { ...found };
  if (apartment !== undefined) {
    indoor.expected = expectedIndoorAddress(apartment, threeByte);
    indoor.matchesExpected = indoor.expected === found.address;
    if (!indoor.matchesExpected) {
      warnings.push({
        code: 'indoor_mismatch',
        severity: 'warning',
        message: `Ermittelte Innenstation ${formatAddress(found.address, threeByte)} weicht von der erwarteten Adresse ${formatAddress(indoor.expected, threeByte)} (Wohnung ${apartment}) ab. Drehregler prüfen.`,
      });
    }
  }
  if (found.method === 'frequency') {
    warnings.push({
      code: 'indoor_by_frequency',
      severity: 'info',
      message: `Innenstation ${describeAddress(found.address, threeByte)} nur anhand der Häufigkeit bestimmt (kein Öffnen-Frame aufgenommen).`,
    });
  }
  result.indoor = indoor;

  const ctx: Context = {
    session,
    steps,
    indoor: found.address,
    threeByte,
    baseline: new Set(steps.baseline.flat().map(frameKey)),
    warnings,
    stats,
  };
  if (steps.baseline.length === 0) {
    warnings.push({
      code: 'no_baseline',
      severity: 'info',
      step: 'baseline',
      message:
        'Keine Baseline aufgenommen – Frames einer normalen Sprechverbindung können nicht ausgefiltert werden.',
    });
  }

  for (const step of RING_STEPS) result.rings[step] = analyzeRing(ctx, step);
  separateGateAndHouse(ctx, result.rings.ring_gate, result.rings.ring_house);

  for (const step of OPEN_STEPS) result.opens[step] = analyzeOpen(ctx, step);
  const { open_gate: gate, open_house: house } = result.opens;
  if (
    gate &&
    house &&
    gate.destination === house.destination &&
    gate.messageType === house.messageType &&
    formatBytesPlain(gate.data) === formatBytesPlain(house.data)
  ) {
    warnings.push({
      code: 'gate_house_same_open',
      severity: 'warning',
      message:
        'Öffnen Tor und Öffnen Haustür senden denselben Frame – beide Schlösser würden dieselbe Tür öffnen.',
    });
  }

  return result;
}
