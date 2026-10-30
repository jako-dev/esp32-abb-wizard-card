// @vitest-environment happy-dom
import '../src/abb-welcome-wizard-card';
import type { AbbWelcomeWizardCard } from '../src/abb-welcome-wizard-card';
import type { HassEvent, HomeAssistant, StateChangedData } from '../src/ha-types';

type Listener = (event: HassEvent<StateChangedData>) => void;

function fakeHass() {
  const listeners: Listener[] = [];
  const subscribeEvents = vi.fn(async (cb: Listener, type?: string) => {
    expect(type).toBe('state_changed');
    listeners.push(cb);
    return () => {
      listeners.splice(listeners.indexOf(cb), 1);
    };
  });
  // Any other property access (e.g. callService) would be undefined and throw if used.
  const hass = {
    states: {
      'sensor.doorbell_intercom': {
        entity_id: 'sensor.doorbell_intercom',
        state: '[2001 > 1010] Type: 01',
        last_changed: '',
        last_updated: '',
        attributes: { friendly_name: 'Doorbell Intercom' },
      },
    },
    connection: { subscribeEvents },
  } as unknown as HomeAssistant;
  const emit = (state: string, entity_id = 'sensor.doorbell_intercom') =>
    listeners.forEach((l) =>
      l({
        event_type: 'state_changed',
        time_fired: new Date().toISOString(),
        data: {
          entity_id,
          old_state: null,
          new_state: { entity_id, state, last_changed: '', last_updated: '', attributes: {} },
        },
      }),
    );
  return { hass, emit, listeners, subscribeEvents };
}

async function mount() {
  localStorage.clear();
  const card = document.createElement('abb-welcome-wizard-card') as AbbWelcomeWizardCard;
  card.setConfig({ type: 'custom:abb-welcome-wizard-card', entity: 'sensor.doorbell_intercom' });
  const fake = fakeHass();
  document.body.appendChild(card);
  card.hass = fake.hass;
  await card.updateComplete;
  await Promise.resolve();
  return { card, ...fake };
}

const text = (card: HTMLElement) => card.shadowRoot!.textContent!.replace(/\s+/g, ' ');

describe('abb-welcome-wizard-card', () => {
  afterEach(() => document.body.replaceChildren());

  it('validates the config', () => {
    const card = document.createElement('abb-welcome-wizard-card') as AbbWelcomeWizardCard;
    expect(() => card.setConfig({ type: 'x' } as never)).toThrow('entity');
    expect(() => card.setConfig({ type: 'x', entity: 'sensor.a', capture_seconds: 0 })).toThrow(
      'capture_seconds',
    );
    expect(() => card.setConfig({ type: 'x', entity: 'sensor.a', indoor_address: 'nope' })).toThrow(
      'indoor_address',
    );
  });

  it('registers in the card picker', () => {
    expect(window.customCards?.some((c) => c.type === 'abb-welcome-wizard-card')).toBe(true);
  });

  it('shows live frames of the configured entity only', async () => {
    const { card, emit, subscribeEvents } = await mount();
    expect(subscribeEvents).toHaveBeenCalledTimes(1);
    expect(text(card)).toContain('Doorbell Intercom gefunden');

    emit('55.FF.00.01.10.10.20.01.8A.C3 [2001 > 1010] Type: 01');
    emit('[2002 > 1011] Type: 01', 'sensor.other');
    await card.updateComplete;

    const frames = card.shadowRoot!.querySelectorAll('.frame');
    expect(frames).toHaveLength(1);
    expect(frames[0].textContent!.replace(/\s+/g, ' ')).toContain('2001 › 1010');
    expect(text(card)).toContain('1 Frame(s) seit dem Öffnen');
  });

  it('records a capture into the session and persists it', async () => {
    const { card, emit } = await mount();
    const internals = card as unknown as {
      page: number;
      beginCapture(wait: boolean): void;
      finishCapture(): void;
      session: { steps: Record<string, { captures: { lines: unknown[] }[] }> };
    };
    internals.page = 2; // ring_gate
    await card.updateComplete;
    internals.beginCapture(true);
    await card.updateComplete;
    expect(text(card)).toContain('Bereit');

    emit('[2001 > 1010] Type: 01');
    emit('[1010 > 2001] Type: 81');
    await card.updateComplete;
    expect(text(card)).toContain('Aufnahme läuft');
    internals.finishCapture();
    await card.updateComplete;

    expect(internals.session.steps.ring_gate.captures[0].lines).toHaveLength(2);
    expect(localStorage.getItem('abb-welcome-wizard-card:session:sensor.doorbell_intercom')).toContain(
      'Type: 81',
    );
    expect(text(card)).toContain('Aufnahme 1');
  });

  it('unsubscribes when removed', async () => {
    const { card, listeners } = await mount();
    expect(listeners).toHaveLength(1);
    card.remove();
    await Promise.resolve();
    await Promise.resolve();
    expect(listeners).toHaveLength(0);
  });
});
