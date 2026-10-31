import type { OpenOverride, RingCandidate, RingCondition } from './types';

/** "0d", "0x0D", "D" → 13; undefined if not a single hex byte. */
export function parseHexByte(text: string): number | undefined {
  const t = text.trim().replace(/^0x/i, '');
  return /^[0-9a-f]{1,2}$/i.test(t) ? parseInt(t, 16) : undefined;
}

/** "1C 41 68", "1c,41,68", "0x1c 0x41 0x68", "1C4168"; empty → []. undefined if invalid or longer than 15 bytes. */
export function parseHexBytes(text: string): number[] | undefined {
  const tokens = text
    .trim()
    .split(/[\s.,:;-]+/)
    .filter((t) => t !== '')
    .map((t) => t.replace(/^0x/i, ''));
  const bytes: number[] = [];
  for (const token of tokens) {
    if (!/^[0-9a-f]+$/i.test(token)) return undefined;
    if (token.length <= 2) bytes.push(parseInt(token, 16));
    else if (token.length % 2 === 0)
      for (let i = 0; i < token.length; i += 2) bytes.push(parseInt(token.slice(i, i + 2), 16));
    else return undefined;
  }
  return bytes.length <= 15 ? bytes : undefined;
}

/** Bus address with 4 (2-byte) or 6 (3-byte) hex digits, optional 0x. */
export function parseBusAddress(text: string): number | undefined {
  const t = text.trim().replace(/^0x/i, '');
  return /^([0-9a-f]{4}|[0-9a-f]{6})$/i.test(t) ? parseInt(t, 16) : undefined;
}

export const hexByte = (n: number) => n.toString(16).toUpperCase().padStart(2, '0');
export const hexBytes = (bytes: number[]) => bytes.map(hexByte).join(' ');
export const hexAddress = (n: number, threeByte: boolean) =>
  n
    .toString(16)
    .toUpperCase()
    .padStart(threeByte ? 6 : 4, '0');

export interface ConditionDraft {
  type: string;
  src: string;
  dst: string;
  data: string;
}

export interface OpenDraft {
  destination: string;
  type: string;
  data: string;
}

export function conditionDraft(c: RingCondition | RingCandidate, threeByte: boolean): ConditionDraft {
  return {
    type: hexByte(c.type),
    src: c.src !== undefined ? hexAddress(c.src, threeByte) : '',
    dst: c.dst !== undefined ? hexAddress(c.dst, threeByte) : '',
    data: c.data ? hexBytes(c.data) : '',
  };
}

export function openDraft(open: OpenOverride | undefined, threeByte: boolean): OpenDraft {
  return open
    ? {
        destination: hexAddress(open.destination, threeByte),
        type: hexByte(open.messageType),
        data: hexBytes(open.data),
      }
    : { destination: '', type: '0D', data: '' };
}

export type FieldErrors<T> = Partial<Record<keyof T, string>>;

/** Validate a doorbell condition: type required, source / destination / data optional ("beliebig"). */
export function parseConditionDraft(draft: ConditionDraft): {
  condition?: RingCondition;
  errors: FieldErrors<ConditionDraft>;
} {
  const errors: FieldErrors<ConditionDraft> = {};
  const type = parseHexByte(draft.type);
  if (type === undefined) errors.type = 'Typ: ein Hex-Byte, z. B. 01';
  const src = draft.src.trim() === '' ? undefined : parseBusAddress(draft.src);
  if (draft.src.trim() !== '' && src === undefined) errors.src = 'Quelle: 4 oder 6 Hex-Ziffern, z. B. 2001';
  const dst = draft.dst.trim() === '' ? undefined : parseBusAddress(draft.dst);
  if (draft.dst.trim() !== '' && dst === undefined) errors.dst = 'Ziel: 4 oder 6 Hex-Ziffern, z. B. 1016';
  const data = draft.data.trim() === '' ? undefined : parseHexBytes(draft.data);
  if (draft.data.trim() !== '' && data === undefined) errors.data = 'Data: Hex-Bytes, z. B. 01 10 16';
  if (Object.keys(errors).length > 0 || type === undefined) return { errors };
  if (src === undefined && dst === undefined && data === undefined) {
    return {
      errors: {
        src: 'Mindestens Quelle, Ziel oder Data angeben – sonst passt die Bedingung auf jeden Frame.',
      },
    };
  }
  const condition: RingCondition = { type };
  if (src !== undefined) condition.src = src;
  if (dst !== undefined) condition.dst = dst;
  if (data !== undefined) condition.data = data;
  return { condition, errors };
}

export function parseOpenDraft(draft: OpenDraft): { open?: OpenOverride; errors: FieldErrors<OpenDraft> } {
  const errors: FieldErrors<OpenDraft> = {};
  const destination = parseBusAddress(draft.destination);
  if (destination === undefined) errors.destination = 'Ziel: 4 oder 6 Hex-Ziffern, z. B. 4002';
  const messageType = parseHexByte(draft.type);
  if (messageType === undefined) errors.type = 'Typ: ein Hex-Byte, meist 0D oder 0E';
  const data = parseHexBytes(draft.data);
  if (data === undefined) errors.data = 'Data: Hex-Bytes, z. B. 1C 41 68 (höchstens 15)';
  if (destination === undefined || messageType === undefined || data === undefined) return { errors };
  return { open: { destination, messageType, data }, errors };
}
