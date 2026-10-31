import { css } from 'lit';

export const doorCardStyles = css`
  :host {
    --door-accent: var(--primary-color, #1a73e8);
    --door-on-accent: var(--text-primary-color, #fff);
    --door-text: var(--primary-text-color, #1b1c1f);
    --door-muted: var(--secondary-text-color, #5d636c);
    --door-line: var(--divider-color, rgba(0, 0, 0, 0.12));
    --door-surface: color-mix(in srgb, var(--door-text) 5%, transparent);
    --door-track: color-mix(in srgb, var(--door-text) 9%, transparent);
    /* Slider knob stays white in light and dark themes (like iOS); key buttons use the card colour. */
    --door-knob: #fff;
    --door-face: var(--card-background-color, #fff);
    --door-ok: var(--success-color, #43a047);
    --door-warn: var(--warning-color, #ef8f00);
    --door-error: var(--error-color, #db4437);
    --door-radius: 18px;
    display: block;
  }
  ha-card {
    color: var(--door-text);
    padding: 16px;
  }
  .title {
    margin: 0 0 12px;
    font-size: 1.15rem;
    font-weight: 600;
  }
  .empty {
    color: var(--door-muted);
  }
  ha-icon {
    --mdc-icon-size: 22px;
  }

  /* ---- Shared parts ---------------------------------------------------------------- */
  .head {
    display: flex;
    align-items: center;
    gap: 10px;
    min-width: 0;
  }
  .head-main,
  .keytile-head {
    all: unset;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
    flex: 1;
    border-radius: 12px;
  }
  .head-main:focus-visible,
  .keytile-head:focus-visible {
    outline: 2px solid var(--door-accent);
    outline-offset: 3px;
  }
  .ico {
    flex: none;
    width: 40px;
    height: 40px;
    border-radius: 12px;
    display: grid;
    place-items: center;
    color: var(--tone);
    background: color-mix(in srgb, var(--tone) 15%, transparent);
    transition:
      background 0.3s,
      color 0.3s;
  }
  .tone-locked {
    --tone: var(--door-ok);
  }
  .tone-open {
    --tone: var(--door-warn);
  }
  .tone-busy {
    --tone: var(--door-accent);
  }
  .tone-problem {
    --tone: var(--door-error);
  }
  .tone-unavailable {
    --tone: var(--door-muted);
  }
  .ico.tone-ring {
    background: var(--door-accent);
    color: var(--door-on-accent);
  }
  .txt {
    display: flex;
    flex-direction: column;
    min-width: 0;
  }
  .name {
    font-size: 15px;
    font-weight: 600;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .state {
    font-size: 13px;
    color: var(--door-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .badge {
    flex: none;
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 4px 10px 4px 7px;
    border-radius: 999px;
    background: var(--door-accent);
    color: var(--door-on-accent);
    font-size: 12px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
    --mdc-icon-size: 15px;
  }
  .mini {
    flex: none;
    width: 36px;
    height: 36px;
    padding: 0;
    border-radius: 50%;
    border: 1px solid var(--door-line);
    background: transparent;
    color: var(--door-text);
    display: grid;
    place-items: center;
    cursor: pointer;
    --mdc-icon-size: 18px;
  }
  .camera {
    width: 100%;
    aspect-ratio: 16 / 9;
    object-fit: cover;
    border-radius: 12px;
    background: var(--door-track);
  }
  .hint {
    font-size: 12px;
    color: var(--door-muted);
  }
  .hint.error {
    color: var(--door-error);
  }
  button:focus-visible {
    outline: 2px solid var(--door-accent);
    outline-offset: 2px;
  }

  /* ---- Slider ("zum Öffnen schieben") --------------------------------------------- */
  .slider {
    position: relative;
    height: 48px;
    border-radius: 24px;
    background: var(--door-track);
    overflow: hidden;
    user-select: none;
    -webkit-user-select: none;
    transition: background 0.3s;
  }
  .slider.small {
    height: 40px;
    width: 140px;
    flex: none;
  }
  .slabel {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    padding-left: 36px;
    font-size: 13px;
    font-weight: 500;
    color: var(--door-muted);
    opacity: var(--fade, 1);
    pointer-events: none;
    white-space: nowrap;
  }
  .slider.small .slabel {
    padding-left: 30px;
    font-size: 12px;
  }
  .knob {
    position: absolute;
    top: 4px;
    left: 4px;
    width: 40px;
    height: 40px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: var(--door-knob);
    color: var(--door-accent);
    display: grid;
    place-items: center;
    cursor: grab;
    touch-action: none;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.2);
    transform: translateX(var(--x, 0));
    transition:
      transform 0.3s cubic-bezier(0.2, 0.8, 0.2, 1),
      left 0.4s cubic-bezier(0.2, 0.8, 0.2, 1),
      color 0.3s;
  }
  .slider.small .knob {
    width: 32px;
    height: 32px;
    --mdc-icon-size: 18px;
  }
  .slider.dragging .knob {
    transition: none;
    cursor: grabbing;
  }
  .slider.filled {
    background: var(--door-accent);
  }
  .slider.filled .slabel {
    color: var(--door-on-accent);
  }
  .slider.done,
  .slider.failed,
  .slider.busy {
    background: var(--door-ok);
  }
  .slider.failed {
    background: var(--door-error);
  }
  .slider.busy {
    background: var(--door-accent);
  }
  .slider.done .slabel,
  .slider.failed .slabel,
  .slider.busy .slabel {
    color: #fff;
    opacity: 1;
    padding-left: 0;
    padding-right: 44px;
  }
  .slider.done .knob,
  .slider.failed .knob,
  .slider.busy .knob {
    left: calc(100% - 44px);
    transform: none;
  }
  .slider.small.done .knob,
  .slider.small.failed .knob,
  .slider.small.busy .knob {
    left: calc(100% - 36px);
  }
  .slider.done .knob {
    color: var(--door-ok);
  }
  .slider.failed .knob {
    color: var(--door-error);
  }
  .slider.disabled {
    opacity: 0.45;
  }

  /* ---- Press button (hold / tap / dialog) ----------------------------------------- */
  .press {
    position: relative;
    overflow: hidden;
    font: inherit;
    font-size: 14px;
    font-weight: 500;
    min-height: 48px;
    padding: 0 18px;
    border: none;
    border-radius: 24px;
    background: color-mix(in srgb, var(--door-accent) 14%, transparent);
    color: var(--door-accent);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
    touch-action: none;
    --mdc-icon-size: 20px;
  }
  .press.full {
    width: 100%;
  }
  .press.small {
    min-height: 40px;
    padding: 0 14px;
    font-size: 13px;
    flex: none;
  }
  .press.filled {
    background: var(--door-accent);
    color: var(--door-on-accent);
  }
  .press.done {
    background: var(--door-ok);
    color: #fff;
  }
  .press.failed {
    background: var(--door-error);
    color: #fff;
  }
  .press > * {
    position: relative;
  }
  .press::before,
  .chip::before {
    content: '';
    position: absolute;
    inset: 0;
    background: color-mix(in srgb, var(--door-accent) 30%, transparent);
    transform: scaleX(0);
    transform-origin: left;
  }
  .press.filled::before {
    background: rgba(255, 255, 255, 0.3);
  }
  .press.holding::before,
  .chip.holding::before {
    transform: scaleX(1);
    transition: transform var(--hold-ms, 800ms) linear;
  }
  .press:disabled {
    opacity: 0.5;
    cursor: default;
  }

  /* ---- A · Tiles ------------------------------------------------------------------- */
  .tiles {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 240px), 1fr));
    gap: 12px;
  }
  .tile {
    display: flex;
    flex-direction: column;
    gap: 14px;
    padding: 14px;
    border-radius: var(--door-radius);
    background: var(--door-surface);
    outline: 2px solid transparent;
    transition:
      outline-color 0.3s,
      background 0.3s;
  }
  .tile > .slider,
  .tile > .press {
    margin-top: auto;
  }
  .tile.ringing {
    grid-column: 1 / -1;
    outline-color: var(--door-accent);
    background: color-mix(in srgb, var(--door-accent) 9%, transparent);
  }

  /* ---- A · Rows -------------------------------------------------------------------- */
  .rows {
    display: flex;
    flex-direction: column;
  }
  .row {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 12px 0;
    border-top: 1px solid var(--door-line);
  }
  .row:first-child {
    border-top: none;
  }
  .row.ringing {
    border-top: none;
    margin-bottom: 6px;
    padding: 12px;
    border-radius: var(--door-radius);
    background: color-mix(in srgb, var(--door-accent) 12%, transparent);
  }
  .row.ringing + .row {
    border-top: none;
  }

  /* ---- B · Round key buttons ------------------------------------------------------- */
  .buttons {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 170px), 1fr));
    gap: 12px;
  }
  .keytile {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    padding: 16px 14px 18px;
    border-radius: 22px;
    background: var(--door-surface);
    text-align: center;
    transition:
      background 0.3s,
      color 0.3s;
  }
  .keytile-head {
    flex-direction: column;
    gap: 2px;
    align-items: center;
    flex: none;
    max-width: 100%;
  }
  .dot {
    display: inline-block;
    width: 8px;
    height: 8px;
    margin-right: 6px;
    border-radius: 50%;
    background: var(--tone);
    vertical-align: 1px;
  }
  .keytile.ringing {
    background: var(--door-accent);
    color: var(--door-on-accent);
  }
  .keytile.ringing .state,
  .keytile.ringing .keyhint {
    color: var(--door-on-accent);
  }
  .keytile.ringing .dot {
    background: var(--door-on-accent);
  }
  .key {
    position: relative;
    width: 104px;
    height: 104px;
    padding: 0;
    border: none;
    background: transparent;
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
    touch-action: none;
    border-radius: 50%;
  }
  .key:disabled {
    opacity: 0.5;
    cursor: default;
  }
  .ring {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    transform: rotate(-90deg);
  }
  .ring circle {
    fill: none;
    stroke-width: 4;
    stroke-linecap: round;
  }
  .ring-bg {
    stroke: var(--door-track);
  }
  .ring-fg {
    stroke: var(--door-accent);
  }
  .key.holding .ring-fg {
    stroke-dashoffset: 0 !important;
    transition: stroke-dashoffset var(--hold-ms, 800ms) linear;
  }
  .keytile.ringing .ring-bg {
    stroke: rgba(255, 255, 255, 0.35);
  }
  .keytile.ringing .ring-fg {
    stroke: #fff;
  }
  .face {
    position: absolute;
    inset: 10px;
    border-radius: 50%;
    display: grid;
    place-items: center;
    background: var(--door-face);
    color: var(--door-accent);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
    transition:
      background 0.3s,
      color 0.3s;
    --mdc-icon-size: 34px;
  }
  .face.idle {
    position: static;
    width: 84px;
    height: 84px;
    color: var(--door-muted);
    box-shadow: none;
    background: var(--door-track);
  }
  .keytile.done .face {
    background: var(--door-ok);
    color: #fff;
  }
  .keyhint {
    font-size: 12px;
    font-weight: 500;
    color: var(--door-muted);
  }

  /* ---- C · Status bar -------------------------------------------------------------- */
  .bar {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }
  .chip {
    position: relative;
    overflow: hidden;
    font: inherit;
    display: inline-flex;
    align-items: center;
    gap: 10px;
    min-height: 52px;
    padding: 6px 14px 6px 6px;
    border-radius: 16px;
    border: 1px solid transparent;
    background: var(--door-surface);
    color: var(--door-text);
    text-align: left;
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
    touch-action: none;
  }
  .chip > * {
    position: relative;
  }
  .chip .ico {
    width: 36px;
    height: 36px;
    border-radius: 11px;
    --mdc-icon-size: 20px;
  }
  .chip .name {
    font-size: 14px;
  }
  .chip .state {
    font-size: 12px;
  }
  .chip.ringing {
    border-color: var(--door-accent);
  }
  .chip.done .ico {
    background: var(--door-ok);
    color: #fff;
  }
  .chip:disabled {
    opacity: 0.6;
    cursor: default;
  }
  .hero {
    display: flex;
    flex-direction: column;
    gap: 14px;
    margin-bottom: 12px;
    padding: 16px;
    border-radius: var(--door-radius);
    background: var(--door-accent);
    color: var(--door-on-accent);
    transition: background 0.3s;
  }
  .hero.done {
    background: var(--door-ok);
  }
  .hero-top {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .hero-ico {
    flex: none;
    width: 46px;
    height: 46px;
    border-radius: 14px;
    display: grid;
    place-items: center;
    background: rgba(255, 255, 255, 0.2);
    --mdc-icon-size: 26px;
  }
  .hero-title {
    font-size: 18px;
    font-weight: 600;
  }
  .hero-text {
    font-size: 13px;
    opacity: 0.9;
  }
  .count {
    margin-left: auto;
    font-size: 24px;
    font-weight: 600;
    font-variant-numeric: tabular-nums;
  }
  .hero-actions {
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .hero-actions > .slider,
  .hero-actions > .press {
    flex: 1;
  }
  .hero .slider.filled {
    background: rgba(255, 255, 255, 0.22);
  }
  .hero .press.filled {
    background: #fff;
    color: var(--door-accent);
  }
  .hero .hint {
    color: var(--door-on-accent);
  }
  .ghost {
    flex: none;
    font: inherit;
    font-size: 13px;
    font-weight: 500;
    padding: 10px 14px;
    border-radius: 999px;
    border: 1px solid rgba(255, 255, 255, 0.55);
    background: transparent;
    color: inherit;
    cursor: pointer;
  }

  @media (prefers-reduced-motion: reduce) {
    .knob,
    .tile,
    .press::before,
    .chip::before {
      transition: none !important;
    }
  }
`;
