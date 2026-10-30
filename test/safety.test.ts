import { readdirSync, readFileSync } from 'node:fs';

// Phase 1 is strictly read-only: no code path may call services or send anything to the bus.
const FORBIDDEN = [
  /callService/,
  /call_service/,
  /callWS/,
  /callApi/,
  /sendMessage(?!Promise)/,
  /fireEvent\(/,
  /hass-call-service/,
  /\.unlock\b/,
  /button\.press/,
  /esphome\.\w+_send/,
];

describe('safety', () => {
  const dir = new URL('../src/', import.meta.url);
  const files = readdirSync(dir).filter((f) => f.endsWith('.ts'));

  it.each(files)('%s does not call Home Assistant services', (file) => {
    const source = readFileSync(new URL(file, dir), 'utf8');
    for (const pattern of FORBIDDEN) expect(source).not.toMatch(pattern);
  });

  it('only sends the read-only history query besides subscribe_events', () => {
    for (const file of files) {
      const source = readFileSync(new URL(file, dir), 'utf8');
      if (file !== 'history.ts') expect(source, file).not.toMatch(/sendMessagePromise\(/);
    }
    const history = readFileSync(new URL('history.ts', dir), 'utf8');
    expect(history.match(/sendMessagePromise/g)).toHaveLength(1);
    expect([...history.matchAll(/(?<![\w_])type: '([^']+)'/g)].map((m) => m[1])).toEqual([
      'history/history_during_period',
    ]);
  });
});
