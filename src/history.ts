import type { HassConnection } from './ha-types';
import { lineFromEvent } from './recorder';
import type { RecordedLine } from './types';

/** Compressed state as returned by `history/history_during_period` (times in epoch seconds). */
export interface CompressedState {
  s: string;
  lu: number;
  lc?: number;
}

export function historyToLines(
  response: Record<string, CompressedState[]> | null,
  entity: string,
): RecordedLine[] {
  return (response?.[entity] ?? []).flatMap((state) => {
    const line = lineFromEvent(
      {
        event_type: 'state_changed',
        time_fired: new Date((state.lc ?? state.lu) * 1000).toISOString(),
        data: {
          entity_id: entity,
          old_state: null,
          new_state: {
            entity_id: entity,
            state: state.s,
            last_changed: '',
            last_updated: '',
            attributes: {},
          },
        },
      },
      entity,
    );
    return line ? [line] : [];
  });
}

/**
 * Read recorded states between two points in time (read-only). Used to fill in frames missed while the
 * connection was down and to find the last doorbell ring. This is the only websocket command the cards send
 * besides subscribe_events.
 */
export async function fetchHistory(
  connection: HassConnection,
  entityIds: string[],
  start: number,
  end: number,
): Promise<Record<string, CompressedState[]>> {
  const response = await connection.sendMessagePromise<Record<string, CompressedState[]> | null>({
    type: 'history/history_during_period',
    start_time: new Date(start).toISOString(),
    end_time: new Date(end).toISOString(),
    entity_ids: entityIds,
    include_start_time_state: false,
    significant_changes_only: false,
    minimal_response: false,
    no_attributes: true,
  });
  return response ?? {};
}

export async function fetchHistoryLines(
  connection: HassConnection,
  entity: string,
  start: number,
  end: number,
): Promise<RecordedLine[]> {
  return historyToLines(await fetchHistory(connection, [entity], start, end), entity);
}

/** Epoch milliseconds of the last time each entity turned `on`, if any. */
export function lastOnTimes(history: Record<string, CompressedState[]>): Record<string, number> {
  const result: Record<string, number> = {};
  for (const [entity, states] of Object.entries(history)) {
    for (const state of states) if (state.s === 'on') result[entity] = (state.lc ?? state.lu) * 1000;
  }
  return result;
}
