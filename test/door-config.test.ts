import {
  canLockAgain,
  canOperate,
  discoverDoors,
  formatAgo,
  isOpening,
  lockStatus,
  normalizeDoorCardConfig,
  ringRemaining,
  sortDoors,
} from '../src/door-card/door-config';
import type { HassEntity } from '../src/ha-types';

const entity = (entity_id: string, state = 'off', friendly_name?: string): HassEntity => ({
  entity_id,
  state,
  last_changed: '',
  last_updated: '',
  attributes: friendly_name ? { friendly_name } : {},
});

describe('door card config', () => {
  it('accepts a full configuration', () => {
    const config = normalizeDoorCardConfig({
      type: 'custom:abb-welcome-door-card',
      layout: 'rows',
      doors: [
        { name: 'Tor', lock: 'lock.tor', doorbell: 'binary_sensor.klingel_tor', confirm: 'tap' },
        { name: 'Wohnungstür', lock: 'lock.aqara', action: 'open', users: ['abc'], icon: 'mdi:door' },
        { name: 'Garage', doorbell: 'binary_sensor.klingel_garage', camera: 'camera.einfahrt' },
      ],
    });
    expect(config.doors[1]).toEqual({
      name: 'Wohnungstür',
      lock: 'lock.aqara',
      action: 'open',
      users: ['abc'],
      icon: 'mdi:door',
    });
    expect(config.layout).toBe('rows');
  });

  it('rejects invalid configurations with German messages', () => {
    expect(() => normalizeDoorCardConfig({})).toThrow('"doors"');
    expect(() => normalizeDoorCardConfig({ doors: [{ name: 'A' }] })).toThrow('Tür „A“: braucht mindestens');
    expect(() => normalizeDoorCardConfig({ doors: [{ name: 'A', lock: 'switch.x' }] })).toThrow(
      'lock-Entität',
    );
    expect(() => normalizeDoorCardConfig({ doors: [{ lock: 'lock.a', confirm: 'swipe' }] })).toThrow(
      'hold, tap, dialog',
    );
    expect(() => normalizeDoorCardConfig({ doors: [], layout: 'grid' })).toThrow('layout');
    expect(() => normalizeDoorCardConfig({ doors: [], ring_window: -1 })).toThrow('ring_window');
  });

  it('discovers doors created by the wizard', () => {
    const states = Object.fromEntries(
      [
        entity('binary_sensor.abb_welcome_demo_klingel_tor', 'off', 'ABB Welcome Demo Klingel Tor'),
        entity(
          'binary_sensor.abb_welcome_demo_klingel_wohnungstuer',
          'off',
          'ABB Welcome Demo Klingel Wohnungstür',
        ),
        entity('lock.abb_welcome_demo_tor', 'locked'),
        entity('lock.aqara_wohnungstuer', 'locked', 'Aqara Wohnungstür'),
        entity('binary_sensor.fenster', 'off'),
      ].map((e) => [e.entity_id, e]),
    );
    expect(discoverDoors(states)).toEqual([
      {
        name: 'Tor',
        doorbell: 'binary_sensor.abb_welcome_demo_klingel_tor',
        lock: 'lock.abb_welcome_demo_tor',
      },
      {
        name: 'Wohnungstür',
        doorbell: 'binary_sensor.abb_welcome_demo_klingel_wohnungstuer',
        lock: 'lock.aqara_wohnungstuer',
      },
    ]);
  });

  it('describes lock states', () => {
    expect(lockStatus('locked')).toEqual({ label: 'Verriegelt', tone: 'locked' });
    expect(lockStatus('unlocking').tone).toBe('busy');
    expect(lockStatus('open').tone).toBe('open');
    expect(lockStatus('jammed').label).toBe('Blockiert');
    expect(lockStatus('unavailable').tone).toBe('unavailable');
    expect(lockStatus(undefined).label).toBe('Nicht gefunden');
    expect(isOpening('unlocking') && isOpening('open') && !isOpening('locked')).toBe(true);
    expect(canLockAgain('unlocked') && !canLockAgain('unlocking')).toBe(true);
  });

  it('counts down the doorbell highlight', () => {
    expect(ringRemaining(undefined, 0, 60)).toBe(0);
    expect(ringRemaining(1000, 1000, 60)).toBe(60);
    expect(ringRemaining(1000, 31_500, 60)).toBe(30);
    expect(ringRemaining(1000, 61_000, 60)).toBe(0);
    expect(ringRemaining(1000, 2000, 0)).toBe(0);
  });

  it('formats relative times in German', () => {
    const now = new Date(2026, 9, 31, 15, 0, 0).getTime();
    expect(formatAgo(now - 10_000, now)).toBe('gerade eben');
    expect(formatAgo(now - 5 * 60_000, now)).toBe('vor 5 min');
    expect(formatAgo(now - 2 * 3600_000, now)).toBe('vor 2 h');
    expect(formatAgo(new Date(2026, 9, 31, 7, 5).getTime(), now)).toBe('heute 07:05');
    expect(formatAgo(new Date(2026, 9, 30, 14, 2).getTime(), now)).toBe('gestern 14:02');
    expect(formatAgo(new Date(2026, 9, 28, 9, 15).getTime(), now)).toBe('28.10. 09:15');
  });

  it('restricts doors to users', () => {
    expect(canOperate({ name: 'A', lock: 'lock.a' }, undefined)).toBe(true);
    expect(canOperate({ name: 'A', lock: 'lock.a', users: ['u1'] }, 'u1')).toBe(true);
    expect(canOperate({ name: 'A', lock: 'lock.a', users: ['u1'] }, 'u2')).toBe(false);
    expect(canOperate({ name: 'A', lock: 'lock.a', users: ['u1'] }, undefined)).toBe(false);
  });

  it('puts ringing doors first', () => {
    const doors = [
      { id: 'a', left: 0, ring: 0 },
      { id: 'b', left: 10, ring: 100 },
      { id: 'c', left: 0, ring: 0 },
      { id: 'd', left: 50, ring: 200 },
    ];
    expect(
      sortDoors(
        doors,
        (d) => d.left,
        (d) => d.ring,
      ).map((d) => d.id),
    ).toEqual(['d', 'b', 'a', 'c']);
  });
});
