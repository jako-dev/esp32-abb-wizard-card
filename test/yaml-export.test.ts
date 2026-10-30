import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { parse } from 'yaml';
import { analyzeSession } from '../src/analysis';
import { apartmentFromDials } from '../src/address';
import { createSession, parseSession } from '../src/session';
import { generateYaml, type ExportOptions } from '../src/yaml-export';

// Run with UPDATE_GOLDEN=1 to rewrite the golden files after an intended change.
const update = process.env.UPDATE_GOLDEN === '1';

function exportFixture(name: string, options: ExportOptions = {}): string {
  const session = parseSession(readFileSync(new URL(`./fixtures/${name}.json`, import.meta.url), 'utf8'));
  const result = analyzeSession(session);
  return generateYaml(result, { apartment: apartmentFromDials(session.dials), ...options });
}

function expectGolden(actual: string, file: string): void {
  const url = new URL(`./golden/${file}`, import.meta.url);
  if (update || !existsSync(url)) writeFileSync(url, actual);
  expect(actual).toBe(readFileSync(url, 'utf8'));
}

describe('generateYaml golden files', () => {
  it.each([
    ['mat931-example', 'mat931-example.yaml', {}],
    ['two-outdoor-neighbours', 'two-outdoor-neighbours.yaml', {}],
    ['two-outdoor-neighbours', 'two-outdoor-neighbours.masked.yaml', { maskDoorCode: true }],
    ['three-byte', 'three-byte.yaml', { debugSensorId: null }],
  ] as const)('%s → %s', (fixture, golden, options) => {
    expectGolden(exportFixture(fixture, options), golden);
  });
});

describe('generateYaml', () => {
  const yaml = exportFixture('two-outdoor-neighbours');
  const doc = parse(yaml);

  it('produces valid YAML', () => {
    expect(Object.keys(doc)).toEqual(['esphome', 'remote_receiver', 'binary_sensor', 'lock']);
  });

  it('creates one binary sensor per doorbell and one lock per door', () => {
    expect(doc.binary_sensor.map((b: { id: string }) => b.id)).toEqual([
      'klingel_tor',
      'klingel_haustuer',
      'klingel_wohnung',
    ]);
    expect(doc.lock.map((l: { id: string }) => l.id)).toEqual(['tor', 'haustuer']);
  });

  it('combines doorbell candidates with or:', () => {
    const conditions = doc.remote_receiver.on_abbwelcome.then[1].if.condition.or;
    expect(conditions).toEqual([
      {
        lambda:
          'return (x.get_message_type() == 0x01) && (x.get_source_address() == 0x2001) && (x.get_destination_address() == 0x1010);',
      },
      {
        lambda:
          'std::vector<uint8_t> d = {0x01, 0x10, 0x10}; return (x.get_message_type() == 0x0a) && (x.get_source_address() == 0x2001) && (x.get_destination_address() == 0x3001) && (x.get_data() == d);',
      },
    ]);
  });

  it('transmits the door opener frame', () => {
    expect(doc.lock[1].unlock_action[0]['remote_transmitter.transmit_abbwelcome']).toEqual({
      source_address: 0x1010,
      destination_address: 0x4001,
      three_byte_address: false,
      message_type: 0x0d,
      data: [0xab, 0xcd, 0xef],
    });
    expect(yaml).toContain('nicht öffentlich teilen');
  });

  it('masks the door code on request', () => {
    const masked = parse(exportFixture('two-outdoor-neighbours', { maskDoorCode: true }));
    expect(masked.lock[1].unlock_action[0]['remote_transmitter.transmit_abbwelcome'].data).toEqual([0, 0, 0]);
  });

  it('sets three_byte_address for three-byte systems', () => {
    const three = parse(exportFixture('three-byte'));
    expect(three.lock[0].unlock_action[0]['remote_transmitter.transmit_abbwelcome']).toMatchObject({
      source_address: 0x000110,
      destination_address: 0x000401,
      three_byte_address: true,
      message_type: 0x0e,
    });
  });

  it('explains when nothing could be determined', () => {
    const empty = generateYaml(analyzeSession(createSession('sensor.x')));
    expect(empty).toContain('Keine Innenstationsadresse ermittelt');
    expect(parse(empty)).toBeNull();
  });
});
