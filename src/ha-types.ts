import type { DoorConfigInput } from './doors';

// Minimal subset of the Home Assistant frontend types used by this card.

export interface HassEntity {
  entity_id: string;
  state: string;
  last_changed: string;
  last_updated: string;
  attributes: Record<string, unknown>;
}

export interface HassEvent<T = unknown> {
  event_type: string;
  time_fired: string;
  data: T;
}

export interface StateChangedData {
  entity_id: string;
  old_state: HassEntity | null;
  new_state: HassEntity | null;
}

export type Unsubscribe = () => Promise<void> | void;

export interface HassConnection {
  subscribeEvents<T>(callback: (event: HassEvent<T>) => void, eventType?: string): Promise<Unsubscribe>;
  sendMessagePromise<T>(message: Record<string, unknown>): Promise<T>;
}

export interface HomeAssistant {
  states: Record<string, HassEntity>;
  connection: HassConnection;
  /** False while the websocket connection to Home Assistant is down. */
  connected?: boolean;
  /** Entity and device registry (as provided by the frontend), used to suggest the ESPHome device name. */
  entities?: Record<string, { device_id?: string | null }>;
  devices?: Record<
    string,
    { name?: string | null; name_by_user?: string | null; connections?: [string, string][] }
  >;
  user?: { id?: string; is_admin: boolean; name?: string };
}

export interface CardConfig {
  type: string;
  entity: string;
  capture_seconds?: number;
  /** Optional indoor station address, e.g. "0x1010" (overrides auto-detection). */
  indoor_address?: string | number;
  title?: string;
  /** Optional preset of the doors; can also be edited in the card. */
  doors?: DoorConfigInput[];
}
