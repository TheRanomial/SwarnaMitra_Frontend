"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
	cancelSip,
	getUserSips,
	pauseSip,
	resumeSip,
	runDueSips,
	SIP,
} from "../lib/api";
import { getStoredUser } from "../lib/session";

interface StoredUser {
	id: number;
	name: string;
}

export default function SipsPage() {
	const [sips, setSips] = useState<SIP[]>([]);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [runResult, setRunResult] = useState<string | null>(null);
	const [user, setUser] = useState<StoredUser | null>(null);
	const [userLoaded, setUserLoaded] = useState(false);

	useEffect(() => {
		setUser(getStoredUser());
		setUserLoaded(true);
	}, []);

	const refresh = useCallback(async () => {
		if (!user) return;
		setLoading(true);
		setError(null);
		try {
			const data = await getUserSips(user.id);
			setSips(data.sips);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load SIPs");
		} finally {
			setLoading(false);
		}
	}, [user]);

	useEffect(() => {
		if (user) refresh();
	}, [user, refresh]);

	const doAction = async (
		action: "pause" | "resume" | "cancel",
		sipId: number,
	) => {
		if (!user) return;
		try {
			if (action === "pause") await pauseSip(sipId, user.id);
			else if (action === "resume") await resumeSip(sipId, user.id);
			else await cancelSip(sipId, user.id);
			await refresh();
		} catch (err) {
			setError(err instanceof Error ? err.message : "Action failed");
		}
	};

	const runDue = async () => {
		setRunResult(null);
		try {
			const r = await runDueSips();
			setRunResult(`Executed ${r.count} due instalment(s).`);
			await refresh();
		} catch (err) {
			setError(err instanceof Error ? err.message : "run-due failed");
		}
	};

	return (
		<div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-gray-100 p-6">
			<div className="max-w-5xl mx-auto">
				<div className="flex items-center justify-between mb-6">
					<h1 className="text-3xl font-extrabold text-yellow-300">Your SIPs</h1>
					<div className="flex gap-2">
						<Link
							href="/chat"
							className="px-3 py-2 rounded-lg bg-gray-800 border border-yellow-700/40 text-yellow-300 text-sm hover:bg-gray-700"
						>
							← Chat
						</Link>
						<Link
							href="/ledger"
							className="px-3 py-2 rounded-lg bg-gray-800 border border-yellow-700/40 text-yellow-300 text-sm hover:bg-gray-700"
						>
							Purchase History
						</Link>
						<button
							type="button"
							onClick={runDue}
							className="px-3 py-2 rounded-lg bg-amber-500 text-black text-sm font-semibold hover:bg-amber-400"
							title="Manually fire any due SIP installments"
						>
							Run due
						</button>
						<button
							type="button"
							onClick={refresh}
							className="px-3 py-2 rounded-lg bg-yellow-500 text-black text-sm font-semibold hover:bg-yellow-400"
						>
							Refresh
						</button>
					</div>
				</div>

				{userLoaded && !user && (
					<p className="text-red-300">
						No session yet — visit the{" "}
						<Link href="/chat" className="underline">
							chat
						</Link>{" "}
						first.
					</p>
				)}

				{user && (
					<>
						<div className="mb-4 text-sm text-gray-300">
							Signed in as <span className="font-semibold">{user.name}</span> (#
							{user.id})
						</div>

						{runResult && (
							<div className="mb-4 p-3 rounded-lg">{runResult}</div>
						)}

						{error && <p className="text-red-400">{error}</p>}

						<div className="rounded-xl border border-yellow-700/40 overflow-hidden">
							<table className="w-full text-sm">
								<thead className="bg-gray-800 text-yellow-300">
									<tr>
										<th className="text-left p-3">#</th>
										<th className="text-right p-3">Amount</th>
										<th className="text-left p-3">Freq</th>
										<th className="text-left p-3">Anchor</th>
										<th className="text-left p-3">Next run</th>
										<th className="text-left p-3">Status</th>
										<th className="text-right p-3">Actions</th>
									</tr>
								</thead>
								<tbody>
									{sips.length === 0 ? (
										<tr>
											<td colSpan={7} className="text-center p-6 text-gray-400">
												No SIPs yet. Try{" "}
												<span className="italic">
													&quot;Start a SIP of Rs 500 every month from the
													31st&quot;
												</span>{" "}
												in the chat.
											</td>
										</tr>
									) : (
										sips.map((s) => (
											<tr
												key={s.id}
												className="border-t border-gray-800 hover:bg-gray-800/50"
											>
												<td className="p-3">{s.id}</td>
												<td className="p-3 text-right">₹{s.amount_inr}</td>
												<td className="p-3">{s.frequency}</td>
												<td className="p-3">
													{s.anchor_day == null ? "—" : s.anchor_day}
												</td>
												<td className="p-3 text-gray-300">
													{new Date(s.next_run_at).toLocaleString()}
												</td>
												<td className="p-3">
													<span
														className={`px-2 py-0.5 rounded text-xs ${
															s.status === "active"
																? "bg-green-500/20 text-green-300"
																: s.status === "paused"
																	? "bg-blue-500/20 text-blue-300"
																	: "bg-gray-500/20 text-gray-200"
														}`}
													>
														{s.status}
													</span>
												</td>
												<td className="p-3">
													<div className="flex justify-end gap-2">
														{s.status === "active" && (
															<button
																type="button"
																onClick={() => doAction("pause", s.id)}
																className="px-2 py-1 rounded bg-blue-600 hover:bg-blue-700 text-white text-xs"
															>
																Pause
															</button>
														)}
														{s.status === "paused" && (
															<button
																type="button"
																onClick={() => doAction("resume", s.id)}
																className="px-2 py-1 rounded bg-green-600 hover:bg-green-700 text-white text-xs"
															>
																Resume
															</button>
														)}
														{s.status !== "cancelled" && (
															<button
																type="button"
																onClick={() => doAction("cancel", s.id)}
																className="px-2 py-1 rounded bg-red-600 hover:bg-red-700 text-white text-xs"
															>
																Cancel
															</button>
														)}
													</div>
												</td>
											</tr>
										))
									)}
								</tbody>
							</table>
						</div>
					</>
				)}
			</div>
		</div>
	);
}
