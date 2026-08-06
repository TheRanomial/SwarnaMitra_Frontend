"use client";

import { motion } from "framer-motion";
import { Calendar, ReceiptText } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ChatInterface, { UiMessage } from "../components/ChatInterface";
import ConversationSidebar from "../components/ConversationSidebar";
import {
	loadConversations,
	loadCurrentId,
	saveConversations,
	saveCurrentId,
} from "../lib/conversationStore";
import { ensureUser } from "../lib/session";

interface Conversation {
	id: string;
	title: string;
	messages: UiMessage[];
}

export default function ChatPage() {
	const [darkMode, setDarkMode] = useState(true);
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [conversations, setConversations] = useState<Conversation[]>([]);
	const [currentConversationId, setCurrentConversationId] = useState<
		string | null
	>(null);
	const [userId, setUserId] = useState<number | null>(null);
	const [userName, setUserName] = useState<string | null>(null);
	const [bootstrapError, setBootstrapError] = useState<string | null>(null);
	const hydrated = useRef(false);

	useEffect(() => {
		if (darkMode) {
			document.body.classList.add("dark");
		} else {
			document.body.classList.remove("dark");
		}
	}, [darkMode]);

	useEffect(() => {
		let cancelled = false;
		(async () => {
			try {
				const u = await ensureUser();
				if (!cancelled) {
					setUserId(u.id);
					setUserName(u.name);
				}
			} catch (err) {
				if (!cancelled) {
					setBootstrapError(
						err instanceof Error ? err.message : "Failed to reach backend",
					);
				}
			}
		})();
		return () => {
			cancelled = true;
		};
	}, []);

	useEffect(() => {
		const stored = loadConversations();
		if (stored.length) setConversations(stored);
		const currentId = loadCurrentId();
		if (currentId) setCurrentConversationId(currentId);
		hydrated.current = true;
	}, []);

	useEffect(() => {
		if (!hydrated.current) return;
		saveConversations(conversations);
	}, [conversations]);
	useEffect(() => {
		if (!hydrated.current) return;
		saveCurrentId(currentConversationId);
	}, [currentConversationId]);

	const appendMessage = (convId: string | null, message: UiMessage): string => {
		const targetId = convId ?? Date.now().toString();
		setConversations((prev) => {
			const existing = convId ? prev.find((c) => c.id === convId) : undefined;
			if (existing) {
				return prev.map((c) =>
					c.id === convId ? { ...c, messages: [...c.messages, message] } : c,
				);
			}
			return [
				...prev,
				{
					id: targetId,
					title:
						message.content.slice(0, 30) +
						(message.content.length > 30 ? "..." : ""),
					messages: [message],
				},
			];
		});
		if (!convId) setCurrentConversationId(targetId);
		return targetId;
	};

	return (
		<div
			className={`min-h-screen flex transition-all duration-500 overflow-hidden relative
        ${
					darkMode
						? "dark bg-gradient-to-br from-black via-gray-900 to-black"
						: "bg-gradient-to-br from-yellow-50 via-white to-yellow-100"
				}`}
		>
			<div className="absolute inset-0 overflow-hidden pointer-events-none">
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.08),transparent_70%)]" />
				<div className="absolute inset-0 flex items-center justify-center">
					<div className="h-[60rem] w-[40rem] rounded-full bg-gradient-to-r from-yellow-500/20 to-amber-500/20 blur-3xl" />
				</div>
			</div>

			<motion.button
				onClick={() => setSidebarOpen(!sidebarOpen)}
				className={`fixed top-4 left-4 p-3 rounded-full transition-colors duration-300 z-20 shadow-lg
          ${
						darkMode
							? "bg-gray-800 text-yellow-400 border border-yellow-700/40"
							: "bg-white text-amber-600 border border-amber-300"
					}`}
				whileHover={{ scale: 1.1 }}
				whileTap={{ scale: 0.9 }}
			>
				{sidebarOpen ? "✕" : "☰"}
			</motion.button>

			<ConversationSidebar
				darkMode={darkMode}
				isOpen={sidebarOpen}
				conversations={conversations}
				currentConversationId={currentConversationId}
				setCurrentConversationId={setCurrentConversationId}
			/>

			<main
				className={`flex-1 flex flex-col items-center justify-center p-4 transition-all duration-300 ${
					sidebarOpen ? "ml-64" : "ml-0"
				}`}
			>
				<div className="fixed top-4 right-4 z-20 flex items-center gap-2">
					<Link
						href="/ledger"
						className={`px-3 py-2 rounded-lg flex items-center text-md font-semibold shadow ${
							darkMode
								? "bg-gray-800 text-yellow-400 border border-yellow-700/40 hover:bg-gray-700"
								: "bg-white text-amber-700 border border-amber-300 hover:bg-amber-50"
						}`}
					>
						<ReceiptText className="inline-block mr-1" size={16} />
						Purchase History
					</Link>
					<Link
						href="/sips"
						className={`px-3 py-2 rounded-lg flex items-center text-md font-semibold shadow ${
							darkMode
								? "bg-gray-800 text-yellow-400 border border-yellow-700/40 hover:bg-gray-700"
								: "bg-white text-amber-700 border border-amber-300 hover:bg-amber-50"
						}`}
					>
						<Calendar className="inline-block mr-1" size={16} />
						SIPs
					</Link>
				</div>

				<motion.h1
					initial={{ opacity: 0, y: -50 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className={`text-4xl font-extrabold mb-2 p-2 text-transparent bg-clip-text
            ${
							darkMode
								? "bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600"
								: "bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-700"
						}`}
				>
					SwarnaMitra (स्वर्णमित्र)
				</motion.h1>
				<motion.p
					initial={{ opacity: 0, y: -20 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6, delay: 0.2 }}
					className={`text-sm mb-2 text-center max-w-2xl leading-relaxed
            ${darkMode ? "text-gray-300" : "text-gray-700"}`}
				>
					Ask, quote, buy, or start a SIP regarding Gold — all in one chat.
				</motion.p>

				<div
					className={`text-xs mb-4 ${
						darkMode ? "text-gray-400" : "text-gray-500"
					}`}
				>
					{bootstrapError ? (
						<span className="text-red-400">
							Backend unreachable: {bootstrapError}
						</span>
					) : userName ? (
						<span>
							Session: <span className="font-semibold">{userName}</span> (#
							{userId})
						</span>
					) : (
						<span>Setting up your session…</span>
					)}
				</div>

				<ChatInterface
					darkMode={darkMode}
					userId={userId}
					appendMessage={appendMessage}
					currentConversation={
						conversations.find((conv) => conv.id === currentConversationId) ||
						null
					}
				/>
			</main>
		</div>
	);
}
