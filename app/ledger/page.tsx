"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { getLedger, Ledger } from "../lib/api";
import { getStoredUser } from "../lib/session";

interface StoredUser {
	id: number;
	name: string;
}

export default function LedgerPage() {
	const [ledger, setLedger] = useState<Ledger | null>(null);
	const [error, setError] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);
	const [user, setUser] = useState<StoredUser | null>(null);
	const [userLoaded, setUserLoaded] = useState(false);

	// Load the stored user exactly once on mount. Reading localStorage on
	// every render would return a fresh object and trigger an infinite
	// fetch loop via the useCallback/useEffect chain below.
	useEffect(() => {
		setUser(getStoredUser());
		setUserLoaded(true);
	}, []);

	const refresh = useCallback(async () => {
		if (!user) return;
		setLoading(true);
		setError(null);
		try {
			const data = await getLedger(user.id);
			setLedger(data);
		} catch (err) {
			setError(err instanceof Error ? err.message : "Failed to load ledger");
		} finally {
			setLoading(false);
		}
	}, [user]);

	useEffect(() => {
		if (user) refresh();
	}, [user, refresh]);

	return (
		<div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black text-gray-100 p-6">
			<div className="max-w-5xl mx-auto">
				<div className="flex items-center justify-between mb-6">
					<h1 className="text-3xl font-extrabold text-yellow-300">
						Your Gold Ledger
					</h1>
					<div className="flex gap-2">
						<Link
							href="/chat"
							className="px-3 py-2 rounded-lg bg-gray-800 border border-yellow-700/40 text-yellow-300 text-sm hover:bg-gray-700"
						>
							← Chat
						</Link>
						<Link
							href="/sips"
							className="px-3 py-2 rounded-lg bg-gray-800 border border-yellow-700/40 text-yellow-300 text-sm hover:bg-gray-700"
						>
							SIPs
						</Link>
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
						first to create one.
					</p>
				)}

				{user && (
					<>
						<div className="mb-4 text-sm text-gray-300">
							Signed in as{" "}
							<span className="font-semibold">{user.name}</span> (#{user.id})
						</div>

						{loading && <p>Loading…</p>}
						{error && <p className="text-red-400">{error}</p>}

						{ledger && (
							<>
								<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
									<div className="p-4 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 text-black shadow">
										<div className="text-xs uppercase font-bold">Total spent</div>
										<div className="text-2xl font-extrabold">
											₹{ledger.totals.total_inr}
										</div>
									</div>
									<div className="p-4 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 text-black shadow">
										<div className="text-xs uppercase font-bold">Total grams</div>
										<div className="text-2xl font-extrabold">
											{ledger.totals.total_grams} g
										</div>
									</div>
									<div className="p-4 rounded-xl bg-gradient-to-br from-yellow-400 to-yellow-600 text-black shadow">
										<div className="text-xs uppercase font-bold">
											Purchases
										</div>
										<div className="text-2xl font-extrabold">
											{ledger.totals.count}
										</div>
									</div>
								</div>

								<div className="rounded-xl border border-yellow-700/40 overflow-hidden">
									<table className="w-full text-sm">
										<thead className="bg-gray-800 text-yellow-300">
											<tr>
												<th className="text-left p-3">#</th>
												<th className="text-left p-3">When</th>
												<th className="text-right p-3">Amount</th>
												<th className="text-right p-3">Grams</th>
												<th className="text-right p-3">Price/g</th>
												<th className="text-left p-3">Origin</th>
												<th className="text-left p-3">Price source</th>
											</tr>
										</thead>
										<tbody>
											{ledger.purchases.length === 0 ? (
												<tr>
													<td
														colSpan={7}
														className="text-center p-6 text-gray-400"
													>
														No purchases yet. Try{" "}
														<span className="italic">
															&quot;Buy gold worth 500&quot;
														</span>{" "}
														in the chat.
													</td>
												</tr>
											) : (
												ledger.purchases.map((p) => (
													<tr
														key={p.id}
														className="border-t border-gray-800 hover:bg-gray-800/50"
													>
														<td className="p-3">{p.id}</td>
														<td className="p-3 text-gray-300">
															{new Date(p.created_at).toLocaleString()}
														</td>
														<td className="p-3 text-right">
															₹{p.amount_inr}
														</td>
														<td className="p-3 text-right">
															{p.quantity_grams} g
														</td>
														<td className="p-3 text-right">
															₹{p.price_per_gram_inr}
														</td>
														<td className="p-3">
															<span
																className={`px-2 py-0.5 rounded text-xs ${
																	p.origin === "sip"
																		? "bg-blue-500/20 text-blue-300"
																		: p.origin === "chat"
																			? "bg-yellow-500/20 text-yellow-300"
																			: "bg-gray-500/20 text-gray-200"
																}`}
															>
																{p.origin}
															</span>
														</td>
														<td className="p-3 text-gray-300">
															{p.price_source}
														</td>
													</tr>
												))
											)}
										</tbody>
									</table>
								</div>
							</>
						)}
					</>
				)}
			</div>
		</div>
	);
}
