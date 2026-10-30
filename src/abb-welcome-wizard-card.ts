import { LitElement, html, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import {
  apartmentFromDials,
  describeAddress,
  expectedIndoorAddress,
  formatAddress,
  formatAddressPlain,
  formatBytesPlain,
  involvesAddress,
} from './address';
import { analyzeSession } from './analysis';
import { EDITOR_TAG } from './editor';
import { DEFAULT_DOORS, doorIcon, doorsFromConfig, MAX_DOORS, newDoor, openStepId } from './doors';
import type { CardConfig, HassEvent, HomeAssistant, StateChangedData, Unsubscribe } from './ha-types';
import { parseFrame } from './parser';
import { fetchHistoryLines } from './history';
import {
  applyHistory,
  captureFinished,
  captureLine,
  COMMIT_DELAY_MS,
  historyWindow,
  markMissed,
  markReconnected,
  lineFromEvent,
  parseAddressInput,
  startCapture,
  type ActiveCapture,
} from './recorder';
import {
  addCapture,
  createSession,
  stepRecord,
  lastRingTime,
  parseSession,
  removeCapture,
  serializeSession,
  setDials,
  setDoors,
  doorCaptureCount,
  setIndoorAddress,
  setSkipped,
} from './session';
import { buildSteps, OPEN_DEFAULT_PAUSE_MINUTES, type StepDefinition } from './steps';
import {
  clearStoredSession,
  copyText,
  downloadText,
  loadActiveCapture,
  loadStoredSession,
  storeActiveCapture,
  storeSession,
} from './storage';
import { cardStyles } from './styles';
import type {
  DialSettings,
  Door,
  OpenResult,
  RecordedLine,
  RingCandidate,
  RingResult,
  Session,
  Severity,
  WizardResult,
} from './types';
import {
  DEFAULT_DEVICE,
  deviceNameFromFriendly,
  generateYaml,
  lockTargets,
  ringTargets,
  type DeviceOptions,
} from './yaml-export';

const CARD_TAG = 'abb-welcome-wizard-card';
const VERSION = '0.4.0';
const DEFAULT_CAPTURE_SECONDS = 10;
const LIVE_LIMIT = 40;
/** A capture interrupted by a reload is resumed only if it is younger than this. */
const RESUME_LIMIT_MS = 15 * 60 * 1000;

const SEVERITY_ICON: Record<Severity, string> = {
  info: 'mdi:information-outline',
  warning: 'mdi:alert-outline',
  error: 'mdi:alert-circle-outline',
};

function timeOf(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? '--:--:--' : d.toLocaleTimeString('de-DE', { hour12: false });
}

const hex2 = (n: number) => n.toString(16).toUpperCase().padStart(2, '0');

@customElement(CARD_TAG)
export class AbbWelcomeWizardCard extends LitElement {
  static override styles = cardStyles;

  @state() private config?: CardConfig;
  @state() private session!: Session;
  @state() private page = 0;
  @state() private live: RecordedLine[] = [];
  @state() private capture: ActiveCapture | null = null;
  @state() private now = Date.now();
  @state() private toast = '';
  @state() private maskDoorCode = false;
  @state() private showDoorCode = false;
  @state() private exportMode: 'full' | 'snippet' = 'full';
  /** Device settings edited by the user; unset fields are suggested from Home Assistant. */
  @state() private deviceEdits: Partial<DeviceOptions> = {};
  @state() private indoorInput = '';
  @state() private receivedCount = 0;
  /** Per-page override of the step's default capture mode. */
  @state() private waitForFrame?: boolean;

  private _hass?: HomeAssistant;
  private unsubscribe?: Promise<Unsubscribe | undefined>;
  private timer?: number;
  private toastTimer?: number;
  private syncing = false;
  private lastSyncAt = 0;
  private syncFailed = false;
  private readonly onVisibilityChange = () => {
    if (!this.capture) return;
    // Mobile browsers pause pages in the background; events received meanwhile may be lost.
    this.capture =
      document.visibilityState === 'hidden'
        ? markMissed(this.capture)
        : markReconnected(this.capture, Date.now());
  };
  private analysisCache?: { session: Session; indoor?: number; result: WizardResult };
  private stepsCache?: { doors: Door[]; steps: StepDefinition[] };

  // ---- Lovelace API --------------------------------------------------------------------------------

  public static getConfigElement(): HTMLElement {
    return document.createElement(EDITOR_TAG);
  }

  public static getStubConfig(hass: HomeAssistant): Partial<CardConfig> {
    const candidates = Object.keys(hass?.states ?? {}).filter(
      (id) => id.startsWith('sensor.') && /intercom|abb|welcome|frame|doorbell/i.test(id),
    );
    return { entity: candidates[0] ?? 'sensor.doorbell_intercom', capture_seconds: DEFAULT_CAPTURE_SECONDS };
  }

  public setConfig(config: CardConfig): void {
    if (!config || typeof config.entity !== 'string' || !config.entity.includes('.')) {
      throw new Error('Bitte "entity" auf den Debug-Textsensor setzen, z. B. sensor.doorbell_intercom.');
    }
    if (
      config.capture_seconds !== undefined &&
      (typeof config.capture_seconds !== 'number' ||
        config.capture_seconds < 2 ||
        config.capture_seconds > 120)
    ) {
      throw new Error('"capture_seconds" muss eine Zahl zwischen 2 und 120 sein.');
    }
    if (config.indoor_address !== undefined && parseAddressInput(config.indoor_address) === undefined) {
      throw new Error('"indoor_address" muss eine Adresse wie 0x1010 oder 0x000110 sein.');
    }
    if (config.doors !== undefined) doorsFromConfig(config.doors);
    const entityChanged = this.config?.entity !== config.entity;
    this.config = config;
    if (entityChanged) {
      this.resubscribe();
      this.session = loadStoredSession(config.entity) ?? createSession(config.entity, this.configDoors);
      this.indoorInput =
        this.session.indoorAddress !== undefined
          ? formatAddress(this.session.indoorAddress, this.session.indoorAddress > 0xffff)
          : '';
      this.live = [];
      this.capture = null;
      this.resumeCapture(config.entity);
    }
  }

  public getCardSize(): number {
    return 10;
  }

  public set hass(hass: HomeAssistant) {
    const first = !this._hass;
    const wasConnected = this.online;
    this._hass = hass;
    if (this.capture && wasConnected !== this.online) {
      this.capture = this.online ? markReconnected(this.capture, Date.now()) : markMissed(this.capture);
    }
    if (first) this.subscribe();
    this.requestUpdate();
  }

  public get hass(): HomeAssistant | undefined {
    return this._hass;
  }

  private get online(): boolean {
    return this._hass?.connected !== false;
  }

  override connectedCallback(): void {
    super.connectedCallback();
    this.subscribe();
    document.addEventListener('visibilitychange', this.onVisibilityChange);
  }

  override disconnectedCallback(): void {
    super.disconnectedCallback();
    document.removeEventListener('visibilitychange', this.onVisibilityChange);
    this.unsubscribeEvents();
    this.stopTimer();
  }

  protected override updated(changed: PropertyValues): void {
    if (this.session && this.page > this.resultPage) this.page = this.resultPage;
    if (changed.has('page') && changed.get('page') !== undefined) {
      // Bring the new step (and the top of the card) into view after navigating.
      this.renderRoot
        .querySelector('.stepper .current')
        ?.scrollIntoView?.({ block: 'nearest', inline: 'center', behavior: 'smooth' });
    }
    if (changed.has('capture')) {
      if (this.capture) this.startTimer();
      else this.stopTimer();
      if (this.config) storeActiveCapture(this.config.entity, this.capture);
    }
  }

  // ---- Event subscription (read-only: the card never calls services or sends frames) ---------------

  private subscribe(): void {
    if (this.unsubscribe || !this._hass?.connection || !this.config || !this.isConnected) return;
    this.unsubscribe = this._hass.connection
      .subscribeEvents<StateChangedData>((event) => this.onStateChanged(event), 'state_changed')
      .catch((err) => {
        console.error(`${CARD_TAG}: subscribing to state_changed failed`, err);
        this.unsubscribe = undefined;
        return undefined;
      });
  }

  private unsubscribeEvents(): void {
    const pending = this.unsubscribe;
    this.unsubscribe = undefined;
    pending?.then((unsub) => unsub?.()).catch(() => undefined);
  }

  private resubscribe(): void {
    this.unsubscribeEvents();
    this.subscribe();
  }

  private onStateChanged(event: HassEvent<StateChangedData>): void {
    if (!this.config) return;
    const line = lineFromEvent(event, this.config.entity);
    if (!line) return;
    this.receivedCount++;
    this.live = [line, ...this.live].slice(0, LIVE_LIMIT);
    if (this.capture) {
      this.capture = captureLine(this.capture, line, this.captureSeconds, Date.now());
    }
  }

  // ---- Capture -------------------------------------------------------------------------------------

  private get captureSeconds(): number {
    return this.config?.capture_seconds ?? DEFAULT_CAPTURE_SECONDS;
  }

  private startTimer(): void {
    if (this.timer !== undefined) return;
    this.timer = window.setInterval(() => {
      this.now = Date.now();
      if (!this.capture) return;
      if (this.capture.missed) this.syncFromHistory();
      else if (captureFinished(this.capture, this.now)) this.finishCapture();
    }, 250);
  }

  private stopTimer(): void {
    if (this.timer !== undefined) window.clearInterval(this.timer);
    this.timer = undefined;
  }

  private beginCapture(waitForFrame: boolean): void {
    const step = this.currentStep;
    if (!step) return;
    this.now = Date.now();
    this.syncFailed = false;
    this.capture = startCapture(step.id, this.captureSeconds, waitForFrame, this.now);
  }

  /** Fill in frames missed while offline from the recorder history (read-only). */
  private async syncFromHistory(): Promise<void> {
    const capture = this.capture;
    const now = Date.now();
    if (
      !capture?.missed ||
      capture.syncAfter === undefined ||
      !this.online ||
      !this._hass?.connection ||
      !this.config ||
      this.syncing ||
      now - this.lastSyncAt < 2000
    ) {
      return;
    }
    this.syncing = true;
    this.lastSyncAt = now;
    try {
      const { start, end } = historyWindow(capture, now);
      const lines = await fetchHistoryLines(this._hass.connection, this.config.entity, start, end);
      // The capture may have been cancelled or replaced while waiting.
      if (this.capture?.armedAt === capture.armedAt) {
        this.capture = applyHistory(this.capture, lines, this.captureSeconds, Date.now());
      }
    } catch (err) {
      console.warn(`${CARD_TAG}: reading history failed`, err);
      if (this.capture?.armedAt === capture.armedAt && !this.syncFailed) {
        this.syncFailed = true;
        // Without history (e.g. sensor excluded from the recorder) keep what was received live.
        this.capture = { ...this.capture, missed: false, syncAfter: undefined };
        this.showToast('Verpasste Frames konnten nicht aus dem Verlauf geladen werden.');
      }
    } finally {
      this.syncing = false;
    }
  }

  /** Continue a capture that was interrupted by reloading the page or app. */
  private resumeCapture(entity: string): void {
    const stored = loadActiveCapture(entity);
    if (!stored) return;
    const stepIndex = this.steps.findIndex((s) => s.id === stored.step);
    if (stepIndex < 0 || Date.now() - stored.armedAt > RESUME_LIMIT_MS) {
      storeActiveCapture(entity, null);
      return;
    }
    this.page = stepIndex + 1;
    this.capture = { ...stored, missed: true, syncAfter: Date.now() + COMMIT_DELAY_MS };
    this.showToast('Unterbrochene Aufnahme wird fortgesetzt.');
  }

  private finishCapture(): void {
    const capture = this.capture;
    this.capture = null;
    if (!capture || capture.phase !== 'recording') return;
    const ended = Math.min(Date.now(), capture.endsAt ?? Date.now());
    this.updateSession(
      addCapture(this.session, capture.step, {
        startedAt: capture.startedAt ?? new Date().toISOString(),
        endedAt: new Date(ended).toISOString(),
        lines: capture.lines,
      }),
    );
    this.showToast(
      capture.lines.length > 0
        ? `Aufnahme gespeichert (${capture.lines.length} Frames).`
        : 'Aufnahme gespeichert – es kamen keine Frames an.',
    );
  }

  private cancelCapture(): void {
    this.capture = null;
  }

  // ---- Session -------------------------------------------------------------------------------------

  private updateSession(session: Session): void {
    this.session = session;
    storeSession(session);
  }

  /** Doors from the card config (`doors:`), otherwise the default gate / house door / apartment setup. */
  private get configDoors(): Door[] {
    return this.config?.doors !== undefined ? doorsFromConfig(this.config.doors) : [...DEFAULT_DOORS];
  }

  private get steps(): StepDefinition[] {
    if (this.stepsCache?.doors !== this.session.doors) {
      this.stepsCache = { doors: this.session.doors, steps: buildSteps(this.session.doors) };
    }
    return this.stepsCache.steps;
  }

  /** Page 0 is the start page, 1..steps.length are the recording steps, the last page is the result. */
  private get resultPage(): number {
    return this.steps.length + 1;
  }

  private get configIndoor(): number | undefined {
    return parseAddressInput(this.config?.indoor_address);
  }

  private get result(): WizardResult {
    const indoor = this.session.indoorAddress ?? this.configIndoor;
    const cache = this.analysisCache;
    if (cache && cache.session === this.session && cache.indoor === indoor) return cache.result;
    const result = analyzeSession(this.session, { indoorAddress: indoor });
    this.analysisCache = { session: this.session, indoor, result };
    return result;
  }

  /** Address used to highlight own frames: detected, manual or expected from the dials. */
  private get highlightAddress(): number | undefined {
    const detected = this.result.indoor?.address;
    if (detected !== undefined) return detected;
    const apartment = apartmentFromDials(this.session.dials);
    return apartment !== undefined ? expectedIndoorAddress(apartment, false) : undefined;
  }

  private exportSession(): void {
    const stamp = new Date().toISOString().slice(0, 16).replace(/[:T]/g, '-');
    downloadText(`abb-welcome-session-${stamp}.json`, serializeSession(this.session), 'application/json');
  }

  private importSession(): void {
    this.renderRoot.querySelector<HTMLInputElement>('#import')?.click();
  }

  private async onImportFile(ev: Event): Promise<void> {
    const input = ev.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file || !this.config) return;
    try {
      const imported = parseSession(await file.text());
      // Keep working on the configured entity, even if the session was recorded with another one.
      this.updateSession({ ...imported, entity: this.config.entity });
      this.indoorInput =
        imported.indoorAddress !== undefined
          ? formatAddress(imported.indoorAddress, imported.indoorAddress > 0xffff)
          : '';
      this.page = this.resultPage;
      this.showToast('Sitzung importiert.');
    } catch (err) {
      this.showToast(err instanceof Error ? err.message : String(err));
    }
  }

  private resetSession(): void {
    if (!this.config) return;
    if (!window.confirm('Alle Aufnahmen dieser Sitzung löschen und neu beginnen?')) return;
    clearStoredSession(this.config.entity);
    this.updateSession(createSession(this.config.entity, this.configDoors));
    this.indoorInput = '';
    this.capture = null;
    this.page = 0;
  }

  private onDialInput(field: keyof DialSettings, ev: Event): void {
    const raw = (ev.target as HTMLInputElement).value;
    const value = raw === '' ? undefined : Number(raw);
    this.updateSession(
      setDials(this.session, {
        ...this.session.dials,
        [field]: value !== undefined && Number.isInteger(value) ? value : undefined,
      }),
    );
  }

  private onIndoorInput(ev: Event): void {
    this.indoorInput = (ev.target as HTMLInputElement).value;
    const trimmed = this.indoorInput.trim();
    if (trimmed === '') this.updateSession(setIndoorAddress(this.session, undefined));
    else {
      const parsed = parseAddressInput(trimmed);
      if (parsed !== undefined) this.updateSession(setIndoorAddress(this.session, parsed));
    }
  }

  private updateDoor(key: string, patch: Partial<Door>): void {
    let doors = this.session.doors.map((d) => (d.key === key ? { ...d, ...patch } : d));
    // Only one default door: checking one unchecks the others.
    if (patch.default) doors = doors.map((d) => (d.key === key ? d : { ...d, default: false }));
    this.updateSession(setDoors(this.session, doors));
  }

  private renameDoor(door: Door, ev: Event): void {
    const input = ev.target as HTMLInputElement;
    const name = input.value.trim();
    if (name === '') input.value = door.name;
    else if (name !== door.name) this.updateDoor(door.key, { name });
  }

  private addDoor(): void {
    if (this.session.doors.length >= MAX_DOORS) return;
    this.updateSession(setDoors(this.session, [...this.session.doors, newDoor(this.session.doors)]));
  }

  private removeDoor(door: Door): void {
    if (this.session.doors.length <= 1) return;
    const captures = doorCaptureCount(this.session, door);
    if (captures > 0 && !window.confirm(`„${door.name}“ und ${captures} Aufnahme(n) dieser Tür löschen?`))
      return;
    this.updateSession(
      setDoors(
        this.session,
        this.session.doors.filter((d) => d.key !== door.key),
      ),
    );
  }

  private resetDoors(): void {
    const doors = this.configDoors;
    const lost = this.session.doors
      .filter((d) => !doors.some((c) => c.key === d.key))
      .reduce((n, d) => n + doorCaptureCount(this.session, d), 0);
    if (lost > 0 && !window.confirm(`Dabei gehen ${lost} Aufnahme(n) entfernter Türen verloren. Fortfahren?`))
      return;
    this.updateSession(setDoors(this.session, doors));
  }

  private showToast(text: string): void {
    this.toast = text;
    window.clearTimeout(this.toastTimer);
    this.toastTimer = window.setTimeout(() => (this.toast = ''), 4000);
  }

  // ---- Navigation ----------------------------------------------------------------------------------

  private get currentStep(): StepDefinition | undefined {
    const steps = this.steps;
    return this.page >= 1 && this.page <= steps.length ? steps[this.page - 1] : undefined;
  }

  private goTo(page: number): void {
    if (this.capture) return;
    this.page = Math.max(0, Math.min(this.resultPage, page));
    this.waitForFrame = undefined;
  }

  private skipStep(): void {
    const step = this.currentStep;
    if (step) this.updateSession(setSkipped(this.session, step.id, true));
    this.goTo(this.page + 1);
  }

  // ---- Rendering -----------------------------------------------------------------------------------

  protected override render(): TemplateResult | typeof nothing {
    if (!this.config || !this.session) return nothing;
    return html`
      <ha-card>
        <div class="header">
          <div class="header-icon"><ha-icon icon="mdi:doorbell-video"></ha-icon></div>
          <div class="title">
            <h1>${this.config.title ?? 'ABB-Welcome Einrichtung'}</h1>
            <div class="subtitle">Klingeln & Türöffner einmessen</div>
          </div>
          <button class="icon" title="Sitzung exportieren (JSON)" @click=${this.exportSession}>
            <ha-icon icon="mdi:download-outline"></ha-icon>
          </button>
          <button class="icon" title="Sitzung importieren (JSON)" @click=${this.importSession}>
            <ha-icon icon="mdi:upload-outline"></ha-icon>
          </button>
          <button class="icon" title="Neu beginnen" @click=${this.resetSession}>
            <ha-icon icon="mdi:restart"></ha-icon>
          </button>
          <input id="import" type="file" accept="application/json,.json" @change=${this.onImportFile} />
        </div>
        ${this.renderStepper()}
        <div class="progress"><div style="width:${(this.page / this.resultPage) * 100}%"></div></div>
        <div class="content">
          ${this.capture ? nothing : this.renderConnectionStatus()}
          ${
            this.page === 0
              ? this.renderStart()
              : this.page >= this.resultPage
                ? this.renderResult()
                : this.renderStep(this.steps[this.page - 1])
          }
        </div>
        ${this.renderFooter()}
      </ha-card>
    `;
  }

  private renderStepper(): TemplateResult {
    const pages: { label: string; icon: string; status: string }[] = [
      { label: 'Start', icon: 'mdi:play', status: '' },
      ...this.steps.map((s) => {
        const record = stepRecord(this.session, s.id);
        const status = record.captures.length > 0 ? 'done' : record.skipped ? 'skipped' : '';
        return { label: s.short, icon: status === 'done' ? 'mdi:check' : s.icon, status };
      }),
      { label: 'Ergebnis', icon: 'mdi:file-code-outline', status: '' },
    ];
    return html`
      <nav class="stepper" aria-label="Schritte">
        ${pages.map(
          (p, i) => html`
            <button
              class="${p.status} ${i === this.page ? 'current' : ''}"
              ?disabled=${!!this.capture}
              aria-current=${i === this.page ? 'step' : 'false'}
              title=${p.label}
              @click=${() => this.goTo(i)}
            >
              <span class="dot"><ha-icon icon=${p.icon}></ha-icon></span>
              <span class="label">${p.label}</span>
            </button>
          `,
        )}
      </nav>
    `;
  }

  private renderFooter(): TemplateResult {
    const step = this.currentStep;
    const hasCaptures = step ? stepRecord(this.session, step.id).captures.length > 0 : false;
    return html`
      <div class="footer">
        <button
          class="btn text"
          ?disabled=${this.page === 0 || !!this.capture}
          @click=${() => this.goTo(this.page - 1)}
        >
          <ha-icon icon="mdi:chevron-left"></ha-icon>Zurück
        </button>
        <span class="spacer"></span>
        ${this.toast ? html`<span class="toast" role="status">${this.toast}</span>` : nothing}
        <span class="spacer"></span>
        ${
          step && !hasCaptures
            ? html`<button class="btn text" ?disabled=${!!this.capture} @click=${this.skipStep}>
                Überspringen
              </button>`
            : nothing
        }
        ${
          this.page < this.resultPage
            ? html`<button
                class="btn ${!step || hasCaptures ? 'primary' : ''}"
                ?disabled=${!!this.capture}
                @click=${() => this.goTo(this.page + 1)}
              >
                ${this.page === this.steps.length ? 'Auswerten' : 'Weiter'}<ha-icon
                  icon="mdi:chevron-right"
                ></ha-icon>
              </button>`
            : nothing
        }
      </div>
    `;
  }

  // ---- Start page ----------------------------------------------------------------------------------

  private renderStart(): TemplateResult {
    const entity = this.config!.entity;
    const stateObj = this.hass?.states[entity];
    const apartment = apartmentFromDials(this.session.dials);
    const threeByte = this.result.threeByte;
    const expected = apartment !== undefined ? expectedIndoorAddress(apartment, threeByte) : undefined;
    const indoorInvalid = this.indoorInput.trim() !== '' && parseAddressInput(this.indoorInput) === undefined;
    const configIndoor = this.configIndoor;

    return html`
      <h2><ha-icon icon="mdi:hand-wave-outline"></ha-icon>Willkommen</h2>
      <p>
        Dieser Assistent führt dich in wenigen Minuten durch das Einmessen deiner Busch-Welcome / ABB-Welcome
        Gegensprechanlage: Du klingelst und drückst die Schlüssel-Taste, die Karte schneidet die Bus-Frames
        mit, wertet sie aus und erzeugt die fertige ESPHome-Konfiguration.
      </p>
      <div class="callout ok">
        <ha-icon icon="mdi:shield-check-outline"></ha-icon>
        <span
          ><b>Nur lesen:</b> Die Karte sendet nichts auf den Bus und löst keine Aktionen aus. Türen öffnen
          sich nur, wenn du selbst die Schlüssel-Taste drückst.</span
        >
      </div>

      <div class="panel">
        <h3>1 · Datenquelle prüfen</h3>
        ${
          stateObj
            ? html`<div class="callout ${this.receivedCount > 0 ? 'ok' : 'info'}">
                <ha-icon
                  icon=${this.receivedCount > 0 ? 'mdi:check-circle-outline' : 'mdi:timer-sand'}
                ></ha-icon>
                <span>
                  <b>${(stateObj.attributes.friendly_name as string) ?? entity}</b> gefunden.
                  ${
                    this.receivedCount > 0
                      ? html`${this.receivedCount} Frame(s) seit dem Öffnen der Karte empfangen.`
                      : html`Noch keine neuen Frames – drück zum Test kurz eine Taste an der Innenstation.`
                  } <br /><span class="muted small">Letzter Wert: <code>${stateObj.state}</code></span>
                </span>
              </div>`
            : html`<div class="callout error">
                <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
                <span
                  >Die Entität <code>${entity}</code> existiert nicht. Trage in der Karten-Konfiguration unter
                  <code>entity</code> den Debug-Textsensor deines ESP32 ein (z. B. „Doorbell Intercom“).</span
                >
              </div>`
        }
      </div>

      <div class="panel">
        <h3>2 · Drehregler der Innenstation (optional)</h3>
        <p class="muted small">
          Auf der Rückseite deiner Innenstation. X10 und X1 ergeben die Wohnungsnummer – daraus folgt die
          erwartete Adresse. Sie dient nur zur Kontrolle, die echte Adresse wird aus den Frames ermittelt.
        </p>
        <div class="fields">
          ${(['station', 'x10', 'x1'] as const).map(
            (field) => html`
              <label class="field"
                >${field.toUpperCase()}
                <input
                  type="number"
                  min="0"
                  max="9"
                  inputmode="numeric"
                  .value=${this.session.dials[field]?.toString() ?? ''}
                  @change=${(ev: Event) => this.onDialInput(field, ev)}
                />
              </label>
            `,
          )}
        </div>
        ${
          expected !== undefined
            ? html`<p class="small">
                Wohnung <b>${apartment}</b> → erwartete Innenstationsadresse
                <span class="badge accent">${formatAddress(expected, threeByte)}</span>
              </p>`
            : nothing
        }
      </div>

      <details ?open=${configIndoor !== undefined || this.session.indoorAddress !== undefined}>
        <summary>Innenstationsadresse manuell festlegen (für Profis)</summary>
        <div class="panel" style="border:none;padding:0">
          <p class="muted small">
            Normalerweise ermittelt der Assistent die Adresse selbst. Falls du sie kennst oder die Erkennung
            danebenliegt, kannst du sie hier
            vorgeben${
              configIndoor !== undefined
                ? html` (Karten-Konfiguration:
                    <code>${formatAddress(configIndoor, configIndoor > 0xffff)}</code>)`
                : nothing
            }.
          </p>
          <label class="field"
            >Adresse (z. B. 0x1010 oder 0x000110)
            <input
              type="text"
              class=${indoorInvalid ? 'invalid' : ''}
              placeholder=${configIndoor !== undefined ? formatAddress(configIndoor, configIndoor > 0xffff) : 'automatisch'}
              .value=${this.indoorInput}
              @input=${this.onIndoorInput}
            />
          </label>
        </div>
      </details>

      ${this.renderDoorEditor()} ${this.renderLive('Live-Frames')} ${this.renderLimitations()}
    `;
  }

  private renderDoorEditor(): TemplateResult {
    const doors = this.session.doors;
    return html`
      <div class="panel">
        <h3>3 · Türen deiner Anlage</h3>
        <p class="muted small">
          Für jede Tür gibt es einen Klingel-Schritt, für Türen mit Öffner zusätzlich einen Öffnen-Schritt.
          Namen frei wählbar – sie werden auch für die Sensoren und Schlösser in ESPHome verwendet.
        </p>
        <div class="doors">
          ${doors.map(
            (door) => html`
              <div class="door-row">
                <div class="door-main">
                  <ha-icon icon=${doorIcon(door)}></ha-icon>
                  <input
                    type="text"
                    aria-label="Name der Tür"
                    maxlength="40"
                    .value=${door.name}
                    @change=${(ev: Event) => this.renameDoor(door, ev)}
                  />
                  <button
                    class="icon"
                    title="Tür entfernen"
                    ?disabled=${doors.length <= 1}
                    @click=${() => this.removeDoor(door)}
                  >
                    <ha-icon icon="mdi:delete-outline"></ha-icon>
                  </button>
                </div>
                <div class="door-options">
                  <select
                    aria-label="Art der Klingel"
                    .value=${door.type}
                    @change=${(ev: Event) =>
                      this.updateDoor(door.key, {
                        type: (ev.target as HTMLSelectElement).value as Door['type'],
                        open: (ev.target as HTMLSelectElement).value === 'outdoor',
                      })}
                  >
                    <option value="outdoor">Außentür (eigene Außenstation)</option>
                    <option value="floor">Wohnungstür (Etagenruf)</option>
                  </select>
                  <label class="switch" title="Die Schlüssel-Taste der Innenstation kann diese Tür öffnen">
                    <input
                      type="checkbox"
                      .checked=${door.open}
                      ?disabled=${door.type === 'floor'}
                      @change=${(ev: Event) =>
                        this.updateDoor(door.key, { open: (ev.target as HTMLInputElement).checked })}
                    />Türöffner
                  </label>
                  <label
                    class="switch"
                    title="Öffnet sich mit der Schlüssel-Taste auch ohne vorheriges Klingeln"
                  >
                    <input
                      type="checkbox"
                      .checked=${door.default}
                      ?disabled=${!door.open}
                      @change=${(ev: Event) =>
                        this.updateDoor(door.key, { default: (ev.target as HTMLInputElement).checked })}
                    />Standard-Tür
                  </label>
                </div>
              </div>
            `,
          )}
        </div>
        <div class="actions">
          <button class="btn" ?disabled=${doors.length >= MAX_DOORS} @click=${this.addDoor}>
            <ha-icon icon="mdi:plus"></ha-icon>Tür hinzufügen
          </button>
          <button class="btn text" @click=${this.resetDoors}>Vorgabe wiederherstellen</button>
        </div>
        <details>
          <summary>Was bedeuten die Optionen?</summary>
          <ul class="small" style="margin:0;padding-left:1.2em;line-height:1.5">
            <li>
              <b>Außentür:</b> Tür mit eigener Außenstation (Klingeltaster mit Lautsprecher), z. B. Tor oder
              Haustür.
            </li>
            <li>
              <b>Wohnungstür (Etagenruf):</b> Klingeltaster, der direkt an der Innenstation angeschlossen ist.
              Kein Öffner.
            </li>
            <li>
              <b>Türöffner:</b> Die Schlüssel-Taste der Innenstation öffnet diese Tür (nach dem Klingeln an
              ihr).
            </li>
            <li>
              <b>Standard-Tür:</b> Die Tür, die die Schlüssel-Taste auch <i>ohne</i> vorheriges Klingeln
              öffnet – meist die Haustür. Höchstens eine.
            </li>
          </ul>
        </details>
      </div>
    `;
  }

  private renderDoorsWithoutOpener(): TemplateResult | typeof nothing {
    const names = this.session.doors.filter((d) => !d.open).map((d) => `„${d.name}“`);
    if (names.length === 0) return nothing;
    return html`<p class="muted small">Ohne elektrischen Öffner (nur Klingel): ${names.join(', ')}.</p>`;
  }

  private renderLimitations(): TemplateResult {
    return html`
      <details>
        <summary>Bekannte Einschränkungen</summary>
        <p class="small">
          Home Assistant meldet nur <i>Änderungen</i> des Sensors. Kommen zwei identische Frames direkt
          hintereinander, erscheint nur einer – Wiederholungen (») können also fehlen. Die Auswertung hängt
          deshalb nicht von exakten Wiederholungszahlen ab. Firmwares, die nur den letzten Frame alle 100 ms
          melden, können Frames verschlucken (<code>api: batch_delay: 0ms</code> hilft).
        </p>
      </details>
    `;
  }

  // ---- Live list -----------------------------------------------------------------------------------

  private renderLive(title: string, lines: RecordedLine[] = this.live): TemplateResult {
    const receiving = this.live.length > 0;
    return html`
      <div class="panel">
        <h3 style="display:flex;align-items:center;gap:8px">
          <span class="live-dot ${receiving ? '' : 'off'}"></span>${title}
          <span class="muted small" style="font-weight:normal"
            >${lines.length > 0 ? `(${lines.length})` : ''}</span
          >
        </h3>
        ${this.renderFrames(lines, 'Warte auf Frames … Tipp: Taste an der Innenstation drücken.')}
      </div>
    `;
  }

  private renderFrames(lines: RecordedLine[], emptyText: string): TemplateResult {
    if (lines.length === 0) return html`<div class="empty">${emptyText}</div>`;
    const own = this.highlightAddress;
    return html`
      <div class="frames" role="log">
        ${lines.map((entry) => {
          const parsed = parseFrame(entry.line);
          if (!parsed.ok) {
            return html`<div class="frame unparsed" title="Nicht erkannt">
              <span class="time">${timeOf(entry.time)}</span><span class="route">?</span
              ><span class="detail">${entry.line}</span>
            </div>`;
          }
          const f = parsed.frame;
          const mine = own !== undefined && involvesAddress(f, own);
          const cls = own === undefined ? '' : mine ? 'own' : 'foreign';
          return html`<div class="frame ${cls}" title=${entry.line}>
            <span class="time">${timeOf(entry.time)}</span>
            <span class="route"
              >${formatAddressPlain(f.src, f.threeByte)} ${f.retransmission ? '»' : '›'}
              ${formatAddressPlain(f.dst, f.threeByte)}</span
            >
            <span class="detail"
              ><span class="type">${hex2(f.type)}</span>${
                f.data.length ? html` · ${formatBytesPlain(f.data)}` : nothing
              }</span
            >
          </div>`;
        })}
      </div>
    `;
  }

  // ---- Recording step ------------------------------------------------------------------------------

  private renderStep(step: StepDefinition): TemplateResult {
    const record = stepRecord(this.session, step.id);
    const count = record.captures.length;
    return html`
      <h2><ha-icon icon=${step.icon}></ha-icon>${step.title}</h2>
      <ol class="todo">
        ${step.todo.map((t) => html`<li>${t}</li>`)}
      </ol>
      <details>
        <summary>Warum?</summary>
        <p class="small">${step.why}</p>
      </details>
      ${step.needsPause ? this.renderPauseHint() : nothing}
      ${
        step.kind === 'open'
          ? html`<div class="callout warning">
              <ha-icon icon="mdi:door-open"></ha-icon>
              <span
                >Die Tür öffnet sich bei diesem Schritt tatsächlich – nur ausführen, wenn das in Ordnung
                ist.</span
              >
            </div>`
          : nothing
      }

      <div class="panel">
        ${this.capture ? this.renderActiveCapture() : this.renderCaptureControls(step, count)}
      </div>

      ${count > 0 ? this.renderCaptures(step) : nothing}
      ${count > 0 ? this.renderStepFeedback(step) : nothing}
      ${
        this.capture
          ? this.renderLive('Frames dieser Aufnahme', [...this.capture.lines].reverse())
          : this.renderLive('Live-Frames')
      }
    `;
  }

  private renderPauseHint(): TemplateResult {
    const last = lastRingTime(this.session);
    if (!last) return html``;
    const minutes = (this.now - last.getTime()) / 60000;
    const ok = minutes >= OPEN_DEFAULT_PAUSE_MINUTES;
    return html`<div class="callout ${ok ? 'ok' : 'warning'}">
      <ha-icon icon="mdi:timer-outline"></ha-icon>
      <span
        >Letztes Klingeln vor
        ${minutes < 1 ? 'weniger als einer Minute' : `${Math.floor(minutes)} Minute(n)`}.
        ${
          ok
            ? 'Passt – die Schlüssel-Taste öffnet jetzt die Standard-Außenstation.'
            : `Bitte noch etwas warten (mindestens ${OPEN_DEFAULT_PAUSE_MINUTES} Minuten).`
        }</span
      >
    </div>`;
  }

  private renderCaptureControls(step: StepDefinition, count: number): TemplateResult {
    const seconds = this.captureSeconds;
    const wait = this.waitForFrame ?? step.waitForFrame;
    return html`
      <div class="actions">
        <button class="btn primary large" @click=${() => this.beginCapture(wait)}>
          <ha-icon icon=${count === 0 ? 'mdi:record-circle-outline' : 'mdi:repeat'}></ha-icon>
          ${count === 0 ? 'Aufnahme starten' : 'Wiederholen'}
        </button>
        <span class="spacer" style="flex:1"></span>
        ${this.renderReps(count, step.repetitions)}
      </div>
      <label class="switch">
        <input
          type="checkbox"
          .checked=${wait}
          @change=${(ev: Event) => (this.waitForFrame = (ev.target as HTMLInputElement).checked)}
        />
        <span
          >Erst mit dem ersten Frame starten
          <span class="muted">(z. B. wenn du erst zur Tür gehen musst)</span></span
        >
      </label>
      <p class="muted small">
        ${
          wait
            ? `Nach dem Tippen wartet die Karte auf den ersten Frame und nimmt ab dann ${seconds} s auf.`
            : `Die Aufnahme läuft ${seconds} s ab dem Tippen.`
        }
        ${
          count === 0
            ? ''
            : count < step.repetitions
              ? `Empfohlen: ${step.repetitions} Aufnahmen.`
              : 'Genug Aufnahmen – weiter zum nächsten Schritt.'
        }
      </p>
    `;
  }

  private renderReps(count: number, recommended: number): TemplateResult {
    const dots = Math.max(count, recommended);
    return html`<span class="reps" title="${count} von ${recommended} empfohlenen Aufnahmen">
      ${Array.from({ length: dots }, (_, i) => html`<span class=${i < count ? 'filled' : ''}></span>`)}
    </span>`;
  }

  private renderConnectionStatus(): TemplateResult | typeof nothing {
    if (!this.online) {
      return html`<div class="callout warning" role="status">
        <ha-icon icon="mdi:wifi-off"></ha-icon>
        <span
          >Keine Verbindung zu Home
          Assistant.${
            this.capture
              ? ' Mach einfach weiter – Home Assistant zeichnet die Frames trotzdem auf. Sobald die Verbindung zurück ist, holt die Karte sie aus dem Verlauf nach.'
              : ' Live-Frames sind pausiert.'
          }</span
        >
      </div>`;
    }
    if (this.capture?.missed) {
      return html`<div class="callout info" role="status">
        <ha-icon icon="mdi:history"></ha-icon>
        <span>Verbindung wieder da – verpasste Frames werden aus dem Verlauf nachgeladen …</span>
      </div>`;
    }
    return nothing;
  }

  private renderActiveCapture(): TemplateResult {
    const capture = this.capture!;
    if (capture.phase === 'armed') {
      return html`${this.renderConnectionStatus()}
        <div class="capture">
          <div class="pulse"><ha-icon icon="mdi:bell-ring-outline"></ha-icon></div>
          <div style="flex:1">
            <b>Bereit – jetzt klingeln bzw. Taste drücken.</b>
            <p class="muted small">Die Aufnahme startet automatisch mit dem ersten Frame.</p>
          </div>
          <button class="btn text" @click=${this.cancelCapture}>Abbrechen</button>
        </div>`;
    }
    const total = this.captureSeconds * 1000;
    const left = Math.max(0, (capture.endsAt ?? this.now) - this.now);
    const circumference = 2 * Math.PI * 32;
    const completing = left === 0 && capture.missed;
    return html`${this.renderConnectionStatus()}
      <div class="capture">
        <div class="ring" role="timer" aria-label="Verbleibende Sekunden">
          <svg width="72" height="72" viewBox="0 0 72 72">
            <circle class="track" cx="36" cy="36" r="32"></circle>
            <circle
              class="bar"
              cx="36"
              cy="36"
              r="32"
              stroke-dasharray=${circumference}
              stroke-dashoffset=${circumference * (1 - left / total)}
            ></circle>
          </svg>
          <div class="value">${Math.ceil(left / 1000)}</div>
        </div>
        <div style="flex:1">
          <b>${completing ? 'Aufnahme wird vervollständigt …' : 'Aufnahme läuft …'}</b>
          <p class="muted small">${capture.lines.length} Frame(s) empfangen</p>
        </div>
        <button class="btn" @click=${this.finishCapture}>Jetzt beenden</button>
      </div>`;
  }

  private renderCaptures(step: StepDefinition): TemplateResult {
    const captures = stepRecord(this.session, step.id).captures;
    return html`
      <div class="captures">
        <div class="actions">
          <h3 style="margin:0;flex:1">Aufnahmen</h3>
          <button
            class="btn text danger"
            @click=${() => this.updateSession(removeCapture(this.session, step.id, captures.length - 1))}
          >
            <ha-icon icon="mdi:undo"></ha-icon>Verwerfen
          </button>
        </div>
        ${captures.map(
          (c, i) => html`
            <details class="capture-row">
              <summary>
                <ha-icon icon="mdi:chevron-right"></ha-icon>
                <span class="grow">Aufnahme ${i + 1} · ${timeOf(c.startedAt)}</span>
                <span class="badge ${c.lines.length ? '' : 'warning'}">${c.lines.length} Frames</span>
                <button
                  class="icon"
                  title="Diese Aufnahme löschen"
                  @click=${(ev: Event) => {
                    ev.preventDefault();
                    this.updateSession(removeCapture(this.session, step.id, i));
                  }}
                >
                  <ha-icon icon="mdi:delete-outline"></ha-icon>
                </button>
              </summary>
              ${this.renderFrames(c.lines, 'Keine Frames in dieser Aufnahme.')}
            </details>
          `,
        )}
      </div>
    `;
  }

  /** Immediate feedback on what the analysis found for this step. */
  private renderStepFeedback(step: StepDefinition): TemplateResult {
    const result = this.result;
    if (!result.indoor) {
      return html`<div class="callout info">
        <ha-icon icon="mdi:information-outline"></ha-icon>
        <span>Innenstation noch nicht erkannt – sie ergibt sich spätestens aus den Öffnen-Schritten.</span>
      </div>`;
    }
    if (step.kind === 'baseline' || !step.door) {
      return html`<div class="callout ok">
        <ha-icon icon="mdi:check-circle-outline"></ha-icon>
        <span
          >${stepRecord(this.session, step.id).captures.flatMap((c) => c.lines).length} Frames als Baseline
          markiert.</span
        >
      </div>`;
    }
    if (step.kind === 'ring') {
      const ring = result.rings[step.door.key];
      return ring.candidates.length > 0
        ? html`<div class="panel">
            <h3>Erkannt</h3>
            ${this.renderCandidates(ring)}
          </div>`
        : html`<div class="callout warning">
            <ha-icon icon="mdi:alert-outline"></ha-icon>
            <span
              >Noch keine passenden Klingel-Frames für
              ${describeAddress(result.indoor.address, result.threeByte)}.</span
            >
          </div>`;
    }
    const open = result.opens[step.door.key];
    return open
      ? html`<div class="panel">
          <h3>Erkannt</h3>
          ${this.renderOpen(open)}
        </div>`
      : html`<div class="callout warning">
          <ha-icon icon="mdi:alert-outline"></ha-icon>
          <span>Kein Öffnen-Frame (Typ 0D/0E) von der Innenstation gefunden.</span>
        </div>`;
  }

  // ---- Result page ---------------------------------------------------------------------------------

  private renderResult(): TemplateResult {
    const result = this.result;
    const { indoor, threeByte } = result;
    const apartment = apartmentFromDials(this.session.dials);
    const device = this.device;
    const yaml = generateYaml(result, this.session.doors, {
      maskDoorCode: this.maskDoorCode,
      apartment,
      device: this.exportMode === 'full' ? device : undefined,
    });
    const recorded = Object.values(this.session.steps).some((s) => s.captures.length > 0);

    if (!recorded) {
      return html`<h2><ha-icon icon="mdi:file-code-outline"></ha-icon>Ergebnis</h2>
        <div class="callout info">
          <ha-icon icon="mdi:information-outline"></ha-icon>
          <span>Noch keine Aufnahmen. Geh die Schritte durch oder importiere eine gespeicherte Sitzung.</span>
        </div>`;
    }

    return html`
      <h2><ha-icon icon="mdi:file-code-outline"></ha-icon>Ergebnis</h2>

      <div class="grid">
        <div class="panel stat">
          <span class="muted small">Innenstation</span>
          <span class="value">${indoor ? formatAddress(indoor.address, threeByte) : '—'}</span>
          ${
            indoor
              ? html`<span class="small">
                  ${
                    indoor.method === 'manual'
                      ? html`<span class="badge accent">manuell</span>`
                      : indoor.method === 'open'
                        ? html`<span class="badge ok">aus Öffnen-Frames</span>`
                        : html`<span class="badge warning">nach Häufigkeit</span>`
                  }
                  ${
                    indoor.expected !== undefined
                      ? indoor.matchesExpected
                        ? html`<span class="badge ok"
                            ><ha-icon icon="mdi:check"></ha-icon>passt zu Wohnung ${apartment}</span
                          >`
                        : html`<span class="badge warning"
                            >erwartet ${formatAddress(indoor.expected, threeByte)} (Wohnung
                            ${apartment})</span
                          >`
                      : nothing
                  }
                </span>`
              : nothing
          }
        </div>
        <div class="panel stat">
          <span class="muted small">Adresslänge</span>
          <span class="value">${threeByte ? '3 Byte' : '2 Byte'}</span>
          <span class="muted small">${threeByte ? 'three_byte_address: true' : 'Standard'}</span>
        </div>
      </div>

      ${this.renderWarnings(result)}

      <div class="panel">
        <h3>Klingeln</h3>
        ${ringTargets(this.session.doors).map((t) => {
          const ring = result.rings[t.door.key];
          const ok = ring.selected.length > 0;
          return html`<div class="result-row">
            <ha-icon icon=${doorIcon(t.door)}></ha-icon>
            <div>
              <div class="row-head">
                <b>${t.name}</b>
                ${
                  ring.outdoorAddress !== undefined
                    ? html`<span class="muted small"
                        >${describeAddress(ring.outdoorAddress, threeByte)}</span
                      >`
                    : nothing
                }
                <span class="spacer"></span>
                ${
                  ok
                    ? html`<span class="badge ok">binary_sensor.${t.id}</span>`
                    : html`<span class="badge ${ring.captures ? 'warning' : ''}"
                        >${ring.captures ? 'nicht erkannt' : 'nicht aufgenommen'}</span
                      >`
                }
              </div>
              ${ring.candidates.length > 0 ? this.renderCandidates(ring) : nothing}
            </div>
          </div>`;
        })}
      </div>

      <div class="panel">
        <h3 style="display:flex;align-items:center;gap:8px">
          <span style="flex:1">Türöffner (Schlüssel-Taste)</span>
          <button
            class="icon"
            title="Türcode anzeigen/verbergen"
            @click=${() => (this.showDoorCode = !this.showDoorCode)}
          >
            <ha-icon icon=${this.showDoorCode ? 'mdi:eye-off-outline' : 'mdi:eye-outline'}></ha-icon>
          </button>
        </h3>
        ${lockTargets(this.session.doors).map((t) => {
          const open = result.opens[t.door.key];
          const recorded = stepRecord(this.session, openStepId(t.door)).captures.length > 0;
          return html`<div class="result-row">
            <ha-icon icon=${t.icon}></ha-icon>
            <div>
              <div class="row-head">
                <b>${t.name}</b>
                <span class="spacer"></span>
                ${
                  open
                    ? html`<span class="badge ok">lock.${t.id}</span>`
                    : html`<span class="badge ${recorded ? 'warning' : ''}"
                        >${recorded ? 'nicht erkannt' : 'nicht aufgenommen'}</span
                      >`
                }
              </div>
              ${open ? this.renderOpen(open) : nothing}
            </div>
          </div>`;
        })}
        ${this.renderDoorsWithoutOpener()}
      </div>

      <div class="panel">
        <h3 style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
          <span style="flex:1">ESPHome-Konfiguration</span>
          <label class="switch">
            <input
              type="checkbox"
              .checked=${this.maskDoorCode}
              @change=${(ev: Event) => (this.maskDoorCode = (ev.target as HTMLInputElement).checked)}
            />Türcode maskieren
          </label>
        </h3>
        <div class="segmented" role="radiogroup" aria-label="Umfang">
          ${(
            [
              ['full', 'Komplette Datei'],
              ['snippet', 'Nur geänderte Abschnitte'],
            ] as const
          ).map(
            ([mode, label]) =>
              html`<button
                role="radio"
                aria-checked=${this.exportMode === mode}
                class=${this.exportMode === mode ? 'active' : ''}
                @click=${() => (this.exportMode = mode)}
              >
                ${label}
              </button>`,
          )}
        </div>
        ${this.exportMode === 'full' ? this.renderDeviceFields(device) : nothing}
        <p class="muted small">
          ${
            this.exportMode === 'full'
              ? html`Im ESPHome Device Builder beim Gerät auf <b>Bearbeiten</b>, den gesamten Inhalt durch
                  diese Datei ersetzen und <b>Installieren</b> (drahtlos). Benötigt in
                  <code>secrets.yaml</code>: wifi_ssid, wifi_password, api_encryption_key, ota_password,
                  ap_password – den API-Schlüssel aus der bisherigen Datei übernehmen.`
              : 'In der ESPHome-Konfiguration deines ESP32 die gleichnamigen Abschnitte der Demo-Firmware ersetzen und per OTA installieren.'
          }
          ${
            this.maskDoorCode
              ? 'Türcodes sind durch Platzhalter ersetzt – gut zum Teilen in Foren.'
              : html`<b>Enthält deinen Türcode – nicht öffentlich teilen.</b>`
          }
        </p>
        <div class="actions">
          <button class="btn primary" @click=${() => this.copyYaml(yaml)}>
            <ha-icon icon="mdi:content-copy"></ha-icon>Kopieren
          </button>
          <button
            class="btn"
            @click=${() =>
              downloadText(
                this.exportMode === 'full' ? `${device.name}.yaml` : 'abb-welcome-abschnitte.yaml',
                yaml,
                'text/yaml',
              )}
          >
            <ha-icon icon="mdi:download"></ha-icon>Herunterladen
          </button>
        </div>
        <pre class="yaml">${yaml}</pre>
      </div>

      <details>
        <summary>
          Statistik · ${result.stats.parsedFrames} Frames, ${result.stats.baselineFiltered} per Baseline und
          ${result.stats.neighbourFiltered} als Nachbar-Frames ausgefiltert
        </summary>
        ${
          result.stats.unparsedLines.length > 0
            ? html`<p class="small">${result.stats.unparsedLines.length} nicht erkannte Zeile(n):</p>
                <div class="frames">
                  ${result.stats.unparsedLines.map((l) => html`<div class="frame unparsed"><span></span><span></span><span>${l}</span></div>`)}
                </div>`
            : html`<p class="small muted">Alle Zeilen wurden erkannt.</p>`
        }
      </details>
      ${this.renderLimitations()}
    `;
  }

  /** Device settings: user edits, otherwise suggested from the debug sensor's device in Home Assistant. */
  private get device(): DeviceOptions {
    const entity = this.config ? this._hass?.entities?.[this.config.entity] : undefined;
    const registered = entity?.device_id ? this._hass?.devices?.[entity.device_id] : undefined;
    const friendly = registered?.name_by_user || registered?.name || DEFAULT_DEVICE.friendlyName;
    const stateName = this.config
      ? this._hass?.states[this.config.entity]?.attributes.friendly_name
      : undefined;
    // The entity's friendly name is "<device> <sensor>"; keep the sensor part so the entity id stays the same.
    const sensorName =
      typeof stateName === 'string' && stateName.startsWith(`${friendly} `)
        ? stateName.slice(friendly.length + 1)
        : DEFAULT_DEVICE.debugSensorName;
    return {
      ...DEFAULT_DEVICE,
      name: deviceNameFromFriendly(friendly),
      friendlyName: friendly,
      debugSensorName: sensorName,
      ...this.deviceEdits,
    };
  }

  private renderDeviceFields(device: DeviceOptions): TemplateResult {
    const field = (key: keyof DeviceOptions, label: string, hint?: string) =>
      html`<label class="field"
        >${label}
        <input
          type="text"
          .value=${device[key] ?? ''}
          @change=${(ev: Event) => {
            const value = (ev.target as HTMLInputElement).value.trim();
            const edits = { ...this.deviceEdits };
            if (value === '') delete edits[key];
            else edits[key] = key === 'name' ? deviceNameFromFriendly(value) : value;
            this.deviceEdits = edits;
          }}
        />
        ${hint ? html`<span>${hint}</span>` : nothing}
      </label>`;
    return html`<div class="fields device-fields">
      ${field('name', 'Gerätename', 'esphome name – muss zum bestehenden Gerät passen')}
      ${field('friendlyName', 'Anzeigename')}
      ${field('debugSensorName', 'Debug-Sensor', 'Unverändert lassen, damit diese Karte ihn findet')}
    </div>`;
  }

  private async copyYaml(yaml: string): Promise<void> {
    this.showToast(
      (await copyText(yaml)) ? 'YAML kopiert.' : 'Kopieren nicht möglich – bitte manuell markieren.',
    );
  }

  private renderWarnings(result: WizardResult): TemplateResult | typeof nothing {
    const order: Severity[] = ['error', 'warning', 'info'];
    const warnings = [...result.warnings].sort(
      (a, b) => order.indexOf(a.severity) - order.indexOf(b.severity),
    );
    if (warnings.length === 0) {
      return html`<div class="callout ok">
        <ha-icon icon="mdi:check-circle-outline"></ha-icon><span>Keine Auffälligkeiten.</span>
      </div>`;
    }
    const important = warnings.filter((w) => w.severity !== 'info');
    const info = warnings.filter((w) => w.severity === 'info');
    return html`
      ${
        important.length === 0
          ? html`<div class="callout ok">
              <ha-icon icon="mdi:check-circle-outline"></ha-icon><span>Keine Probleme gefunden.</span>
            </div>`
          : nothing
      }
      ${important.map(
        (w) =>
          html`<div class="callout ${w.severity}">
            <ha-icon icon=${SEVERITY_ICON[w.severity]}></ha-icon><span>${w.message}</span>
          </div>`,
      )}
      ${
        info.length > 0
          ? html`<details>
              <summary>${info.length} Hinweis(e)</summary>
              <ul class="small" style="margin:0;padding-left:1.2em;line-height:1.5">
                ${info.map((w) => html`<li>${w.message}</li>`)}
              </ul>
            </details>`
          : nothing
      }
    `;
  }

  private renderCandidates(ring: RingResult): TemplateResult {
    const { threeByte } = this.result;
    const selected = new Set(ring.selected.map((c) => c.key));
    const describe = (c: RingCandidate) => {
      const addr = (a: number) => formatAddressPlain(a, threeByte);
      const route =
        c.src !== undefined && c.dst !== undefined
          ? `${addr(c.src)} › ${addr(c.dst)}`
          : c.src !== undefined
            ? `von ${addr(c.src)}`
            : c.dst !== undefined
              ? `an ${addr(c.dst)}`
              : '';
      return `Typ ${hex2(c.type)} ${route}${c.data ? ` · ${formatBytesPlain(c.data)}` : ''}`;
    };
    return html`<div class="candidates">
      ${ring.candidates.map(
        (c) =>
          html`<div
            class="candidate ${selected.has(c.key) ? '' : 'unselected'}"
            title=${selected.has(c.key) ? 'wird verwendet' : 'nicht in allen Aufnahmen – wird nicht verwendet'}
          >
            <code>${describe(c)}</code>
            <div
              class="meter ${c.reliable ? '' : 'partial'}"
              title="${c.occurrences}/${ring.captures} Aufnahmen"
            >
              <div style="width:${Math.round(c.score * 100)}%"></div>
            </div>
          </div>`,
      )}
    </div>`;
  }

  private renderOpen(open: OpenResult): TemplateResult {
    const { threeByte } = this.result;
    const code = this.showDoorCode ? formatBytesPlain(open.data) : open.data.map(() => '••').join(' ');
    return html`<dl class="kv" style="margin:6px 0 0">
      <dt>Ziel</dt>
      <dd>${describeAddress(open.destination, threeByte)}</dd>
      <dt>Typ</dt>
      <dd>${hex2(open.messageType)} ${open.messageType === 0x0e ? '(Schiebetür)' : '(Türöffner)'}</dd>
      <dt>Türcode</dt>
      <dd>${code || '—'}</dd>
      <dt>Bestätigung</dt>
      <dd>
        ${
          open.confirmation
            ? `${hex2(open.confirmation.messageType)} von ${formatAddress(open.confirmation.source, threeByte)}`
            : '—'
        }
      </dd>
      <dt>Stabilität</dt>
      <dd>${open.occurrences}/${open.captures} Aufnahmen</dd>
    </dl>`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    [CARD_TAG]: AbbWelcomeWizardCard;
  }
  interface Window {
    customCards?: {
      type: string;
      name: string;
      description: string;
      preview?: boolean;
      documentationURL?: string;
    }[];
  }
}

window.customCards = window.customCards ?? [];
if (!window.customCards.some((c) => c.type === CARD_TAG)) {
  window.customCards.push({
    type: CARD_TAG,
    name: 'ABB-Welcome Wizard',
    description: 'Assistent zum Einmessen von Klingeln und Türöffnern einer Busch-/ABB-Welcome-Anlage.',
    preview: false,
    documentationURL: 'https://github.com/jako-dev/esp32-abb-wizard-card',
  });
}

console.info(
  `%c ABB-WELCOME-WIZARD-CARD %c ${VERSION} `,
  'background:#03a9f4;color:#fff',
  'background:#444;color:#fff',
);
