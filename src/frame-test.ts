import type { Frame, OpenResult } from './types';

/**
 * Live test of an open frame from the result step. This is the ONLY place where the wizard sends anything:
 * it calls the `send_frame` action of the exported firmware, and only after the user confirmed.
 */

/** ESPHome action name in the exported firmware (Home Assistant: esphome.<node>_send_frame). */
export const SEND_FRAME_ACTION = 'send_frame';
/** How long to wait for the door's 8D/8E reply. */
export const REPLY_TIMEOUT_MS = 6000;

export interface SendFramePayload {
  source: number;
  destination: number;
  message_type: number;
  data: number[];
  three_byte: boolean;
}

interface Services {
  callService(domain: 'esphome', service: string, data: SendFramePayload): Promise<unknown>;
  services?: Record<string, Record<string, unknown>>;
}

/** ESPHome node name → Home Assistant service prefix ("abb-welcome-demo" → "abb_welcome_demo"). */
const serviceName = (node: string) =>
  `${node.toLowerCase().replace(/[^a-z0-9]+/g, '_')}_${SEND_FRAME_ACTION}`;

/**
 * Find the send_frame service: the one of the configured device if it exists, otherwise the only one there is.
 * Undefined if the firmware has no such action yet.
 */
export function findSendFrameService(
  services: Record<string, Record<string, unknown>> | undefined,
  nodeName?: string,
): string | undefined {
  const esphome = Object.keys(services?.esphome ?? {});
  if (nodeName && esphome.includes(serviceName(nodeName))) return serviceName(nodeName);
  const all = esphome.filter((s) => s.endsWith(`_${SEND_FRAME_ACTION}`));
  return all.length === 1 ? all[0] : undefined;
}

export function sendFramePayload(indoor: number, open: OpenResult, threeByte: boolean): SendFramePayload {
  return {
    source: indoor,
    destination: open.destination,
    message_type: open.messageType,
    data: [...open.data],
    three_byte: threeByte,
  };
}

export async function sendTestFrame(
  hass: Services,
  service: string,
  payload: SendFramePayload,
): Promise<void> {
  await hass.callService('esphome', service, payload);
}

/** The door's reply to the test: reply type of the command, addressed to the indoor station. */
export function isTestReply(frame: Frame, payload: SendFramePayload): boolean {
  return frame.type === (payload.message_type | 0x80) && frame.dst === payload.source;
}
