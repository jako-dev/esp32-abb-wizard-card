import { LitElement, css, html, nothing, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import type { HomeAssistant } from '../ha-types';
import { discoverDoors, type DoorCardConfig, type DoorCardDoor } from './door-config';

export const DOOR_EDITOR_TAG = 'abb-welcome-door-card-editor';

const CARD_SCHEMA = [
  { name: 'title', selector: { text: {} } },
  {
    type: 'grid',
    name: '',
    schema: [
      {
        name: 'layout',
        selector: {
          select: {
            mode: 'dropdown',
            options: [
              { value: 'tiles', label: 'Kacheln (Tablet)' },
              { value: 'rows', label: 'Liste (Handy)' },
              { value: 'buttons', label: 'Schlüssel-Knöpfe (Wandtablet)' },
              { value: 'bar', label: 'Statusleiste (kompakt)' },
            ],
          },
        },
      },
      {
        name: 'ring_window',
        selector: { number: { min: 0, max: 600, step: 5, mode: 'box', unit_of_measurement: 's' } },
      },
    ],
  },
];

const DOOR_SCHEMA = [
  {
    type: 'grid',
    name: '',
    schema: [
      { name: 'name', required: true, selector: { text: {} } },
      { name: 'icon', selector: { icon: {} } },
    ],
  },
  { name: 'lock', selector: { entity: { domain: 'lock' } } },
  { name: 'doorbell', selector: { entity: { domain: 'binary_sensor' } } },
  {
    type: 'grid',
    name: '',
    schema: [
      {
        name: 'confirm',
        selector: {
          select: {
            mode: 'dropdown',
            options: [
              { value: 'slide', label: 'Schieben' },
              { value: 'hold', label: 'Gedrückt halten' },
              { value: 'dialog', label: 'Mit Rückfrage' },
              { value: 'tap', label: 'Einmal tippen' },
            ],
          },
        },
      },
      {
        name: 'action',
        selector: {
          select: {
            mode: 'dropdown',
            options: [
              { value: 'unlock', label: 'Entriegeln (Standard)' },
              { value: 'open', label: 'Öffnen / Falle ziehen' },
            ],
          },
        },
      },
    ],
  },
  {
    name: 'controls',
    selector: {
      select: {
        multiple: true,
        mode: 'list',
        options: [
          { value: 'lock', label: 'Abschließen (wenn offen)' },
          { value: 'unlock', label: 'Aufschließen (wenn abgeschlossen)' },
          { value: 'open', label: 'Öffnen / Falle ziehen' },
        ],
      },
    },
  },
  { name: 'camera', selector: { entity: { domain: 'camera' } } },
  {
    name: 'camera_view',
    selector: {
      select: {
        mode: 'dropdown',
        options: [
          { value: 'ring', label: 'Nur beim Klingeln' },
          { value: 'always', label: 'Immer' },
        ],
      },
    },
  },
];

const LABELS: Record<string, string> = {
  title: 'Titel (optional)',
  layout: 'Darstellung',
  ring_window: 'Klingel-Hinweis anzeigen für',
  name: 'Name',
  icon: 'Icon (optional)',
  lock: 'Schloss',
  doorbell: 'Klingel-Sensor (optional)',
  confirm: 'Öffnen bestätigen durch (leer = passend zur Darstellung)',
  action: 'Aktion',
  controls: 'Zusätzliche Knöpfe (leer = Abschließen)',
  camera: 'Kamera (optional)',
  camera_view: 'Kamerabild zeigen',
};

const HELPERS: Record<string, string> = {
  lock: 'Schloss aus dem ABB-Welcome-Wizard oder jedes andere, z. B. Aqara.',
  doorbell: 'z. B. binary_sensor.klingel_tor – hebt die Tür beim Klingeln hervor.',
  action: '„Öffnen“ nur für Schlösser mit Falle (z. B. Nuki „Tür aufziehen“, Aqara U200).',
  controls:
    'Smart Locks wie Aqara U200: Aktion „Öffnen“ plus Abschließen und Aufschließen. Knöpfe erscheinen nur, wenn sie zum Zustand passen.',
};

/** Visual editor: card options plus a list of doors with add / move / remove. */
@customElement(DOOR_EDITOR_TAG)
export class AbbWelcomeDoorCardEditor extends LitElement {
  static override styles = css`
    .door {
      border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      border-radius: 12px;
      padding: 8px 12px 12px;
      margin-top: 12px;
    }
    .door-header {
      display: flex;
      align-items: center;
      gap: 4px;
      margin-bottom: 4px;
    }
    .door-header b {
      flex: 1;
    }
    .actions {
      display: flex;
      gap: 8px;
      flex-wrap: wrap;
      margin-top: 12px;
    }
    button {
      font: inherit;
      cursor: pointer;
      border-radius: 999px;
      border: 1px solid var(--divider-color, rgba(0, 0, 0, 0.12));
      background: transparent;
      color: var(--primary-color);
      padding: 6px 14px;
    }
    button.icon {
      border: none;
      padding: 4px;
      color: var(--secondary-text-color);
      --mdc-icon-size: 20px;
    }
    button:disabled {
      opacity: 0.35;
      cursor: default;
    }
    p {
      color: var(--secondary-text-color);
      font-size: 0.875rem;
    }
  `;

  @state() public hass?: HomeAssistant;
  @state() private config?: DoorCardConfig;

  public setConfig(config: DoorCardConfig): void {
    this.config = { ...config, doors: Array.isArray(config.doors) ? config.doors : [] };
  }

  private emit(config: DoorCardConfig): void {
    this.config = config;
    this.dispatchEvent(
      new CustomEvent('config-changed', { detail: { config }, bubbles: true, composed: true }),
    );
  }

  private clean<T extends object>(value: T): T {
    const copy = { ...value } as Record<string, unknown>;
    for (const [key, v] of Object.entries(copy))
      if (v === '' || v === undefined || v === null || (Array.isArray(v) && v.length === 0)) delete copy[key];
    return copy as T;
  }

  private onCardChanged(ev: CustomEvent<{ value: Partial<DoorCardConfig> }>): void {
    ev.stopPropagation();
    this.emit(this.clean({ ...this.config!, ...ev.detail.value, doors: this.config!.doors }));
  }

  private updateDoors(doors: DoorCardDoor[]): void {
    this.emit({ ...this.config!, doors });
  }

  private onDoorChanged(index: number, ev: CustomEvent<{ value: DoorCardDoor }>): void {
    ev.stopPropagation();
    const doors = [...this.config!.doors];
    doors[index] = this.clean(ev.detail.value);
    this.updateDoors(doors);
  }

  private move(index: number, delta: number): void {
    const doors = [...this.config!.doors];
    const [door] = doors.splice(index, 1);
    doors.splice(index + delta, 0, door);
    this.updateDoors(doors);
  }

  private discover(): void {
    const found = discoverDoors(this.hass?.states ?? {});
    const known = new Set(this.config!.doors.flatMap((d) => [d.lock, d.doorbell]).filter(Boolean));
    const fresh = found.filter((d) => !known.has(d.lock) && !known.has(d.doorbell));
    this.updateDoors([...this.config!.doors, ...fresh]);
  }

  protected override render(): TemplateResult | typeof nothing {
    if (!this.config) return nothing;
    const doors = this.config.doors;
    const computeLabel = (s: { name: string }) => LABELS[s.name] ?? s.name;
    const computeHelper = (s: { name: string }) => HELPERS[s.name];
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this.config}
        .schema=${CARD_SCHEMA}
        .computeLabel=${computeLabel}
        @value-changed=${this.onCardChanged}
      ></ha-form>
      ${doors.map(
        (door, index) => html`
          <div class="door">
            <div class="door-header">
              <b>${door.name || `Tür ${index + 1}`}</b>
              <button
                class="icon"
                title="Nach oben"
                ?disabled=${index === 0}
                @click=${() => this.move(index, -1)}
              >
                <ha-icon icon="mdi:arrow-up"></ha-icon>
              </button>
              <button
                class="icon"
                title="Nach unten"
                ?disabled=${index === doors.length - 1}
                @click=${() => this.move(index, 1)}
              >
                <ha-icon icon="mdi:arrow-down"></ha-icon>
              </button>
              <button
                class="icon"
                title="Tür entfernen"
                @click=${() => this.updateDoors(doors.filter((_, i) => i !== index))}
              >
                <ha-icon icon="mdi:delete-outline"></ha-icon>
              </button>
            </div>
            <ha-form
              .hass=${this.hass}
              .data=${door}
              .schema=${DOOR_SCHEMA}
              .computeLabel=${computeLabel}
              .computeHelper=${computeHelper}
              @value-changed=${(ev: CustomEvent<{ value: DoorCardDoor }>) => this.onDoorChanged(index, ev)}
            ></ha-form>
          </div>
        `,
      )}
      <div class="actions">
        <button @click=${() => this.updateDoors([...doors, { name: 'Neue Tür' }])}>+ Tür hinzufügen</button>
        <button @click=${this.discover}>Türen automatisch finden</button>
      </div>
      <p>
        „Automatisch finden“ sucht die Klingel-Sensoren und Schlösser aus dem ABB-Welcome-Wizard und alle
        anderen Schlösser. Bestimmte Benutzer kannst du per YAML mit <code>users:</code> (Benutzer-IDs)
        festlegen.
      </p>
    `;
  }
}
