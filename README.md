# SwarnaMitra Frontend

Next.js 15 + React 19 + Tailwind interface for the **SwarnaMitra Backend v2**
(FastAPI + SQLite + Gemini). Ships with:

- **`/`** — Landing page.
- **`/chat`** — LLM-routed chat with inline Confirm / Cancel buttons for
  purchase and SIP proposals. Renders quotes, receipts, and SIP cards as
  structured payloads (not just plain text).
- **`/ledger`** — Your purchase history with exact rupee / gram totals.
- **`/sips`** — Manage active SIPs: pause, resume, cancel, or manually
  run due instalments.

## Setup

Assumes the v2 backend is available (see
`../SwarnaMitra-Backend-Python-v2/README.md`).

```bash
# 1. Install deps
npm install

# 2. Point the frontend at the backend
cp .env.local.example .env.local
# NEXT_PUBLIC_API_URL defaults to http://localhost:8000

# 3. Run
npm run dev            # dev with turbopack
# or:
npm run build && npm start
```

Open `http://localhost:3000`.

## How it talks to the backend

- All HTTP goes through `app/lib/api.ts` — one typed client per endpoint.
  No `axios`, just `fetch`; typed responses match the backend's dataclass
  shapes.
- On first visit to `/chat`, `app/lib/session.ts` calls `POST /users` and
  stashes the returned `{id, name}` in `localStorage`. Subsequent requests
  send that id. No auth, deliberately — matches the backend contract.
- Chat messages `POST /chat` with `{user_id, message}` and get back
  `{kind, reply, intent, data}`. The UI:
  - Colours the assistant bubble by `kind` (advisory / quote / refused /
    purchase_pending / …).
  - Renders `data` as a structured card for `quote`, `purchase_done`,
    `sip_created`, and `sip_existing`.
  - Shows an inline **Confirm / Cancel** bar whenever the last assistant
    reply is `*_pending` — clicking Confirm just sends `"yes"` and lets
    the backend consume the `pending_confirmations` row. This maps to the
    backend's rule that the LLM never executes writes; only user
    confirmation does.

## What changed vs the old frontend

The old frontend spoke to the Express/OpenAI backend:

- Payload `{userInput}` → response `{response: string}`.
- No confirmation flow, no receipts, no SIP or ledger UI.

This version speaks to v2:

- `POST /chat {user_id, message}` → `{kind, reply, data, intent}`.
- Two-step purchase & SIP flows with typed confirmation buttons.
- New pages for ledger and SIP management wired to
  `GET /users/{id}/ledger`, `GET /users/{id}/sips`,
  `POST /sip/{id}/{pause,resume,cancel}`, and the manual
  `POST /sip/run-due` worker.

## Project layout

```
app/
  page.tsx                  Landing
  chat/page.tsx             Chat page shell (session bootstrap + layout)
  ledger/page.tsx           Purchase history + totals
  sips/page.tsx             SIP list w/ pause / resume / cancel / run-due
  components/
    ChatInterface.tsx       Message list, input, Confirm/Cancel action bar
    MessageBubble.tsx       Kind-aware bubble w/ structured extras
    ConversationSidebar.tsx Local conversation history (in-memory)
  lib/
    api.ts                  Typed client for every v2 endpoint
    session.ts              localStorage-backed user session
```

## Verifying the wiring

```bash
# 1. In one terminal — backend
cd ../SwarnaMitra-Backend-Python-v2
LLM_MODE=fake HARD_FALLBACK_PRICE_INR_PER_GRAM=6543.21 python main.py

# 2. In another — frontend
npm run dev

# 3. Open http://localhost:3000/chat
#    Try: "How much gold for 500 rupees?"
#         "Buy gold worth 333.33"    → click Confirm
#         "Start a SIP of Rs 500 every month from the 31st" → Confirm
#    Then visit /ledger and /sips.
```
