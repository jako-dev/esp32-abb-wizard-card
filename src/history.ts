import type { HassConnection } from './ha-types';
import { lineFromEvent } from './recorder';
import type { RecordedLine } from './types';

/** Compressed state as returned by `history/history_during_period` (times in epoch seconds). */
interface CompressedState {
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
 * Read the debug sensor's recorded states between two points in time, to fill in frames missed while the
 * connection was down. Read-only: this is the only websocket command the card sends besides subscribe_events.
 */
export async function fetchHistoryLines(
  connection: HassConnection,
  entity: string,
  start: number,
  end: number,
): Promise<RecordedLine[]> {
  const response = await connection.sendMessagePromise<Record<string, CompressedState[]>>({
    type: 'history/history_during_period',
    start_time: new Date(start).toISOString(),
    end_time: new Date(end).toISOString(),
    entity_ids: [entity],
    include_start_time_state: false,
    significant_changes_only: false,
    minimal_response: false,
    no_attributes: true,
  });
  return historyToLines(response, entity);
}
