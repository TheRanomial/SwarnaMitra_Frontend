"use client";
import { motion } from "framer-motion";
import { MessageSquare, Plus } from "lucide-react";
import { useEffect, useRef } from "react";

interface Message {
	role: "user" | "assistant";
	content: string;
}

interface Conversation {
	id: string;
	title: string;
	messages: Message[];
}

interface ConversationSidebarProps {
	darkMode: boolean;
	isOpen: boolean;
	conversations: Conversation[];
	currentConversationId: string | null;
	setCurrentConversationId: (id: string) => void;
}

export default function ConversationSidebar({
	darkMode,
	isOpen,
	conversations,
	currentConversationId,
	setCurrentConversationId,
}: ConversationSidebarProps) {
	const conversationListRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		if (conversationListRef.current) {
			conversationListRef.current.scrollTop =
				conversationListRef.current.scrollHeight;
		}
	}, []);

	return (
		<motion.div
			initial={{ x: -300 }}
			animate={{ x: isOpen ? 0 : -300 }}
			transition={{ duration: 0.3 }}
			className={`fixed left-0 top-0 bottom-0 w-64 ${
				darkMode ? "bg-gray-800" : "bg-white"
			} shadow-lg z-10 flex flex-col`}
		>
			<div className="flex-shrink-0">
				<div className="flex items-center p-4">
					<h2
						className={`text-xl font-bold ${
							darkMode ? "text-white" : "text-gray-800"
						}`}
					>
						Conversations
					</h2>
				</div>

				<div className="p-4">
					<button
						type="button"
						className={`w-full py-2 px-4 rounded-lg mb-4 flex items-center justify-center ${
							darkMode
								? "bg-yellow-300 hover:bg-yellow-400 text-black"
								: "bg-yellow-300 hover:bg-yellow-400 text-black"
						}`}
						onClick={() => setCurrentConversationId("")}
					>
						<Plus size={20} className="mr-2" />
						New Chat
					</button>
				</div>
			</div>
			<div ref={conversationListRef} className="flex-grow overflow-y-auto p-4">
				<div className="space-y-2">
					{conversations.map((conversation) => (
						<button
							key={conversation.id}
							type="button"
							className={`p-2 rounded-lg cursor-pointer ${
								darkMode
									? conversation.id === currentConversationId
										? "bg-gray-700 text-white"
										: "hover:bg-gray-700 text-gray-300"
									: conversation.id === currentConversationId
										? "bg-gray-200 text-gray-800"
										: "hover:bg-gray-100 text-gray-600"
							}`}
							onClick={() => setCurrentConversationId(conversation.id)}
						>
							<div className="flex items-center">
								<MessageSquare size={16} className="mr-2" />
								<span className="font-medium">{conversation.title}</span>
							</div>
							<p className="text-sm truncate mt-1">
								{
									conversation.messages[conversation.messages.length - 1]
										?.content
								}
							</p>
						</button>
					))}
				</div>
			</div>
		</motion.div>
	);
}
