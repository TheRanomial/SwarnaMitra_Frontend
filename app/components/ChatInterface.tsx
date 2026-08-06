"use client";

import { ArrowBigUp, Check, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ApiError, type ChatKind, type ChatResponse, chat } from "../lib/api";
import MessageBubble from "./MessageBubble";

export interface UiMessage {
	role: "user" | "assistant";
	content: string;
	kind?: ChatKind;
	data?: Record<string, unknown>;
	intent?: string;
	usedFallback?: boolean;
}

interface Conversation {
	id: string;
	title: string;
	messages: UiMessage[];
}

interface ChatInterfaceProps {
	darkMode: boolean;
	userId: number | null;
	appendMessage: (convId: string | null, message: UiMessage) => string;
	currentConversation: Conversation | null;
}

const PENDING_KINDS: ChatKind[] = [
	"purchase_pending",
	"sip_pending",
	"sip_manage_pending",
];

export default function ChatInterface({
	darkMode,
	userId,
	appendMessage,
	currentConversation,
}: ChatInterfaceProps) {
	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const messagesContainerRef = useRef<HTMLDivElement>(null);

	const messageCount = currentConversation?.messages.length ?? 0;
	useEffect(() => {
		const el = messagesContainerRef.current;
		if (!el) return;
		el.scrollTo({ top: el.scrollHeight, behavior: "smooth" });
	}, [messageCount, isLoading, currentConversation?.id]);

	const lastMessage =
		currentConversation?.messages[currentConversation.messages.length - 1];
	const showConfirmBar =
		lastMessage?.role === "assistant" &&
		lastMessage.kind !== undefined &&
		PENDING_KINDS.includes(lastMessage.kind);

	const sendMessage = async (text: string) => {
		if (!text.trim() || !userId) return;

		const convId = appendMessage(currentConversation?.id ?? null, {
			role: "user",
			content: text,
		});
		setInput("");
		setIsLoading(true);

		try {
			const res: ChatResponse = await chat(userId, text);
			appendMessage(convId, {
				role: "assistant",
				content: res.reply,
				kind: res.kind,
				data: res.data,
				intent: res.intent,
				usedFallback: res.used_llm_fallback,
			});
		} catch (error) {
			const message =
				error instanceof ApiError
					? `⚠️ ${error.message} (HTTP ${error.status})`
					: "⚠️ Sorry, I encountered an error. Please try again.";
			appendMessage(convId, { role: "assistant", content: message });
			console.error("chat error", error);
		} finally {
			setIsLoading(false);
		}
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		sendMessage(input);
	};

	return (
		<div
			className={`relative w-full max-w-4xl h-[750px] flex flex-col rounded-xl overflow-hidden shadow-[0_0_30px_rgba(255,215,0,0.15)] border
        ${
					darkMode
						? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-yellow-700/40"
						: "bg-gradient-to-br from-yellow-50 via-white to-yellow-100 border-amber-200"
				}`}
		>
			<div
				ref={messagesContainerRef}
				className="flex-1 overflow-y-auto p-6 space-y-4"
			>
				{currentConversation?.messages.length ? null : (
					<div
						className={`text-center text-sm ${
							darkMode ? "text-gray-400" : "text-gray-500"
						}`}
					>
						<p>
							Try:{" "}
							<span className="italic">
								&quot;How much gold can I buy for 500 rupees?&quot;
							</span>
						</p>
						<p>
							or{" "}
							<span className="italic">
								&quot;Start a SIP of Rs 500 every month from the 31st&quot;
							</span>
						</p>
					</div>
				)}
				{currentConversation?.messages.map((message, idx) => (
					<MessageBubble
						key={`${currentConversation.id}-${idx}`}
						message={message}
						darkMode={darkMode}
					/>
				))}
				{isLoading && (
					<div
						className={`flex justify-center items-center h-8 ${
							darkMode ? "text-yellow-400" : "text-amber-600"
						}`}
					>
						<div className="animate-bounce mx-1">•</div>
						<div className="animate-bounce mx-1 animation-delay-200">•</div>
						<div className="animate-bounce mx-1 animation-delay-400">•</div>
					</div>
				)}
			</div>

			{showConfirmBar && (
				<div
					className={`px-4 py-3 border-t flex items-center justify-between gap-3 text-sm
            ${
							darkMode
								? "bg-yellow-900/30 border-yellow-700/40 text-yellow-100"
								: "bg-amber-100 border-amber-300 text-amber-900"
						}`}
				>
					<span>Awaiting your confirmation.</span>
					<div className="flex gap-2">
						<button
							type="button"
							disabled={isLoading}
							onClick={() => sendMessage("yes")}
							className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-green-600 hover:bg-green-700 text-white font-semibold shadow disabled:opacity-50"
						>
							<Check size={16} /> Confirm
						</button>
						<button
							type="button"
							disabled={isLoading}
							onClick={() => sendMessage("no")}
							className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-gray-700 hover:bg-gray-800 text-white font-semibold shadow disabled:opacity-50"
						>
							<X size={16} /> Cancel
						</button>
					</div>
				</div>
			)}

			<form
				onSubmit={handleSubmit}
				className={`p-4 border-t ${
					darkMode ? "border-yellow-700/30" : "border-amber-300"
				}`}
			>
				<div className="flex space-x-3">
					<input
						type="text"
						value={input}
						onChange={(e) => setInput(e.target.value)}
						placeholder={
							userId
								? "Ask SwarnaMitra anything about gold..."
								: "Setting up your session..."
						}
						disabled={!userId || isLoading}
						className={`flex-1 p-3 rounded-lg outline-none shadow-inner transition disabled:opacity-60
              ${
								darkMode
									? "bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500"
									: "bg-white text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-amber-400"
							}`}
					/>
					<button
						type="submit"
						disabled={isLoading || !userId}
						className={`px-5 py-3 rounded-lg font-bold flex items-center justify-center shadow-lg transition transform hover:scale-105 disabled:opacity-50 disabled:hover:scale-100
              ${
								darkMode
									? "bg-gradient-to-r from-yellow-500 to-amber-600 text-black hover:from-yellow-600 hover:to-amber-700"
									: "bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:from-amber-600 hover:to-yellow-600"
							}`}
					>
						<ArrowBigUp className="w-5 h-5" />
					</button>
				</div>
			</form>
		</div>
	);
}
