import { LitElement, html, nothing, svg, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import type { HomeAssistant } from '../ha-types';
import { fetchHistory, lastOnTimes } from '../history';
import {
  canOperate,
  confirmModeFor,
  DEFAULTS,
  discoverDoors,
  DOOR_CARD_TAG,
  formatAgo,
  isLocking,
  isOpening,
  lockStatus,
  normalizeDoorCardConfig,
  ringRemaining,
  sortDoors,
  visibleControls,
  wordingFor,
  type ConfirmMode,
  type DoorCardConfig,
  type DoorCardDoor,
  type DoorCardLayout,
  type LockControl,
  type StatusTone,
} from './door-config';
import { DOOR_EDITOR_TAG } from './door-card-editor';
import { doorCardStyles } from './door-styles';

/** Home Assistant with the service call API – only this card uses it, the wizard never does. */
type HassWithServices = HomeAssistant & {
  callService(domain: 'lock', service: string, data: { entity_id: string }): Promise<unknown>;
};

type Pending =
  | { phase: 'sending'; service?: string }
  | { phase: 'sent'; at: number; service?: string }
  | { phase: 'done'; at: number; service?: string }
  | { phase: 'noresponse'; at: number }
  | { phase: 'error'; at: number; message: string };

interface Entry {
  door: DoorCardDoor;
  index: number;
}

/** Without a state change after this time the command counts as "sent without confirmation". */
const CONFIRM_TIMEOUT_MS = 8000;
/** How long success / failure feedback stays visible. */
const FEEDBACK_MS = 4000;
/** An inline confirmation ("Wirklich öffnen?") expires after this time. */
const DIALOG_MS = 6000;
/** Doorbell history loaded for "klingelte vor …". */
const RING_HISTORY_MS = 7 * 24 * 3600 * 1000;
/** A slider opens when the knob is dragged this far. */
const SLIDE_THRESHOLD = 0.85;
/** Inner padding of the slider track around the knob (px). */
const SLIDER_PAD = 4;
const RING_CIRCUMFERENCE = 2 * Math.PI * 48;

const icon = (name: string) => html`<ha-icon icon=${name}></ha-icon>`;

/** Extra lock buttons: icon, label and whether a second tap is needed (everything that opens the door). */
const CONTROL_INFO: Record<LockControl, { icon: string; label: string; confirm: boolean }> = {
  lock: { icon: 'mdi:lock', label: 'Abschließen', confirm: false },
  unlock: { icon: 'mdi:lock-open-variant', label: 'Aufschließen', confirm: true },
  open: { icon: 'mdi:door-open', label: 'Öffnen', confirm: true },
};

/** Daily-use card: open / lock the doors set up with the wizard (or any other lock). */
@customElement(DOOR_CARD_TAG)
export class AbbWelcomeDoorCard extends LitElement {
  static override styles = doorCardStyles;

  @state() private config?: DoorCardConfig;
  @state() private now = Date.now();
  @state() private lastRings: Record<string, number> = {};
  /** Doorbell → ring time the user dismissed with "Ignorieren". */
  @state() private dismissed: Record<string, number> = {};
  @state() private pending: Record<number, Pending> = {};
  @state() private holding?: number;
  @state() private drag?: { id: string; x: number; max: number; start: number };
  @state() private confirming?: { index: number; until: number };
  /** Extra button waiting for its second tap ("Aufschließen?"). */
  @state() private confirmingControl?: { index: number; control: LockControl; until: number };
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
    switch (this.doorLayout) {
      case 'bar':
        return 2;
      case 'rows':
        return count + 1;
      case 'buttons':
        return 4;
      default:
        return 2 * Math.ceil(count / 2) + 1;
    }
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

  private get doorLayout(): DoorCardLayout {
    return this.config?.layout ?? DEFAULTS.layout;
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
      const merged = { ...lastOnTimes(history) };
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
    if (this.confirmingControl && this.now > this.confirmingControl.until) this.confirmingControl = undefined;
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
      const p = pending[index];
      if (p?.phase === 'sent' && door.lock && this.confirms(p.service, hass.states[door.lock]?.state)) {
        pending[index] = { phase: 'done', at: Date.now(), service: p.service };
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

  /** Does the lock state confirm the command? */
  private confirms(service: string | undefined, state: string | undefined): boolean {
    return service === 'lock' ? isLocking(state) : isOpening(state);
  }

  private async callLock(index: number, door: DoorCardDoor, service: string): Promise<void> {
    if (!this._hass || !door.lock) return;
    this.confirmingControl = undefined;
    this.pending = { ...this.pending, [index]: { phase: 'sending', service } };
    try {
      await this._hass.callService('lock', service, { entity_id: door.lock });
      const confirmed = this.confirms(service, this._hass.states[door.lock]?.state);
      this.pending = {
        ...this.pending,
        [index]: confirmed
          ? { phase: 'done', at: Date.now(), service }
          : { phase: 'sent', at: Date.now(), service },
      };
      if (confirmed) this.haptic('success');
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

  private isBusy(index: number): boolean {
    const phase = this.pending[index]?.phase;
    return phase === 'sending' || phase === 'sent';
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

  /** Event handlers for buttons in hold / tap / dialog mode. */
  private pressHandlers(index: number, door: DoorCardDoor, mode: ConfirmMode) {
    if (mode !== 'hold') {
      return {
        click: () => {
          if (this.confirming?.index === index || mode === 'tap') this.openDoor(index, door);
          else this.confirming = { index, until: Date.now() + DIALOG_MS };
        },
      };
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

  // ---- Slider ----------------------------------------------------------------------------------------

  private slideStart(id: string, index: number, ev: PointerEvent): void {
    if (this.isBusy(index) || ev.button !== 0) return;
    ev.preventDefault();
    const knob = ev.currentTarget as HTMLElement;
    const track = knob.parentElement!;
    const max = Math.max(
      1,
      track.getBoundingClientRect().width - knob.getBoundingClientRect().width - 2 * SLIDER_PAD,
    );
    knob.setPointerCapture?.(ev.pointerId);
    this.drag = { id, x: 0, max, start: ev.clientX };
  }

  private slideMove(id: string, ev: PointerEvent): void {
    if (this.drag?.id !== id) return;
    this.drag = { ...this.drag, x: Math.min(this.drag.max, Math.max(0, ev.clientX - this.drag.start)) };
  }

  private slideEnd(id: string, index: number, door: DoorCardDoor): void {
    if (this.drag?.id !== id) return;
    const done = this.drag.x >= this.drag.max * SLIDE_THRESHOLD;
    this.drag = undefined;
    if (done) this.openDoor(index, door);
    else this.hint = { index, text: 'Zum Öffnen ganz nach rechts schieben', until: Date.now() + 2500 };
  }

  // ---- State helpers ---------------------------------------------------------------------------------

  private lastRing(door: DoorCardDoor): number {
    return door.doorbell ? (this.lastRings[door.doorbell] ?? 0) : 0;
  }

  private remaining(door: DoorCardDoor): number {
    if (!door.doorbell) return 0;
    const last = this.lastRings[door.doorbell];
    if (last !== undefined && this.dismissed[door.doorbell] === last) return 0;
    const ringing = this._hass?.states[door.doorbell]?.state === 'on';
    const window = this.config?.ring_window ?? DEFAULTS.ring_window;
    return Math.max(ringing ? window : 0, ringRemaining(last, this.now, window));
  }

  private dismiss(door: DoorCardDoor): void {
    if (door.doorbell) this.dismissed = { ...this.dismissed, [door.doorbell]: this.lastRing(door) };
  }

  private lockState(door: DoorCardDoor): string | undefined {
    return door.lock ? this._hass?.states[door.lock]?.state : undefined;
  }

  private tone(door: DoorCardDoor): StatusTone {
    return door.lock ? lockStatus(this.lockState(door)).tone : 'locked';
  }

  private operable(door: DoorCardDoor): boolean {
    return !!door.lock && canOperate(door, this._hass?.user?.id);
  }

  private doorIcon(door: DoorCardDoor, ringing: boolean): string {
    if (door.icon) return door.icon;
    if (ringing) return 'mdi:bell-ring';
    if (!door.lock) return 'mdi:bell';
    return isOpening(this.lockState(door)) ? 'mdi:lock-open-variant' : 'mdi:lock';
  }

  private stateLine(door: DoorCardDoor, short = false): string {
    const parts: string[] = [];
    if (door.lock) parts.push(lockStatus(this.lockState(door), wordingFor(door)).label);
    if (this.remaining(door) > 0) parts.push('klingelt');
    else if (!short) {
      const ring = this.lastRing(door);
      if (ring > 0) parts.push(`klingelte ${formatAgo(ring, this.now)}`);
      else if (!door.lock) parts.push('Klingel');
    }
    return parts.join(' · ');
  }

  /** "Geklingelt vor 5 min", "Geklingelt gestern 16:22" – shown on its own line below the state. */
  private ringInfo(door: DoorCardDoor): string | undefined {
    if (this.remaining(door) > 0) return 'Klingelt gerade';
    const ring = this.lastRing(door);
    return ring > 0 ? `Geklingelt ${formatAgo(ring, this.now)}` : undefined;
  }

  /** Label for the action, reflecting a running or finished command. */
  private actionLabel(index: number, idle: string): string {
    const pending = this.pending[index];
    switch (pending?.phase) {
      case 'sending':
        return 'Wird gesendet …';
      case 'sent':
        return 'Warte auf Tür …';
      case 'done':
        return this.doneLabel(index, pending.service);
      case 'noresponse':
        return 'Gesendet – keine Rückmeldung';
      case 'error':
        return 'Fehlgeschlagen';
      default:
        return this.confirming?.index === index ? 'Wirklich öffnen?' : idle;
    }
  }

  private doneLabel(index: number, service: string | undefined): string {
    const door = this.config?.doors[index];
    const smart = door ? wordingFor(door) === 'lock' : false;
    if (service === 'lock') return smart ? 'Abgeschlossen' : 'Verriegelt';
    if (service === 'unlock' && smart) return 'Aufgeschlossen';
    return 'Geöffnet';
  }

  private feedbackClass(index: number): string {
    const phase = this.pending[index]?.phase;
    return phase === 'done' ? 'done' : phase === 'error' ? 'failed' : this.isBusy(index) ? 'busy' : '';
  }

  // ---- Rendering -------------------------------------------------------------------------------------

  protected override render(): TemplateResult | typeof nothing {
    if (!this.config) return nothing;
    const entries = sortDoors(
      this.config.doors.map((door, index) => ({ door, index })),
      (e) => this.remaining(e.door),
      (e) => this.lastRing(e.door),
    );
    const body =
      this.config.doors.length === 0
        ? html`<div class="empty">Noch keine Türen konfiguriert – im Karten-Editor hinzufügen.</div>`
        : this.doorLayout === 'rows'
          ? this.renderRows(entries)
          : this.doorLayout === 'buttons'
            ? this.renderButtons(entries)
            : this.doorLayout === 'bar'
              ? this.renderBar(entries)
              : this.renderTiles(entries);
    return html`
      <ha-card style="--hold-ms:${this.holdTime()}ms">
        ${this.config.title ? html`<h2 class="title">${this.config.title}</h2>` : nothing} ${body}
      </ha-card>
    `;
  }

  private renderHead(door: DoorCardDoor, ringing: boolean, extra?: TemplateResult): TemplateResult {
    return html`<div class="head">
      <button class="head-main" @click=${() => this.moreInfo(door.lock ?? door.doorbell)}>
        <span class="ico tone-${ringing ? 'ring' : this.tone(door)}"
          >${icon(this.doorIcon(door, ringing))}</span
        >
        <span class="txt" title=${this.stateLine(door)}>
          <span class="name">${door.name}</span>
          ${door.lock ? html`<span class="state">${lockStatus(this.lockState(door), wordingFor(door)).label}</span>` : nothing}
          ${
            this.ringInfo(door)
              ? html`<span class="ring-info">${this.ringInfo(door)}</span>`
              : door.lock
                ? nothing
                : html`<span class="state">Klingel</span>`
          }
        </span>
      </button>
      ${ringing ? html`<span class="badge">${icon('mdi:bell-ring')}${this.remaining(door)} s</span>` : nothing}
      ${extra ?? nothing}
    </div>`;
  }

  /** Small extra lock buttons (abschließen / aufschließen / öffnen) that fit the current state. */
  private renderControls(door: DoorCardDoor, index: number): TemplateResult | typeof nothing {
    if (!this.operable(door)) return nothing;
    const controls = visibleControls(door, this.lockState(door));
    if (controls.length === 0) return nothing;
    const smart = wordingFor(door) === 'lock';
    return html`${controls.map((control) => {
      const info = CONTROL_INFO[control];
      const label = control === 'lock' && !smart ? 'Verriegeln' : info.label;
      const asking = this.confirmingControl?.index === index && this.confirmingControl.control === control;
      return html`<button
        class="mini ${asking ? 'asking' : ''}"
        title="${door.name} ${label.toLowerCase()}"
        aria-label="${door.name} ${label.toLowerCase()}${asking ? ' – zum Bestätigen nochmal tippen' : ''}"
        ?disabled=${this.isBusy(index)}
        @click=${() => this.pressControl(index, door, control)}
      >
        ${icon(info.icon)}
      </button>`;
    })}`;
  }

  private pressControl(index: number, door: DoorCardDoor, control: LockControl): void {
    const asking = this.confirmingControl?.index === index && this.confirmingControl.control === control;
    if (CONTROL_INFO[control].confirm && !asking) {
      this.confirmingControl = { index, control, until: Date.now() + DIALOG_MS };
      this.hint = {
        index,
        text: `Zum ${CONTROL_INFO[control].label} nochmal tippen`,
        until: Date.now() + DIALOG_MS,
      };
      this.haptic('light');
      return;
    }
    void this.callLock(index, door, control);
  }

  private renderHint(door: DoorCardDoor, index: number): TemplateResult | typeof nothing {
    const pending = this.pending[index];
    if (pending?.phase === 'error') return html`<div class="hint error">Fehler: ${pending.message}</div>`;
    if (this.hint?.index === index) return html`<div class="hint">${this.hint.text}</div>`;
    if (door.lock && !canOperate(door, this._hass?.user?.id)) {
      return html`<div class="hint">Öffnen nur für berechtigte Personen</div>`;
    }
    return nothing;
  }

  private renderCamera(door: DoorCardDoor, ringing: boolean): TemplateResult | typeof nothing {
    const picture = door.camera ? this._hass?.states[door.camera]?.attributes.entity_picture : undefined;
    if (typeof picture !== 'string' || !(ringing || door.camera_view === 'always')) return nothing;
    // Refresh the snapshot every 2 s.
    const src = `${picture}${picture.includes('?') ? '&' : '?'}t=${Math.floor(this.now / 2000)}`;
    return html`<img class="camera" alt="Kamera ${door.name}" src=${src} />`;
  }

  /** The open control for a door: slider, hold / tap / dialog button. */
  private renderAction(
    door: DoorCardDoor,
    index: number,
    options: { place?: 'main' | 'hero'; size?: 'full' | 'small'; filled?: boolean } = {},
  ): TemplateResult | typeof nothing {
    if (!this.operable(door)) return nothing;
    const disabled = this.tone(door) === 'unavailable';
    const mode = confirmModeFor(door, this.doorLayout, options.place);
    const size = options.size ?? 'full';
    const fill = options.filled ? 'filled' : '';
    if (mode === 'slide') {
      const id = `${options.place ?? 'main'}-${index}`;
      const dragging = this.drag?.id === id;
      const x = dragging ? this.drag!.x : 0;
      const fade = dragging ? 1 - x / this.drag!.max : 1;
      const feedback = this.feedbackClass(index);
      return html`<div
        class="slider ${size} ${fill} ${feedback} ${dragging ? 'dragging' : ''} ${disabled ? 'disabled' : ''}"
        style="--x:${x}px;--fade:${fade}"
      >
        <span class="slabel"
          >${this.actionLabel(index, size === 'small' ? 'Öffnen' : 'Zum Öffnen schieben')}</span
        >
        <button
          class="knob"
          aria-label="${door.name} öffnen – schieben oder Eingabetaste"
          ?disabled=${disabled || this.isBusy(index)}
          @pointerdown=${(ev: PointerEvent) => this.slideStart(id, index, ev)}
          @pointermove=${(ev: PointerEvent) => this.slideMove(id, ev)}
          @pointerup=${() => this.slideEnd(id, index, door)}
          @pointercancel=${() => (this.drag = undefined)}
          @keydown=${(ev: KeyboardEvent) => {
            if (ev.key === 'Enter' || ev.key === ' ' || ev.key === 'ArrowRight') {
              ev.preventDefault();
              this.openDoor(index, door);
            }
          }}
        >
          ${icon(feedback === 'done' ? 'mdi:check' : feedback === 'failed' ? 'mdi:alert' : 'mdi:chevron-double-right')}
        </button>
      </div>`;
    }
    const handlers = this.pressHandlers(index, door, mode);
    const idle = mode === 'hold' ? (size === 'small' ? 'Halten' : 'Halten zum Öffnen') : 'Öffnen';
    return html`<button
      class="press ${size} ${fill} ${this.feedbackClass(index)} ${this.holding === index ? 'holding' : ''}"
      ?disabled=${disabled || this.isBusy(index)}
      aria-label="${door.name} öffnen"
      @pointerdown=${'pointerdown' in handlers ? handlers.pointerdown : undefined}
      @pointerup=${'pointerup' in handlers ? handlers.pointerup : undefined}
      @pointerleave=${'pointerleave' in handlers ? handlers.pointerleave : undefined}
      @pointercancel=${'pointercancel' in handlers ? handlers.pointercancel : undefined}
      @contextmenu=${'contextmenu' in handlers ? handlers.contextmenu : undefined}
      @keydown=${'keydown' in handlers ? handlers.keydown : undefined}
      @keyup=${'keyup' in handlers ? handlers.keyup : undefined}
      @click=${handlers.click}
    >
      ${icon(this.pending[index]?.phase === 'done' ? 'mdi:check' : 'mdi:door-open')}
      <span>${this.actionLabel(index, idle)}</span>
    </button>`;
  }

  // A · Tiles: ringing doors span the full width.
  private renderTiles(entries: Entry[]): TemplateResult {
    return html`<div class="tiles">
      ${entries.map(({ door, index }) => {
        const ringing = this.remaining(door) > 0;
        return html`<div class="tile ${ringing ? 'ringing' : ''}">
          ${this.renderHead(door, ringing, this.renderControls(door, index) as TemplateResult)}
          ${this.renderCamera(door, ringing)} ${this.renderAction(door, index, { filled: ringing })}
          ${this.renderHint(door, index)}
        </div>`;
      })}
    </div>`;
  }

  // A · List for phones: compact control on the right, full slider for ringing doors.
  private renderRows(entries: Entry[]): TemplateResult {
    return html`<div class="rows">
      ${entries.map(({ door, index }) => {
        const ringing = this.remaining(door) > 0;
        const extra = html`${this.renderControls(door, index)}
        ${ringing ? nothing : this.renderAction(door, index, { size: 'small' })}`;
        return html`<div class="row ${ringing ? 'ringing' : ''}">
          ${this.renderHead(door, ringing, extra)} ${this.renderCamera(door, ringing)}
          ${ringing ? this.renderAction(door, index, { filled: true }) : nothing}
          ${this.renderHint(door, index)}
        </div>`;
      })}
    </div>`;
  }

  // B · Large round key buttons with a progress ring while holding.
  private renderButtons(entries: Entry[]): TemplateResult {
    return html`<div class="buttons">
      ${entries.map(({ door, index }) => {
        const ringing = this.remaining(door) > 0;
        const mode = confirmModeFor(door, 'buttons');
        const handlers = this.pressHandlers(index, door, mode);
        const disabled = this.tone(door) === 'unavailable' || this.isBusy(index);
        const phase = this.pending[index]?.phase;
        return html`<div class="keytile ${ringing ? 'ringing' : ''} ${this.feedbackClass(index)}">
          <button class="keytile-head" @click=${() => this.moreInfo(door.lock ?? door.doorbell)}>
            <span class="name">${door.name}</span>
            <span class="state"
              ><span class="dot tone-${this.tone(door)}"></span>${this.stateLine(door, true)}</span
            >
          </button>
          ${this.renderCamera(door, ringing)}
          ${
            this.operable(door)
              ? html`<button
                    class="key ${this.holding === index ? 'holding' : ''}"
                    aria-label="${door.name} öffnen"
                    ?disabled=${disabled}
                    @pointerdown=${'pointerdown' in handlers ? handlers.pointerdown : undefined}
                    @pointerup=${'pointerup' in handlers ? handlers.pointerup : undefined}
                    @pointerleave=${'pointerleave' in handlers ? handlers.pointerleave : undefined}
                    @pointercancel=${'pointercancel' in handlers ? handlers.pointercancel : undefined}
                    @contextmenu=${'contextmenu' in handlers ? handlers.contextmenu : undefined}
                    @keydown=${'keydown' in handlers ? handlers.keydown : undefined}
                    @keyup=${'keyup' in handlers ? handlers.keyup : undefined}
                    @click=${handlers.click}
                  >
                    <svg class="ring" viewBox="0 0 104 104" aria-hidden="true">
                      ${svg`<circle class="ring-bg" cx="52" cy="52" r="48"></circle>
                    <circle class="ring-fg" cx="52" cy="52" r="48" style="stroke-dasharray:${RING_CIRCUMFERENCE};stroke-dashoffset:${RING_CIRCUMFERENCE}"></circle>`}
                    </svg>
                    <span class="face"
                      >${icon(phase === 'done' ? 'mdi:check' : (door.icon ?? 'mdi:key-variant'))}</span
                    >
                  </button>
                  <span class="keyhint"
                    >${this.actionLabel(index, mode === 'hold' ? 'Gedrückt halten' : 'Tippen zum Öffnen')}</span
                  >`
              : html`<span class="face idle">${icon(this.doorIcon(door, ringing))}</span>`
          }
          ${this.renderControls(door, index)} ${this.renderHint(door, index)}
        </div>`;
      })}
    </div>`;
  }

  // C · Status bar: chips, plus a large panel for the ringing door.
  private renderBar(entries: Entry[]): TemplateResult {
    const ringing = entries.find((e) => this.remaining(e.door) > 0);
    return html`
      ${ringing ? this.renderHero(ringing) : nothing}
      <div class="bar">${entries.map((entry) => this.renderChip(entry, entry === ringing))}</div>
    `;
  }

  private renderHero({ door, index }: Entry): TemplateResult {
    const done = this.pending[index]?.phase === 'done';
    return html`<div class="hero ${done ? 'done' : ''}" role="status">
      <div class="hero-top">
        <span class="hero-ico">${icon(done ? 'mdi:check' : 'mdi:bell-ring')}</span>
        <span class="txt">
          <span class="hero-title">${done ? `${door.name} geöffnet` : `Es klingelt: ${door.name}`}</span>
          <span class="hero-text"
            >${
              done
                ? 'Bestätigt'
                : door.lock
                  ? 'Jetzt öffnen, solange der Ruf aktiv ist'
                  : this.stateLine(door)
            }</span
          >
        </span>
        <span class="count">${this.remaining(door)} s</span>
      </div>
      ${this.renderCamera(door, true)}
      <div class="hero-actions">
        ${this.renderAction(door, index, { place: 'hero', filled: true })}
        <button class="ghost" @click=${() => this.dismiss(door)}>Ignorieren</button>
      </div>
      ${this.renderHint(door, index)}
    </div>`;
  }

  private renderChip({ door, index }: Entry, ringing: boolean): TemplateResult {
    const operable = this.operable(door) && this.tone(door) !== 'unavailable';
    const mode = confirmModeFor(door, 'bar');
    const handlers = operable
      ? this.pressHandlers(index, door, mode)
      : { click: () => this.moreInfo(door.doorbell) };
    const label =
      this.pending[index] || this.confirming?.index === index
        ? this.actionLabel(index, '')
        : this.stateLine(door, true);
    return html`<button
      class="chip ${ringing ? 'ringing' : ''} ${this.holding === index ? 'holding' : ''} ${this.feedbackClass(index)}"
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
      @click=${handlers.click}
    >
      <span class="ico tone-${ringing ? 'ring' : this.tone(door)}"
        >${icon(this.doorIcon(door, ringing))}</span
      >
      <span class="txt"><span class="name">${door.name}</span><span class="state">${label}</span></span>
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
