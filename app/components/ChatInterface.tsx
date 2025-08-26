import axios from "axios";
import { ArrowBigUp } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import MessageBubble from "./MessageBubble";

interface Message {
	role: "user" | "assistant";
	content: string;
}

interface Conversation {
	id: string;
	title: string;
	messages: Message[];
}

interface ChatInterfaceProps {
	darkMode: boolean;
	addMessageToConversation: (message: Message) => void;
	currentConversation: Conversation | null;
}

export default function ChatInterface({
	darkMode,
	addMessageToConversation,
	currentConversation,
}: ChatInterfaceProps) {
	const [input, setInput] = useState("");
	const [isLoading, setIsLoading] = useState(false);
	const messagesEndRef = useRef<HTMLDivElement>(null);

	const scrollToBottom = () => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	};

	useEffect(scrollToBottom, []);

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!input.trim()) return;

		const userMessage: Message = { role: "user", content: input };
		addMessageToConversation(userMessage);
		setInput("");
		setIsLoading(true);

		try {
			const response = await axios.post(
				`${process.env.NEXT_PUBLIC_API_URL}/chat`,
				{
					userInput: input,
				},
			);

			const assistantMessage: Message = {
				role: "assistant",
				content: response.data.response,
			};
			addMessageToConversation(assistantMessage);
		} catch (error) {
			console.error("Error:", error);
			addMessageToConversation({
				role: "assistant",
				content: "⚠️ Sorry, I encountered an error. Please try again.",
			});
		} finally {
			setIsLoading(false);
		}
	};

	return (
		<div
			className={`relative w-full max-w-4xl h-[600px] flex flex-col rounded-xl overflow-hidden shadow-[0_0_30px_rgba(255,215,0,0.15)] border 
        ${
					darkMode
						? "bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border-yellow-700/40"
						: "bg-gradient-to-br from-yellow-50 via-white to-yellow-100 border-amber-200"
				}`}
		>
			<div className="flex-1 overflow-y-auto p-6 space-y-4">
				{currentConversation?.messages.map((message, idx) => (
					<MessageBubble
						key={`${currentConversation?.id}-${idx}-${message.role}-${message.content.slice(
							0,
							20,
						)}`}
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
				<div ref={messagesEndRef} />
			</div>

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
						placeholder="Ask SwarnaMitra anything about gold..."
						className={`flex-1 p-3 rounded-lg outline-none shadow-inner transition 
              ${
								darkMode
									? "bg-gray-800 text-white placeholder-gray-400 focus:ring-2 focus:ring-yellow-500"
									: "bg-white text-gray-800 placeholder-gray-500 focus:ring-2 focus:ring-amber-400"
							}`}
					/>
					<button
						type="submit"
						disabled={isLoading}
						className={`px-5 py-3 rounded-lg font-bold flex items-center justify-center shadow-lg transition transform hover:scale-105
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
