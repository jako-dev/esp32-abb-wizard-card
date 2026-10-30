import type { DialSettings, Frame } from './types';

export type DeviceRole = 'indoor' | 'outdoor' | 'gateway' | 'door' | 'unknown';

const ROLE_BY_CLASS: Record<number, DeviceRole> = { 1: 'indoor', 2: 'outdoor', 3: 'gateway', 4: 'door' };

/**
 * Device class: 2-byte addresses use the high nibble (`10XY` = 1), 3-byte addresses the middle byte (`0001XY` = 1).
 * See https://github.com/Mat931/esp32-doorbell-bus-interface/wiki/Address-Types
 */
function deviceClass(address: number, threeByte: boolean): number | null {
  if (threeByte) return address >> 16 === 0 ? (address >> 8) & 0xff : null;
  if (address > 0xffff) return null;
  const high = address >> 8;
  return (high & 0x0f) === 0 ? high >> 4 : null;
}

export function addressRole(address: number, threeByte: boolean): DeviceRole {
  const cls = deviceClass(address, threeByte);
  return (cls !== null && ROLE_BY_CLASS[cls]) || 'unknown';
}

export const isIndoor = (address: number, threeByte: boolean): boolean =>
  addressRole(address, threeByte) === 'indoor';

export const isOutdoor = (address: number, threeByte: boolean): boolean =>
  addressRole(address, threeByte) === 'outdoor';

/** Address as it appears in ESPHome YAML, e.g. `0x1010` or `0x000110`. */
export function formatAddress(address: number, threeByte: boolean): string {
  return '0x' + address.toString(16).padStart(threeByte ? 6 : 4, '0');
}

/** Address as printed by the debug sensor, e.g. `1010`. */
export function formatAddressPlain(address: number, threeByte: boolean): string {
  return address
    .toString(16)
    .toUpperCase()
    .padStart(threeByte ? 6 : 4, '0');
}

export function formatByte(value: number): string {
  return '0x' + value.toString(16).padStart(2, '0');
}

export function formatBytesPlain(bytes: number[]): string {
  return bytes.map((b) => b.toString(16).toUpperCase().padStart(2, '0')).join(' ');
}

const ROLE_LABELS: Record<DeviceRole, string> = {
  indoor: 'Innenstation',
  outdoor: 'Außenstation',
  gateway: 'Gateway',
  door: 'Türsteuergerät',
  unknown: 'Gerät',
};

export function describeAddress(address: number, threeByte: boolean): string {
  const role = addressRole(address, threeByte);
  const label = ROLE_LABELS[role];
  const hex = formatAddress(address, threeByte);
  if (role === 'indoor' || role === 'outdoor') return `${label} #${address & 0xff} (${hex})`;
  return `${label} (${hex})`;
}

/** Apartment number from the X10 / X1 dials, undefined if incomplete. */
export function apartmentFromDials(dials: DialSettings): number | undefined {
  const { x10, x1 } = dials;
  if (x10 === undefined || x1 === undefined) return undefined;
  if (!Number.isInteger(x10) || !Number.isInteger(x1) || x10 < 0 || x10 > 9 || x1 < 0 || x1 > 9)
    return undefined;
  return x10 * 10 + x1;
}

/** Expected indoor station address: apartment number (decimal) in the low byte. */
export function expectedIndoorAddress(apartment: number, threeByte: boolean): number {
  return (threeByte ? 0x000100 : 0x1000) | (apartment & 0xff);
}

/** Big-endian bytes of an address. */
export function addressBytes(address: number, threeByte: boolean): number[] {
  return threeByte
    ? [(address >> 16) & 0xff, (address >> 8) & 0xff, address & 0xff]
    : [(address >> 8) & 0xff, address & 0xff];
}

function containsSequence(haystack: number[], needle: number[]): boolean {
  outer: for (let i = 0; i + needle.length <= haystack.length; i++) {
    for (let j = 0; j < needle.length; j++) if (haystack[i + j] !== needle[j]) continue outer;
    return true;
  }
  return false;
}

/** True if the address bytes appear (big-endian, contiguous) in the frame data. */
export function dataContainsAddress(frame: Frame, address: number): boolean {
  return containsSequence(frame.data, addressBytes(address, frame.threeByte));
}

/** Frame relates to the given indoor station: as source, destination or in the data. */
export function involvesAddress(frame: Frame, address: number): boolean {
  return frame.src === address || frame.dst === address || dataContainsAddress(frame, address);
}
