// Typed client for the SwarnaMitra v2 backend.
//
// All money strings arrive already quantised (INR: 2dp, grams: 4dp). Do not
// coerce them to `number` in the UI — render as-is to preserve precision.

export const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export type ChatKind =
  | "advisory"
  | "quote"
  | "purchase_pending"
  | "purchase_done"
  | "sip_pending"
  | "sip_created"
  | "sip_existing"
  | "sip_manage_pending"
  | "sip_paused"
  | "sip_cancelled"
  | "sip_resumed"
  | "cancelled"
  | "clarify"
  | "refused"
  | "off_topic"
  | "rejected"
  | "price_unavailable"
  | "not_found"
  | "nothing_to_confirm"
  | "nothing_to_cancel"
  | "unknown_pending";

export interface ChatResponse {
  kind: ChatKind;
  reply: string;
  intent: string;
  data: Record<string, unknown>;
  used_llm_fallback: boolean;
}

export interface Purchase {
  id: number;
  user_id: number;
  amount_inr: string;
  quantity_grams: string;
  price_per_gram_inr: string;
  price_source: "live" | "cached" | "hard_fallback";
  origin: "api" | "chat" | "sip";
  sip_id: number | null;
  idempotency_key: string;
  created_at: string;
  replayed: boolean;
}

export interface SIP {
  id: number;
  user_id: number;
  amount_inr: string;
  frequency: "daily" | "weekly" | "monthly";
  anchor_day: number | null;
  next_run_at: string;
  status: "active" | "paused" | "cancelled";
  idempotency_key: string;
  created_at: string;
}

export interface Ledger {
  purchases: Purchase[];
  totals: { total_inr: string; total_grams: string; count: string };
}

export interface JourneyEvent {
  id: number;
  user_id: number;
  kind: string;
  payload: Record<string, unknown>;
  created_at: string;
}

export interface Journey {
  user: { id: number; name: string };
  events: JourneyEvent[];
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  extraHeaders: Record<string, string> = {}
): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...extraHeaders,
      ...(init.headers || {}),
    },
  });
  const text = await res.text();
  const body = text ? JSON.parse(text) : null;
  if (!res.ok) {
    const message =
      (body && (body.message || body.error)) || `HTTP ${res.status}`;
    throw new ApiError(message, res.status, body);
  }
  return body as T;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public body: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// -------- Users --------

export function createUser(name: string) {
  return request<{ id: number; name: string }>("/users", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
}

export function getUser(id: number) {
  return request<{ id: number; name: string; created_at: string }>(
    `/users/${id}`
  );
}

// -------- Chat --------

export function chat(user_id: number, message: string) {
  return request<ChatResponse>("/chat", {
    method: "POST",
    body: JSON.stringify({ user_id, message }),
  });
}

// -------- Purchase (direct) --------

export function purchase(
  user_id: number,
  amount_inr: string,
  idempotency_key: string
) {
  return request<Purchase>(
    "/purchase",
    {
      method: "POST",
      body: JSON.stringify({ user_id, amount_inr }),
    },
    { "Idempotency-Key": idempotency_key }
  );
}

// -------- SIP --------

export function createSip(
  user_id: number,
  amount_inr: string,
  frequency: "daily" | "weekly" | "monthly",
  opts: { anchor_day?: number; start_date?: string } = {},
  idempotency_key?: string
) {
  const body = JSON.stringify({
    user_id,
    amount_inr,
    frequency,
    anchor_day: opts.anchor_day,
    start_date: opts.start_date,
  });
  return request<{ sip: SIP; created: boolean }>(
    "/sip",
    { method: "POST", body },
    idempotency_key ? { "Idempotency-Key": idempotency_key } : {}
  );
}

export function pauseSip(sip_id: number, user_id: number) {
  return request<SIP>(`/sip/${sip_id}/pause`, {
    method: "POST",
    body: JSON.stringify({ user_id }),
  });
}

export function resumeSip(sip_id: number, user_id: number) {
  return request<SIP>(`/sip/${sip_id}/resume`, {
    method: "POST",
    body: JSON.stringify({ user_id }),
  });
}

export function cancelSip(sip_id: number, user_id: number) {
  return request<SIP>(`/sip/${sip_id}/cancel`, {
    method: "POST",
    body: JSON.stringify({ user_id }),
  });
}

export function runDueSips() {
  return request<{ executed: unknown[]; count: number }>("/sip/run-due", {
    method: "POST",
  });
}

// -------- Read APIs --------

export function getLedger(user_id: number) {
  return request<Ledger>(`/users/${user_id}/ledger`);
}

export function getUserSips(user_id: number) {
  return request<{ sips: SIP[] }>(`/users/${user_id}/sips`);
}

export function getJourney(user_id: number) {
  return request<Journey>(`/users/${user_id}/journey`);
}
