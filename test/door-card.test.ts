// @vitest-environment happy-dom
import '../src/door-card/door-card';
import type { AbbWelcomeDoorCard } from '../src/door-card/door-card';
import type { HassEntity, HomeAssistant } from '../src/ha-types';

const entity = (entity_id: string, state: string, last_changed = new Date().toISOString()): HassEntity => ({
  entity_id,
  state,
  last_changed,
  last_updated: last_changed,
  attributes: {},
});

function makeHass(states: HassEntity[], extra: Partial<HomeAssistant> = {}) {
  const callService = vi.fn(async () => undefined);
  const sendMessagePromise = vi.fn(async () => ({
    'binary_sensor.klingel_tor': [
      { s: 'off', lu: Date.now() / 1000 - 600 },
      { s: 'on', lu: Date.now() / 1000 - 300 },
    ],
  }));
  const hass = {
    states: Object.fromEntries(states.map((s) => [s.entity_id, s])),
    connection: { subscribeEvents: vi.fn(), sendMessagePromise },
    user: { id: 'me', is_admin: false },
    callService,
    ...extra,
  } as unknown as HomeAssistant;
  return { hass, callService, sendMessagePromise };
}

const baseStates = () => [
  entity('lock.tor', 'locked'),
  entity('lock.aqara', 'locked'),
  entity('binary_sensor.klingel_tor', 'off'),
];

async function mount(config: Record<string, unknown>, hassStates = baseStates()) {
  const card = document.createElement('abb-welcome-door-card') as AbbWelcomeDoorCard;
  card.setConfig({ type: 'custom:abb-welcome-door-card', ...config } as never);
  const ctx = makeHass(hassStates);
  card.hass = ctx.hass as never;
  document.body.appendChild(card);
  await card.updateComplete;
  return { card, ...ctx, root: card.shadowRoot! };
}

const text = (el: Element | ShadowRoot) => el.textContent!.replace(/\s+/g, ' ');
const doors = [
  { name: 'Tor', lock: 'lock.tor', doorbell: 'binary_sensor.klingel_tor' },
  { name: 'Wohnungstür', lock: 'lock.aqara', confirm: 'tap' },
];

const ring = (hass: HomeAssistant) =>
  ({
    ...hass,
    states: { ...hass.states, 'binary_sensor.klingel_tor': entity('binary_sensor.klingel_tor', 'on') },
  }) as never;

describe('abb-welcome-door-card', () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
  afterEach(() => {
    vi.useRealTimers();
    document.body.replaceChildren();
  });

  it('shows every door with its state and the last ring from the history', async () => {
    const { root, card, sendMessagePromise } = await mount({ doors });
    await vi.waitFor(() => expect(sendMessagePromise).toHaveBeenCalled());
    await card.updateComplete;
    expect(text(root)).toContain('Verriegelt · klingelte vor 5 min');
    expect(text(root)).toContain('Zum Öffnen schieben');
  });

  it('opens by sliding the knob all the way', async () => {
    const { root, card, callService } = await mount({ doors });
    const knob = root.querySelector<HTMLButtonElement>('.slider .knob')!;
    knob.dispatchEvent(new PointerEvent('pointerdown', { button: 0, clientX: 10 }));
    await card.updateComplete;
    knob.dispatchEvent(new PointerEvent('pointerup'));
    await card.updateComplete;
    expect(callService).not.toHaveBeenCalled();
    expect(text(root)).toContain('ganz nach rechts schieben');

    knob.dispatchEvent(new PointerEvent('pointerdown', { button: 0, clientX: 10 }));
    knob.dispatchEvent(new PointerEvent('pointermove', { clientX: 400 }));
    knob.dispatchEvent(new PointerEvent('pointerup'));
    expect(callService).toHaveBeenCalledWith('lock', 'unlock', { entity_id: 'lock.tor' });
  });

  it('opens a slider with the keyboard', async () => {
    const { root, callService } = await mount({ doors });
    root.querySelector('.slider .knob')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(callService).toHaveBeenCalledWith('lock', 'unlock', { entity_id: 'lock.tor' });
  });

  it('opens only after holding the button', async () => {
    const { root, card, callService } = await mount({
      doors: [{ name: 'Tor', lock: 'lock.tor', confirm: 'hold' }],
      hold_time: 500,
    });
    const button = root.querySelector<HTMLButtonElement>('button.press')!;
    expect(text(button)).toContain('Halten zum Öffnen');
    button.dispatchEvent(new PointerEvent('pointerdown', { button: 0 }));
    await vi.advanceTimersByTimeAsync(200);
    button.dispatchEvent(new PointerEvent('pointerup'));
    await card.updateComplete;
    expect(callService).not.toHaveBeenCalled();
    expect(text(root)).toContain('Zum Öffnen gedrückt halten');

    button.dispatchEvent(new PointerEvent('pointerdown', { button: 0 }));
    await vi.advanceTimersByTimeAsync(600);
    expect(callService).toHaveBeenCalledWith('lock', 'unlock', { entity_id: 'lock.tor' });
  });

  it('confirms success when the lock reports unlocking', async () => {
    const { root, card, hass } = await mount({ doors });
    root.querySelector<HTMLButtonElement>('button.press')!.click(); // Wohnungstür: tap
    await vi.advanceTimersByTimeAsync(0);
    await card.updateComplete;
    expect(text(root)).toContain('Warte auf Tür');

    card.hass = {
      ...hass,
      states: { ...hass.states, 'lock.aqara': entity('lock.aqara', 'unlocked') },
    } as never;
    await card.updateComplete;
    expect(text(root)).toContain('Geöffnet');
    expect(root.querySelector('button.mini[aria-label="Wohnungstür verriegeln"]')).not.toBeNull();
  });

  it('reports a command without confirmation', async () => {
    const { root, card } = await mount({ doors });
    root.querySelector<HTMLButtonElement>('button.press')!.click();
    await vi.advanceTimersByTimeAsync(9000);
    await card.updateComplete;
    expect(text(root)).toContain('Gesendet – keine Rückmeldung');
  });

  it('asks before opening in dialog mode', async () => {
    const { root, card, callService } = await mount({
      doors: [{ name: 'Haustür', lock: 'lock.tor', confirm: 'dialog' }],
    });
    root.querySelector<HTMLButtonElement>('button.press')!.click();
    await card.updateComplete;
    expect(text(root)).toContain('Wirklich öffnen?');
    expect(callService).not.toHaveBeenCalled();
    root.querySelector<HTMLButtonElement>('button.press')!.click();
    expect(callService).toHaveBeenCalledWith('lock', 'unlock', { entity_id: 'lock.tor' });
  });

  it('uses lock.open for locks with a latch', async () => {
    const { root, callService } = await mount({
      doors: [{ name: 'Wohnungstür', lock: 'lock.aqara', confirm: 'tap', action: 'open' }],
    });
    root.querySelector<HTMLButtonElement>('button.press')!.click();
    expect(callService).toHaveBeenCalledWith('lock', 'open', { entity_id: 'lock.aqara' });
  });

  it('highlights a ringing door and moves it to the top', async () => {
    const { root, card, hass } = await mount({
      doors: [{ name: 'Wohnungstür', lock: 'lock.aqara' }, doors[0]],
    });
    expect(root.querySelector('.name')!.textContent).toBe('Wohnungstür');
    card.hass = ring(hass);
    await card.updateComplete;
    const first = root.querySelector('.tile')!;
    expect(first.classList.contains('ringing')).toBe(true);
    expect(text(first)).toContain('Tor');
    expect(text(first)).toContain('60 s');
    expect(first.querySelector('.slider.filled')).not.toBeNull();
  });

  it('only lets configured users open', async () => {
    const { root } = await mount({ doors: [{ name: 'Tor', lock: 'lock.tor', users: ['someone-else'] }] });
    expect(root.querySelector('.knob, button.press')).toBeNull();
    expect(text(root)).toContain('nur für berechtigte Personen');
  });

  it('disables opening while the lock is unavailable', async () => {
    const { root } = await mount({ doors: doors.slice(0, 1) }, [entity('lock.tor', 'unavailable')]);
    expect(root.querySelector<HTMLButtonElement>('.knob')!.disabled).toBe(true);
    expect(text(root)).toContain('Nicht verfügbar');
  });

  it('shows small controls in the list and a full slider for the ringing door', async () => {
    const { root, card, hass } = await mount({ doors, layout: 'rows' });
    expect(root.querySelectorAll('.row')).toHaveLength(2);
    expect(root.querySelector('.slider.small')).not.toBeNull();
    card.hass = ring(hass);
    await card.updateComplete;
    expect(root.querySelector('.row.ringing .slider.filled')).not.toBeNull();
  });

  it('renders round key buttons that open on hold', async () => {
    const { root, callService } = await mount({ doors, layout: 'buttons', hold_time: 300 });
    const keys = root.querySelectorAll<HTMLButtonElement>('button.key');
    expect(keys).toHaveLength(2);
    expect(text(root)).toContain('Gedrückt halten');
    keys[0].dispatchEvent(new PointerEvent('pointerdown', { button: 0 }));
    await vi.advanceTimersByTimeAsync(400);
    expect(callService).toHaveBeenCalledWith('lock', 'unlock', { entity_id: 'lock.tor' });
  });

  it('shows the status bar with a panel for the ringing door that can be dismissed', async () => {
    const { root, card, hass, callService } = await mount({ doors, layout: 'bar' });
    expect(root.querySelectorAll('button.chip')).toHaveLength(2);
    expect(root.querySelector('.hero')).toBeNull();

    card.hass = ring(hass);
    await card.updateComplete;
    expect(text(root.querySelector('.hero')!)).toContain('Es klingelt: Tor');
    root.querySelector('.hero .knob')!.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
    expect(callService).toHaveBeenCalledWith('lock', 'unlock', { entity_id: 'lock.tor' });

    [...root.querySelectorAll<HTMLButtonElement>('.hero button')]
      .find((b) => b.textContent!.includes('Ignorieren'))!
      .click();
    await card.updateComplete;
    expect(root.querySelector('.hero')).toBeNull();
  });

  it('accepts the old compact layout name', async () => {
    const { root } = await mount({ doors, layout: 'compact' });
    expect(root.querySelectorAll('button.chip')).toHaveLength(2);
  });
});
