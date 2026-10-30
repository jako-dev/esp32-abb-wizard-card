import type { Frame, ParseResult } from './types';

// `[2001 > 1010]`, `[2001 » 1010]`, `[000201 > 000110]`. `Â»` and `>>` cover mis-decoded or ASCII variants of `»`.
const ADDRESS_RE = /\[\s*([0-9a-f]{4}|[0-9a-f]{6})\s*(»|Â»|>>|>)\s*([0-9a-f]{4}|[0-9a-f]{6})\s*\]/i;
const TYPE_RE = /^\s*,?\s*type\s*[:=]?\s*(?:0x)?([0-9a-f]{1,2})(?![0-9a-f])/i;
const DATA_RE = /^\s*,?\s*data\s*[:=]?\s*(.*?)\s*$/i;
const RAW_RE = /((?:[0-9a-f]{2}[.:\s]){2,}[0-9a-f]{2})\s*(?:\(\s*(\d+)\s*\))?\s*$/i;

function parseHexBytes(text: string): number[] | null {
  const trimmed = text.trim();
  if (trimmed === '') return [];
  const tokens = trimmed.split(/[\s.,:;-]+/).filter((t) => t !== '');
  const bytes: number[] = [];
  for (let token of tokens) {
    token = token.replace(/^0x/i, '');
    if (!/^[0-9a-f]+$/i.test(token)) return null;
    if (token.length <= 2) {
      bytes.push(parseInt(token, 16));
    } else if (token.length % 2 === 0) {
      // Contiguous hex string such as "011010".
      for (let i = 0; i < token.length; i += 2) bytes.push(parseInt(token.slice(i, i + 2), 16));
    } else {
      return null;
    }
  }
  return bytes;
}

/**
 * Parse one line as printed by ESPHome's ABBWelcomeData::format_to(), e.g.
 * `55.FF.00.41.10.10.20.01.8A.01.10.10.C3 [2001 > 1010] Type: 01, Data: 01.10.10`
 * or the older `55.FF.XX...XX (10) [2001 > 1010] Type: 01 Data: 01 10 10`.
 * Log prefixes, case and spacing are tolerated.
 */
export function parseFrame(line: string): ParseResult {
  const fail = (reason: string): ParseResult => ({ ok: false, line, reason });
  if (typeof line !== 'string') return fail('not a string');

  const addr = ADDRESS_RE.exec(line);
  if (!addr) return fail('no address block');
  const [, srcHex, arrow, dstHex] = addr;

  const afterAddr = line.slice(addr.index + addr[0].length);
  const typeMatch = TYPE_RE.exec(afterAddr);
  if (!typeMatch) return fail('no message type');

  const afterType = afterAddr.slice(typeMatch[0].length);
  let data: number[] = [];
  if (afterType.trim() !== '') {
    const dataMatch = DATA_RE.exec(afterType);
    if (!dataMatch) return fail('unexpected text after type');
    const parsed = parseHexBytes(dataMatch[1]);
    if (!parsed) return fail('invalid data bytes');
    data = parsed;
  }

  const frame: Frame = {
    src: parseInt(srcHex, 16),
    dst: parseInt(dstHex, 16),
    type: parseInt(typeMatch[1], 16),
    data,
    threeByte: srcHex.length === 6 || dstHex.length === 6,
    retransmission: arrow !== '>',
  };

  const rawMatch = RAW_RE.exec(line.slice(0, addr.index));
  if (rawMatch) {
    frame.raw = rawMatch[1].toUpperCase().replace(/[:\s]/g, '.');
    if (rawMatch[2] !== undefined) frame.rawLength = parseInt(rawMatch[2], 10);
  }
  return { ok: true, frame };
}
