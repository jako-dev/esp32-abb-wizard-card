import { findSendFrameService, isTestReply, sendFramePayload, sendTestFrame } from '../src/frame-test';
import type { Frame, OpenResult } from '../src/types';

const open: OpenResult = {
  door: 'haustuer',
  captures: 1,
  destination: 0x4002,
  messageType: 0x0d,
  data: [0x1c, 0x41, 0x68],
  occurrences: 1,
  score: 1,
};
const frame = (p: Partial<Frame>): Frame => ({
  src: 0,
  dst: 0,
  type: 0,
  data: [],
  threeByte: false,
  retransmission: false,
  ...p,
});

describe('frame test', () => {
  it('finds the send_frame action of the device', () => {
    const services = {
      esphome: { abb_welcome_demo_send_frame: {}, other_send_frame: {}, abb_welcome_demo_x: {} },
    };
    expect(findSendFrameService(services, 'abb-welcome-demo')).toBe('abb_welcome_demo_send_frame');
    expect(findSendFrameService(services, 'klingel')).toBeUndefined();
    expect(findSendFrameService({ esphome: { klingel_send_frame: {} } }, 'abb-welcome-demo')).toBe(
      'klingel_send_frame',
    );
    expect(findSendFrameService({ light: {} }, 'abb-welcome-demo')).toBeUndefined();
    expect(findSendFrameService(undefined)).toBeUndefined();
  });

  it('sends exactly the shown frame', async () => {
    const payload = sendFramePayload(0x1016, open, false);
    expect(payload).toEqual({
      source: 0x1016,
      destination: 0x4002,
      message_type: 0x0d,
      data: [0x1c, 0x41, 0x68],
      three_byte: false,
    });
    const callService = vi.fn(async () => undefined);
    await sendTestFrame({ callService }, 'abb_welcome_demo_send_frame', payload);
    expect(callService).toHaveBeenCalledWith('esphome', 'abb_welcome_demo_send_frame', payload);
  });

  it('recognises the door reply', () => {
    const payload = sendFramePayload(0x1016, open, false);
    expect(isTestReply(frame({ src: 0x4002, dst: 0x1016, type: 0x8d }), payload)).toBe(true);
    expect(isTestReply(frame({ src: 0x4002, dst: 0x1011, type: 0x8d }), payload)).toBe(false);
    expect(isTestReply(frame({ src: 0x4002, dst: 0x1016, type: 0x8e }), payload)).toBe(false);
  });
});
