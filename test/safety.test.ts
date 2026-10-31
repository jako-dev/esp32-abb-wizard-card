import { readdirSync, readFileSync } from 'node:fs';

// The wizard is strictly read-only: no code path may call services or send anything to the bus.
// Only the door card (src/door-card/) may call services, and only lock services.
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

  it('lets the door card call lock services only', () => {
    const doorDir = new URL('../src/door-card/', import.meta.url);
    const doorFiles = readdirSync(doorDir).filter((f) => f.endsWith('.ts'));
    const calls: string[] = [];
    for (const file of doorFiles) {
      const source = readFileSync(new URL(file, doorDir), 'utf8');
      for (const pattern of [/callWS/, /callApi/, /sendMessage(?!Promise)/, /button\.press/]) {
        expect(source, file).not.toMatch(pattern);
      }
      expect(source, file).not.toMatch(/sendMessagePromise\(/);
      calls.push(...[...source.matchAll(/\.callService\(\s*'([^']+)'/g)].map((m) => m[1]));
      // Every call site must name its domain literally.
      expect(source.match(/\.callService\(/g)?.length ?? 0, file).toBe(
        [...source.matchAll(/\.callService\(\s*'/g)].length,
      );
    }
    expect(calls.length).toBeGreaterThan(0);
    expect(new Set(calls)).toEqual(new Set(['lock']));
  });
});
