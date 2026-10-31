import { LitElement, html, nothing, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import type { HomeAssistant } from '../ha-types';
import { fetchHistory, lastOnTimes } from '../history';
import {
  canLockAgain,
  canOperate,
  DEFAULTS,
  discoverDoors,
  DOOR_CARD_TAG,
  formatAgo,
  isOpening,
  lockStatus,
  normalizeDoorCardConfig,
  ringRemaining,
  sortDoors,
  type DoorCardConfig,
  type DoorCardDoor,
} from './door-config';
import { DOOR_EDITOR_TAG } from './door-card-editor';
import { doorCardStyles } from './door-styles';

/** Home Assistant with the service call API – only this card uses it, the wizard never does. */
type HassWithServices = HomeAssistant & {
  callService(domain: 'lock', service: string, data: { entity_id: string }): Promise<unknown>;
};

type Pending =
  | { phase: 'sending' }
  | { phase: 'sent'; at: number }
  | { phase: 'done'; at: number }
  | { phase: 'noresponse'; at: number }
  | { phase: 'error'; at: number; message: string };

/** Without a state change after this time the command counts as "sent without confirmation". */
const CONFIRM_TIMEOUT_MS = 8000;
/** How long success / failure feedback stays on the button. */
const FEEDBACK_MS = 4000;
/** An inline confirmation ("Wirklich öffnen?") expires after this time. */
const DIALOG_MS = 6000;
/** Doorbell history loaded for "klingelte vor …". */
const RING_HISTORY_MS = 7 * 24 * 3600 * 1000;

/** Daily-use card: open / lock the doors set up with the wizard (or any other lock). */
@customElement(DOOR_CARD_TAG)
export class AbbWelcomeDoorCard extends LitElement {
  static override styles = doorCardStyles;

  @state() private config?: DoorCardConfig;
  @state() private now = Date.now();
  @state() private lastRings: Record<string, number> = {};
  @state() private pending: Record<number, Pending> = {};
  @state() private holding?: number;
  @state() private confirming?: { index: number; until: number };
  @state() private hint?: { index: number; text: string; until: number };

  private _hass?: HassWithServices;
  private timer?: number;
  private holdTimer?: number;
  private historyLoadedFor?: string;

  public static getConfigElement(): HTMLElement {
    return document.createElement(DOOR_EDITOR_TAG);
  }

  public static getStubConfig(hass?: HomeAssistant): Partial<DoorCardConfig> {
    const doors = discoverDoors(hass?.states ?? {});
    return { doors: doors.length > 0 ? doors : [{ name: 'Haustür', lock: 'lock.haustuer' }] };
  }

  public setConfig(config: DoorCardConfig): void {
    this.config = normalizeDoorCardConfig(config);
    this.pending = {};
    this.confirming = undefined;
    this.loadRingHistory();
  }

  public getCardSize(): number {
    const count = this.config?.doors.length ?? 1;
    const layout = this.config?.layout ?? DEFAULTS.layout;
    return layout === 'compact' ? 1 : layout === 'rows' ? count + 1 : 3 * Math.ceil(count / 2);
  }

  public getGridOptions(): Record<string, number> {
    return { columns: 12, min_columns: 4 };
  }

  public set hass(hass: HassWithServices) {
    const previous = this._hass;
    this._hass = hass;
    if (this.config) {
      // Rings are detected live from the doorbell sensors turning on.
      const rings = { ...this.lastRings };
      let changed = false;
      for (const door of this.config.doors) {
        if (!door.doorbell) continue;
        const now = hass.states[door.doorbell];
        const before = previous?.states[door.doorbell];
        if (previous && now?.state === 'on' && before?.state !== 'on') {
          rings[door.doorbell] = Date.parse(now.last_changed) || Date.now();
          changed = true;
        }
      }
      if (changed) this.lastRings = rings;
      this.updatePending(hass);
    }
    if (!previous) this.loadRingHistory();
    this.requestUpdate();
  }

  public get hass(): HassWithServices | undefined {
    return this._hass;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.timer = window.setInterval(() => this.tick(), 1000);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    window.clearInterval(this.timer);
    this.cancelHold();
  }

  /** Last ring per doorbell from the recorder, so "klingelte vor …" survives reloads and restarts. */
  private async loadRingHistory(): Promise<void> {
    const bells = (this.config?.doors ?? []).flatMap((d) => (d.doorbell ? [d.doorbell] : []));
    const key = bells.join(',');
    if (!this._hass?.connection?.sendMessagePromise || bells.length === 0 || this.historyLoadedFor === key)
      return;
    this.historyLoadedFor = key;
    try {
      const now = Date.now();
      const history = await fetchHistory(this._hass.connection, bells, now - RING_HISTORY_MS, now);
      const fromHistory = lastOnTimes(history);
      const merged = { ...fromHistory };
      for (const [entity, time] of Object.entries(this.lastRings))
        merged[entity] = Math.max(time, merged[entity] ?? 0);
      this.lastRings = merged;
    } catch {
      // History not available (e.g. recorder excluded): live detection still works.
    }
  }

  private tick(): void {
    this.now = Date.now();
    if (this.confirming && this.now > this.confirming.until) this.confirming = undefined;
    if (this.hint && this.now > this.hint.until) this.hint = undefined;
    let changed = false;
    const pending = { ...this.pending };
    for (const [key, p] of Object.entries(pending)) {
      const index = Number(key);
      if (p.phase === 'sent' && this.now - p.at > CONFIRM_TIMEOUT_MS) {
        pending[index] = { phase: 'noresponse', at: this.now };
        changed = true;
      } else if (p.phase !== 'sending' && p.phase !== 'sent' && this.now - p.at > FEEDBACK_MS) {
        delete pending[index];
        changed = true;
      }
    }
    if (changed) this.pending = pending;
  }

  private updatePending(hass: HomeAssistant): void {
    if (!this.config) return;
    let changed = false;
    const pending = { ...this.pending };
    this.config.doors.forEach((door, index) => {
      if (pending[index]?.phase === 'sent' && door.lock && isOpening(hass.states[door.lock]?.state)) {
        pending[index] = { phase: 'done', at: Date.now() };
        this.haptic('success');
        changed = true;
      }
    });
    if (changed) this.pending = pending;
  }

  private haptic(type: 'success' | 'failure' | 'light'): void {
    // The Home Assistant companion apps turn this event into a vibration.
    window.dispatchEvent(new CustomEvent('haptic', { detail: type }));
  }

  private moreInfo(entityId: string | undefined): void {
    if (!entityId) return;
    this.dispatchEvent(
      new CustomEvent('hass-more-info', { detail: { entityId }, bubbles: true, composed: true }),
    );
  }

  // ---- Opening ---------------------------------------------------------------------------------------

  private async callLock(index: number, door: DoorCardDoor, service: string): Promise<void> {
    if (!this._hass || !door.lock) return;
    this.pending = { ...this.pending, [index]: { phase: 'sending' } };
    try {
      await this._hass.callService('lock', service, { entity_id: door.lock });
      const opening = service !== 'lock';
      this.pending = {
        ...this.pending,
        [index]:
          opening && !isOpening(this._hass.states[door.lock]?.state)
            ? { phase: 'sent', at: Date.now() }
            : { phase: 'done', at: Date.now() },
      };
      if (this.pending[index].phase === 'done') this.haptic('success');
    } catch (err) {
      const message =
        err instanceof Error ? err.message : ((err as { message?: string })?.message ?? String(err));
      this.pending = { ...this.pending, [index]: { phase: 'error', at: Date.now(), message } };
      this.haptic('failure');
    }
  }

  private openDoor(index: number, door: DoorCardDoor): void {
    this.confirming = undefined;
    void this.callLock(index, door, door.action ?? DEFAULTS.action);
  }

  private holdTime(): number {
    return this.config?.hold_time ?? DEFAULTS.hold_time;
  }

  private startHold(index: number, door: DoorCardDoor, ev: Event): void {
    ev.preventDefault();
    if (this.holding !== undefined || this.isBusy(index)) return;
    this.holding = index;
    this.haptic('light');
    this.holdTimer = window.setTimeout(() => {
      this.holdTimer = undefined;
      this.holding = undefined;
      this.openDoor(index, door);
    }, this.holdTime());
  }

  private endHold(index: number): void {
    if (this.holding !== index) return;
    if (this.holdTimer !== undefined) {
      this.hint = { index, text: 'Zum Öffnen gedrückt halten', until: Date.now() + 2500 };
    }
    this.cancelHold();
  }

  private cancelHold(): void {
    window.clearTimeout(this.holdTimer);
    this.holdTimer = undefined;
    this.holding = undefined;
  }

  private onActivate(index: number, door: DoorCardDoor): void {
    const mode = door.confirm ?? DEFAULTS.confirm;
    if (mode === 'tap') this.openDoor(index, door);
    else if (mode === 'dialog') this.confirming = { index, until: Date.now() + DIALOG_MS };
  }

  private isBusy(index: number): boolean {
    const phase = this.pending[index]?.phase;
    return phase === 'sending' || phase === 'sent';
  }

  /** Event handlers for the open button / compact chip, depending on the confirmation mode. */
  private openHandlers(index: number, door: DoorCardDoor) {
    if ((door.confirm ?? DEFAULTS.confirm) !== 'hold') {
      return { click: () => this.onActivate(index, door) };
    }
    return {
      pointerdown: (ev: PointerEvent) => {
        if (ev.button === 0) this.startHold(index, door, ev);
      },
      pointerup: () => this.endHold(index),
      pointerleave: () => this.endHold(index),
      pointercancel: () => this.endHold(index),
      contextmenu: (ev: Event) => ev.preventDefault(),
      keydown: (ev: KeyboardEvent) => {
        if ((ev.key === 'Enter' || ev.key === ' ') && !ev.repeat) this.startHold(index, door, ev);
      },
      keyup: (ev: KeyboardEvent) => {
        if (ev.key === 'Enter' || ev.key === ' ') this.endHold(index);
      },
      click: (ev: Event) => ev.preventDefault(),
    };
  }

  // ---- Rendering -------------------------------------------------------------------------------------

  private lastRing(door: DoorCardDoor): number {
    return door.doorbell ? (this.lastRings[door.doorbell] ?? 0) : 0;
  }

  private remaining(door: DoorCardDoor): number {
    const ringing = door.doorbell && this._hass?.states[door.doorbell]?.state === 'on';
    const window = this.config?.ring_window ?? DEFAULTS.ring_window;
    return Math.max(
      ringing ? window : 0,
      ringRemaining(door.doorbell ? this.lastRings[door.doorbell] : undefined, this.now, window),
    );
  }

  protected override render(): TemplateResult | typeof nothing {
    if (!this.config) return nothing;
    const layout = this.config.layout ?? DEFAULTS.layout;
    const indexed = this.config.doors.map((door, index) => ({ door, index }));
    const sorted = sortDoors(
      indexed,
      (d) => this.remaining(d.door),
      (d) => this.lastRing(d.door),
    );
    return html`
      <ha-card>
        ${this.config.title ? html`<div class="title">${this.config.title}</div>` : nothing}
        ${
          this.config.doors.length === 0
            ? html`<div class="empty">Noch keine Türen konfiguriert – im Karten-Editor hinzufügen.</div>`
            : html`<div class="doors ${layout}" style="--hold-ms:${this.holdTime()}ms">
                ${sorted.map(({ door, index }) =>
                  layout === 'compact' ? this.renderChip(door, index) : this.renderDoor(door, index),
                )}
              </div>`
        }
      </ha-card>
    `;
  }

  private icon(door: DoorCardDoor, state: string | undefined, ringing: boolean): string {
    if (door.icon) return door.icon;
    if (ringing) return 'mdi:bell-ring';
    if (!door.lock) return 'mdi:bell';
    return isOpening(state) ? 'mdi:lock-open-variant' : 'mdi:lock';
  }

  private stateLine(door: DoorCardDoor): string {
    const parts: string[] = [];
    if (door.lock) parts.push(lockStatus(this._hass?.states[door.lock]?.state).label);
    const ring = this.lastRing(door);
    if (ring > 0) parts.push(`klingelte ${formatAgo(ring, this.now)}`);
    else if (!door.lock) parts.push('Klingel');
    return parts.join(' · ');
  }

  private renderDoor(door: DoorCardDoor, index: number): TemplateResult {
    const lockState = door.lock ? this._hass?.states[door.lock]?.state : undefined;
    const status = door.lock ? lockStatus(lockState) : { tone: 'locked' as const };
    const remaining = this.remaining(door);
    const ringing = remaining > 0;
    const camera = door.camera ? this._hass?.states[door.camera] : undefined;
    const showCamera =
      camera?.attributes.entity_picture &&
      (ringing || (door.camera_view ?? DEFAULTS.camera_view) === 'always');
    const hint = this.hint?.index === index ? this.hint.text : undefined;
    const pending = this.pending[index];

    return html`
      <div class="door tone-${status.tone} ${ringing ? 'ringing' : ''}">
        <button class="door-head" @click=${() => this.moreInfo(door.lock ?? door.doorbell)}>
          <span class="door-icon"><ha-icon icon=${this.icon(door, lockState, ringing)}></ha-icon></span>
          <span class="door-text">
            <span class="door-name">${door.name}</span>
            <span class="door-state">${this.stateLine(door)}</span>
          </span>
        </button>
        ${
          ringing
            ? html`<div class="ring-banner" role="status">
                <ha-icon icon="mdi:bell-ring-outline"></ha-icon>Es
                klingelt${door.lock ? ` – jetzt öffnen` : ''}
                <span style="margin-left:auto;font-variant-numeric:tabular-nums">${remaining} s</span>
              </div>`
            : nothing
        }
        ${
          showCamera
            ? html`<img
                class="camera"
                alt="Kamera ${door.name}"
                src=${this.cameraUrl(String(camera!.attributes.entity_picture))}
              />`
            : nothing
        }
        ${this.renderActions(door, index, lockState)}
        ${
          pending?.phase === 'error'
            ? html`<div class="hint error">Fehler: ${pending.message}</div>`
            : hint
              ? html`<div class="hint">${hint}</div>`
              : nothing
        }
      </div>
    `;
  }

  private cameraUrl(picture: string): string {
    // Refresh the snapshot every 2 s.
    return `${picture}${picture.includes('?') ? '&' : '?'}t=${Math.floor(this.now / 2000)}`;
  }

  private openLabel(door: DoorCardDoor, index: number): TemplateResult {
    const pending = this.pending[index];
    switch (pending?.phase) {
      case 'sending':
        return html`<span>Wird gesendet …</span>`;
      case 'sent':
        return html`<span>Warte auf Tür …</span>`;
      case 'done':
        return html`<ha-icon icon="mdi:check"></ha-icon><span>Geöffnet</span>`;
      case 'noresponse':
        return html`<span>Gesendet – keine Rückmeldung</span>`;
      case 'error':
        return html`<ha-icon icon="mdi:alert"></ha-icon><span>Fehlgeschlagen</span>`;
    }
    const hold = (door.confirm ?? DEFAULTS.confirm) === 'hold';
    return html`<ha-icon icon="mdi:door-open"></ha-icon
      ><span>${hold ? 'Halten zum Öffnen' : 'Öffnen'}</span>`;
  }

  private renderActions(
    door: DoorCardDoor,
    index: number,
    lockState: string | undefined,
  ): TemplateResult | typeof nothing {
    if (!door.lock) return nothing;
    if (!canOperate(door, this._hass?.user?.id)) {
      return html`<div class="hint">Öffnen nur für berechtigte Personen</div>`;
    }
    const unavailable = lockStatus(lockState).tone === 'unavailable';
    if (this.confirming?.index === index) {
      return html`<div class="actions">
        <button class="act open" @click=${() => this.openDoor(index, door)}>
          <ha-icon icon="mdi:door-open"></ha-icon><span>Wirklich öffnen?</span>
        </button>
        <button class="act secondary" @click=${() => (this.confirming = undefined)}>Abbrechen</button>
      </div>`;
    }
    const handlers = this.openHandlers(index, door);
    const phase = this.pending[index]?.phase;
    return html`<div class="actions">
      <button
        class="act open ${this.holding === index ? 'holding' : ''} ${phase === 'done' ? 'done' : ''} ${
          phase === 'error' ? 'failed' : ''
        }"
        ?disabled=${unavailable || this.isBusy(index)}
        aria-label="${door.name} öffnen"
        @pointerdown=${handlers.pointerdown}
        @pointerup=${handlers.pointerup}
        @pointerleave=${handlers.pointerleave}
        @pointercancel=${handlers.pointercancel}
        @contextmenu=${handlers.contextmenu}
        @keydown=${handlers.keydown}
        @keyup=${handlers.keyup}
        @click=${handlers.click}
      >
        ${this.openLabel(door, index)}
      </button>
      ${
        canLockAgain(lockState)
          ? html`<button class="act secondary" @click=${() => this.callLock(index, door, 'lock')}>
              <ha-icon icon="mdi:lock"></ha-icon><span>Verriegeln</span>
            </button>`
          : nothing
      }
    </div>`;
  }

  private renderChip(door: DoorCardDoor, index: number): TemplateResult {
    const lockState = door.lock ? this._hass?.states[door.lock]?.state : undefined;
    const status = door.lock ? lockStatus(lockState) : { tone: 'locked' as const, label: '' };
    const ringing = this.remaining(door) > 0;
    const operable = !!door.lock && canOperate(door, this._hass?.user?.id) && status.tone !== 'unavailable';
    const handlers = operable
      ? this.openHandlers(index, door)
      : { click: () => this.moreInfo(door.doorbell) };
    const confirming = this.confirming?.index === index;
    const phase = this.pending[index]?.phase;
    const label = confirming
      ? 'Wirklich öffnen?'
      : phase === 'done'
        ? 'Geöffnet'
        : phase === 'sending' || phase === 'sent'
          ? '…'
          : door.name;
    return html`<button
      class="chip tone-${status.tone} ${ringing ? 'ringing' : ''} ${this.holding === index ? 'holding' : ''}"
      title=${this.stateLine(door)}
      aria-label=${operable ? `${door.name} öffnen` : door.name}
      ?disabled=${this.isBusy(index)}
      @pointerdown=${'pointerdown' in handlers ? handlers.pointerdown : undefined}
      @pointerup=${'pointerup' in handlers ? handlers.pointerup : undefined}
      @pointerleave=${'pointerleave' in handlers ? handlers.pointerleave : undefined}
      @pointercancel=${'pointercancel' in handlers ? handlers.pointercancel : undefined}
      @contextmenu=${'contextmenu' in handlers ? handlers.contextmenu : undefined}
      @keydown=${'keydown' in handlers ? handlers.keydown : undefined}
      @keyup=${'keyup' in handlers ? handlers.keyup : undefined}
      @click=${confirming ? () => this.openDoor(index, door) : handlers.click}
    >
      <span class="door-icon"><ha-icon icon=${this.icon(door, lockState, ringing)}></ha-icon></span>
      <span>${label}</span>
    </button>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [DOOR_CARD_TAG]: AbbWelcomeDoorCard;
  }
}

window.customCards = window.customCards ?? [];
if (!window.customCards.some((c) => c.type === DOOR_CARD_TAG)) {
  window.customCards.push({
    type: DOOR_CARD_TAG,
    name: 'ABB-Welcome Türen',
    description:
      'Türen öffnen und verriegeln, mit Klingel-Anzeige – für ABB-Welcome-Schlösser und jedes andere Schloss.',
    preview: true,
    documentationURL: 'https://github.com/jako-dev/esp32-abb-wizard-card',
  });
}
