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
import { BASELINE_STEP, openStepId, ringStepId } from './doors';
import { parseFrame } from './parser';
import type {
  Door,
  DoorType,
  Frame,
  IndoorResult,
  OpenResult,
  RingCandidate,
  RingResult,
  Session,
  StepId,
  Warning,
  WizardResult,
} from './types';

export const TYPE_RING_OUTDOOR = 0x01;
export const TYPE_CALL = 0x0a;
export const TYPE_RING_INDOOR = 0x11;
export const TYPE_DOOR_BUZZER = 0x0d;
export const TYPE_DOOR_SLIDING = 0x0e;
export const REPLY_FLAG = 0x80;

/** Rule order, used to sort candidates the same way as the examples in Mat931's how_to_customize. */
const RULE_ORDER = [0x01, 0x81, 0x0a, 0x11, 0x91];

export const ringLabel = (door: Door): string => `Klingel „${door.name}“`;
export const openLabel = (door: Door): string => `Öffnen „${door.name}“`;

type ParsedSteps = Record<StepId, Frame[][]>;
const capturesOf = (steps: ParsedSteps, id: StepId): Frame[][] => steps[id] ?? [];

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
  for (const [id, record] of Object.entries(session.steps)) {
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

function determineIndoor(
  steps: ParsedSteps,
  doors: readonly Door[],
  preferred?: number,
): Omit<IndoorResult, 'expected'> | null {
  const byOpen = new Map<number, number>();
  for (const door of doors.filter((d) => d.open)) {
    for (const frames of capturesOf(steps, openStepId(door))) {
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
export function matchRingRule(type: DoorType, f: Frame, indoor: number): RuleMatch | null {
  const outdoorOf = (address: number) => (isOutdoor(address, f.threeByte) ? address : undefined);
  if (type === 'floor') {
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

function warnMissingStep(ctx: Context, step: StepId, label: string): void {
  const skipped = ctx.session.steps[step]?.skipped === true;
  ctx.warnings.push({
    code: skipped ? 'step_skipped' : 'step_missing',
    severity: 'info',
    step,
    message: `${label}: ${skipped ? 'übersprungen' : 'keine Aufnahme vorhanden'}.`,
  });
}

function analyzeRing(ctx: Context, door: Door): RingResult {
  const step = ringStepId(door);
  const label = ringLabel(door);
  const captures = capturesOf(ctx.steps, step);
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
      const match = matchRingRule(door.type, f, ctx.indoor);
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
    warnMissingStep(ctx, step, label);
  } else if (candidates.length === 0) {
    ctx.warnings.push({
      code: 'no_ring_candidates',
      severity: 'warning',
      step,
      message: `${label}: keine passenden Frames gefunden (erwartet: ${
        door.type === 'floor' ? 'Typ 11/91' : 'Typ 01/81/0A'
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
        message: `${label}: kein Kandidat kam in allen ${captures.length} Aufnahmen vor; verwende die besten (${Math.round(best * 100)} %).`,
      });
    }
    if (captures.length === 1) {
      ctx.warnings.push({
        code: 'single_capture',
        severity: 'info',
        step,
        message: `${label}: nur eine Aufnahme – Stabilität nicht prüfbar. 2–3 Wiederholungen empfohlen.`,
      });
    }
  }

  return {
    door: door.key,
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

/**
 * Doorbells of different outdoor doors must be distinguishable. Candidates shared by several doors are dropped
 * if every door keeps at least one own candidate; otherwise the affected pairs are reported.
 */
function separateOutdoorDoors(ctx: Context, doors: readonly Door[], rings: Record<string, RingResult>): void {
  const active = doors.filter((d) => d.type === 'outdoor' && rings[d.key].selected.length > 0);
  const owners = new Map<string, number>();
  for (const door of active) for (const c of rings[door.key].selected) increment(owners, c.key);
  const shared = new Set([...owners].filter(([, n]) => n > 1).map(([key]) => key));
  const own = (door: Door) => rings[door.key].selected.filter((c) => !shared.has(c.key));

  let conflicts = 0;
  for (let i = 0; i < active.length; i++) {
    for (let j = i + 1; j < active.length; j++) {
      const [a, b] = [active[i], active[j]];
      const ra = rings[a.key];
      const rb = rings[b.key];
      const keysB = new Set(rb.selected.map((c) => c.key));
      const overlap = ra.selected.some((c) => keysB.has(c.key));
      const sameOutdoor = ra.outdoorAddress !== undefined && ra.outdoorAddress === rb.outdoorAddress;
      if (!sameOutdoor && !(overlap && (own(a).length === 0 || own(b).length === 0))) continue;
      conflicts++;
      ctx.warnings.push({
        code: 'doors_indistinguishable',
        severity: 'warning',
        message:
          `„${a.name}“ und „${b.name}“ nicht unterscheidbar: beide Klingeln erzeugen dieselben Frames` +
          (sameOutdoor ? ` (Außenstation ${formatAddress(ra.outdoorAddress!, ctx.threeByte)})` : '') +
          '. Beide Klingel-Sensoren würden gemeinsam auslösen.',
      });
    }
  }
  if (conflicts > 0 || shared.size === 0) return;

  for (const door of active) {
    const ring = rings[door.key];
    ring.selected = own(door);
    ring.outdoorAddress = outdoorAddressOf(ring.selected);
  }
  ctx.warnings.push({
    code: 'shared_candidates_removed',
    severity: 'info',
    message: `${shared.size} Kandidat(en) kamen bei mehreren Türen vor und wurden nicht verwendet.`,
  });
}

function analyzeOpen(ctx: Context, door: Door): OpenResult | null {
  const step = openStepId(door);
  const label = openLabel(door);
  const captures = capturesOf(ctx.steps, step);
  if (captures.length === 0) {
    warnMissingStep(ctx, step, label);
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
      message: `${label}: kein 0D/0E-Frame von ${formatAddress(ctx.indoor, ctx.threeByte)} gefunden.`,
    });
    return null;
  }
  if (seen.size > 1) {
    ctx.warnings.push({
      code: 'multiple_open_frames',
      severity: 'info',
      step,
      message: `${label}: ${seen.size} verschiedene Öffnen-Frames gefunden, verwende den häufigsten.`,
    });
  }
  if (best.in.size < captures.length) {
    ctx.warnings.push({
      code: 'unstable_open',
      severity: 'warning',
      step,
      message: `${label}: Öffnen-Frame nur in ${best.in.size} von ${captures.length} Aufnahmen.`,
    });
  }

  const { frame } = best;
  const result: OpenResult = {
    door: door.key,
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
      message: `${label}: keine Bestätigung (${hex2(confirmType)}) gefunden – das Schloss meldet dann keinen Status.`,
    });
  }
  return result;
}

function emptyRing(door: Door): RingResult {
  return { door: door.key, captures: 0, candidates: [], selected: [], otherFrames: [] };
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
      : determineIndoor(steps, session.doors, preferred);
  const result: WizardResult = {
    indoor: null,
    threeByte: majorityThreeByte,
    rings: Object.fromEntries(session.doors.map((d) => [d.key, emptyRing(d)])),
    opens: Object.fromEntries(session.doors.filter((d) => d.open).map((d) => [d.key, null])),
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
    baseline: new Set(capturesOf(steps, BASELINE_STEP).flat().map(frameKey)),
    warnings,
    stats,
  };
  if (capturesOf(steps, BASELINE_STEP).length === 0) {
    warnings.push({
      code: 'no_baseline',
      severity: 'info',
      step: BASELINE_STEP,
      message:
        'Keine Baseline aufgenommen – Frames einer normalen Sprechverbindung können nicht ausgefiltert werden.',
    });
  }

  for (const door of session.doors) result.rings[door.key] = analyzeRing(ctx, door);
  separateOutdoorDoors(ctx, session.doors, result.rings);

  const openable = session.doors.filter((d) => d.open);
  for (const door of openable) result.opens[door.key] = analyzeOpen(ctx, door);
  for (let i = 0; i < openable.length; i++) {
    for (let j = i + 1; j < openable.length; j++) {
      const a = result.opens[openable[i].key];
      const b = result.opens[openable[j].key];
      if (
        a &&
        b &&
        a.destination === b.destination &&
        a.messageType === b.messageType &&
        formatBytesPlain(a.data) === formatBytesPlain(b.data)
      ) {
        warnings.push({
          code: 'same_open_frame',
          severity: 'warning',
          message: `${openLabel(openable[i])} und ${openLabel(openable[j])} senden denselben Frame – beide Schlösser würden dieselbe Tür öffnen.`,
        });
      }
    }
  }

  return result;
}
