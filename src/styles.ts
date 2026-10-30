import { css } from 'lit';

export const cardStyles = css`
  :host {
    --wiz-accent: var(--primary-color, #03a9f4);
    --wiz-text: var(--primary-text-color, #212121);
    --wiz-muted: var(--secondary-text-color, #727272);
    --wiz-divider: var(--divider-color, rgba(0, 0, 0, 0.12));
    --wiz-surface: var(--secondary-background-color, rgba(127, 127, 127, 0.08));
    --wiz-ok: var(--success-color, #43a047);
    --wiz-warn: var(--warning-color, #ffa600);
    --wiz-error: var(--error-color, #db4437);
    --wiz-info: var(--info-color, #039be5);
    --wiz-radius: var(--ha-card-border-radius, 12px);
    --wiz-mono: var(--code-font-family, ui-monospace, SFMono-Regular, Menlo, Consolas, monospace);
    display: block;
  }

  ha-card {
    overflow: hidden;
    color: var(--wiz-text);
  }

  .header {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px 16px 8px;
  }
  .header .title {
    flex: 1;
    min-width: 0;
  }
  .header h1 {
    margin: 0;
    font-size: 1.25rem;
    font-weight: 500;
    line-height: 1.3;
  }
  @media (max-width: 420px) {
    .header .header-icon {
      display: none;
    }
  }
  .header .subtitle {
    color: var(--wiz-muted);
    font-size: 0.875rem;
  }
  .header-icon {
    display: grid;
    place-items: center;
    width: 40px;
    height: 40px;
    border-radius: 50%;
    background: color-mix(in srgb, var(--wiz-accent) 15%, transparent);
    color: var(--wiz-accent);
    flex: none;
  }

  /* Stepper */
  .stepper {
    display: flex;
    gap: 4px;
    padding: 8px 16px 12px;
    overflow-x: auto;
    scrollbar-width: none;
  }
  .stepper::-webkit-scrollbar {
    display: none;
  }
  .stepper button {
    all: unset;
    cursor: pointer;
    flex: 1 0 auto;
    min-width: 34px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
    font-size: 0.7rem;
    color: var(--wiz-muted);
    text-align: center;
  }
  .stepper button:focus-visible .dot {
    outline: 2px solid var(--wiz-accent);
    outline-offset: 2px;
  }
  .stepper .dot {
    display: grid;
    place-items: center;
    width: 30px;
    height: 30px;
    border-radius: 50%;
    border: 2px solid var(--wiz-divider);
    background: var(--card-background-color, transparent);
    --mdc-icon-size: 16px;
    transition:
      background 0.2s,
      border-color 0.2s;
  }
  .stepper .done .dot {
    border-color: var(--wiz-ok);
    color: var(--wiz-ok);
  }
  .stepper .skipped .dot {
    border-style: dashed;
  }
  .stepper .current {
    color: var(--wiz-text);
    font-weight: 500;
  }
  .stepper .current .dot {
    border-color: var(--wiz-accent);
    background: var(--wiz-accent);
    color: var(--text-primary-color, #fff);
  }
  .stepper .label {
    max-width: 72px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .progress {
    height: 3px;
    background: var(--wiz-divider);
  }
  .progress > div {
    height: 100%;
    background: var(--wiz-accent);
    transition: width 0.3s;
  }

  .content {
    padding: 16px;
    display: grid;
    gap: 16px;
  }
  h2 {
    margin: 0;
    font-size: 1.1rem;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
  }
  h3 {
    margin: 0 0 8px;
    font-size: 0.95rem;
    font-weight: 500;
  }
  p {
    margin: 0;
    line-height: 1.5;
  }
  .muted {
    color: var(--wiz-muted);
  }
  .small {
    font-size: 0.85rem;
  }
  ol.todo {
    margin: 0;
    padding-left: 1.4em;
    display: grid;
    gap: 6px;
    line-height: 1.45;
  }
  details {
    border-radius: 8px;
    background: var(--wiz-surface);
    padding: 8px 12px;
  }
  details summary {
    cursor: pointer;
    color: var(--wiz-muted);
    font-size: 0.875rem;
  }
  details[open] summary {
    margin-bottom: 6px;
  }

  /* Panels and callouts */
  .panel {
    border: 1px solid var(--wiz-divider);
    border-radius: var(--wiz-radius);
    padding: 12px;
    display: grid;
    gap: 10px;
  }
  .callout {
    display: flex;
    gap: 10px;
    align-items: flex-start;
    border-radius: 8px;
    padding: 10px 12px;
    font-size: 0.875rem;
    line-height: 1.45;
    background: color-mix(in srgb, var(--callout-color) 12%, transparent);
    --mdc-icon-size: 20px;
  }
  .callout ha-icon {
    color: var(--callout-color);
    flex: none;
  }
  .callout.info {
    --callout-color: var(--wiz-info);
  }
  .callout.ok {
    --callout-color: var(--wiz-ok);
  }
  .callout.warning {
    --callout-color: var(--wiz-warn);
  }
  .callout.error {
    --callout-color: var(--wiz-error);
  }

  .badge {
    display: inline-flex;
    align-items: center;
    gap: 4px;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 500;
    background: color-mix(in srgb, var(--badge-color, var(--wiz-muted)) 15%, transparent);
    color: var(--badge-color, var(--wiz-muted));
    white-space: nowrap;
    --mdc-icon-size: 14px;
  }
  .badge.ok {
    --badge-color: var(--wiz-ok);
  }
  .badge.warning {
    --badge-color: var(--wiz-warn);
  }
  .badge.error {
    --badge-color: var(--wiz-error);
  }
  .badge.accent {
    --badge-color: var(--wiz-accent);
  }

  /* Form */
  .fields {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(90px, 1fr));
    gap: 8px;
  }
  label.field {
    display: grid;
    gap: 4px;
    font-size: 0.75rem;
    color: var(--wiz-muted);
  }
  input[type='number'],
  input[type='text'] {
    font: inherit;
    font-size: 1rem;
    color: var(--wiz-text);
    background: var(--wiz-surface);
    border: 1px solid var(--wiz-divider);
    border-radius: 8px;
    padding: 8px 10px;
    min-width: 0;
  }
  input:focus {
    outline: 2px solid var(--wiz-accent);
    outline-offset: -1px;
  }
  input.invalid {
    border-color: var(--wiz-error);
  }
  .switch {
    display: flex;
    align-items: flex-start;
    gap: 8px;
    font-size: 0.875rem;
    cursor: pointer;
  }

  /* Export */
  .segmented {
    display: inline-flex;
    border: 1px solid var(--wiz-divider);
    border-radius: 999px;
    padding: 2px;
    gap: 2px;
    justify-self: start;
    flex-wrap: wrap;
  }
  .segmented button {
    font: inherit;
    font-size: 0.85rem;
    border: none;
    background: transparent;
    color: var(--wiz-text);
    padding: 6px 14px;
    border-radius: 999px;
    cursor: pointer;
  }
  .segmented button.active {
    background: var(--wiz-accent);
    color: var(--text-primary-color, #fff);
  }
  .segmented button:focus-visible {
    outline: 2px solid var(--wiz-accent);
    outline-offset: 1px;
  }
  .device-fields {
    grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
  }
  .device-fields label.field span {
    font-size: 0.7rem;
  }

  /* Door editor */
  .doors {
    display: grid;
    gap: 8px;
  }
  .door-row {
    display: grid;
    gap: 6px;
    padding: 8px;
    border-radius: 8px;
    background: var(--wiz-surface);
  }
  .door-main {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  .door-main ha-icon {
    color: var(--wiz-muted);
    flex: none;
  }
  .door-main input {
    flex: 1;
    background: var(--card-background-color, transparent);
  }
  .door-options {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 6px 16px;
    padding-left: 32px;
  }
  select {
    font: inherit;
    font-size: 0.875rem;
    color: var(--wiz-text);
    background: var(--card-background-color, transparent);
    border: 1px solid var(--wiz-divider);
    border-radius: 8px;
    padding: 6px 8px;
    max-width: 100%;
  }
  .switch:has(input:disabled) {
    opacity: 0.5;
  }

  /* Buttons */
  .actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    align-items: center;
  }
  button.btn {
    font: inherit;
    font-size: 0.875rem;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 36px;
    padding: 0 14px;
    border-radius: 999px;
    border: 1px solid var(--wiz-divider);
    background: transparent;
    color: var(--wiz-accent);
    cursor: pointer;
    --mdc-icon-size: 18px;
    transition:
      background 0.15s,
      opacity 0.15s;
  }
  button.btn:hover {
    background: color-mix(in srgb, var(--wiz-accent) 8%, transparent);
  }
  button.btn:focus-visible {
    outline: 2px solid var(--wiz-accent);
    outline-offset: 2px;
  }
  button.btn.primary {
    background: var(--wiz-accent);
    border-color: var(--wiz-accent);
    color: var(--text-primary-color, #fff);
  }
  button.btn.primary:hover {
    background: color-mix(in srgb, var(--wiz-accent) 85%, black);
  }
  button.btn.large {
    min-height: 44px;
    padding: 0 20px;
    font-size: 0.95rem;
  }
  button.btn.text {
    border-color: transparent;
  }
  button.btn.danger {
    color: var(--wiz-error);
  }
  button.btn:disabled {
    opacity: 0.4;
    cursor: default;
  }
  button.icon {
    all: unset;
    cursor: pointer;
    display: grid;
    place-items: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    color: var(--wiz-muted);
    --mdc-icon-size: 20px;
  }
  button.icon:disabled {
    opacity: 0.3;
    cursor: default;
  }
  button.icon:hover {
    background: var(--wiz-surface);
  }
  button.icon:focus-visible {
    outline: 2px solid var(--wiz-accent);
  }

  /* Capture */
  .capture {
    display: flex;
    gap: 16px;
    align-items: center;
  }
  .ring {
    position: relative;
    width: 72px;
    height: 72px;
    flex: none;
  }
  .ring svg {
    transform: rotate(-90deg);
  }
  .ring circle {
    fill: none;
    stroke-width: 6;
  }
  .ring .track {
    stroke: var(--wiz-divider);
  }
  .ring .bar {
    stroke: var(--wiz-accent);
    stroke-linecap: round;
    transition: stroke-dashoffset 0.25s linear;
  }
  .ring .value {
    position: absolute;
    inset: 0;
    display: grid;
    place-items: center;
    font-size: 1.3rem;
    font-weight: 500;
    font-variant-numeric: tabular-nums;
  }
  .pulse {
    width: 72px;
    height: 72px;
    flex: none;
    border-radius: 50%;
    display: grid;
    place-items: center;
    color: var(--wiz-accent);
    background: color-mix(in srgb, var(--wiz-accent) 15%, transparent);
    animation: pulse 1.6s ease-in-out infinite;
    --mdc-icon-size: 32px;
  }
  @keyframes pulse {
    50% {
      box-shadow: 0 0 0 10px color-mix(in srgb, var(--wiz-accent) 0%, transparent);
      background: color-mix(in srgb, var(--wiz-accent) 25%, transparent);
    }
    0%,
    100% {
      box-shadow: 0 0 0 0 color-mix(in srgb, var(--wiz-accent) 35%, transparent);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .pulse {
      animation: none;
    }
  }
  .reps {
    display: flex;
    gap: 6px;
    align-items: center;
  }
  .reps span {
    width: 10px;
    height: 10px;
    border-radius: 50%;
    background: var(--wiz-divider);
  }
  .reps span.filled {
    background: var(--wiz-ok);
  }

  /* Lists */
  .captures {
    display: grid;
    gap: 6px;
  }
  .capture-row {
    border-radius: 8px;
    background: var(--wiz-surface);
  }
  .capture-row summary {
    list-style: none;
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 6px 6px 6px 12px;
    cursor: pointer;
    color: var(--wiz-text);
  }
  .capture-row summary::-webkit-details-marker {
    display: none;
  }
  .capture-row summary .grow {
    flex: 1;
  }
  .capture-row .frames {
    padding: 0 8px 8px;
  }

  .frames {
    display: grid;
    gap: 2px;
    max-height: 260px;
    overflow-y: auto;
    font-family: var(--wiz-mono);
    font-size: 0.78rem;
  }
  .frame {
    display: grid;
    grid-template-columns: auto auto 1fr;
    gap: 8px;
    align-items: baseline;
    padding: 3px 6px;
    border-radius: 6px;
  }
  .frame .time {
    color: var(--wiz-muted);
  }
  .frame .route {
    white-space: nowrap;
  }
  .frame .detail {
    overflow-wrap: anywhere;
  }
  .frame.own {
    background: color-mix(in srgb, var(--wiz-accent) 10%, transparent);
  }
  .frame.foreign {
    opacity: 0.55;
  }
  .frame.unparsed {
    color: var(--wiz-warn);
  }
  .frame .type {
    font-weight: 600;
  }
  .empty {
    color: var(--wiz-muted);
    font-size: 0.85rem;
    padding: 8px 0;
    text-align: center;
  }
  .live-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--wiz-ok);
    display: inline-block;
  }
  .live-dot.off {
    background: var(--wiz-muted);
  }

  /* Results */
  .grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
    gap: 12px;
  }
  .stat {
    display: grid;
    gap: 2px;
  }
  .stat .value {
    font-size: 1.3rem;
    font-weight: 500;
    font-family: var(--wiz-mono);
  }
  .row-head {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px 8px;
  }
  .row-head .spacer {
    flex: 1;
  }
  .result-row {
    display: grid;
    grid-template-columns: auto 1fr;
    gap: 10px;
    align-items: start;
    padding: 10px 0;
    border-top: 1px solid var(--wiz-divider);
  }
  .result-row:first-of-type {
    border-top: none;
  }
  .result-row > ha-icon {
    color: var(--wiz-muted);
    margin-top: 2px;
  }
  .candidates {
    display: grid;
    gap: 4px;
    margin-top: 6px;
  }
  .candidate {
    display: grid;
    grid-template-columns: 1fr 64px;
    gap: 8px;
    align-items: center;
    font-size: 0.8rem;
  }
  .candidate code {
    font-family: var(--wiz-mono);
    overflow-wrap: anywhere;
  }
  .candidate.unselected {
    opacity: 0.55;
  }
  .meter {
    height: 6px;
    border-radius: 3px;
    background: var(--wiz-divider);
    overflow: hidden;
  }
  .meter > div {
    height: 100%;
    background: var(--wiz-ok);
  }
  .meter.partial > div {
    background: var(--wiz-warn);
  }
  .kv {
    display: grid;
    grid-template-columns: max-content 1fr;
    gap: 2px 12px;
    font-size: 0.85rem;
  }
  .kv dt {
    color: var(--wiz-muted);
  }
  .kv dd {
    margin: 0;
    font-family: var(--wiz-mono);
  }
  pre.yaml {
    margin: 0;
    padding: 12px;
    border-radius: 8px;
    background: var(--code-editor-background-color, var(--wiz-surface));
    font-family: var(--wiz-mono);
    font-size: 0.75rem;
    line-height: 1.5;
    max-height: 420px;
    overflow: auto;
    white-space: pre;
  }

  .footer {
    display: flex;
    gap: 8px;
    align-items: center;
    padding: 12px 16px 16px;
    border-top: 1px solid var(--wiz-divider);
  }
  .footer .spacer {
    flex: 1;
  }
  .toast {
    font-size: 0.85rem;
    color: var(--wiz-ok);
  }
  input[type='file'] {
    display: none;
  }
`;
