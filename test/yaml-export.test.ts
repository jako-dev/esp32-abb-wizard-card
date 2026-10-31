import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { parse } from 'yaml';
import { analyzeSession } from '../src/analysis';
import { createSession, parseSession } from '../src/session';
import {
  checkDeviceName,
  deviceNameFromFriendly,
  effectiveDeviceName,
  generateYaml,
  macSuffix,
  type ExportOptions,
} from '../src/yaml-export';
import { setOverrides } from '../src/session';

// Run with UPDATE_GOLDEN=1 to rewrite the golden files after an intended change.
const update = process.env.UPDATE_GOLDEN === '1';

function exportFixture(name: string, options: ExportOptions = {}): string {
  const session = parseSession(readFileSync(new URL(`./fixtures/${name}.json`, import.meta.url), 'utf8'));
  const result = analyzeSession(session);
  return generateYaml(result, session.doors, options);
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
    ['custom-doors', 'custom-doors.yaml', {}],
    [
      'two-outdoor-neighbours',
      'two-outdoor-neighbours.full.yaml',
      { device: { name: 'abb-welcome-demo', friendlyName: 'ABB Welcome Demo' } },
    ],
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
      'klingel_wohnungstuer',
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

  it('names sensors and locks after the configured doors', () => {
    const custom = parse(exportFixture('custom-doors'));
    expect(custom.binary_sensor.map((b: { id: string; name: string }) => [b.id, b.name])).toEqual([
      ['klingel_haustuer', 'Klingel Haustür'],
      ['klingel_garage', 'Klingel Garage'],
      ['klingel_wohnung_oben', 'Klingel Wohnung oben'],
    ]);
    expect(custom.lock.map((l: { id: string; name: string }) => [l.id, l.name])).toEqual([
      ['haustuer', 'Haustür'],
    ]);
  });

  it('explains when nothing could be determined', () => {
    const session = createSession('sensor.x');
    const empty = generateYaml(analyzeSession(session), session.doors);
    expect(empty).toContain('Keine Innenstationsadresse ermittelt');
    expect(parse(empty)).toBeNull();
  });

  describe('complete device configuration', () => {
    const secret = { tag: '!secret', resolve: (value: string) => `secret:${value}` };
    const lambda = { tag: '!lambda', resolve: (value: string) => `lambda:${value}` };
    const full = parse(
      exportFixture('two-outdoor-neighbours', {
        device: { name: 'klingel', friendlyName: 'Klingel', debugSensorName: 'ABB Welcome Last Frame' },
      }),
      { customTags: [secret, lambda] },
    );

    it('contains everything needed to flash the device', () => {
      expect(Object.keys(full)).toEqual([
        'esp32',
        'esphome',
        'wifi',
        'captive_portal',
        'logger',
        'api',
        'ota',
        'remote_transmitter',
        'remote_receiver',
        'binary_sensor',
        'sensor',
        'text_sensor',
        'lock',
        'button',
        'status_led',
      ]);
      expect(full.esp32.framework.type).toBe('esp-idf');
      expect(full.esphome).toMatchObject({ name: 'klingel', friendly_name: 'Klingel' });
      expect(full.api).toMatchObject({
        encryption: { key: 'secret:api_encryption_key' },
        batch_delay: '0ms',
      });
      expect(full.api.actions[0].action).toBe('send_frame');
      expect(Object.keys(full.api.actions[0].variables)).toEqual([
        'source',
        'destination',
        'message_type',
        'data',
        'three_byte',
      ]);
      expect(Object.keys(full.api.actions[0].then[0]['remote_transmitter.transmit_abbwelcome'])).toEqual([
        'source_address',
        'destination_address',
        'three_byte_address',
        'message_type',
        'data',
      ]);
      expect(full.remote_receiver).toMatchObject({ pin: { number: 'GPIO25' }, dump: ['abbwelcome'] });
      expect(full.remote_transmitter.pin).toBe('GPIO26');
    });

    it('keeps the debug sensor so this card keeps working', () => {
      expect(full.text_sensor).toEqual([
        {
          platform: 'template',
          name: 'ABB Welcome Last Frame',
          id: 'doorbell_intercom',
          icon: 'mdi:bell-circle',
          update_interval: 'never',
        },
      ]);
      expect(full.remote_receiver.on_abbwelcome.then[0].lambda).toContain('id(doorbell_intercom)');
    });

    it('derives ESPHome node names', () => {
      expect(deviceNameFromFriendly('ABB Welcome Demo')).toBe('abb-welcome-demo');
      expect(deviceNameFromFriendly('Türklingel Süd')).toBe('tuerklingel-sued');
      expect(deviceNameFromFriendly('!!')).toBe('abb-welcome-demo');
    });
  });
});

describe('locks for manual and derived open frames', () => {
  const session = setOverrides(createSession('sensor.x'), {
    indoorAddress: 0x1016,
    opens: { haustuer: { destination: 0x4002, messageType: 0x0d, data: [0x1c, 0x41, 0x68] } },
  });
  const yaml = generateYaml(analyzeSession(session), session.doors);
  const doc = parse(yaml);

  it('creates a template lock that transmits the frame', () => {
    expect(doc.lock).toHaveLength(1);
    expect(doc.lock[0]).toMatchObject({ platform: 'template', name: 'Haustür', id: 'haustuer' });
    expect(doc.lock[0].unlock_action[0]['remote_transmitter.transmit_abbwelcome']).toEqual({
      source_address: 0x1016,
      destination_address: 0x4002,
      three_byte_address: false,
      message_type: 0x0d,
      data: [0x1c, 0x41, 0x68],
    });
    expect(yaml).toContain('# Haustür: Öffnen-Frame manuell eingetragen');
  });

  it('publishes LOCKED on boot and listens for the 8D reply', () => {
    expect(doc.esphome.on_boot).toEqual([{ 'lock.template.publish': { id: 'haustuer', state: 'LOCKED' } }]);
    const feedback = doc.remote_receiver.on_abbwelcome.then.find((step: { if?: { then: unknown[] } }) =>
      JSON.stringify(step).includes('UNLOCKING'),
    );
    expect(feedback.if.condition.and).toEqual([
      { lambda: 'return (x.get_message_type() == 0x8d);' },
      { lambda: 'return (x.get_source_address() == 0x4002);' },
      { lambda: 'return (x.get_destination_address() == 0x1016);' },
    ]);
    expect(feedback.if.then).toEqual([
      { 'lock.template.publish': { id: 'haustuer', state: 'UNLOCKING' } },
      { delay: '3s' },
      { 'lock.template.publish': { id: 'haustuer', state: 'LOCKED' } },
    ]);
    expect(yaml).toContain('Bestätigung Typ 8D, angenommen – nicht aufgenommen');
  });
});

describe('device name', () => {
  const tags = [
    { tag: '!secret', resolve: (value: string) => value },
    { tag: '!lambda', resolve: (value: string) => value },
  ];
  const exportWith = (device: ExportOptions['device']) =>
    parse(exportFixture('two-outdoor-neighbours', { device }), { customTags: tags });

  it('adds name_add_mac_suffix only when enabled and keeps batch_delay', () => {
    expect(
      exportWith({ name: 'abb-welcome-demo', friendlyName: 'ABB' }).esphome.name_add_mac_suffix,
    ).toBeUndefined();
    const full = exportWith({ name: 'abb-welcome-demo', friendlyName: 'ABB', nameAddMacSuffix: true });
    expect(full.esphome).toMatchObject({ name: 'abb-welcome-demo', name_add_mac_suffix: true });
    expect(full.api.batch_delay).toBe('0ms');
  });

  it('computes the name with MAC suffix', () => {
    expect(macSuffix('24:6F:28:AA:BB:CC')).toBe('aabbcc');
    expect(macSuffix('nope')).toBeUndefined();
    expect(
      effectiveDeviceName(
        { name: 'abb-welcome-demo', friendlyName: '', nameAddMacSuffix: true },
        '24:6f:28:aa:bb:cc',
      ),
    ).toBe('abb-welcome-demo-aabbcc');
  });

  it('warns if the name does not fit the device in Home Assistant', () => {
    const device = { name: 'abb-welcome-demo', friendlyName: 'ABB Welcome Demo' };
    expect(checkDeviceName(device, { name: 'ABB Welcome Demo' })).toBeUndefined();
    expect(checkDeviceName(device, {})).toBeUndefined();
    expect(checkDeviceName({ ...device, name: 'klingel' }, { name: 'ABB Welcome Demo' })).toContain(
      'passt nicht zum Gerät',
    );
    const mac = '24:6f:28:aa:bb:cc';
    expect(checkDeviceName(device, { name: 'ABB Welcome Demo aabbcc', mac })).toContain(
      'name_add_mac_suffix“ aktivieren',
    );
    expect(
      checkDeviceName({ ...device, nameAddMacSuffix: true }, { name: 'ABB Welcome Demo aabbcc', mac }),
    ).toBeUndefined();
    expect(
      checkDeviceName({ ...device, nameAddMacSuffix: true }, { name: 'ABB Welcome Demo', mac }),
    ).toContain('ausschalten');
  });
});
