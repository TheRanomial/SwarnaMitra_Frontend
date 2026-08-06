"use client";

import { motion } from "framer-motion";
import type { ChatKind } from "../lib/api";

interface MessageProps {
	message: {
		role: "user" | "assistant";
		content: string;
		kind?: ChatKind;
		data?: Record<string, unknown>;
	};
	darkMode: boolean;
}

// Palette by kind — colours the rail on the left of assistant bubbles.
const KIND_STYLES: Record<
	string,
	{ ring: string; badge: string; label: string }
> = {
	advisory: {
		ring: "border-amber-400/50",
		badge: "bg-amber-500/20 text-amber-300",
		label: "advisory",
	},
	quote: {
		ring: "border-yellow-400/60",
		badge: "bg-yellow-500/20 text-yellow-300",
		label: "quote",
	},
	purchase_pending: {
		ring: "border-orange-400/60",
		badge: "bg-orange-500/20 text-orange-300",
		label: "awaiting confirmation",
	},
	sip_pending: {
		ring: "border-orange-400/60",
		badge: "bg-orange-500/20 text-orange-300",
		label: "awaiting confirmation",
	},
	sip_manage_pending: {
		ring: "border-orange-400/60",
		badge: "bg-orange-500/20 text-orange-300",
		label: "awaiting confirmation",
	},
	purchase_done: {
		ring: "border-green-400/60",
		badge: "bg-green-500/20 text-green-300",
		label: "purchase done",
	},
	sip_created: {
		ring: "border-green-400/60",
		badge: "bg-green-500/20 text-green-300",
		label: "sip created",
	},
	sip_existing: {
		ring: "border-blue-400/60",
		badge: "bg-blue-500/20 text-blue-300",
		label: "sip already exists",
	},
	sip_paused: {
		ring: "border-blue-400/60",
		badge: "bg-blue-500/20 text-blue-300",
		label: "sip paused",
	},
	sip_cancelled: {
		ring: "border-gray-400/60",
		badge: "bg-gray-500/20 text-gray-200",
		label: "sip cancelled",
	},
	sip_resumed: {
		ring: "border-green-400/60",
		badge: "bg-green-500/20 text-green-300",
		label: "sip resumed",
	},
	refused: {
		ring: "border-red-400/60",
		badge: "bg-red-500/20 text-red-300",
		label: "refused",
	},
	rejected: {
		ring: "border-red-400/60",
		badge: "bg-red-500/20 text-red-300",
		label: "rejected",
	},
	off_topic: {
		ring: "border-gray-400/60",
		badge: "bg-gray-500/20 text-gray-200",
		label: "off-topic",
	},
	clarify: {
		ring: "border-purple-400/60",
		badge: "bg-purple-500/20 text-purple-300",
		label: "needs detail",
	},
	price_unavailable: {
		ring: "border-red-400/60",
		badge: "bg-red-500/20 text-red-300",
		label: "price feed down",
	},
	not_found: {
		ring: "border-gray-400/60",
		badge: "bg-gray-500/20 text-gray-200",
		label: "not found",
	},
	cancelled: {
		ring: "border-gray-400/60",
		badge: "bg-gray-500/20 text-gray-200",
		label: "cancelled",
	},
	nothing_to_confirm: {
		ring: "border-gray-400/60",
		badge: "bg-gray-500/20 text-gray-200",
		label: "no pending action",
	},
	nothing_to_cancel: {
		ring: "border-gray-400/60",
		badge: "bg-gray-500/20 text-gray-200",
		label: "no pending action",
	},
};

function renderInlineBold(content: string) {
	const parts = content.split(/(\*\*.*?\*\*)/g);
	return parts.map((part, i) => {
		if (part.startsWith("**") && part.endsWith("**")) {
			return <strong key={i}>{part.slice(2, -2)}</strong>;
		}
		return <span key={i}>{part}</span>;
	});
}

// Human-friendly cards for the kinds that carry structured data.
function StructuredExtras({
	kind,
	data,
	darkMode,
}: {
	kind?: ChatKind;
	data?: Record<string, unknown>;
	darkMode: boolean;
}) {
	if (!kind || !data) return null;
	const rowClass = darkMode
		? "flex justify-between text-xs text-yellow-100/80"
		: "flex justify-between text-xs text-amber-900";

	if (kind === "quote") {
		return (
			<div className="mt-3 space-y-1">
				<div className={rowClass}>
					<span>Amount</span>
					<span>₹{String(data.amount_inr)}</span>
				</div>
				<div className={rowClass}>
					<span>You get</span>
					<span>{String(data.quantity_grams)} g</span>
				</div>
				<div className={rowClass}>
					<span>Price</span>
					<span>
						₹{String(data.price_per_gram_inr)}/g ({String(data.price_source)})
					</span>
				</div>
			</div>
		);
	}
	if (kind === "purchase_done") {
		const p = data.purchase as
			| {
					id: number;
					amount_inr: string;
					quantity_grams: string;
					price_per_gram_inr: string;
					price_source: string;
					created_at: string;
					idempotency_key: string;
			  }
			| undefined;
		if (!p) return null;
		return (
			<div className="mt-3 space-y-1">
				<div className={rowClass}>
					<span>Receipt #</span>
					<span>{p.id}</span>
				</div>
				<div className={rowClass}>
					<span>Amount</span>
					<span>₹{p.amount_inr}</span>
				</div>
				<div className={rowClass}>
					<span>Quantity</span>
					<span>{p.quantity_grams} g</span>
				</div>
				<div className={rowClass}>
					<span>Price</span>
					<span>
						₹{p.price_per_gram_inr}/g ({p.price_source})
					</span>
				</div>
				<div className={rowClass}>
					<span>When</span>
					<span>{new Date(p.created_at).toLocaleString()}</span>
				</div>
			</div>
		);
	}
	if (kind === "sip_created" || kind === "sip_existing") {
		const s = data.sip as
			| {
					id: number;
					amount_inr: string;
					frequency: string;
					anchor_day: number | null;
					next_run_at: string;
					status: string;
			  }
			| undefined;
		if (!s) return null;
		return (
			<div className="mt-3 space-y-1">
				<div className={rowClass}>
					<span>SIP #</span>
					<span>{s.id}</span>
				</div>
				<div className={rowClass}>
					<span>Amount</span>
					<span>
						₹{s.amount_inr} / {s.frequency}
						{s.anchor_day != null ? ` (day ${s.anchor_day})` : ""}
					</span>
				</div>
				<div className={rowClass}>
					<span>Next run</span>
					<span>{new Date(s.next_run_at).toLocaleString()}</span>
				</div>
				<div className={rowClass}>
					<span>Status</span>
					<span>{s.status}</span>
				</div>
			</div>
		);
	}
	return null;
}

export default function MessageBubble({ message, darkMode }: MessageProps) {
	const isUser = message.role === "user";
	const style =
		!isUser && message.kind ? KIND_STYLES[message.kind] : undefined;

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ duration: 0.3 }}
			className={`flex ${isUser ? "justify-end" : "justify-start"}`}
		>
			<div
				className={`max-w-[75%] p-3 rounded-lg border ${
					isUser
						? darkMode
							? "text-black border-amber-600 bg-gradient-to-r from-yellow-300 via-amber-400 to-yellow-500"
							: "bg-blue-500 text-white border-blue-400"
						: darkMode
							? `bg-gray-700 text-gray-100 ${style?.ring ?? "border-gray-600"}`
							: `bg-white text-gray-800 ${style?.ring ?? "border-gray-200"}`
				}`}
				style={{
					wordWrap: "break-word",
					overflowWrap: "break-word",
					wordBreak: "break-word",
				}}
			>
				{!isUser && style && (
					<div
						className={`inline-block px-2 py-0.5 mb-2 rounded text-[10px] uppercase tracking-wide font-semibold ${style.badge}`}
					>
						{style.label}
					</div>
				)}
				<div>{renderInlineBold(message.content)}</div>
				<StructuredExtras
					kind={message.kind}
					data={message.data}
					darkMode={darkMode}
				/>
			</div>
		</motion.div>
	);
}
