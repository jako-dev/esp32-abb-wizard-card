import type { Door, DoorType, StepId } from './types';

export const MAX_DOORS = 8;

/** Default setup: gate and house door with their own outdoor stations, plus the apartment doorbell. */
export const DEFAULT_DOORS: readonly Door[] = [
  { key: 'tor', name: 'Tor', type: 'outdoor', open: true, default: false, icon: 'mdi:gate' },
  { key: 'haustuer', name: 'Haustür', type: 'outdoor', open: true, default: true, icon: 'mdi:door' },
  {
    key: 'wohnung',
    name: 'Wohnungstür',
    type: 'floor',
    open: false,
    default: false,
    icon: 'mdi:door-closed',
  },
];

export const BASELINE_STEP = 'baseline';
export const ringStepId = (door: Door | string): StepId =>
  `ring:${typeof door === 'string' ? door : door.key}`;
export const openStepId = (door: Door | string): StepId =>
  `open:${typeof door === 'string' ? door : door.key}`;

/** ESPHome-compatible id from a name: lower case, umlauts transliterated, other characters as `_`. */
export function slugify(name: string): string {
  const slug = name
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '');
  return slug === '' ? 'tuer' : /^[0-9]/.test(slug) ? `tuer_${slug}` : slug;
}

function unique(base: string, taken: Set<string>): string {
  let candidate = base;
  for (let i = 2; taken.has(candidate); i++) candidate = `${base}_${i}`;
  taken.add(candidate);
  return candidate;
}

/** ESPHome ids per door key, unique across all doors (`tor`, `haustuer`, `garage_2` ...). */
export function doorIds(doors: readonly Door[]): Record<string, string> {
  const taken = new Set<string>();
  const ids: Record<string, string> = {};
  for (const door of doors) ids[door.key] = unique(door.id ? slugify(door.id) : slugify(door.name), taken);
  return ids;
}

export function defaultIcon(type: DoorType): string {
  return type === 'floor' ? 'mdi:door-closed' : 'mdi:door';
}

export function doorIcon(door: Door): string {
  return door.icon ?? defaultIcon(door.type);
}

/** Make a door list consistent: floor doors cannot open, at most one default door among openable doors. */
export function sanitizeDoors(doors: readonly Door[]): Door[] {
  let defaultSeen = false;
  return doors.map((door) => {
    const open = door.type === 'outdoor' && door.open;
    const isDefault = open && door.default && !defaultSeen;
    if (isDefault) defaultSeen = true;
    return { ...door, open, default: isDefault };
  });
}

/** Create a new door with a key that is unique in `doors`. */
export function newDoor(doors: readonly Door[], name = 'Neue Tür', type: DoorType = 'outdoor'): Door {
  const key = unique(slugify(name), new Set(doors.map((d) => d.key)));
  return { key, name, type, open: type === 'outdoor', default: false };
}

export interface DoorConfigInput {
  name?: unknown;
  type?: unknown;
  open?: unknown;
  default?: unknown;
  id?: unknown;
  icon?: unknown;
}

/** Validate the optional `doors:` list of the card config. Throws German error messages. */
export function doorsFromConfig(input: unknown): Door[] {
  if (!Array.isArray(input) || input.length === 0)
    throw new Error('"doors" muss eine Liste mit mindestens einer Tür sein.');
  if (input.length > MAX_DOORS) throw new Error(`Höchstens ${MAX_DOORS} Türen möglich.`);
  const keys = new Set<string>();
  const doors = input.map((raw: DoorConfigInput, i) => {
    if (typeof raw !== 'object' || raw === null || typeof raw.name !== 'string' || raw.name.trim() === '') {
      throw new Error(`Tür ${i + 1}: "name" fehlt.`);
    }
    const type = raw.type ?? 'outdoor';
    if (type !== 'outdoor' && type !== 'floor') {
      throw new Error(`Tür "${raw.name}": "type" muss outdoor (Außentür) oder floor (Etagenruf) sein.`);
    }
    const name = raw.name.trim();
    const door: Door = {
      key: unique(slugify(typeof raw.id === 'string' ? raw.id : name), keys),
      name,
      type,
      open: type === 'outdoor' && raw.open !== false,
      default: raw.default === true,
    };
    if (typeof raw.id === 'string' && raw.id.trim() !== '') door.id = raw.id.trim();
    if (typeof raw.icon === 'string' && raw.icon.trim() !== '') door.icon = raw.icon.trim();
    return door;
  });
  if (doors.filter((d) => d.default).length > 1) throw new Error('Nur eine Tür kann "default: true" haben.');
  return sanitizeDoors(doors);
}

/** Validate doors stored in a session file (lenient: drops invalid entries). */
export function doorsFromSession(input: unknown): Door[] | undefined {
  if (!Array.isArray(input)) return undefined;
  const keys = new Set<string>();
  const doors: Door[] = [];
  for (const raw of input.slice(0, MAX_DOORS)) {
    if (typeof raw !== 'object' || raw === null) continue;
    const r = raw as Record<string, unknown>;
    if (typeof r.key !== 'string' || !/^[a-z0-9_]+$/.test(r.key) || keys.has(r.key)) continue;
    if (typeof r.name !== 'string' || (r.type !== 'outdoor' && r.type !== 'floor')) continue;
    keys.add(r.key);
    const door: Door = {
      key: r.key,
      name: r.name,
      type: r.type,
      open: r.open === true,
      default: r.default === true,
    };
    if (typeof r.id === 'string') door.id = r.id;
    if (typeof r.icon === 'string') door.icon = r.icon;
    doors.push(door);
  }
  return doors.length > 0 ? sanitizeDoors(doors) : undefined;
}
