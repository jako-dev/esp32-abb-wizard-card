import { LitElement, html, nothing, type PropertyValues, type TemplateResult } from 'lit';
import { customElement, state } from 'lit/decorators.js';
import {
  describeAddress,
  DIAL_READING_LABELS,
  dialCandidates,
  describeDials,
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
import {
  findSendFrameService,
  isTestReply,
  REPLY_TIMEOUT_MS,
  sendFramePayload,
  sendTestFrame,
  type SendFramePayload,
} from './frame-test';
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
  setExportSettings,
  setIndoorAddress,
  setOverrides,
  setSkipped,
} from './session';
import { buildSteps, OPEN_DEFAULT_PAUSE_MINUTES, type StepDefinition } from './steps';
import {
  clearStoredSession,
  copyText,
  downloadText,
  hasBackup,
  loadActiveCapture,
  loadStoredSession,
  storeActiveCapture,
  storeSession,
} from './storage';
import { cardStyles } from './styles';
import type {
  DialSettings,
  Door,
  ExportSettings,
  Overrides,
  OpenResult,
  RecordedLine,
  RingCandidate,
  RingResult,
  Session,
  Severity,
  WizardResult,
} from './types';
import {
  checkDeviceName,
  DEFAULT_DEVICE,
  deviceNameFromFriendly,
  effectiveDeviceName,
  generateYaml,
  lockTargets,
  ringTargets,
  type DeviceOptions,
  type ExportTarget,
  type RegisteredDevice,
} from './yaml-export';
import {
  conditionDraft,
  hexAddress,
  openDraft,
  parseBusAddress,
  parseConditionDraft,
  parseOpenDraft,
  type ConditionDraft,
  type FieldErrors,
  type OpenDraft,
} from './manual';

const CARD_TAG = 'abb-welcome-wizard-card';

/** The value being edited in the result step. */
type Editing =
  | { kind: 'indoor'; value: string; error?: string }
  | { kind: 'outdoor'; door: string; value: string; error?: string }
  | { kind: 'ring'; door: string; rows: ConditionDraft[]; errors: FieldErrors<ConditionDraft>[] }
  | { kind: 'open'; door: string; draft: OpenDraft; errors: FieldErrors<OpenDraft> };
const VERSION = '0.9.2';
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
  @state() private editing?: Editing;
  /** Live test of an open frame (the only time the wizard sends something). */
  @state() private frameTest?: {
    door: string;
    phase: 'confirm' | 'sending' | 'waiting' | 'confirmed' | 'noreply' | 'error';
    payload: SendFramePayload;
    message?: string;
  };
  private frameTestTimer?: number;
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
      const stored = loadStoredSession(config.entity);
      this.session = stored ?? createSession(config.entity, this.configDoors);
      if (!stored && hasBackup(config.entity)) {
        this.showToast('Gespeicherte Sitzung nicht lesbar – eine Sicherung wurde im Browser abgelegt.');
      }
      this.indoorInput =
        this.session.overrides.indoorAddress !== undefined
          ? formatAddress(this.session.overrides.indoorAddress, this.session.overrides.indoorAddress > 0xffff)
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
    const test = this.frameTest;
    if (test && (test.phase === 'sending' || test.phase === 'waiting')) {
      const parsed = parseFrame(line.line);
      if (parsed.ok && isTestReply(parsed.frame, test.payload)) {
        const { frame } = parsed;
        this.frameTest = {
          ...test,
          phase: 'confirmed',
          message: `${hex2(frame.type)} von ${formatAddress(frame.src, frame.threeByte)}`,
        };
        window.clearTimeout(this.frameTestTimer);
      }
    }
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
    const indoor = this.session.overrides.indoorAddress ?? this.configIndoor;
    const cache = this.analysisCache;
    if (cache && cache.session === this.session && cache.indoor === indoor) return cache.result;
    const result = analyzeSession(this.session, { indoorAddress: indoor });
    this.analysisCache = { session: this.session, indoor, result };
    return result;
  }

  /** Addresses used to highlight own frames: detected or manual, otherwise those the dials stand for. */
  private get highlightAddresses(): number[] {
    const detected = this.result.indoor?.address;
    if (detected !== undefined) return [detected];
    return dialCandidates(this.session.dials, false).map((c) => c.address);
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
        imported.overrides.indoorAddress !== undefined
          ? formatAddress(imported.overrides.indoorAddress, imported.overrides.indoorAddress > 0xffff)
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
    const threeByte = this.result.threeByte;
    const candidates = dialCandidates(this.session.dials, threeByte);
    const measured = this.result.indoor?.method === 'manual' ? undefined : this.result.indoor?.address;
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
          Auf der Rückseite deiner Innenstation. Je nach Anlage stehen X10/X1 direkt als Ziffern in der
          Adresse (1/6 → 0x1016) oder werden dezimal umgerechnet (16 → 0x1010). Beides wird mit der gemessenen
          Adresse verglichen – nur zur Kontrolle, die echte Adresse kommt aus den Frames.
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
          candidates.length > 0
            ? html`<div class="small" style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">
                ${describeDials(this.session.dials)} →
                ${candidates.map((c) => {
                  const match = measured === c.address;
                  const other = measured !== undefined && !match;
                  return html`<span
                    class="badge ${match ? 'ok' : other ? '' : 'accent'}"
                    title=${match ? 'passt zur gemessenen Adresse' : DIAL_READING_LABELS[c.reading]}
                    >${match ? html`<ha-icon icon="mdi:check"></ha-icon>` : nothing}${formatAddress(c.address, threeByte)}
                    · ${DIAL_READING_LABELS[c.reading]}</span
                  >`;
                })}
                ${
                  measured !== undefined && !candidates.some((c) => c.address === measured)
                    ? html`<span class="badge warning"
                        >gemessen ${formatAddress(measured, threeByte)} – passt zu keiner</span
                      >`
                    : nothing
                }
              </div>`
            : nothing
        }
      </div>

      <details ?open=${configIndoor !== undefined || this.session.overrides.indoorAddress !== undefined}>
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
    const own = this.highlightAddresses;
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
          const mine = own.some((address) => involvesAddress(f, address));
          const cls = own.length === 0 ? '' : mine ? 'own' : 'foreign';
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
    const device = this.device;
    const yaml = generateYaml(result, this.session.doors, {
      maskDoorCode: this.maskDoorCode,
      device: this.exportSettings.mode === 'full' ? device : undefined,
    });
    const recorded = Object.values(this.session.steps).some((s) => s.captures.length > 0);
    const overrides = this.session.overrides;

    return html`
      <h2><ha-icon icon="mdi:file-code-outline"></ha-icon>Ergebnis</h2>
      ${
        recorded
          ? nothing
          : html`<div class="callout info">
              <ha-icon icon="mdi:information-outline"></ha-icon>
              <span
                >Noch keine Aufnahmen. Geh die Schritte durch, importiere eine Sitzung – oder trag die Werte
                unten mit dem Stift von Hand ein.</span
              >
            </div>`
      }

      <div class="grid">
        <div class="panel stat">
          <span class="muted small edit-head"
            >Innenstation
            ${this.editButton('Innenstationsadresse bearbeiten', () =>
              this.startEdit({
                kind: 'indoor',
                value: indoor ? hexAddress(indoor.address, threeByte) : '',
              }),
            )}</span
          >
          ${
            this.editing?.kind === 'indoor'
              ? this.renderAddressEditor(
                  this.editing.value,
                  this.editing.error,
                  overrides.indoorAddress !== undefined,
                )
              : html`<span class="value">${indoor ? formatAddress(indoor.address, threeByte) : '—'}</span>`
          }
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
                    indoor.dialMatch
                      ? html`<span class="badge ok"
                          ><ha-icon icon="mdi:check"></ha-icon>passt zu den Drehreglern
                          (${DIAL_READING_LABELS[indoor.dialMatch]})</span
                        >`
                      : indoor.dialMatch === null
                        ? html`<span class="badge warning">passt nicht zu den Drehreglern</span>`
                        : nothing
                  }
                </span>`
              : html`<span class="muted small">Ohne Innenstation kein Export – bitte eintragen.</span>`
          }
        </div>
        <div class="panel stat">
          <label class="muted small edit-head" for="three-byte">Adresslänge</label>
          <select
            id="three-byte"
            @change=${(ev: Event) => {
              const value = (ev.target as HTMLSelectElement).value;
              this.updateOverrides({
                ...overrides,
                threeByte: value === 'auto' ? undefined : value === '3',
              });
            }}
          >
            <option value="auto" ?selected=${overrides.threeByte === undefined}>Automatisch</option>
            <option value="2" ?selected=${overrides.threeByte === false}>2 Byte (XXXX)</option>
            <option value="3" ?selected=${overrides.threeByte === true}>3 Byte (XXXXXX)</option>
          </select>
          <span class="small">
            <span class="value" style="font-size:1rem">${threeByte ? '3 Byte' : '2 Byte'}</span>
            ${result.threeByteManual ? html`<span class="badge accent">manuell</span>` : nothing}
          </span>
        </div>
      </div>

      ${this.renderWarnings(result)}

      <div class="panel">
        <h3>Klingeln</h3>
        ${ringTargets(this.session.doors).map((t) => this.renderRingResult(t, result))}
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
        ${lockTargets(this.session.doors).map((t) => this.renderOpenResult(t, result))}
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
                aria-checked=${this.exportSettings.mode === mode}
                class=${this.exportSettings.mode === mode ? 'active' : ''}
                @click=${() => this.updateExportSettings({ mode })}
              >
                ${label}
              </button>`,
          )}
        </div>
        ${this.exportSettings.mode === 'full' ? this.renderDeviceFields(device) : nothing}
        <p class="muted small">
          ${
            this.exportSettings.mode === 'full'
              ? html`Im ESPHome Device Builder beim Gerät auf <b>Bearbeiten</b>, den gesamten Inhalt durch
                  diese Datei ersetzen und <b>Installieren</b> (drahtlos). Benötigt in
                  <code>secrets.yaml</code>: wifi_ssid, wifi_password, api_encryption_key, ap_password. Der
                  API-Schlüssel sichert auch das Aufspielen ab, ein OTA-Passwort ist nicht nötig.`
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
                this.exportSettings.mode === 'full' ? `${device.name}.yaml` : 'abb-welcome-abschnitte.yaml',
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
  /** Export settings of the session; the full device file is the default. */
  private get exportSettings(): ExportSettings & { mode: 'full' | 'snippet' } {
    return { mode: 'full', ...this.session.exportSettings };
  }

  private updateExportSettings(patch: Partial<ExportSettings>): void {
    this.updateSession(setExportSettings(this.session, { ...this.session.exportSettings, ...patch }));
  }

  /** The ESP32 as Home Assistant knows it (device registry of the debug sensor). */
  private get registeredDevice(): RegisteredDevice & { friendlyName?: string } {
    const entity = this.config ? this._hass?.entities?.[this.config.entity] : undefined;
    const device = entity?.device_id ? this._hass?.devices?.[entity.device_id] : undefined;
    const mac = device?.connections?.find(([type]) => type === 'mac')?.[1];
    return {
      name: device?.name ?? undefined,
      friendlyName: device?.name_by_user || device?.name || undefined,
      mac,
    };
  }

  /** Device settings: saved values, otherwise suggested from the device in Home Assistant. */
  private get device(): DeviceOptions {
    const registered = this.registeredDevice;
    const friendly = registered.friendlyName ?? DEFAULT_DEVICE.friendlyName;
    const stateName = this.config
      ? this._hass?.states[this.config.entity]?.attributes.friendly_name
      : undefined;
    // The entity's friendly name is "<device> <sensor>"; keep the sensor part so the entity id stays the same.
    const sensorName =
      typeof stateName === 'string' && stateName.startsWith(`${friendly} `)
        ? stateName.slice(friendly.length + 1)
        : DEFAULT_DEVICE.debugSensorName;
    const saved = this.session.exportSettings;
    return {
      ...DEFAULT_DEVICE,
      name: saved.name ?? (registered.name ? deviceNameFromFriendly(registered.name) : DEFAULT_DEVICE.name),
      friendlyName: saved.friendlyName ?? friendly,
      debugSensorName: saved.debugSensorName ?? sensorName,
      nameAddMacSuffix: saved.nameAddMacSuffix ?? false,
      useAddress: saved.useAddress,
      allowPlaintextUpload: saved.allowPlaintextUpload ?? false,
    };
  }

  private renderDeviceFields(device: DeviceOptions): TemplateResult {
    const field = (
      key: 'name' | 'friendlyName' | 'debugSensorName' | 'useAddress',
      label: string,
      hint?: string,
    ) =>
      html`<label class="field"
        >${label}
        <input
          type="text"
          .value=${device[key] ?? ''}
          @change=${(ev: Event) => {
            const value = (ev.target as HTMLInputElement).value.trim();
            this.updateExportSettings({
              [key]: value === '' ? undefined : key === 'name' ? deviceNameFromFriendly(value) : value,
            });
          }}
        />
        ${hint ? html`<span>${hint}</span>` : nothing}
      </label>`;
    const registered = this.registeredDevice;
    const warning = checkDeviceName(device, registered);
    return html`<div class="fields device-fields">
        ${field('name', 'Gerätename', 'esphome name – muss zum bestehenden Gerät passen')}
        ${field('friendlyName', 'Anzeigename')}
        ${field('debugSensorName', 'Debug-Sensor', 'Unverändert lassen, damit diese Karte ihn findet')}
        ${field(
          'useAddress',
          'Adresse fürs Aufspielen',
          'Nur beim Umbenennen: alter Name.local oder IP (use_address)',
        )}
      </div>
      <label class="switch">
        <input
          type="checkbox"
          .checked=${!!device.nameAddMacSuffix}
          @change=${(ev: Event) => this.updateExportSettings({ nameAddMacSuffix: (ev.target as HTMLInputElement).checked })}
        />
        <span
          >name_add_mac_suffix
          <span class="muted"
            >– hängt die letzten 6 Stellen der MAC an den Namen
            an${
              registered.mac
                ? ` (→ ${effectiveDeviceName({ ...device, nameAddMacSuffix: true }, registered.mac)})`
                : ''
            }.
            Die Demo-Firmware nutzt das nicht.</span
          ></span
        >
      </label>
      <label class="switch">
        <input
          type="checkbox"
          .checked=${!!device.allowPlaintextUpload}
          @change=${(ev: Event) =>
            this.updateExportSettings({ allowPlaintextUpload: (ev.target as HTMLInputElement).checked })}
        />
        <span
          >Erstes Aufspielen auf die Werks-Firmware
          <span class="muted"
            >– setzt <code>allow_plaintext_upload</code>, weil die bisherige Firmware noch keine
            OTA-Verschlüsselung kennt. Nach dem ersten erfolgreichen Aufspielen Haken entfernen, Datei neu
            kopieren und noch einmal installieren.</span
          ></span
        >
      </label>
      ${
        device.useAddress
          ? html`<div class="callout info">
              <ha-icon icon="mdi:rename-outline"></ha-icon>
              <span
                >Das Gerät wird beim Aufspielen zu „${effectiveDeviceName(device, registered.mac)}“. Der
                Device Builder erreicht es dafür einmal über <code>${device.useAddress}</code>. Nach dem
                ersten erfolgreichen Aufspielen die Zeile <code>use_address</code> im Device Builder löschen
                und speichern (und das Feld hier leeren).</span
              >
            </div>`
          : warning
            ? html`<div class="callout warning">
                <ha-icon icon="mdi:alert-outline"></ha-icon
                ><span
                  >${warning} Zum Umbenennen den bisherigen Namen (z. B. „…-factory-a7d7f8.local“) oder die IP
                  unter „Adresse fürs Aufspielen“ eintragen.</span
                >
              </div>`
            : nothing
      }`;
  }

  private async copyYaml(yaml: string): Promise<void> {
    this.showToast(
      (await copyText(yaml)) ? 'YAML kopiert.' : 'Kopieren nicht möglich – bitte manuell markieren.',
    );
  }

  // ---- Manual values ----------------------------------------------------------------------------

  private updateOverrides(overrides: Overrides): void {
    this.updateSession(setOverrides(this.session, overrides));
    const indoor = this.session.overrides.indoorAddress;
    this.indoorInput = indoor !== undefined ? formatAddress(indoor, indoor > 0xffff) : '';
  }

  private startEdit(editing: Editing): void {
    this.editing = editing;
  }

  private editButton(label: string, onClick: () => void): TemplateResult {
    return html`<button class="icon edit" title=${label} aria-label=${label} @click=${onClick}>
      <ha-icon icon="mdi:pencil-outline"></ha-icon>
    </button>`;
  }

  private editActions(onSave: () => void, onReset?: () => void): TemplateResult {
    return html`<div class="actions">
      <button class="btn primary" @click=${onSave}><ha-icon icon="mdi:check"></ha-icon>Übernehmen</button>
      <button class="btn text" @click=${() => (this.editing = undefined)}>Abbrechen</button>
      ${
        onReset
          ? html`<button class="btn text danger" @click=${onReset}>
              <ha-icon icon="mdi:restore"></ha-icon>Analyse verwenden
            </button>`
          : nothing
      }
    </div>`;
  }

  /** Inline editor for the indoor station or an outdoor station address. */
  private renderAddressEditor(value: string, error: string | undefined, manual: boolean): TemplateResult {
    const cur = () => this.editing as Extract<Editing, { kind: 'indoor' | 'outdoor' }>;
    const editing = cur();
    const save = () => {
      const address = parseBusAddress(cur().value);
      if (address === undefined) {
        this.editing = { ...cur(), error: '4 oder 6 Hex-Ziffern, z. B. 1016' };
        return;
      }
      const overrides = this.session.overrides;
      if (editing.kind === 'indoor') this.updateOverrides({ ...overrides, indoorAddress: address });
      else {
        const ring = overrides.rings?.[editing.door] ?? {};
        this.updateOverrides({
          ...overrides,
          rings: { ...overrides.rings, [editing.door]: { ...ring, outdoorAddress: address } },
        });
      }
      this.editing = undefined;
    };
    const reset = () => {
      const overrides = this.session.overrides;
      if (editing.kind === 'indoor') this.updateOverrides({ ...overrides, indoorAddress: undefined });
      else {
        const ring = { ...(overrides.rings?.[editing.door] ?? {}) };
        delete ring.outdoorAddress;
        this.updateOverrides({ ...overrides, rings: { ...overrides.rings, [editing.door]: ring } });
      }
      this.editing = undefined;
    };
    return html`<div class="editor">
      <label class="field"
        >Adresse (hex)
        <input
          type="text"
          class=${error ? 'invalid' : ''}
          placeholder="1016"
          .value=${value}
          @input=${(ev: Event) =>
            (this.editing = { ...cur(), value: (ev.target as HTMLInputElement).value, error: undefined })}
          @keydown=${(ev: KeyboardEvent) => ev.key === 'Enter' && save()}
        />
        ${error ? html`<span class="field-error">${error}</span>` : nothing}
      </label>
      ${this.editActions(save, manual ? reset : undefined)}
    </div>`;
  }

  private renderRingResult(t: ExportTarget, result: WizardResult): TemplateResult {
    const ring = result.rings[t.door.key];
    const { threeByte } = result;
    const ok = ring.selected.length > 0;
    const editing = this.editing;
    const editingRing = editing?.kind === 'ring' && editing.door === t.door.key ? editing : undefined;
    const editingOutdoor = editing?.kind === 'outdoor' && editing.door === t.door.key ? editing : undefined;
    const outdoor = t.door.type === 'outdoor';
    return html`<div class="result-row">
      <ha-icon icon=${doorIcon(t.door)}></ha-icon>
      <div>
        <div class="row-head">
          <b>${t.name}</b>
          ${
            outdoor && ring.outdoorAddress !== undefined && !editingOutdoor
              ? html`<span class="muted small">${describeAddress(ring.outdoorAddress, threeByte)}</span>`
              : nothing
          }
          ${ring.outdoorManual ? html`<span class="badge accent">manuell</span>` : nothing}
          ${
            outdoor && !editingOutdoor
              ? this.editButton(`Außenstation ${t.door.name} bearbeiten`, () =>
                  this.startEdit({
                    kind: 'outdoor',
                    door: t.door.key,
                    value:
                      ring.outdoorAddress !== undefined ? hexAddress(ring.outdoorAddress, threeByte) : '',
                  }),
                )
              : nothing
          }
          <span class="spacer"></span>
          ${ring.manual ? html`<span class="badge accent">manuell</span>` : nothing}
          ${
            ok
              ? html`<span class="badge ok">binary_sensor.${t.id}</span>`
              : html`<span class="badge ${ring.captures ? 'warning' : ''}"
                  >${ring.captures ? 'nicht erkannt' : 'nicht aufgenommen'}</span
                >`
          }
        </div>
        ${
          editingOutdoor
            ? this.renderAddressEditor(
                editingOutdoor.value,
                editingOutdoor.error,
                this.session.overrides.rings?.[t.door.key]?.outdoorAddress !== undefined,
              )
            : nothing
        }
        ${
          editingRing
            ? this.renderRingEditor(editingRing, ring)
            : html`${
                  ring.manual
                    ? this.renderManualConditions(ring)
                    : ring.candidates.length > 0
                      ? this.renderCandidates(ring)
                      : nothing
                }
                <button
                  class="btn text small-btn"
                  @click=${() =>
                    this.startEdit({
                      kind: 'ring',
                      door: t.door.key,
                      rows: ring.selected.map((c) => conditionDraft(c, threeByte)),
                      errors: [],
                    })}
                >
                  <ha-icon icon="mdi:pencil-outline"></ha-icon>Bedingungen bearbeiten
                </button>`
        }
      </div>
    </div>`;
  }

  private renderManualConditions(ring: RingResult): TemplateResult {
    const { threeByte } = this.result;
    return html`<div class="candidates">
      ${ring.selected.map(
        (c) =>
          html`<div class="candidate">
            <code
              >Typ ${hex2(c.type)} ${c.src !== undefined ? `von ${formatAddressPlain(c.src, threeByte)}` : ''}
              ${c.dst !== undefined ? `an ${formatAddressPlain(c.dst, threeByte)}` : ''}
              ${c.data ? `· ${formatBytesPlain(c.data)}` : ''}</code
            >
            <span class="badge accent">manuell</span>
          </div>`,
      )}
    </div>`;
  }

  private renderRingEditor(editing: Extract<Editing, { kind: 'ring' }>, ring: RingResult): TemplateResult {
    // Handlers read the current draft: several inputs can fire before the next render.
    const cur = () => this.editing as Extract<Editing, { kind: 'ring' }>;
    const update = (rows: ConditionDraft[]) => (this.editing = { ...cur(), rows, errors: [] });
    const save = () => {
      const parsed = cur().rows.map(parseConditionDraft);
      if (parsed.some((p) => !p.condition)) {
        this.editing = { ...cur(), errors: parsed.map((p) => p.errors) };
        return;
      }
      const overrides = this.session.overrides;
      const current = overrides.rings?.[editing.door] ?? {};
      this.updateOverrides({
        ...overrides,
        rings: {
          ...overrides.rings,
          [editing.door]: { ...current, conditions: parsed.map((p) => p.condition!) },
        },
      });
      this.editing = undefined;
    };
    const reset = () => {
      const overrides = this.session.overrides;
      const current = { ...(overrides.rings?.[editing.door] ?? {}) };
      delete current.conditions;
      this.updateOverrides({ ...overrides, rings: { ...overrides.rings, [editing.door]: current } });
      this.editing = undefined;
    };
    const field = (
      row: ConditionDraft,
      index: number,
      key: keyof ConditionDraft,
      label: string,
      hint: string,
    ) => {
      const error = editing.errors[index]?.[key];
      return html`<label class="field"
        >${label}
        <input
          type="text"
          class=${error ? 'invalid' : ''}
          placeholder=${hint}
          .value=${row[key]}
          @input=${(ev: Event) =>
            update(
              cur().rows.map((r, i) =>
                i === index ? { ...r, [key]: (ev.target as HTMLInputElement).value } : r,
              ),
            )}
        />
        ${error ? html`<span class="field-error">${error}</span>` : nothing}
      </label>`;
    };
    return html`<div class="editor">
      <p class="muted small">
        Eine Bedingung passt, wenn Typ und alle ausgefüllten Felder übereinstimmen; leer = beliebig. Der
        Klingel-Sensor löst aus, wenn irgendeine Bedingung passt.
      </p>
      ${editing.rows.map(
        (row, index) =>
          html`<div class="condition-row">
            ${field(row, index, 'type', 'Typ', '01')} ${field(row, index, 'src', 'Quelle', 'beliebig')}
            ${field(row, index, 'dst', 'Ziel', 'beliebig')} ${field(row, index, 'data', 'Data', 'beliebig')}
            <button
              class="icon"
              title="Bedingung entfernen"
              aria-label="Bedingung entfernen"
              @click=${() => update(cur().rows.filter((_, i) => i !== index))}
            >
              <ha-icon icon="mdi:delete-outline"></ha-icon>
            </button>
          </div>`,
      )}
      <button
        class="btn text small-btn"
        @click=${() => update([...cur().rows, { type: '01', src: '', dst: '', data: '' }])}
      >
        <ha-icon icon="mdi:plus"></ha-icon>Bedingung hinzufügen
      </button>
      ${this.editActions(save, ring.manual ? reset : undefined)}
    </div>`;
  }

  private renderOpenResult(t: ExportTarget, result: WizardResult): TemplateResult {
    const open = result.opens[t.door.key];
    const recorded = stepRecord(this.session, openStepId(t.door)).captures.length > 0;
    const editing =
      this.editing?.kind === 'open' && this.editing.door === t.door.key ? this.editing : undefined;
    return html`<div class="result-row">
      <ha-icon icon=${t.icon}></ha-icon>
      <div>
        <div class="row-head">
          <b>${t.name}</b>
          ${open?.manual ? html`<span class="badge accent">manuell</span>` : nothing}
          ${
            !editing
              ? this.editButton(`Öffnen-Frame ${t.door.name} bearbeiten`, () =>
                  this.startEdit({
                    kind: 'open',
                    door: t.door.key,
                    draft: openDraft(open ?? undefined, result.threeByte),
                    errors: {},
                  }),
                )
              : nothing
          }
          <span class="spacer"></span>
          ${
            open
              ? html`<span class="badge ok">lock.${t.id}</span>`
              : html`<span class="badge ${recorded ? 'warning' : ''}"
                  >${recorded ? 'nicht erkannt' : 'nicht aufgenommen'}</span
                >`
          }
        </div>
        ${editing ? this.renderOpenEditor(editing, !!open?.manual) : open ? this.renderOpen(open) : nothing}
        ${open ? this.renderFrameTest(t, open) : nothing}
      </div>
    </div>`;
  }

  private async runFrameTest(door: string, service: string, payload: SendFramePayload): Promise<void> {
    if (!this._hass) return;
    this.frameTest = { door, phase: 'sending', payload };
    try {
      await sendTestFrame(this._hass as unknown as Parameters<typeof sendTestFrame>[0], service, payload);
      if (this.frameTest?.door === door && this.frameTest.phase === 'sending') {
        this.frameTest = { ...this.frameTest, phase: 'waiting' };
      }
      window.clearTimeout(this.frameTestTimer);
      this.frameTestTimer = window.setTimeout(() => {
        if (this.frameTest?.door === door && this.frameTest.phase === 'waiting') {
          this.frameTest = { ...this.frameTest, phase: 'noreply' };
        }
      }, REPLY_TIMEOUT_MS);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : ((err as { message?: string })?.message ?? String(err));
      this.frameTest = { door, phase: 'error', payload, message };
    }
  }

  /** "Testen": send the shown open frame through the firmware's send_frame action, after confirmation. */
  private renderFrameTest(t: ExportTarget, open: OpenResult): TemplateResult | typeof nothing {
    const indoor = this.result.indoor;
    if (!indoor || this.editing) return nothing;
    const { threeByte } = this.result;
    if (this._hass?.user?.is_admin !== true) {
      return html`<p class="muted small">Live-Test nur für Administratoren.</p>`;
    }
    const service = findSendFrameService(
      this._hass.services,
      effectiveDeviceName(this.device, this.registeredDevice.mac),
    );
    if (!service) {
      return html`<p class="muted small">
        <button class="btn text small-btn" disabled><ha-icon icon="mdi:send"></ha-icon>Testen</button>
        Zum Testen die komplette Datei (mit Aktion <code>send_frame</code>) auf den ESP32 spielen – danach
        erscheint der Test hier.
      </p>`;
    }
    const payload = sendFramePayload(indoor.address, open, threeByte);
    const test = this.frameTest?.door === t.door.key ? this.frameTest : undefined;
    const frameText = `[${formatAddressPlain(payload.source, threeByte)} > ${formatAddressPlain(
      payload.destination,
      threeByte,
    )}] ${hex2(payload.message_type)} ${
      this.showDoorCode ? formatBytesPlain(payload.data) : payload.data.map(() => '••').join(' ')
    }`;
    const reset = () => (this.frameTest = undefined);
    switch (test?.phase) {
      case 'confirm':
        return html`<div class="callout warning">
          <ha-icon icon="mdi:door-open"></ha-icon>
          <span
            >Sendet <code>${frameText}</code> auf den Bus – „${t.door.name}“ öffnet sich wirklich.
            <span class="actions" style="margin-top:8px">
              <button class="btn primary" @click=${() => this.runFrameTest(t.door.key, service, payload)}>
                <ha-icon icon="mdi:send"></ha-icon>Senden
              </button>
              <button class="btn text" @click=${reset}>Abbrechen</button>
            </span></span
          >
        </div>`;
      case 'sending':
      case 'waiting':
        return html`<div class="callout info" role="status">
          <ha-icon icon="mdi:timer-sand"></ha-icon><span>Gesendet – warte auf die Bestätigung der Tür …</span>
        </div>`;
      case 'confirmed':
        return html`<div class="callout ok" role="status">
          <ha-icon icon="mdi:check-circle-outline"></ha-icon>
          <span
            >Bestätigt: ${test.message}. Der Öffnen-Frame funktioniert.
            <button class="btn text small-btn" @click=${reset}>OK</button></span
          >
        </div>`;
      case 'noreply':
        return html`<div class="callout warning" role="status">
          <ha-icon icon="mdi:help-circle-outline"></ha-icon>
          <span
            >Keine Bestätigung (${hex2(payload.message_type | 0x80)}) empfangen. Ging die Tür trotzdem auf,
            stimmt der Befehl; sonst Ziel, Typ und Data prüfen.
            <button class="btn text small-btn" @click=${reset}>OK</button></span
          >
        </div>`;
      case 'error':
        return html`<div class="callout error" role="status">
          <ha-icon icon="mdi:alert-circle-outline"></ha-icon>
          <span
            >Senden fehlgeschlagen: ${test.message}
            <button class="btn text small-btn" @click=${reset}>OK</button></span
          >
        </div>`;
      default:
        return html`<button
          class="btn small-btn"
          ?disabled=${!!this.frameTest && ['confirm', 'sending', 'waiting'].includes(this.frameTest.phase)}
          @click=${() => (this.frameTest = { door: t.door.key, phase: 'confirm', payload })}
        >
          <ha-icon icon="mdi:send"></ha-icon>Testen
        </button>`;
    }
  }

  private renderOpenEditor(editing: Extract<Editing, { kind: 'open' }>, manual: boolean): TemplateResult {
    const cur = () => this.editing as Extract<Editing, { kind: 'open' }>;
    const save = () => {
      const parsed = parseOpenDraft(cur().draft);
      if (!parsed.open) {
        this.editing = { ...cur(), errors: parsed.errors };
        return;
      }
      const overrides = this.session.overrides;
      this.updateOverrides({ ...overrides, opens: { ...overrides.opens, [editing.door]: parsed.open } });
      this.editing = undefined;
    };
    const reset = () => {
      const opens = { ...this.session.overrides.opens };
      delete opens[editing.door];
      this.updateOverrides({ ...this.session.overrides, opens });
      this.editing = undefined;
    };
    const field = (key: keyof OpenDraft, label: string, hint: string) => {
      const error = editing.errors[key];
      return html`<label class="field"
        >${label}
        <input
          type="text"
          class=${error ? 'invalid' : ''}
          placeholder=${hint}
          .value=${editing.draft[key]}
          @input=${(ev: Event) =>
            (this.editing = {
              ...cur(),
              draft: { ...cur().draft, [key]: (ev.target as HTMLInputElement).value },
              errors: {},
            })}
        />
        ${error ? html`<span class="field-error">${error}</span>` : nothing}
      </label>`;
    };
    return html`<div class="editor">
      <p class="muted small">
        Der Befehl, den die Innenstation zum Öffnen sendet (Quelle ist immer die Innenstation). Data ist der
        Türcode – nicht öffentlich teilen.
      </p>
      <div class="condition-row open-row">
        ${field('destination', 'Ziel', '4002')} ${field('type', 'Typ', '0D')}
        ${field('data', 'Data', '1C 41 68')}
      </div>
      ${this.editActions(save, manual ? reset : undefined)}
    </div>`;
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
    return html`${
        open.derived
          ? html`<span class="badge warning" title="Kein 0D/0E empfangen – aus der Bestätigung abgeleitet"
              >abgeleitet – unbestätigt</span
            >`
          : nothing
      }
      <dl class="kv" style="margin:6px 0 0">
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
