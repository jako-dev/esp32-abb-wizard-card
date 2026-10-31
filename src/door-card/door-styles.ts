import { css } from 'lit';

export const doorCardStyles = css`
  :host {
    --door-accent: var(--primary-color, #03a9f4);
    --door-text: var(--primary-text-color, #212121);
    --door-muted: var(--secondary-text-color, #727272);
    --door-divider: var(--divider-color, rgba(0, 0, 0, 0.12));
    --door-surface: var(--secondary-background-color, rgba(127, 127, 127, 0.08));
    --door-ok: var(--success-color, #43a047);
    --door-warn: var(--warning-color, #ffa600);
    --door-error: var(--error-color, #db4437);
    --door-radius: var(--ha-card-border-radius, 12px);
    display: block;
  }
  ha-card {
    color: var(--door-text);
    padding: 12px;
  }
  .title {
    font-size: 1.1rem;
    font-weight: 500;
    padding: 4px 4px 12px;
  }
  .empty {
    color: var(--door-muted);
    padding: 8px 4px;
  }

  /* Layouts */
  .doors.tiles {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(min(100%, 210px), 1fr));
    gap: 12px;
  }
  .doors.rows {
    display: grid;
    gap: 8px;
  }
  .doors.compact {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  /* Door */
  .door {
    --tone: var(--door-muted);
    position: relative;
    display: flex;
    flex-direction: column;
    gap: 10px;
    padding: 12px;
    border-radius: var(--door-radius);
    background: var(--door-surface);
    transition:
      box-shadow 0.3s,
      background 0.3s;
  }
  .tiles .door .actions {
    margin-top: auto;
  }
  /* Rows: name left, buttons right; buttons wrap below the name on narrow screens. */
  .rows .door {
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
  }
  .rows .door .door-head {
    flex: 1 1 180px;
  }
  .rows .door .ring-banner,
  .rows .door .camera,
  .rows .door .hint {
    flex-basis: 100%;
    order: 1;
  }
  .tone-locked {
    --tone: var(--door-ok);
  }
  .tone-busy {
    --tone: var(--door-accent);
  }
  .tone-open {
    --tone: var(--door-warn);
  }
  .tone-problem {
    --tone: var(--door-error);
  }
  .door.ringing {
    --tone: var(--door-accent);
    background: color-mix(in srgb, var(--door-accent) 12%, var(--door-surface));
    animation: ring 1.6s ease-in-out infinite;
  }
  @keyframes ring {
    0%,
    100% {
      box-shadow: 0 0 0 0 color-mix(in srgb, var(--door-accent) 45%, transparent);
    }
    50% {
      box-shadow: 0 0 0 6px color-mix(in srgb, var(--door-accent) 0%, transparent);
    }
  }
  @media (prefers-reduced-motion: reduce) {
    .door.ringing,
    .chip.ringing {
      animation: none;
    }
  }

  .door-head {
    all: unset;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 12px;
    min-width: 0;
    border-radius: 8px;
  }
  .door-head:focus-visible {
    outline: 2px solid var(--door-accent);
    outline-offset: 2px;
  }
  .door-icon {
    flex: none;
    display: grid;
    place-items: center;
    width: 42px;
    height: 42px;
    border-radius: 50%;
    color: var(--tone);
    background: color-mix(in srgb, var(--tone) 18%, transparent);
    --mdc-icon-size: 24px;
  }
  .door-text {
    display: grid;
    min-width: 0;
  }
  .door-name {
    font-weight: 500;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .door-state {
    font-size: 0.85rem;
    color: var(--door-muted);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .ring-banner {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.85rem;
    font-weight: 500;
    color: var(--door-accent);
    --mdc-icon-size: 18px;
  }
  .camera {
    width: 100%;
    border-radius: 8px;
    aspect-ratio: 16 / 9;
    object-fit: cover;
    background: var(--door-divider);
  }
  .hint {
    font-size: 0.8rem;
    color: var(--door-muted);
  }
  .hint.error {
    color: var(--door-error);
  }
  .actions {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
  }
  .tiles .actions > .open {
    flex: 1;
  }

  /* Buttons */
  button.act {
    position: relative;
    overflow: hidden;
    font: inherit;
    font-size: 0.9rem;
    font-weight: 500;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    min-height: 40px;
    padding: 0 16px;
    border-radius: 999px;
    border: 1px solid var(--door-divider);
    background: var(--card-background-color, transparent);
    color: var(--door-text);
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
    touch-action: none;
    --mdc-icon-size: 18px;
  }
  button.act.open {
    background: var(--door-accent);
    border-color: var(--door-accent);
    color: var(--text-primary-color, #fff);
  }
  button.act:focus-visible {
    outline: 2px solid var(--door-accent);
    outline-offset: 2px;
  }
  button.act:disabled {
    opacity: 0.45;
    cursor: default;
  }
  button.act > * {
    position: relative;
  }
  /* Hold-to-open progress */
  button.act::before {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(255, 255, 255, 0.28);
    transform: scaleX(0);
    transform-origin: left;
  }
  button.act.holding::before {
    transform: scaleX(1);
    transition: transform var(--hold-ms, 800ms) linear;
  }
  button.act.done {
    background: var(--door-ok);
    border-color: var(--door-ok);
  }
  button.act.failed {
    background: var(--door-error);
    border-color: var(--door-error);
  }
  button.act.secondary {
    background: transparent;
    color: var(--door-text);
  }

  /* Compact chips */
  .chip {
    --tone: var(--door-muted);
    position: relative;
    overflow: hidden;
    font: inherit;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 44px;
    padding: 0 16px 0 6px;
    border-radius: 999px;
    border: 1px solid var(--door-divider);
    background: var(--door-surface);
    color: var(--door-text);
    cursor: pointer;
    user-select: none;
    -webkit-user-select: none;
    -webkit-touch-callout: none;
    touch-action: none;
  }
  .chip .door-icon {
    width: 32px;
    height: 32px;
    --mdc-icon-size: 18px;
  }
  .chip.ringing {
    border-color: var(--door-accent);
    animation: ring 1.6s ease-in-out infinite;
  }
  .chip::before {
    content: '';
    position: absolute;
    inset: 0;
    background: color-mix(in srgb, var(--door-accent) 25%, transparent);
    transform: scaleX(0);
    transform-origin: left;
  }
  .chip.holding::before {
    transform: scaleX(1);
    transition: transform var(--hold-ms, 800ms) linear;
  }
  .chip > * {
    position: relative;
  }
  .chip:disabled {
    opacity: 0.5;
    cursor: default;
  }
  .chip:focus-visible {
    outline: 2px solid var(--door-accent);
    outline-offset: 2px;
  }
`;
