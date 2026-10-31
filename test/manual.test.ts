import {
  conditionDraft,
  openDraft,
  parseBusAddress,
  parseConditionDraft,
  parseHexByte,
  parseHexBytes,
  parseOpenDraft,
} from '../src/manual';

describe('manual input', () => {
  it('parses hex bytes and addresses', () => {
    expect(parseHexByte('0d')).toBe(0x0d);
    expect(parseHexByte('0x8D')).toBe(0x8d);
    expect(parseHexByte('D')).toBe(0x0d);
    expect(parseHexByte('100')).toBeUndefined();
    expect(parseHexByte('zz')).toBeUndefined();
    expect(parseHexBytes('1C 41 68')).toEqual([0x1c, 0x41, 0x68]);
    expect(parseHexBytes('0x1c,0x41, 0x68')).toEqual([0x1c, 0x41, 0x68]);
    expect(parseHexBytes('1C4168')).toEqual([0x1c, 0x41, 0x68]);
    expect(parseHexBytes('')).toEqual([]);
    expect(parseHexBytes('1C 4')).toEqual([0x1c, 0x04]);
    expect(parseHexBytes('1C 4G')).toBeUndefined();
    expect(parseHexBytes('ABC')).toBeUndefined();
    expect(parseHexBytes('00 '.repeat(16))).toBeUndefined();
    expect(parseBusAddress('1016')).toBe(0x1016);
    expect(parseBusAddress('0x000110')).toBe(0x110);
    expect(parseBusAddress('101')).toBeUndefined();
  });

  it('validates doorbell conditions', () => {
    expect(parseConditionDraft({ type: '01', src: '2001', dst: '1016', data: '' })).toEqual({
      condition: { type: 0x01, src: 0x2001, dst: 0x1016 },
      errors: {},
    });
    expect(parseConditionDraft({ type: '0A', src: '2001', dst: '', data: '01 10 16' }).condition).toEqual({
      type: 0x0a,
      src: 0x2001,
      data: [0x01, 0x10, 0x16],
    });
    expect(parseConditionDraft({ type: 'x', src: '20', dst: '', data: 'q' }).errors).toEqual({
      type: expect.stringContaining('Typ'),
      src: expect.stringContaining('Quelle'),
      data: expect.stringContaining('Data'),
    });
    expect(parseConditionDraft({ type: '11', src: '', dst: '', data: '' }).errors.src).toContain(
      'jeden Frame',
    );
  });

  it('validates open frames', () => {
    expect(parseOpenDraft({ destination: '4002', type: '0D', data: '1C 41 68' }).open).toEqual({
      destination: 0x4002,
      messageType: 0x0d,
      data: [0x1c, 0x41, 0x68],
    });
    expect(parseOpenDraft({ destination: '', type: '0D', data: '' }).errors.destination).toBeDefined();
  });

  it('turns values into drafts', () => {
    expect(conditionDraft({ type: 0x0a, src: 0x2001, data: [1, 0x10, 0x16] }, false)).toEqual({
      type: '0A',
      src: '2001',
      dst: '',
      data: '01 10 16',
    });
    expect(openDraft({ destination: 0x110, messageType: 0x0e, data: [] }, true)).toEqual({
      destination: '000110',
      type: '0E',
      data: '',
    });
    expect(openDraft(undefined, false)).toEqual({ destination: '', type: '0D', data: '' });
  });
});
