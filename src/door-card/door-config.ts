import type { HassEntity } from '../ha-types';

export const DOOR_CARD_TAG = 'abb-welcome-door-card';

export type ConfirmMode = 'slide' | 'hold' | 'tap' | 'dialog';
export type OpenAction = 'unlock' | 'open';
export type DoorCardLayout = 'tiles' | 'rows' | 'buttons' | 'bar';
export type CameraView = 'ring' | 'always';

export interface DoorCardDoor {
  name: string;
  icon?: string;
  /** Any lock entity: ABB-Welcome lock from the wizard, Aqara, Nuki ... */
  lock?: string;
  /** Doorbell binary sensor (e.g. binary_sensor.klingel_tor). */
  doorbell?: string;
  camera?: string;
  camera_view?: CameraView;
  /** How opening has to be confirmed; default depends on the layout (slide, or hold for round buttons). */
  confirm?: ConfirmMode;
  /** lock.unlock (default) or lock.open for locks with a latch (e.g. "Tür aufziehen"). */
  action?: OpenAction;
  /** Home Assistant user ids allowed to open; everybody if empty. */
  users?: string[];
}

export interface DoorCardConfig {
  type: string;
  title?: string;
  layout?: DoorCardLayout;
  /** Seconds a door stays highlighted after its doorbell rang. */
  ring_window?: number;
  /** Milliseconds the button has to be held in "hold" mode. */
  hold_time?: number;
  doors: DoorCardDoor[];
}

export const DEFAULTS = {
  layout: 'tiles' as DoorCardLayout,
  ring_window: 60,
  hold_time: 800,
  action: 'unlock' as OpenAction,
  camera_view: 'ring' as CameraView,
};

const oneOf = <T extends string>(value: unknown, allowed: readonly T[], field: string): T | undefined => {
  if (value === undefined) return undefined;
  if (typeof value === 'string' && (allowed as readonly string[]).includes(value)) return value as T;
  throw new Error(`"${field}" muss einer dieser Werte sein: ${allowed.join(', ')}.`);
};

const entityOf = (value: unknown, domain: string, field: string): string | undefined => {
  if (value === undefined || value === '' || value === null) return undefined;
  if (typeof value !== 'string' || !value.startsWith(`${domain}.`)) {
    throw new Error(`"${field}" muss eine ${domain}-Entität sein (z. B. ${domain}.haustuer).`);
  }
  return value;
};

/** Validate the card config; throws German error messages for the Lovelace editor. */
export function normalizeDoorCardConfig(raw: unknown): DoorCardConfig {
  if (typeof raw !== 'object' || raw === null) throw new Error('Ungültige Konfiguration.');
  const config = raw as Record<string, unknown>;
  if (!Array.isArray(config.doors)) throw new Error('"doors" muss eine Liste von Türen sein.');
  const ringWindow = config.ring_window;
  if (ringWindow !== undefined && (typeof ringWindow !== 'number' || ringWindow < 0 || ringWindow > 600)) {
    throw new Error('"ring_window" muss zwischen 0 und 600 Sekunden liegen.');
  }
  const holdTime = config.hold_time;
  if (holdTime !== undefined && (typeof holdTime !== 'number' || holdTime < 200 || holdTime > 5000)) {
    throw new Error('"hold_time" muss zwischen 200 und 5000 ms liegen.');
  }

  const doors = config.doors.map((value, i): DoorCardDoor => {
    if (typeof value !== 'object' || value === null) throw new Error(`Tür ${i + 1}: ungültiger Eintrag.`);
    const d = value as Record<string, unknown>;
    const name = typeof d.name === 'string' && d.name.trim() !== '' ? d.name.trim() : undefined;
    const prefix = `Tür ${name ? `„${name}“` : i + 1}`;
    try {
      const door: DoorCardDoor = {
        name: name ?? `Tür ${i + 1}`,
        lock: entityOf(d.lock, 'lock', 'lock'),
        doorbell: entityOf(d.doorbell, 'binary_sensor', 'doorbell'),
        camera: entityOf(d.camera, 'camera', 'camera'),
        camera_view: oneOf(d.camera_view, ['ring', 'always'] as const, 'camera_view'),
        confirm: oneOf(d.confirm, ['slide', 'hold', 'tap', 'dialog'] as const, 'confirm'),
        action: oneOf(d.action, ['unlock', 'open'] as const, 'action'),
      };
      if (typeof d.icon === 'string' && d.icon !== '') door.icon = d.icon;
      if (d.users !== undefined) {
        if (!Array.isArray(d.users) || d.users.some((u) => typeof u !== 'string')) {
          throw new Error('"users" muss eine Liste von Benutzer-IDs sein.');
        }
        door.users = d.users as string[];
      }
      if (!door.lock && !door.doorbell) throw new Error('braucht mindestens "lock" oder "doorbell".');
      for (const key of Object.keys(door) as (keyof DoorCardDoor)[])
        if (door[key] === undefined) delete door[key];
      return door;
    } catch (err) {
      throw new Error(`${prefix}: ${(err as Error).message}`);
    }
  });

  // "compact" was the name of the bar layout in 0.5.
  const layout = config.layout === 'compact' ? 'bar' : config.layout;
  return {
    ...(config as unknown as DoorCardConfig),
    layout: oneOf(layout, ['tiles', 'rows', 'buttons', 'bar'] as const, 'layout'),
    doors,
  };
}

/**
 * Effective confirmation for a door in a layout. Sliders need room: round buttons and bar chips hold instead,
 * the large "ringing" panel of the bar layout keeps the slider.
 */
export function confirmModeFor(
  door: DoorCardDoor,
  layout: DoorCardLayout,
  place: 'main' | 'hero' = 'main',
): ConfirmMode {
  const mode = door.confirm ?? (layout === 'buttons' ? 'hold' : 'slide');
  if (mode === 'slide' && place === 'main' && (layout === 'buttons' || layout === 'bar')) return 'hold';
  return mode;
}

const friendly = (entity: HassEntity | undefined, fallback: string) =>
  typeof entity?.attributes.friendly_name === 'string' ? entity.attributes.friendly_name : fallback;

/**
 * Suggest doors from the entities created by the wizard's ESPHome config: every `binary_sensor.*klingel_<x>`
 * is paired with a lock whose object id ends in `<x>`. Remaining locks are added on their own.
 */
export function discoverDoors(states: Record<string, HassEntity>): DoorCardDoor[] {
  const ids = Object.keys(states).sort();
  const locks = ids.filter((id) => id.startsWith('lock.'));
  const used = new Set<string>();
  const doors: DoorCardDoor[] = [];
  for (const bell of ids.filter((id) => /^binary_sensor\..*klingel_?/.test(id))) {
    const suffix = bell.replace(/^binary_sensor\..*klingel_?/, '');
    const lock = suffix ? locks.find((l) => !used.has(l) && l.endsWith(suffix)) : undefined;
    if (lock) used.add(lock);
    const name = friendly(states[bell], suffix).replace(/^.*Klingel\s*/i, '') || suffix;
    doors.push({ name, doorbell: bell, ...(lock ? { lock } : {}) });
  }
  for (const lock of locks.filter((l) => !used.has(l)))
    doors.push({ name: friendly(states[lock], lock), lock });
  return doors;
}

export type StatusTone = 'locked' | 'busy' | 'open' | 'problem' | 'unavailable';

export function lockStatus(state: string | undefined): { label: string; tone: StatusTone } {
  switch (state) {
    case 'locked':
      return { label: 'Verriegelt', tone: 'locked' };
    case 'unlocking':
      return { label: 'Wird entriegelt …', tone: 'busy' };
    case 'locking':
      return { label: 'Wird verriegelt …', tone: 'busy' };
    case 'opening':
      return { label: 'Wird geöffnet …', tone: 'busy' };
    case 'unlocked':
      return { label: 'Entriegelt', tone: 'open' };
    case 'open':
      return { label: 'Offen', tone: 'open' };
    case 'jammed':
      return { label: 'Blockiert', tone: 'problem' };
    case undefined:
      return { label: 'Nicht gefunden', tone: 'unavailable' };
    default:
      return { label: 'Nicht verfügbar', tone: 'unavailable' };
  }
}

/** The lock reports that it is (being) opened – used as confirmation after sending the command. */
export const isOpening = (state: string | undefined): boolean =>
  state === 'unlocking' || state === 'unlocked' || state === 'opening' || state === 'open';

/** Locks that stay unlocked (e.g. Aqara) can be locked again from the card. */
export const canLockAgain = (state: string | undefined): boolean => state === 'unlocked' || state === 'open';

/** Seconds left of the "doorbell rang" highlight, 0 if not ringing. */
export function ringRemaining(lastRing: number | undefined, now: number, windowSeconds: number): number {
  if (lastRing === undefined || windowSeconds <= 0) return 0;
  const left = Math.ceil((lastRing + windowSeconds * 1000 - now) / 1000);
  return left > 0 ? Math.min(left, windowSeconds) : 0;
}

/** "gerade eben", "vor 5 min", "vor 3 h", "gestern 14:02", "28.10. 09:15". */
export function formatAgo(time: number, now: number): string {
  const seconds = Math.max(0, Math.round((now - time) / 1000));
  if (seconds < 45) return 'gerade eben';
  if (seconds < 3600) return `vor ${Math.max(1, Math.round(seconds / 60))} min`;
  const date = new Date(time);
  const clock = date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  const today = new Date(now);
  const dayDiff = Math.round(
    (new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime() -
      new Date(date.getFullYear(), date.getMonth(), date.getDate()).getTime()) /
      86_400_000,
  );
  if (dayDiff === 0) return seconds < 6 * 3600 ? `vor ${Math.round(seconds / 3600)} h` : `heute ${clock}`;
  if (dayDiff === 1) return `gestern ${clock}`;
  return `${date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' })} ${clock}`;
}

export function canOperate(door: DoorCardDoor, userId: string | undefined): boolean {
  return !door.users || door.users.length === 0 || (userId !== undefined && door.users.includes(userId));
}

/** Ringing doors first (most recent ring on top), otherwise the configured order. */
export function sortDoors<T>(doors: T[], remaining: (door: T) => number, lastRing: (door: T) => number): T[] {
  return doors
    .map((door, index) => ({ door, index }))
    .sort((a, b) => {
      const ra = remaining(a.door) > 0;
      const rb = remaining(b.door) > 0;
      if (ra !== rb) return ra ? -1 : 1;
      if (ra && rb) return lastRing(b.door) - lastRing(a.door);
      return a.index - b.index;
    })
    .map((entry) => entry.door);
}
