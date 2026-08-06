// LocalStorage-backed persistence for chat conversations.
//
// Without this, navigating to /ledger or /sips and back would wipe the
// chat state because the /chat route component unmounts on navigation.

import type { UiMessage } from "../components/ChatInterface";

const CONVERSATIONS_KEY = "swarnamitra.conversations";
const CURRENT_ID_KEY = "swarnamitra.currentConversationId";

export interface StoredConversation {
	id: string;
	title: string;
	messages: UiMessage[];
}

export function loadConversations(): StoredConversation[] {
	if (typeof window === "undefined") return [];
	const raw = window.localStorage.getItem(CONVERSATIONS_KEY);
	if (!raw) return [];
	try {
		const parsed = JSON.parse(raw);
		if (Array.isArray(parsed)) return parsed as StoredConversation[];
	} catch {
		/* fall through to empty */
	}
	return [];
}

export function saveConversations(convs: StoredConversation[]): void {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(CONVERSATIONS_KEY, JSON.stringify(convs));
}

export function loadCurrentId(): string | null {
	if (typeof window === "undefined") return null;
	return window.localStorage.getItem(CURRENT_ID_KEY);
}

export function saveCurrentId(id: string | null): void {
	if (typeof window === "undefined") return;
	if (id) window.localStorage.setItem(CURRENT_ID_KEY, id);
	else window.localStorage.removeItem(CURRENT_ID_KEY);
}

export function clearConversations(): void {
	if (typeof window === "undefined") return;
	window.localStorage.removeItem(CONVERSATIONS_KEY);
	window.localStorage.removeItem(CURRENT_ID_KEY);
}
