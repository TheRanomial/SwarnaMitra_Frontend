import { motion } from "framer-motion";

interface MessageProps {
  message: {
    role: "user" | "assistant";
    content: string;
  };
  darkMode: boolean;
}

export default function MessageBubble({ message, darkMode }: MessageProps) {
  const isUser = message.role === "user";

  const renderContent = (content: string) => {
    const parts = content.split(/(\*\*.*?\*\*)/g);
    return parts.map((part) => {
      if (part.startsWith("**") && part.endsWith("**")) {
        return <strong key={part}>{part.slice(2, -2)}</strong>;
      }
      return <span key={part}>{part}</span>;
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`max-w-[70%] p-3 rounded-lg ${
          isUser
            ? darkMode
              ? "bg-blue-600 text-white"
              : "bg-blue-500 text-white"
            : darkMode
            ? "bg-gray-700 text-gray-200"
            : "bg-gray-200 text-gray-800"
        }`}
        style={{
          wordWrap: "break-word",
          overflowWrap: "break-word",
          wordBreak: "break-word",
        }}
      >
        {renderContent(message.content)}
      </div>
    </motion.div>
  );
}
