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
    expect(text(root)).toContain('Tor');
    expect(text(root)).toContain('Verriegelt · klingelte vor 5 min');
    expect(text(root)).toContain('Halten zum Öffnen');
  });

  it('opens only after holding the button', async () => {
    const { root, card, callService } = await mount({ doors, hold_time: 500 });
    const button = root.querySelector<HTMLButtonElement>('button.act.open')!;

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
    const buttons = root.querySelectorAll<HTMLButtonElement>('button.act.open');
    buttons[1].click(); // Wohnungstür: tap
    await vi.advanceTimersByTimeAsync(0);
    await card.updateComplete;
    expect(text(root)).toContain('Warte auf Tür');

    card.hass = {
      ...hass,
      states: { ...hass.states, 'lock.aqara': entity('lock.aqara', 'unlocked') },
    } as never;
    await card.updateComplete;
    expect(text(root)).toContain('Geöffnet');
    expect(text(root)).toContain('Verriegeln');
  });

  it('reports a command without confirmation', async () => {
    const { root, card } = await mount({ doors });
    root.querySelectorAll<HTMLButtonElement>('button.act.open')[1].click();
    await vi.advanceTimersByTimeAsync(9000);
    await card.updateComplete;
    expect(text(root)).toContain('Gesendet – keine Rückmeldung');
  });

  it('asks before opening in dialog mode', async () => {
    const { root, card, callService } = await mount({
      doors: [{ name: 'Haustür', lock: 'lock.tor', confirm: 'dialog' }],
    });
    root.querySelector<HTMLButtonElement>('button.act.open')!.click();
    await card.updateComplete;
    expect(text(root)).toContain('Wirklich öffnen?');
    expect(callService).not.toHaveBeenCalled();
    root.querySelector<HTMLButtonElement>('button.act.open')!.click();
    expect(callService).toHaveBeenCalledWith('lock', 'unlock', { entity_id: 'lock.tor' });
  });

  it('uses lock.open for locks with a latch', async () => {
    const { root, callService } = await mount({
      doors: [{ name: 'Wohnungstür', lock: 'lock.aqara', confirm: 'tap', action: 'open' }],
    });
    root.querySelector<HTMLButtonElement>('button.act.open')!.click();
    expect(callService).toHaveBeenCalledWith('lock', 'open', { entity_id: 'lock.aqara' });
  });

  it('highlights a ringing door and moves it to the top', async () => {
    const { root, card, hass } = await mount({
      doors: [{ name: 'Wohnungstür', lock: 'lock.aqara' }, ...doors.slice(0, 1)],
    });
    expect(root.querySelector('.door-name')!.textContent).toBe('Wohnungstür');

    card.hass = {
      ...hass,
      states: { ...hass.states, 'binary_sensor.klingel_tor': entity('binary_sensor.klingel_tor', 'on') },
    } as never;
    await card.updateComplete;
    const first = root.querySelector('.door')!;
    expect(first.classList.contains('ringing')).toBe(true);
    expect(text(first)).toContain('Es klingelt – jetzt öffnen');
    expect(text(first)).toContain('60 s');
  });

  it('only lets configured users open', async () => {
    const { root } = await mount({ doors: [{ name: 'Tor', lock: 'lock.tor', users: ['someone-else'] }] });
    expect(root.querySelector('button.act.open')).toBeNull();
    expect(text(root)).toContain('nur für berechtigte Personen');
  });

  it('disables opening while the lock is unavailable', async () => {
    const { root } = await mount({ doors: doors.slice(0, 1) }, [entity('lock.tor', 'unavailable')]);
    expect(root.querySelector<HTMLButtonElement>('button.act.open')!.disabled).toBe(true);
    expect(text(root)).toContain('Nicht verfügbar');
  });

  it('renders the compact layout as buttons', async () => {
    const { root, callService } = await mount({ doors, layout: 'compact' });
    const chips = root.querySelectorAll<HTMLButtonElement>('button.chip');
    expect(chips).toHaveLength(2);
    chips[1].click();
    expect(callService).toHaveBeenCalledWith('lock', 'unlock', { entity_id: 'lock.aqara' });
  });
});
