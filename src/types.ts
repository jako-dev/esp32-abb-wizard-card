/** A decoded ABB-Welcome bus frame. */
export interface Frame {
  src: number;
  dst: number;
  /** Message type, 0x80 and above is a reply to (type - 0x80). */
  type: number;
  data: number[];
  /** True if the system uses three-byte addresses (`[XXXXXX > XXXXXX]`). */
  threeByte: boolean;
  /** True if the line used `»` (retransmission). */
  retransmission: boolean;
  /** Raw hex dump as printed by ESPHome, if present. */
  raw?: string;
  /** Length in parentheses printed after the raw dump by older firmware versions. */
  rawLength?: number;
}

export type ParseResult = { ok: true; frame: Frame } | { ok: false; line: string; reason: string };

/** A raw line as received from the debug text sensor. */
export interface RecordedLine {
  /** ISO timestamp (`time_fired` of the state_changed event). */
  time: string;
  line: string;
}

export const STEP_IDS = [
  'baseline',
  'ring_gate',
  'ring_house',
  'ring_apartment',
  'open_gate',
  'open_house',
] as const;
export type StepId = (typeof STEP_IDS)[number];

export type RingStepId = 'ring_gate' | 'ring_house' | 'ring_apartment';
export type OpenStepId = 'open_gate' | 'open_house';

export interface Capture {
  startedAt: string;
  endedAt: string;
  lines: RecordedLine[];
}

export interface StepRecord {
  skipped: boolean;
  captures: Capture[];
}

/** Dial settings on the back of the indoor station (plausibility hint only). */
export interface DialSettings {
  station?: number;
  x10?: number;
  x1?: number;
}

export interface Session {
  format: 'abb-welcome-wizard-session';
  version: 1;
  entity: string;
  createdAt: string;
  updatedAt: string;
  dials: DialSettings;
  /** Manually set indoor station address (overrides auto-detection). */
  indoorAddress?: number;
  steps: Record<StepId, StepRecord>;
}

export type Severity = 'info' | 'warning' | 'error';

export interface Warning {
  code: string;
  severity: Severity;
  message: string;
  step?: StepId;
}

export interface RingCandidate {
  /** Stable key describing which fields must match (type + addresses + data). */
  key: string;
  type: number;
  /** Fields that are part of the match condition; undefined means "not checked". */
  src?: number;
  dst?: number;
  data?: number[];
  /** Outdoor station address implied by this candidate, if any. */
  outdoor?: number;
  /** Number of captures of the step in which this candidate occurred. */
  occurrences: number;
  /** occurrences / captures of the step. */
  score: number;
  /** Candidate occurred in every capture of the step. */
  reliable: boolean;
}

export interface RingResult {
  step: RingStepId;
  captures: number;
  candidates: RingCandidate[];
  /** Candidates used for the generated YAML. */
  selected: RingCandidate[];
  outdoorAddress?: number;
  /** Relevant frames (own indoor station, not in baseline) that matched no rule. */
  otherFrames: Frame[];
}

export interface OpenConfirmation {
  source: number;
  messageType: number;
  occurrences: number;
}

export interface OpenResult {
  step: OpenStepId;
  captures: number;
  destination: number;
  messageType: number;
  data: number[];
  occurrences: number;
  score: number;
  confirmation?: OpenConfirmation;
}

export interface IndoorResult {
  address: number;
  method: 'manual' | 'open' | 'frequency';
  count: number;
  expected?: number;
  matchesExpected?: boolean;
}

export interface AnalysisStats {
  totalLines: number;
  parsedFrames: number;
  unparsedLines: string[];
  baselineFiltered: number;
  neighbourFiltered: number;
}

export interface WizardResult {
  indoor: IndoorResult | null;
  threeByte: boolean;
  rings: Record<RingStepId, RingResult>;
  opens: Record<OpenStepId, OpenResult | null>;
  warnings: Warning[];
  stats: AnalysisStats;
}
