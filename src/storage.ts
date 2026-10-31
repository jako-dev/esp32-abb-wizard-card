import type { ActiveCapture } from './recorder';
import { parseSession, serializeSession } from './session';
import type { Session } from './types';

// The session (including door codes) only ever lives in this browser's localStorage and in files the user exports.
// The key stays the same across versions; old sessions are migrated when read (see parseSession).
export const sessionKey = (entity: string) => `abb-welcome-wizard-card:session:${entity}`;
export const backupKey = (entity: string) => `abb-welcome-wizard-card:backup:${entity}`;

/**
 * Load the stored session. If it cannot be read (corrupt, or written by a newer version), its raw text is
 * copied to a backup key first, so the new session that replaces it does not destroy the recordings.
 */
export function loadStoredSession(entity: string): Session | undefined {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(sessionKey(entity));
  } catch {
    return undefined;
  }
  if (!raw) return undefined;
  try {
    return parseSession(raw);
  } catch (err) {
    console.warn('abb-welcome-wizard-card: stored session could not be read, keeping a backup', err);
    try {
      window.localStorage.setItem(backupKey(entity), raw);
    } catch {
      // ignore
    }
    return undefined;
  }
}

export function hasBackup(entity: string): boolean {
  try {
    return window.localStorage.getItem(backupKey(entity)) !== null;
  } catch {
    return false;
  }
}

export function storeSession(session: Session): void {
  try {
    window.localStorage.setItem(sessionKey(session.entity), serializeSession(session));
  } catch {
    // Storage unavailable (private mode, quota): the session still works in memory.
  }
}

export function clearStoredSession(entity: string): void {
  try {
    window.localStorage.removeItem(sessionKey(entity));
  } catch {
    // ignore
  }
}

const captureKey = (entity: string) => `abb-welcome-wizard-card:capture:${entity}`;

/** Keep a running capture so it survives a reload of the page or app. */
export function storeActiveCapture(entity: string, capture: ActiveCapture | null): void {
  try {
    if (capture) window.localStorage.setItem(captureKey(entity), JSON.stringify(capture));
    else window.localStorage.removeItem(captureKey(entity));
  } catch {
    // ignore
  }
}

export function loadActiveCapture(entity: string): ActiveCapture | undefined {
  try {
    const raw = JSON.parse(window.localStorage.getItem(captureKey(entity)) ?? 'null');
    if (
      raw &&
      typeof raw.step === 'string' &&
      (raw.phase === 'armed' || raw.phase === 'recording') &&
      typeof raw.armedAt === 'number' &&
      Array.isArray(raw.lines)
    ) {
      return raw as ActiveCapture;
    }
  } catch {
    // ignore
  }
  return undefined;
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
