import { doorIds, doorsFromConfig, newDoor, slugify } from '../src/doors';

describe('doors', () => {
  it('slugifies German names for ESPHome ids', () => {
    expect(slugify('Haustür')).toBe('haustuer');
    expect(slugify('Große Einfahrt (Süd)')).toBe('grosse_einfahrt_sued');
    expect(slugify('3. OG')).toBe('tuer_3_og');
    expect(slugify('!!!')).toBe('tuer');
  });

  it('creates unique ids', () => {
    const doors = doorsFromConfig([{ name: 'Tür' }, { name: 'Tür' }, { name: 'X', id: 'eingang' }]);
    expect(doors.map((d) => d.key)).toEqual(['tuer', 'tuer_2', 'eingang']);
    expect(Object.values(doorIds(doors))).toEqual(['tuer', 'tuer_2', 'eingang']);
    expect(newDoor(doors).key).toBe('neue_tuer');
  });

  it('reads the doors config', () => {
    expect(
      doorsFromConfig([
        { name: 'Haustür', default: true },
        { name: 'Garage', open: false, icon: 'mdi:garage' },
        { name: 'Wohnung', type: 'floor' },
      ]),
    ).toEqual([
      { key: 'haustuer', name: 'Haustür', type: 'outdoor', open: true, default: true },
      { key: 'garage', name: 'Garage', type: 'outdoor', open: false, default: false, icon: 'mdi:garage' },
      { key: 'wohnung', name: 'Wohnung', type: 'floor', open: false, default: false },
    ]);
  });

  it('rejects invalid doors config with German messages', () => {
    expect(() => doorsFromConfig([])).toThrow('mindestens einer Tür');
    expect(() => doorsFromConfig([{}])).toThrow('"name" fehlt');
    expect(() => doorsFromConfig([{ name: 'A', type: 'x' }])).toThrow('outdoor');
    expect(() =>
      doorsFromConfig([
        { name: 'A', default: true },
        { name: 'B', default: true },
      ]),
    ).toThrow('Nur eine Tür');
  });
});
