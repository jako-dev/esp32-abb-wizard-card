import { describeAddress, formatAddress, formatByte } from './address';
import type { OpenResult, OpenStepId, RingCandidate, RingStepId, WizardResult } from './types';

export interface ExportOptions {
  /** Replace the door code bytes with zero placeholders, e.g. for sharing the YAML in a forum. */
  maskDoorCode?: boolean;
  /** ESPHome id of the debug text sensor; null omits the debug lambda. */
  debugSensorId?: string | null;
  /** How long a lock shows UNLOCKING after a confirmed open, in seconds. */
  unlockSeconds?: number;
  /** Apartment number shown in the header comment. */
  apartment?: number;
}

interface RingTarget {
  step: RingStepId;
  id: string;
  name: string;
}

interface LockTarget {
  step: OpenStepId;
  id: string;
  name: string;
  icon: string;
}

export const RING_TARGETS: readonly RingTarget[] = [
  { step: 'ring_gate', id: 'klingel_tor', name: 'Klingel Tor' },
  { step: 'ring_house', id: 'klingel_haustuer', name: 'Klingel Haustür' },
  { step: 'ring_apartment', id: 'klingel_wohnung', name: 'Klingel Wohnungstür' },
];

export const LOCK_TARGETS: readonly LockTarget[] = [
  { step: 'open_gate', id: 'tor', name: 'Tor', icon: 'mdi:gate' },
  { step: 'open_house', id: 'haustuer', name: 'Haustür', icon: 'mdi:door' },
];

const SECRET_NOTE = 'TÜRCODE – nicht öffentlich teilen!';

class YamlWriter {
  private readonly lines: string[] = [];

  line(indent: number, text = ''): this {
    this.lines.push(text === '' ? '' : ' '.repeat(indent) + text);
    return this;
  }

  comment(indent: number, text: string): this {
    return this.line(indent, `# ${text}`.trimEnd());
  }

  toString(): string {
    return this.lines.join('\n') + '\n';
  }
}

function quote(text: string): string {
  return `"${text.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
}

function typeHex(type: number): string {
  return type.toString(16).toUpperCase().padStart(2, '0');
}

function candidateLambda(c: RingCandidate, threeByte: boolean): string {
  const parts = [`(x.get_message_type() == ${formatByte(c.type)})`];
  if (c.src !== undefined) parts.push(`(x.get_source_address() == ${formatAddress(c.src, threeByte)})`);
  if (c.dst !== undefined) parts.push(`(x.get_destination_address() == ${formatAddress(c.dst, threeByte)})`);
  let prefix = '';
  if (c.data !== undefined) {
    prefix = `std::vector<uint8_t> d = {${c.data.map(formatByte).join(', ')}}; `;
    parts.push('(x.get_data() == d)');
  }
  return `'${prefix}return ${parts.join(' && ')};'`;
}

function candidateComment(c: RingCandidate, captures: number, threeByte: boolean): string {
  let text = `Typ ${typeHex(c.type)}`;
  if (c.src !== undefined && c.dst !== undefined) {
    text += `: ${describeAddress(c.src, threeByte)} > ${describeAddress(c.dst, threeByte)}`;
  } else if (c.src !== undefined) {
    text += `, Quelle: ${describeAddress(c.src, threeByte)}`;
  } else if (c.dst !== undefined) {
    text += `, Ziel: ${describeAddress(c.dst, threeByte)}`;
  }
  if (c.data !== undefined) text += `, Data: ${c.data.map((b) => typeHex(b)).join(' ')}`;
  return `${text} (${c.occurrences}/${captures} Aufnahmen)`;
}

function publish(
  w: YamlWriter,
  indent: number,
  kind: 'binary_sensor' | 'lock',
  id: string,
  state: string,
): void {
  w.line(indent, `- ${kind}.template.publish:`);
  w.line(indent + 4, `id: ${id}`);
  w.line(indent + 4, `state: ${state}`);
}

function unlockSequence(w: YamlWriter, indent: number, id: string, seconds: number): void {
  publish(w, indent, 'lock', id, 'UNLOCKING');
  w.line(indent, `- delay: ${seconds}s`);
  publish(w, indent, 'lock', id, 'LOCKED');
}

function writeHeader(w: YamlWriter, result: WizardResult, options: ExportOptions): void {
  const { indoor, threeByte } = result;
  w.comment(0, 'ABB-Welcome Wizard – generierte ESPHome-Konfiguration');
  if (indoor) {
    const apartment = options.apartment !== undefined ? `, Wohnung ${options.apartment}` : '';
    w.comment(0, `Innenstation: ${formatAddress(indoor.address, threeByte)}${apartment}`);
  }
  w.comment(0, `Adresslänge: ${threeByte ? '3 Byte (three_byte_address: true)' : '2 Byte'}`);
  w.comment(0, '');
  w.comment(0, 'Diese Abschnitte ersetzen die gleichnamigen Abschnitte der Demo-Firmware:');
  w.comment(0, 'esphome.on_boot, remote_receiver.on_abbwelcome, binary_sensor und lock.');
  w.comment(0, 'Alle übrigen Einstellungen (wifi, api, ota, remote_transmitter, Pins von');
  w.comment(0, 'remote_receiver, text_sensor ...) unverändert lassen.');
  w.comment(0, '');
  w.comment(0, 'Voraussetzung (in der Demo-Firmware bereits gesetzt):');
  w.comment(0, 'esp32:');
  w.comment(0, '  framework:');
  w.comment(0, '    type: esp-idf');
  if (result.opens.open_gate || result.opens.open_house) {
    w.comment(0, '');
    w.comment(
      0,
      options.maskDoorCode
        ? 'Türcodes sind durch Platzhalter ersetzt – vor dem Flashen die echten Werte eintragen!'
        : `ACHTUNG: "data" der Öffnen-Befehle ist euer ${SECRET_NOTE}`,
    );
  }
  const problems = result.warnings.filter((x) => x.severity !== 'info');
  if (problems.length > 0) {
    w.comment(0, '');
    for (const p of problems) w.comment(0, `${p.severity === 'error' ? 'FEHLER' : 'Warnung'}: ${p.message}`);
  }
  w.line(0);
}

/** Generate the ESPHome YAML snippet for a WizardResult (syntax per Mat931's how_to_customize). */
export function generateYaml(result: WizardResult, options: ExportOptions = {}): string {
  const w = new YamlWriter();
  const { indoor, threeByte } = result;
  const debugId = options.debugSensorId === undefined ? 'doorbell_intercom' : options.debugSensorId;
  const unlockSeconds = options.unlockSeconds ?? 3;

  writeHeader(w, result, options);
  if (!indoor) {
    w.comment(0, 'Keine Innenstationsadresse ermittelt – es kann keine Konfiguration erzeugt werden.');
    return w.toString();
  }

  const rings = RING_TARGETS.filter((t) => result.rings[t.step].selected.length > 0);
  const locks = LOCK_TARGETS.map((t) => ({ ...t, open: result.opens[t.step] })).filter(
    (t): t is LockTarget & { open: OpenResult } => t.open !== null,
  );
  const missing = [
    ...RING_TARGETS.filter((t) => !rings.includes(t)).map((t) => t.name),
    ...LOCK_TARGETS.filter((t) => !result.opens[t.step]).map((t) => `Öffnen ${t.name}`),
  ];

  if (rings.length + locks.length > 0) {
    w.line(0, 'esphome:');
    w.line(2, 'on_boot:');
    for (const t of rings) publish(w, 4, 'binary_sensor', t.id, 'OFF');
    for (const t of locks) publish(w, 4, 'lock', t.id, 'LOCKED');
    w.line(0);
  }

  w.line(0, 'remote_receiver:');
  w.comment(2, 'pin, dump, filter, tolerance, idle, buffer_size ... aus der bestehenden Konfiguration');
  w.line(2, 'on_abbwelcome:');
  w.line(4, 'then:');
  if (debugId) {
    w.comment(6, 'Debug-Textsensor (id ggf. an eure Firmware anpassen)');
    w.line(6, `- lambda: 'char buf[192]; x.format_to(buf, 192); id(${debugId}).publish_state(buf);'`);
  }
  for (const t of rings) {
    const ring = result.rings[t.step];
    const outdoor =
      ring.outdoorAddress !== undefined ? ` – ${describeAddress(ring.outdoorAddress, threeByte)}` : '';
    w.comment(6, `${t.name}${outdoor}`);
    w.line(6, '- if:');
    w.line(10, 'condition:');
    w.line(12, 'or:');
    for (const c of ring.selected) {
      w.comment(14, candidateComment(c, ring.captures, threeByte));
      w.line(14, `- lambda: ${candidateLambda(c, threeByte)}`);
    }
    w.line(10, 'then:');
    publish(w, 12, 'binary_sensor', t.id, 'ON');
    publish(w, 12, 'binary_sensor', t.id, 'OFF');
  }
  for (const t of locks) {
    const confirmation = t.open.confirmation;
    if (!confirmation) continue;
    w.comment(6, `${t.name} geöffnet (Bestätigung Typ ${typeHex(confirmation.messageType)})`);
    w.line(6, '- if:');
    w.line(10, 'condition:');
    w.line(12, 'and:');
    w.line(14, `- lambda: 'return (x.get_message_type() == ${formatByte(confirmation.messageType)});'`);
    w.line(
      14,
      `- lambda: 'return (x.get_source_address() == ${formatAddress(confirmation.source, threeByte)});'`,
    );
    if (confirmation.destination !== undefined) {
      w.line(
        14,
        `- lambda: 'return (x.get_destination_address() == ${formatAddress(confirmation.destination, threeByte)});'`,
      );
    }
    w.line(10, 'then:');
    unlockSequence(w, 12, t.id, unlockSeconds);
  }
  if (missing.length > 0) w.comment(6, `Nicht ermittelt: ${missing.join(', ')}`);
  w.line(0);

  if (rings.length > 0) {
    w.line(0, 'binary_sensor:');
    for (const t of rings) {
      w.line(2, '- platform: template');
      w.line(4, `name: ${quote(t.name)}`);
      w.line(4, `id: ${t.id}`);
      w.line(4, 'icon: mdi:bell');
      w.line(4, 'filters:');
      w.line(6, '- delayed_off: 1s');
    }
    w.line(0);
  }

  if (locks.length > 0) {
    w.line(0, 'lock:');
    for (const t of locks) {
      const { open } = t;
      const data = options.maskDoorCode ? open.data.map(() => 0) : open.data;
      w.line(2, '- platform: template');
      w.line(4, `name: ${quote(t.name)}`);
      w.line(4, `id: ${t.id}`);
      w.line(4, `icon: ${t.icon}`);
      w.line(4, 'lock_action:');
      publish(w, 6, 'lock', t.id, 'LOCKED');
      w.line(4, 'unlock_action:');
      w.line(6, '- remote_transmitter.transmit_abbwelcome:');
      w.line(10, `source_address: ${formatAddress(indoor.address, threeByte)} # Innenstation`);
      w.line(
        10,
        `destination_address: ${formatAddress(open.destination, threeByte)} # ${describeAddress(open.destination, threeByte)}`,
      );
      w.line(10, `three_byte_address: ${threeByte}`);
      w.line(
        10,
        `message_type: ${formatByte(open.messageType)} # ${open.messageType === 0x0e ? 'Schiebetür' : 'Türöffner'}`,
      );
      const note = options.maskDoorCode ? `PLATZHALTER: ${data.length} Byte ${SECRET_NOTE}` : SECRET_NOTE;
      w.line(10, `data: [${data.map(formatByte).join(', ')}] # ${note}`);
      if (!open.confirmation) {
        w.comment(6, 'Keine Bestätigung vom Bus aufgenommen – Status wird nur angenommen');
        unlockSequence(w, 6, t.id, unlockSeconds);
      }
    }
  }

  return w.toString();
}
