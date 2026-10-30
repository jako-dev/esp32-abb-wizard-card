import { parseSession, serializeSession } from './session';
import type { Session } from './types';

// The session (including door codes) only ever lives in this browser's localStorage and in files the user exports.
const key = (entity: string) => `abb-welcome-wizard-card:session:${entity}`;

export function loadStoredSession(entity: string): Session | undefined {
  try {
    const raw = window.localStorage.getItem(key(entity));
    return raw ? parseSession(raw) : undefined;
  } catch {
    return undefined;
  }
}

export function storeSession(session: Session): void {
  try {
    window.localStorage.setItem(key(session.entity), serializeSession(session));
  } catch {
    // Storage unavailable (private mode, quota): the session still works in memory.
  }
}

export function clearStoredSession(entity: string): void {
  try {
    window.localStorage.removeItem(key(entity));
  } catch {
    // ignore
  }
}

/** Offer text as a file download. */
export function downloadText(filename: string, text: string, mime: string): void {
  const url = URL.createObjectURL(new Blob([text], { type: mime }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export async function copyText(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Clipboard API needs a secure context; fall back to a hidden textarea.
    const area = document.createElement('textarea');
    area.value = text;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    area.remove();
    return ok;
  }
}
