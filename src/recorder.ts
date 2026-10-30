import type { HassEvent, StateChangedData } from './ha-types';
import type { RecordedLine, StepId } from './types';

const IGNORED_STATES = new Set(['', 'unknown', 'unavailable']);

/** Extract a debug-sensor line from a state_changed event, or null if it is irrelevant. */
export function lineFromEvent(event: HassEvent<StateChangedData>, entity: string): RecordedLine | null {
  if (event.event_type !== 'state_changed' || event.data?.entity_id !== entity) return null;
  const state = event.data.new_state?.state;
  if (typeof state !== 'string' || IGNORED_STATES.has(state.trim())) return null;
  return { time: event.time_fired || new Date().toISOString(), line: state };
}

/** Parse the optional `indoor_address` config value ("0x1010", "1010", 4112). */
export function parseAddressInput(value: unknown): number | undefined {
  if (typeof value === 'number')
    return Number.isInteger(value) && value > 0 && value <= 0xffffff ? value : undefined;
  if (typeof value !== 'string') return undefined;
  const text = value.trim().replace(/^0x/i, '');
  if (!/^([0-9a-f]{4}|[0-9a-f]{6})$/i.test(text)) return undefined;
  return parseInt(text, 16);
}

export type CapturePhase = 'armed' | 'recording';

/** The recorder writes states to the database every 5 s; history is complete after this delay. */
export const COMMIT_DELAY_MS = 6000;
/** Tolerance for clock differences between this device and Home Assistant. */
const MARGIN_MS = 2000;

export interface ActiveCapture {
  step: StepId;
  phase: CapturePhase;
  /** Epoch milliseconds when the user started the capture. */
  armedAt: number;
  startedAt?: string;
  /** Epoch milliseconds at which the recording ends. */
  endsAt?: number;
  lines: RecordedLine[];
  /** Frames may have been missed (connection lost, app in background or reloaded): fill from history. */
  missed?: boolean;
  /** Earliest time at which the history is complete enough to stop filling it in. */
  syncAfter?: number;
}

/** Start a capture; `waitForFrame` arms it so the countdown starts with the first frame. */
export function startCapture(
  step: StepId,
  seconds: number,
  waitForFrame: boolean,
  now: number,
): ActiveCapture {
  return waitForFrame
    ? { step, phase: 'armed', armedAt: now, lines: [] }
    : {
        step,
        phase: 'recording',
        armedAt: now,
        startedAt: new Date(now).toISOString(),
        endsAt: now + seconds * 1000,
        lines: [],
      };
}

export function captureLine(
  capture: ActiveCapture,
  line: RecordedLine,
  seconds: number,
  now: number,
): ActiveCapture {
  if (capture.phase === 'armed') {
    return {
      ...capture,
      phase: 'recording',
      startedAt: new Date(now).toISOString(),
      endsAt: now + seconds * 1000,
      lines: [line],
    };
  }
  return { ...capture, lines: [...capture.lines, line] };
}

/** Finished when the window is over and no missed frames still have to be filled in from history. */
export function captureFinished(capture: ActiveCapture, now: number): boolean {
  return (
    capture.phase === 'recording' && capture.endsAt !== undefined && now >= capture.endsAt && !capture.missed
  );
}

/** The connection was lost or the app was paused: frames may be missing. */
export function markMissed(capture: ActiveCapture): ActiveCapture {
  return { ...capture, missed: true, syncAfter: undefined };
}

/** Connection is back: fill in from history once the recorder has written the missed states. */
export function markReconnected(capture: ActiveCapture, now: number): ActiveCapture {
  return capture.missed ? { ...capture, syncAfter: now + COMMIT_DELAY_MS } : capture;
}

/** Time range to query from the history. */
export function historyWindow(capture: ActiveCapture, now: number): { start: number; end: number } {
  const start = capture.phase === 'armed' ? capture.armedAt : Date.parse(capture.startedAt ?? '');
  const end = capture.endsAt !== undefined ? Math.min(now, capture.endsAt + MARGIN_MS) : now;
  return { start: (Number.isNaN(start) ? capture.armedAt : start) - MARGIN_MS, end };
}

/** Union of two line lists, sorted by time; the same line within one second counts once. */
export function mergeLines(a: RecordedLine[], b: RecordedLine[]): RecordedLine[] {
  const merged = [...a];
  for (const line of b) {
    const t = Date.parse(line.time);
    if (!merged.some((m) => m.line === line.line && Math.abs(Date.parse(m.time) - t) < 1000))
      merged.push(line);
  }
  return merged.sort((x, y) => Date.parse(x.time) - Date.parse(y.time));
}

/** Merge history lines into the capture; an armed capture starts with the first frame found. */
export function applyHistory(
  capture: ActiveCapture,
  history: RecordedLine[],
  seconds: number,
  now: number,
): ActiveCapture {
  let next = capture;
  if (next.phase === 'armed') {
    const first = history.find((l) => Date.parse(l.time) >= next.armedAt - MARGIN_MS);
    if (first) {
      const t0 = Date.parse(first.time);
      next = { ...next, phase: 'recording', startedAt: first.time, endsAt: t0 + seconds * 1000 };
    }
  }
  if (next.phase === 'recording') {
    const start = Date.parse(next.startedAt ?? '') - MARGIN_MS;
    const end = (next.endsAt ?? now) + MARGIN_MS;
    const inWindow = history.filter((l) => {
      const t = Date.parse(l.time);
      return t >= start && t <= end;
    });
    next = { ...next, lines: mergeLines(next.lines, inWindow) };
  }
  const ended = next.phase === 'recording' && next.endsAt !== undefined && now >= next.endsAt;
  const settled =
    next.syncAfter !== undefined &&
    now >= next.syncAfter &&
    (!ended || now >= (next.endsAt ?? 0) + COMMIT_DELAY_MS);
  return settled ? { ...next, missed: false, syncAfter: undefined } : next;
}
