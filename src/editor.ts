import { LitElement, html, nothing, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import type { CardConfig, HomeAssistant } from './ha-types';

export const EDITOR_TAG = 'abb-welcome-wizard-card-editor';

const SCHEMA = [
  { name: 'entity', required: true, selector: { entity: { domain: 'sensor' } } },
  { name: 'title', selector: { text: {} } },
  {
    type: 'grid',
    name: '',
    schema: [
      {
        name: 'capture_seconds',
        selector: { number: { min: 2, max: 120, step: 1, mode: 'box', unit_of_measurement: 's' } },
      },
      { name: 'indoor_address', selector: { text: {} } },
    ],
  },
];

const LABELS: Record<string, string> = {
  entity: 'Debug-Textsensor des ESP32',
  title: 'Titel (optional)',
  capture_seconds: 'Aufnahmedauer',
  indoor_address: 'Innenstationsadresse (optional)',
};

const HELPERS: Record<string, string> = {
  entity: 'Der Sensor, der jeden Bus-Frame anzeigt, z. B. „Doorbell Intercom“.',
  indoor_address: 'Nur nötig, wenn die automatische Erkennung danebenliegt, z. B. 0x1010.',
};

/** Visual editor for the card options. Doors are set up inside the card itself. */
@customElement(EDITOR_TAG)
export class AbbWelcomeWizardCardEditor extends LitElement {
  @state() public hass?: HomeAssistant;
  @state() private config?: CardConfig;

  public setConfig(config: CardConfig): void {
    this.config = config;
  }

  private onValueChanged(ev: CustomEvent<{ value: Partial<CardConfig> }>): void {
    ev.stopPropagation();
    const config: Record<string, unknown> = { ...this.config, ...ev.detail.value };
    for (const key of ['title', 'indoor_address', 'capture_seconds']) {
      if (config[key] === '' || config[key] === undefined || config[key] === null) delete config[key];
    }
    this.config = config as unknown as CardConfig;
    this.dispatchEvent(
      new CustomEvent('config-changed', { detail: { config }, bubbles: true, composed: true }),
    );
  }

  protected override render(): TemplateResult | typeof nothing {
    if (!this.config) return nothing;
    return html`
      <ha-form
        .hass=${this.hass}
        .data=${this.config}
        .schema=${SCHEMA}
        .computeLabel=${(s: { name: string }) => LABELS[s.name] ?? s.name}
        .computeHelper=${(s: { name: string }) => HELPERS[s.name]}
        @value-changed=${this.onValueChanged}
      ></ha-form>
      <p style="color:var(--secondary-text-color);font-size:0.875rem;margin:12px 0 0">
        Die Türen (Namen, Öffner, Standard-Tür) richtest du direkt in der Karte auf der Startseite ein.
      </p>
    `;
  }
}
