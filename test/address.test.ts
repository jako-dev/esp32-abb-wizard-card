import {
  addressRole,
  apartmentFromDials,
  dataContainsAddress,
  describeAddress,
  expectedIndoorAddress,
  formatAddress,
  involvesAddress,
} from '../src/address';
import type { Frame } from '../src/types';

const frame = (p: Partial<Frame>): Frame => ({
  src: 0,
  dst: 0,
  type: 0,
  data: [],
  threeByte: false,
  retransmission: false,
  ...p,
});

describe('address helpers', () => {
  it('classifies 2-byte addresses', () => {
    expect(addressRole(0x1010, false)).toBe('indoor');
    expect(addressRole(0x2001, false)).toBe('outdoor');
    expect(addressRole(0x3001, false)).toBe('gateway');
    expect(addressRole(0x4001, false)).toBe('door');
    expect(addressRole(0x8001, false)).toBe('unknown');
    expect(addressRole(0x0110, false)).toBe('unknown');
  });

  it('classifies 3-byte addresses', () => {
    expect(addressRole(0x000110, true)).toBe('indoor');
    expect(addressRole(0x000201, true)).toBe('outdoor');
    expect(addressRole(0x000301, true)).toBe('gateway');
    expect(addressRole(0x000401, true)).toBe('door');
    expect(addressRole(0x00ffff, true)).toBe('unknown');
  });

  it('formats addresses', () => {
    expect(formatAddress(0x100c, false)).toBe('0x100c');
    expect(formatAddress(0x110, true)).toBe('0x000110');
    expect(describeAddress(0x1010, false)).toBe('Innenstation #16 (0x1010)');
    expect(describeAddress(0x4001, false)).toBe('Türsteuergerät (0x4001)');
  });

  it('computes the expected address from the dials', () => {
    expect(apartmentFromDials({ station: 2, x10: 1, x1: 6 })).toBe(16);
    expect(apartmentFromDials({ x10: 1 })).toBeUndefined();
    expect(apartmentFromDials({ x10: 10, x1: 0 })).toBeUndefined();
    expect(expectedIndoorAddress(16, false)).toBe(0x1010);
    expect(expectedIndoorAddress(12, false)).toBe(0x100c);
    expect(expectedIndoorAddress(16, true)).toBe(0x000110);
  });

  it('finds addresses in data', () => {
    expect(dataContainsAddress(frame({ data: [0x01, 0x10, 0x10] }), 0x1010)).toBe(true);
    expect(dataContainsAddress(frame({ data: [0x01, 0x10, 0x11] }), 0x1010)).toBe(false);
    expect(dataContainsAddress(frame({ data: [0x01, 0x00, 0x01, 0x10], threeByte: true }), 0x110)).toBe(true);
    expect(involvesAddress(frame({ src: 0x1010 }), 0x1010)).toBe(true);
    expect(involvesAddress(frame({ dst: 0x1010 }), 0x1010)).toBe(true);
    expect(involvesAddress(frame({ src: 0x2001, dst: 0x1011 }), 0x1010)).toBe(false);
  });
});
