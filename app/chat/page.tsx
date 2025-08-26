"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import ChatInterface from "../components/ChatInterface";
import ConversationSidebar from "../components/ConversationSidebar";

interface Message {
	role: "user" | "assistant";
	content: string;
}

interface Conversation {
	id: string;
	title: string;
	messages: Message[];
}

export default function Home() {
	const [darkMode, setDarkMode] = useState(true);
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [conversations, setConversations] = useState<Conversation[]>([]);
	const [currentConversationId, setCurrentConversationId] = useState<
		string | null
	>(null);

	useEffect(() => {
		if (darkMode) {
			document.body.classList.add("dark");
		} else {
			document.body.classList.remove("dark");
		}
	}, [darkMode]);

	const addMessageToConversation = (message: Message) => {
		setConversations((prevConversations) => {
			if (currentConversationId) {
				return prevConversations.map((conv) =>
					conv.id === currentConversationId
						? { ...conv, messages: [...conv.messages, message] }
						: conv,
				);
			} else {
				const newConversation: Conversation = {
					id: Date.now().toString(),
					title:
						message.content.slice(0, 30) +
						(message.content.length > 30 ? "..." : ""),
					messages: [message],
				};
				setCurrentConversationId(newConversation.id);
				return [...prevConversations, newConversation];
			}
		});
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
				<motion.button
					onClick={() => setDarkMode(!darkMode)}
					className={`fixed top-4 right-4 p-3 rounded-full transition-colors duration-300 shadow-md
            ${
							darkMode
								? "bg-gradient-to-r from-yellow-400 to-amber-500 text-black"
								: "bg-gradient-to-r from-gray-800 to-gray-900 text-yellow-300"
						}`}
					whileHover={{ scale: 1.1 }}
					whileTap={{ scale: 0.9 }}
				>
					{darkMode ? "☀️" : "🌙"}
				</motion.button>
				<motion.h1
					initial={{ opacity: 0, y: -50 }}
					animate={{ opacity: 1, y: 0 }}
					transition={{ duration: 0.6 }}
					className={`text-4xl font-extrabold mb-4 p-2 text-transparent bg-clip-text 
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
					className={`text-sm mb-6 text-center max-w-2xl leading-relaxed
            ${darkMode ? "text-gray-300" : "text-gray-700"}`}
				>
					Your trusted AI companion for everything gold — from buying insights
					to market updates, delivered with brilliance ✨
				</motion.p>
				<ChatInterface
					darkMode={darkMode}
					addMessageToConversation={addMessageToConversation}
					currentConversation={
						conversations.find((conv) => conv.id === currentConversationId) ||
						null
					}
				/>
			</main>
		</div>
	);
}
