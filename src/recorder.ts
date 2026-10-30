import type { HassEvent, StateChangedData } from './ha-types';
import type { RecordedLine } from './types';

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

export interface ActiveCapture {
  phase: CapturePhase;
  startedAt?: string;
  /** Epoch milliseconds at which the recording ends. */
  endsAt?: number;
  lines: RecordedLine[];
}

/** Start a capture; `waitForFrame` arms it so the countdown starts with the first frame. */
export function startCapture(seconds: number, waitForFrame: boolean, now: number): ActiveCapture {
  return waitForFrame
    ? { phase: 'armed', lines: [] }
    : { phase: 'recording', startedAt: new Date(now).toISOString(), endsAt: now + seconds * 1000, lines: [] };
}

export function captureLine(
  capture: ActiveCapture,
  line: RecordedLine,
  seconds: number,
  now: number,
): ActiveCapture {
  if (capture.phase === 'armed') {
    return {
      phase: 'recording',
      startedAt: new Date(now).toISOString(),
      endsAt: now + seconds * 1000,
      lines: [line],
    };
  }
  return { ...capture, lines: [...capture.lines, line] };
}

export function captureFinished(capture: ActiveCapture, now: number): boolean {
  return capture.phase === 'recording' && capture.endsAt !== undefined && now >= capture.endsAt;
}
