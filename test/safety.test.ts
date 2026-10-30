import { readdirSync, readFileSync } from 'node:fs';

// Phase 1 is strictly read-only: no code path may call services or send anything to the bus.
const FORBIDDEN = [
  /callService/,
  /call_service/,
  /callWS/,
  /callApi/,
  /sendMessage/,
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
});
