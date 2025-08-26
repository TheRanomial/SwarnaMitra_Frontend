"use client"
import { useRouter } from "next/navigation";

export default function Home() {
	const router = useRouter();
	return (
		<div className="relative min-h-screen bg-black flex flex-col justify-center items-center overflow-hidden">
			<div className="absolute inset-0 bg-gradient-to-br from-yellow-900/40 via-amber-800/30 to-black" />
			<div className="absolute -top-32 -left-32 w-96 h-96 bg-yellow-600 rounded-full blur-3xl opacity-20 animate-pulse" />
			<div className="absolute -bottom-32 -right-32 w-96 h-96 bg-amber-700 rounded-full blur-3xl opacity-20 animate-pulse" />

			<div className="relative z-10 max-w-5xl w-full bg-gradient-to-br from-gray-900/90 via-gray-800/80 to-gray-900/90 border border-yellow-700/40 rounded-2xl shadow-[0_0_30px_rgba(255,215,0,0.2)] p-10 md:p-16 backdrop-blur-lg text-center transform transition-all hover:scale-[1.02]">
				<h1 className="text-4xl md:text-6xl font-extrabold mb-6 bg-clip-text text-transparent  bg-yellow-300 drop-shadow-lg p-4">
					✨ SwarnaMitra (स्वर्णमित्र)
				</h1>

				<p className="text-lg md:text-xl mb-10 max-w-2xl mx-auto text-gray-200 leading-relaxed font-blenderPro">
					Your <span className="font-semibold">AI-powered gold companion</span>{" "}
					<br />
					Empowering you with real-time insights, trusted guidance, and
					personalized strategies to unlock the true potential of gold. Invest
					smarter. Shine brighter.
				</p>

				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-10">
					<div className="bg-gradient-to-br from-yellow-500 to-amber-600 p-5 rounded-xl shadow-lg hover:shadow-2xl transition">
						<h3 className="font-bold text-lg mb-2 font-blenderPro">
							Smart Insights
						</h3>
						<p className="text-sm text-gray-100 font-blenderPro">
							AI-driven predictions for gold price trends
						</p>
					</div>
					<div className="bg-gradient-to-br from-amber-600 to-orange-600 p-5 rounded-xl shadow-lg hover:shadow-2xl transition">
						<h3 className="font-bold text-lg mb-2 font-blenderPro">
							Trusted Guidance
						</h3>
						<p className="text-sm text-gray-100 font-blenderPro">
							Your personal guide for secure gold investments
						</p>
					</div>
					<div className="bg-gradient-to-br from-yellow-400 to-yellow-700 p-5 rounded-xl shadow-lg hover:shadow-2xl transition">
						<h3 className="font-bold text-lg mb-2 font-blenderPro">
							Golden Opportunities
						</h3>
						<p className="text-sm text-gray-100 font-blenderPro">
							Identify the right time to invest with confidence
						</p>
					</div>
					<div className="bg-gradient-to-br from-orange-500 to-amber-700 p-5 rounded-xl shadow-lg hover:shadow-2xl transition">
						<h3 className="font-bold text-lg mb-2 font-blenderPro">
							Wealth Simplified
						</h3>
						<p className="text-sm text-gray-100 font-blenderPro">
							Modern, transparent, and hassle-free gold ownership
						</p>
					</div>
				</div>

				<button
					type="button"
					onClick={() => router.push("/chat")}
					className="inline-block bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-black font-bold py-4 px-10 rounded-full transition duration-300 ease-in-out transform hover:scale-110 shadow-[0_0_20px_rgba(255,215,0,0.5)]"
				>
					Chat Now
				</button>
			</div>

			<footer className="relative z-10 mt-12 text-center text-sm text-gray-400">
				<p>
					&quot;सोना एक ऐसा तत्व है, जिसका मनुष्य के जीवन में महत्वपूर्ण स्थान रहा है। यह
					केवल एक धातु नहीं, बल्कि विभिन्न भावनाओं, विचारों और मूल्यों का प्रतीक भी
					है।&quot;
				</p>
			</footer>
		</div>
	);
}
