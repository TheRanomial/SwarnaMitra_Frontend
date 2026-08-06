// Get-or-create a demo user and persist the id in localStorage.
//
// The v2 backend has no auth; the user_id is a plain int. For a real
// deployment this would be replaced by a proper auth session.

import { createUser } from "./api";

const STORAGE_KEY = "swarnamitra.user";

interface StoredUser {
  id: number;
  name: string;
}

export function getStoredUser(): StoredUser | null {
  if (typeof window === "undefined") return null;
  const raw = window.localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (typeof parsed?.id === "number" && typeof parsed?.name === "string") {
      return parsed;
    }
  } catch {
    /* fall through */
  }
  return null;
}

export function setStoredUser(user: StoredUser): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function clearStoredUser(): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(STORAGE_KEY);
}

export async function ensureUser(name?: string): Promise<StoredUser> {
  const existing = getStoredUser();
  if (existing) return existing;
  const fallback =
    name?.trim() || `Guest-${Math.random().toString(36).slice(2, 8)}`;
  const created = await createUser(fallback);
  const stored: StoredUser = { id: created.id, name: created.name };
  setStoredUser(stored);
  return stored;
}
