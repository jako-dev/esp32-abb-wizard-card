import { parseFrame } from '../src/parser';
import type { Frame } from '../src/types';

function ok(line: string): Frame {
  const result = parseFrame(line);
  if (!result.ok) throw new Error(`expected "${line}" to parse: ${result.reason}`);
  return result.frame;
}

describe('parseFrame', () => {
  it('parses the format from Mat931 how_to_customize', () => {
    const f = ok('55.FF.00.43.10.0C.20.01.5A.01.10.0C.12 (13) [2001 > 100c] Type: 01 Data: 01 10 0c');
    expect(f).toMatchObject({
      src: 0x2001,
      dst: 0x100c,
      type: 0x01,
      data: [0x01, 0x10, 0x0c],
      threeByte: false,
      retransmission: false,
      raw: '55.FF.00.43.10.0C.20.01.5A.01.10.0C.12',
      rawLength: 13,
    });
  });

  it('parses the current ESPHome format (comma, dotted data)', () => {
    const f = ok('55.FF.00.03.40.01.10.10.7E.AB.CD.EF.33 [1010 > 4001] Type: 0D, Data: AB.CD.EF');
    expect(f).toMatchObject({ src: 0x1010, dst: 0x4001, type: 0x0d, data: [0xab, 0xcd, 0xef] });
    expect(f.rawLength).toBeUndefined();
  });

  it('detects retransmissions (»)', () => {
    expect(ok('[2001 » 1010] Type: 01').retransmission).toBe(true);
    expect(ok('[2001 >> 1010] Type: 01').retransmission).toBe(true);
    expect(ok('[2001 Â» 1010] Type: 01').retransmission).toBe(true);
    expect(ok('[2001 > 1010] Type: 01').retransmission).toBe(false);
  });

  it('detects three-byte addresses', () => {
    const f = ok('[000201 > 000110] Type: 0A, Data: 01.00.01.10');
    expect(f).toMatchObject({ src: 0x000201, dst: 0x000110, type: 0x0a, threeByte: true });
    expect(f.data).toEqual([0x01, 0x00, 0x01, 0x10]);
  });

  it('accepts frames without data', () => {
    const f = ok('[1010 > 2001] Type: 81');
    expect(f.data).toEqual([]);
    expect(f.type).toBe(0x81);
  });

  it('accepts frames without raw data', () => {
    const f = ok('[2001 > 1010] Type: 01 Data: 01 10 10');
    expect(f.raw).toBeUndefined();
  });

  it('ignores placeholder raw data from documentation', () => {
    const f = ok('55.FF.XX...XX (10) [2001 > 1010] Type: 01 Data: 01 10 10');
    expect(f).toMatchObject({ src: 0x2001, dst: 0x1010, type: 1, data: [1, 0x10, 0x10] });
  });

  it('is tolerant to spacing and case', () => {
    const f = ok('  [ 2001>1010 ]   type:0a   data:  01:10:10  ');
    expect(f).toMatchObject({ src: 0x2001, dst: 0x1010, type: 0x0a, data: [1, 0x10, 0x10] });
    expect(ok('[ABCD > 1010] TYPE: 8d').type).toBe(0x8d);
  });

  it('accepts data as 0x-prefixed tokens or contiguous hex', () => {
    expect(ok('[1010 > 4001] Type: 0d Data: 0xab, 0xcd, 0xef').data).toEqual([0xab, 0xcd, 0xef]);
    expect(ok('[1010 > 4001] Type: 0d Data: abcdef').data).toEqual([0xab, 0xcd, 0xef]);
  });

  it('accepts ESPHome log prefixes', () => {
    const f = ok(
      '[12:00:01][D][remote.abbwelcome:088]: Received ABBWelcome: 55.FF.00.41 [1010 > 2001] Type: 81',
    );
    expect(f).toMatchObject({ src: 0x1010, dst: 0x2001, type: 0x81, raw: '55.FF.00.41' });
  });

  it.each([
    [''],
    ['unknown'],
    ['unavailable'],
    ['55.FF.00.41.10.10 [Invalid]'],
    ['[2001 > 1010]'],
    ['[2001 > 1010] Type: 01 Data: zz'],
    ['[2001 > 1010] Type: 01 garbage'],
    ['[20011 > 1010] Type: 01'],
    ['hello world'],
  ])('rejects garbage: %j', (line) => {
    const result = parseFrame(line);
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.line).toBe(line);
  });
});
