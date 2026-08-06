"use client";

import { useAuthStore } from "@/stores/authStore";
import { useGuessWhoLeaderboard } from "@/hooks/queries/useGuessWho";
import { getProfilePictureUrl } from "@/lib/utils";
import { VawLeaderboardSkeleton } from "@/components/guess-who/shared/VawSkeleton";
import { useMemo } from "react";

export function VawLeaderboardPanel() {
	const { isAuthenticated, user } = useAuthStore();
	const { data: leaderboard, isLoading } = useGuessWhoLeaderboard();

	const getShortName = (fullName?: string | null) => {
		if (!fullName) return fullName;
		return fullName.split(" ").slice(0, 2).join(" ");
	};

	const userEntry = useMemo(() => {
		if (!leaderboard || !user) return null;
		return leaderboard.find(
			(entry) => entry.user_id === user.id || entry.name === user.name,
		);
	}, [leaderboard, user]);

	if (isLoading) {
		return <VawLeaderboardSkeleton />;
	}

	const totalAttempts = userEntry?.total_attempts ?? 0;
	const correctAnswers = userEntry?.correct_answers ?? 0;
	const rank = userEntry?.rank ?? null;
	const bestLevel = userEntry?.level ?? null;
	const totalPoints = userEntry?.total_points ?? 0;
	const showProfilePic =
		user?.profilePicture && user.profilePicture.trim() !== "";

	const entries = (leaderboard ?? []).slice(0, 5);

	return (
		<div className="flex flex-col gap-6">
			<div className="glass-panel rounded-3xl p-6 space-y-6">
				<div className="flex items-center gap-4">
					{showProfilePic ? (
						<img
							src={getProfilePictureUrl(user?.profilePicture)}
							alt={user?.name ?? "Profile"}
							className="w-16 h-16 rounded-full border-2 border-[#00C2B1] object-cover"
						/>
					) : (
						<div
							className="w-16 h-16 rounded-full border-2 p-1"
							style={{ borderColor: "#00C2B1" }}
						>
							<div
								className="w-full h-full rounded-full flex items-center justify-center font-black italic text-xl"
								style={{
									background:
										"linear-gradient(135deg, #00C2B1 0%, #006a61 100%)",
									color: "#001a17",
								}}
							>
								{user?.name?.[0]?.toUpperCase() ?? "?"}
							</div>
						</div>
					)}
					<div>
						<h4 className="font-headline-md text-headline-md">
							{getShortName(user?.name) ??
								(isAuthenticated ? "Player" : "Guest")}
						</h4>
						<p className="font-label-bold text-sm" style={{ color: "#00C2B1" }}>
							{bestLevel
								? `Rank #${rank ?? "—"}`
								: rank != null
									? `Rank #${rank}`
									: "Belum Main"}
						</p>
					</div>
				</div>

				<div className="grid grid-cols-2 gap-4">
					<div className="bg-black/30 rounded-xl p-3 border border-white/5">
						<p className="text-sm font-bold text-on-surface-variant">
							Total Main
						</p>
						<p
							className="text-2xl font-black italic"
							style={{ color: "#00C2B1" }}
						>
							{totalAttempts > 0 ? totalAttempts : "—"}
						</p>
					</div>
					<div className="bg-black/30 rounded-xl p-3 border border-white/5">
						<p className="text-sm font-bold text-on-surface-variant">
							Jawaban Tepat
						</p>
						<p
							className="text-2xl font-black italic"
							style={{ color: "#00C2B1" }}
						>
							{correctAnswers > 0 ? correctAnswers : "—"}
						</p>
					</div>
				</div>
			</div>

			<div className="glass-panel rounded-3xl p-6 max-h-150 flex flex-col">
				<div className="flex items-center justify-between mb-4">
					<h2 className="text-xl uppercase font-bold">Klasemen Sementara</h2>
				</div>

				<div className="flex-1 overflow-y-auto min-h-0 pb-2">
					{entries.length === 0 ? (
						<p
							className="font-body-md text-sm text-center py-8"
							style={{ color: "#bbcac6" }}
						>
							Belum ada pemain di leaderboard. Jadilah yang pertama!
						</p>
					) : (
						<div className="space-y-2">
							{entries.map((entry) => {
								const isFirst = entry.rank === 1;
								return (
									<div
										key={`${entry.user_id}-${entry.rank}`}
										className="flex items-center gap-4 p-3 rounded-xl transition-colors"
										style={
											isFirst
												? {
														background: "rgba(0, 194, 177, 0.1)",
														border: "1px solid rgba(0, 194, 177, 0.2)",
													}
												: undefined
										}
									>
										<span
											className="font-display-xl text-xl italic w-6"
											style={{
												color: isFirst ? "#00C2B1" : "#bbcac6",
											}}
										>
											{String(entry.rank).padStart(2, "0")}
										</span>
										<div className="flex-1 min-w-0 text-end">
											<p className="font-label-bold truncate">
												{getShortName(entry.name)}
											</p>
											<p
												className="text-[10px] uppercase tracking-widest"
												style={{ color: "#bbcac6" }}
											>
												Lv {entry.level} · {entry.total_points} Pts
											</p>
										</div>
										{isFirst && (
											<span
												className="text-yellow-400"
												style={{ fontSize: 20 }}
											>
												★
											</span>
										)}
									</div>
								);
							})}
						</div>
					)}
				</div>

				<button
					className="w-full py-3 border rounded-xl font-label-bold uppercase tracking-widest text-sm transition-all"
					style={{
						borderColor: "rgba(255, 255, 255, 0.1)",
						color: "#bbcac6",
					}}
					onMouseEnter={(e) => {
						e.currentTarget.style.borderColor = "#00C2B1";
						e.currentTarget.style.color = "#00C2B1";
					}}
					onMouseLeave={(e) => {
						e.currentTarget.style.borderColor = "rgba(255, 255, 255, 0.1)";
						e.currentTarget.style.color = "#bbcac6";
					}}
				>
					Lihat Lebih Banyak
				</button>
			</div>
		</div>
	);
}
