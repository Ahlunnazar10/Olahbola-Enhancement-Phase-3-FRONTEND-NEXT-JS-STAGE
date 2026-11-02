"use client";

import { X } from "lucide-react";
import { useUserStats, type EventStats } from "@/hooks/queries/useUserStats";

export type UserStatModalKey =
	| "leaderboard"
	| "points"
	| "predictions"
	| "participation"
	| null;
import {
	useMyPredictions,
	useMySummary,
	useLeaderboard,
	useMyRank,
	type Match,
} from "@/hooks/queries/useBundesliga";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/authStore";

// ─── Modal wrapper ───────────────────────────────────────────
function ModalShell({
	isOpen,
	onClose,
	title,
	subtitle,
	children,
	}: {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	subtitle: string;
	children: React.ReactNode;

}) {
	if (!isOpen) return null;
	const colors = {
				surface: "#131313",
				primary30: "rgba(67, 222, 204, 0.3)",
				primaryAlpha: "rgba(67, 222, 204, 0.15)",
				whiteAlpha5: "rgba(255, 255, 255, 0.05)",
				whiteAlpha10: "rgba(255, 255, 255, 0.1)",
				text: "#e5e2e1",
				textSecondary: "#bbcac6",
				primary: "#43decc",
				primary05: "rgba(67, 222, 204, 0.05)",
				primary15: "rgba(67, 222, 204, 0.15)",
				primary20: "rgba(67, 222, 204, 0.2)",
				primary03: "rgba(67, 222, 204, 0.3)",
			}

	return (
		<div
			className="fixed inset-0 z-100 flex items-center justify-center p-4 animate-fadeIn"
			style={{
				background: "rgba(0,0,0,0.85)",
				backdropFilter: "blur(8px)",
			}}
			onClick={onClose}
		>
			<div
				className="w-full max-w-md max-h-[85vh] flex flex-col p-6 rounded-3xl border relative overflow-hidden animate-scaleIn"
				style={{
					background: colors.surface,
					borderColor: colors.primary30,
					boxShadow: `0 0 40px ${colors.primaryAlpha}, 0 15px 30px rgba(0,0,0,0.4)`,
				}}
				onClick={(e) => e.stopPropagation()}
			>
				<div
					className="absolute -top-10 left-1/2 -translate-x-1/2 w-40 h-40 rounded-full blur-[60px] pointer-events-none"
					style={{ background: colors.primaryAlpha }}
				/>
				<button
					onClick={onClose}
					className="absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all hover:scale-110 z-20"
					style={{
						background: colors.whiteAlpha5,
						color: colors.textSecondary,
					}}
				>
					<X className="size-4" />
				</button>
				<div className="text-center mb-5 relative z-10">
					<h3 className="text-xl font-bold mb-1" style={{ color: colors.text }}>
						{title}
					</h3>
					<p className="text-xs" style={{ color: colors.textSecondary }}>
						{subtitle}
					</p>
				</div>
				<div className="flex-1 overflow-y-auto space-y-2 pr-1 relative z-10">
					{children}
				</div>
			</div>
		</div>
	);
}

// ─── Leaderboard Modal ───────────────────────────────────────
function LeaderboardModal({
	isOpen,
	onClose,
	leaderboardData,
	myRank,
	myUserName,
	myUserId,
	}: {
	isOpen: boolean;
	onClose: () => void;
	leaderboardData: unknown[] | undefined;
	myRank: { rank: number; total_points?: number } | null;
	myUserName?: string;
	myUserId?: string;

}) {
	const colors = {
				text: "#e5e2e1",
				textSecondary: "#bbcac6",
				primary: "#43decc",
				primary15: "rgba(67, 222, 204, 0.15)",
				primary20: "rgba(67, 222, 204, 0.2)",
				primary30: "rgba(67, 222, 204, 0.3)",
				whiteAlpha5: "rgba(255, 255, 255, 0.05)",
				whiteAlpha10: "rgba(255, 255, 255, 0.1)",
			}

	const raw = (leaderboardData ?? []) as Array<{
		rank: number;
		user_id: string;
		user_name: string;
		profile_picture?: string | null;
		total_points: number;
		total_predictions: number;
		exact_scores?: number;
	}>;

	return (
		<ModalShell
			isOpen={isOpen}
			onClose={onClose}
			title="Klasemen Sementara!"
			subtitle="Semua pemain berdasarkan poin tertinggi."
		>
			{raw.length === 0 ? (
				<div
					className="text-center py-8"
					style={{ color: colors.textSecondary }}
				>
					<p className="text-sm">Belum ada data leaderboard</p>
				</div>
			) : (
				<>
					{[...raw]
						.sort((a, b) => a.rank - b.rank)
						.slice(0, 5)
						.map((entry) => {
							const isCurrentUser =
								myUserId != null && entry.user_id === myUserId;
							return (
								<div
									key={entry.user_id}
									className="p-3 rounded-xl flex items-center gap-3 transition-all"
									style={{
										background: isCurrentUser
											? colors.primary20
											: colors.whiteAlpha5,
										border: isCurrentUser
											? `2px solid ${colors.primary}`
											: `1px solid ${colors.whiteAlpha10}`,
									}}
								>
									<div
										className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0"
										style={{
											background: isCurrentUser
												? colors.primary30
												: colors.whiteAlpha10,
											color: isCurrentUser ? colors.primary : colors.text,
										}}
									>
										{entry.rank}
									</div>
									<div className="flex-1 min-w-0">
										<p
											className="font-bold text-sm truncate"
											style={{ color: colors.text }}
										>
											{entry.user_name}
											{isCurrentUser && (
												<span
													className="ml-1.5 text-xs font-semibold"
													style={{ color: colors.primary }}
												>
													(Kamu)
												</span>
											)}
										</p>
										<p
											className="text-xs"
											style={{ color: colors.textSecondary }}
										>
											{entry.total_predictions} prediksi
										</p>
									</div>
									<div className="text-right shrink-0">
										<p
											className="text-xl font-black"
											style={{ color: colors.primary }}
										>
											{entry.total_points}
										</p>
										<p
											className="text-[10px] uppercase tracking-wider"
											style={{ color: colors.textSecondary }}
										>
											poin
										</p>
									</div>
								</div>
							);
						})}
					{myRank && myRank.rank > 5 && (
						<div
							className="p-3 rounded-xl flex items-center gap-3 mt-2"
							style={{
								background: colors.primary20,
								border: `2px solid ${colors.primary}`,
							}}
						>
							<div
								className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg shrink-0"
								style={{ background: colors.primary30, color: colors.primary }}
							>
								#{myRank.rank}
							</div>
							<div className="flex-1 min-w-0">
								<p
									className="font-bold text-sm truncate"
									style={{ color: colors.text }}
								>
									{myUserName ?? "Kamu"}
									<span
										className="ml-1.5 text-xs font-semibold"
										style={{ color: colors.primary }}
									>
										(Kamu)
									</span>
								</p>
								<p className="text-xs" style={{ color: colors.textSecondary }}>
									{myRank.total_points ?? 0} poin total
								</p>
							</div>
							<div className="text-right shrink-0">
								<p
									className="text-xl font-black"
									style={{ color: colors.primary }}
								>
									{myRank.total_points ?? 0}
								</p>
								<p
									className="text-[10px] uppercase tracking-wider"
									style={{ color: colors.textSecondary }}
								>
									poin
								</p>
							</div>
						</div>
					)}
				</>
			)}
		</ModalShell>
	);
}

// ─── Points History Modal ────────────────────────────────────
function PointsHistoryModal({
	isOpen,
	onClose,
	byMatchday,
	}: {
	isOpen: boolean;
	onClose: () => void;
	byMatchday: Array<{
		matchday: number;
		earned: number;
		count: number;
		runningTotal: number;
		isPartial: boolean;
	}>;

}) {
	const colors = {
				text: "#e5e2e1",
				textSecondary: "#bbcac6",
				primary: "#43decc",
				primary05: "rgba(67, 222, 204, 0.05)",
				primary15: "rgba(67, 222, 204, 0.15)",
				whiteAlpha5: "rgba(255, 255, 255, 0.05)",
				whiteAlpha10: "rgba(255, 255, 255, 0.1)",
			}

	const maxEarned = Math.max(...byMatchday.map((i) => i.earned), 1);

	return (
		<ModalShell
			isOpen={isOpen}
			onClose={onClose}
			title="Perkembangan Poin Kamu!"
			subtitle="Seberapa banyak poin yang kamu kumpulkan tiap matchday."
		>
			{byMatchday.length === 0 ? (
				<div
					className="text-center py-8"
					style={{ color: colors.textSecondary }}
				>
					<p className="text-sm">Belum ada riwayat poin</p>
				</div>
			) : (
				byMatchday.map((item) => {
					const widthPct = Math.round((item.earned / maxEarned) * 100);
					const isCompleted =
						!item.isPartial && (item.earned > 0 || item.count > 0);
					return (
						<div
							key={item.matchday}
							className="p-3 rounded-xl transition-all"
							style={{
								background: isCompleted ? colors.primary05 : colors.whiteAlpha5,
								border: isCompleted
									? `1px solid ${colors.primary}40`
									: `1px solid ${colors.whiteAlpha10}`,
							}}
						>
							<div className="flex items-center justify-between mb-2">
								<div>
									<p
										className="text-sm font-bold"
										style={{ color: colors.text }}
									>
										Matchday {item.matchday}
									</p>
									<p
										className="text-xs"
										style={{ color: colors.textSecondary }}
									>
										{item.count} prediksi
										{!isCompleted ? " · masih berlangsung" : ""}
									</p>
								</div>
								<div className="text-right">
									<p
										className="text-lg font-black"
										style={{ color: colors.primary }}
									>
										+{item.earned} <span className="text-xs">Pts</span>
									</p>
									<p
										className="text-[10px] uppercase tracking-wider"
										style={{ color: colors.textSecondary }}
									>
										akumulasi {item.runningTotal}
									</p>
								</div>
							</div>
							<div
								className="h-1.5 rounded-full overflow-hidden"
								style={{ background: colors.whiteAlpha5 }}
							>
								<div
									className="h-full rounded-full transition-all"
									style={{
										width: `${widthPct}%`,
										background: `linear-gradient(90deg, ${colors.primary}, ${colors.primary}80)`,
									}}
								/>
							</div>
						</div>
					);
				})
			)}
		</ModalShell>
	);
}

// ─── Predictions History Modal ───────────────────────────────
function PredictionsHistoryModal({
	isOpen,
	onClose,
	byMatchday,
	myPredictionsData,
	getMatchForHistory,
	}: {
	isOpen: boolean;
	onClose: () => void;
	byMatchday: Record<number, { matchIds: string[]; count: number }>;
	myPredictionsData: { data: unknown[] } | undefined;
	getMatchForHistory: (matchId: string) => Match | undefined;

}) {
	const colors = {
				text: "#e5e2e1",
				textSecondary: "#bbcac6",
				primary: "#43decc",
				primary15: "rgba(67, 222, 204, 0.15)",
				whiteAlpha5: "rgba(255, 255, 255, 0.05)",
				whiteAlpha10: "rgba(255, 255, 255, 0.1)",
			}

	const days = Object.keys(byMatchday)
		.map(Number)
		.sort((a, b) => a - b);

	return (
		<ModalShell
			isOpen={isOpen}
			onClose={onClose}
			title="Riwayat Prediksi Kamu!"
			subtitle="Perkiraan skor tiap matchday yang sudah kamu kirim."
		>
			{days.length === 0 ? (
				<div
					className="text-center py-8"
					style={{ color: colors.textSecondary }}
				>
					<p className="text-sm">Belum ada riwayat prediksi</p>
				</div>
			) : (
				days.map((md) => {
					const group = byMatchday[md];
					return (
						<div
							key={md}
							className="p-3 rounded-xl transition-all"
							style={{
								background: colors.whiteAlpha5,
								border: `1px solid ${colors.whiteAlpha10}`,
							}}
						>
							<div className="flex items-center justify-between mb-2">
								<div className="flex items-center gap-2">
									<div
										className="w-8 h-8 rounded-full flex items-center justify-center font-black text-[10px] shrink-0"
										style={{
											background: colors.primary15,
											color: colors.primary,
										}}
									>
										MD{md}
									</div>
									<div>
										<p
											className="text-sm font-bold"
											style={{ color: colors.text }}
										>
											Matchday {md}
										</p>
										<p
											className="text-xs"
											style={{ color: colors.textSecondary }}
										>
											{group.count} prediksi dikirim
										</p>
									</div>
								</div>
								<div className="text-right">
									<p
										className="text-lg font-black"
										style={{ color: colors.primary }}
									>
										{group.count}
									</p>
									<p
										className="text-[10px] uppercase tracking-wider"
										style={{ color: colors.textSecondary }}
									>
										prediksi
									</p>
								</div>
							</div>
							{group.matchIds.map((matchId) => {
								const pred = (
									myPredictionsData?.data as Array<{
										match_id: string;
										home_score_predicted: number;
										away_score_predicted: number;
										home_score_actual?: number;
										away_score_actual?: number;
										points_earned: number;
										score_exact: boolean | null;
										result_correct: boolean | null;
										status: string;
										match?: {
											home_team?: { name?: string };
											away_team?: { name?: string };
											matchday?: number;
										};
										matchday?: number;
									}>
								)?.find((p) => p.match_id === matchId);
								const match = getMatchForHistory(matchId);
								if (!pred) return null;
								const matchday = pred.match?.matchday ?? pred.matchday ?? -1;
								const home = (
									pred.match?.home_team?.name ??
									match?.home_team.name ??
									"HOME"
								).toUpperCase();
								const away = (
									pred.match?.away_team?.name ??
									match?.away_team.name ??
									"AWAY"
								).toUpperCase();
								const points = pred.points_earned ?? 0;
								const predicted = `${pred.home_score_predicted}-${pred.away_score_predicted}`;
								const actual =
									pred.home_score_actual != null
										? `${pred.home_score_actual}-${pred.away_score_actual}`
										: match?.home_score != null
											? `${match.home_score}-${match.away_score}`
											: null;
								const resultColor = pred.score_exact
									? "#22c55e"
									: pred.result_correct
										? "#eab308"
										: pred.status === "calculated"
											? "#ef4444"
											: null;
								return (
									<div
										key={matchId}
										className="flex items-center gap-3 p-2 rounded-lg mt-1"
										style={{ background: colors.whiteAlpha5 }}
									>
										<div className="flex-1 min-w-0">
											<p
												className="text-xs font-bold truncate"
												style={{ color: colors.text }}
											>
												{home} vs {away}
											</p>
											<p
												className="text-[10px] uppercase tracking-wider"
												style={{ color: colors.textSecondary }}
											>
												{matchday > 0 ? `MD ${matchday}` : ""}
											</p>
										</div>
										<div className="text-right shrink-0">
											<p
												className="text-sm font-black"
												style={{ color: colors.primary }}
											>
												{predicted}
											</p>
											{actual != null && (
												<p
													className="text-xs font-bold"
													style={{ color: resultColor ?? colors.textSecondary }}
												>
													Final {actual}
												</p>
											)}
										</div>
										<div className="shrink-0">
											{resultColor ? (
												<div
													className="text-[10px] font-black px-1.5 py-0.5 rounded-md"
													style={{
														color: resultColor,
														background: `${resultColor}1f`,
													}}
												>
													+{points} pts
												</div>
											) : (
												<div
													className="text-[10px] font-black px-1.5 py-0.5 rounded-md"
													style={{
														color: colors.textSecondary,
														background: colors.whiteAlpha5,
													}}
												>
													⏳
												</div>
											)}
										</div>
									</div>
								);
							})}
						</div>
					);
				})
			)}
		</ModalShell>
	);
}

// ─── Participation Modal ─────────────────────────────────────
function ParticipationModal({
	isOpen,
	onClose,
	results,
	}: {
	isOpen: boolean;
	onClose: () => void;
	results: EventStats[];

}) {
	const colors = {
				text: "#e5e2e1",
				textSecondary: "#bbcac6",
				primary: "#43decc",
				primary15: "rgba(67, 222, 204, 0.15)",
				whiteAlpha5: "rgba(255, 255, 255, 0.05)",
				whiteAlpha10: "rgba(255, 255, 255, 0.1)",
			}

	return (
		<ModalShell
			isOpen={isOpen}
			onClose={onClose}
			title="Riwayat Partisipasi Game"
			subtitle="Semua game yang pernah kamu mainkan."
		>
			{results.length === 0 ? (
				<div
					className="text-center py-8"
					style={{ color: colors.textSecondary }}
				>
					<p className="text-sm">Belum ada riwayat partisipasi</p>
				</div>
			) : (
				results.map((stat, i) => {
					// The results array is from useUserStats which fetches
					// all events — the order matches the EVENTS array in useUserStats.ts
					const label = stat.event_name ?? "Game";
					const hasData =
						(stat.total_predictions ?? 0) > 0 || (stat.total_points ?? 0) > 0;
					return (
						<div
							key={i}
							className="p-3 rounded-xl transition-all"
							style={{
								background: hasData ? colors.primary15 : colors.whiteAlpha5,
								border: hasData
									? `1px solid ${colors.primary}40`
									: `1px solid ${colors.whiteAlpha10}`,
							}}
						>
							<div className="flex items-center justify-between">
								<div>
									<p
										className="text-sm font-bold"
										style={{ color: colors.text }}
									>
										{label}
									</p>
									<p
										className="text-xs"
										style={{ color: colors.textSecondary }}
									>
										{hasData
											? `${stat.total_predictions} prediksi · ${stat.exact_scores ?? 0} tepat`
											: "Tidak berpartisipasi"}
									</p>
								</div>
								<div className="text-right">
									<p
										className="text-lg font-black"
										style={{
											color: hasData ? colors.primary : colors.textSecondary,
										}}
									>
										{stat.total_points ?? 0}
									</p>
									<p
										className="text-[10px] uppercase tracking-wider"
										style={{ color: colors.textSecondary }}
									>
										poin
									</p>
								</div>
							</div>
						</div>
					);
				})
			)}
		</ModalShell>
	);
}

// ─── Main component ─────────────────────────────────────────
export function UserStatModals({
	activeModal,
	onClose,
	participationResults,
}: {
	activeModal: UserStatModalKey;
	onClose: () => void;

	participationResults: EventStats[];
}) {
	const queryClient = useQueryClient();

	// Leaderboard data
	const { data: leaderboardData } = useLeaderboard();
	const { user } = useAuthStore();
	const { data: myRankData } = useMyRank();

	// My predictions (for points + predictions history)
	const { data: myPredictionsData } = useMyPredictions();
	const { data: mySummaryData } = useMySummary();

	// Build getMatchForHistory
	const getMatchForHistory = (matchId: string): Match | undefined => {
		const allQueries = queryClient.getQueriesData<Match[]>({
			queryKey: ["bundesliga", "matches"],
		});
		for (const [, data] of allQueries) {
			const found = (data as Match[] | undefined)?.find(
				(m) => m.id === matchId,
			);
			if (found) return found;
		}
		return undefined;
	};

	// Build predictions history by matchday
	const predictionsByMatchday = (() => {
		const map: Record<number, { matchIds: string[]; count: number }> = {};
		((myPredictionsData?.data as unknown[]) ?? []).forEach((p) => {
			const pred = p as {
				match_id: string;
				matchday?: number;
				match?: { matchday?: number };
			};
			const md = pred.match?.matchday ?? pred.matchday;
			if (!Number.isInteger(md)) return;
			const mdKey = md as number;
			if (!map[mdKey]) map[mdKey] = { matchIds: [], count: 0 };
			map[mdKey].matchIds.push(pred.match_id);
			map[mdKey].count += 1;
		});
		return map;
	})();

	// Build points history by matchday
	const pointsByMatchday = (() => {
		const map: Record<number, { points: number; count: number }> = {};
		((myPredictionsData?.data as unknown[]) ?? []).forEach((p) => {
			const pred = p as {
				matchday?: number;
				match?: { matchday?: number };
				points_earned?: number;
			};
			const md = pred.match?.matchday ?? pred.matchday;
			if (!Number.isInteger(md)) return;
			const mdKey = md as number;
			if (!map[mdKey]) map[mdKey] = { points: 0, count: 0 };
			map[mdKey].points += Number(pred.points_earned) || 0;
			map[mdKey].count += 1;
		});

		const days = Object.keys(map)
			.map(Number)
			.sort((a, b) => a - b);
		const totalPoints = mySummaryData?.total_points ?? 0;
		const runningTotal = new Map<number, number>();
		let cum = 0;
		for (const md of days) {
			cum = Math.min(cum + (map[md]?.points ?? 0), totalPoints || 0);
			runningTotal.set(md, cum);
		}
		return days.map((md) => ({
			matchday: md,
			earned: map[md]?.points ?? 0,
			count: map[md]?.count ?? 0,
			runningTotal: runningTotal.get(md) ?? 0,
			isPartial: totalPoints > 0 && cum < totalPoints,
		}));
	})();

	const myUserId = user?.id?.toString();
	const myUserName = user?.name;

	return (
		<>
			<LeaderboardModal
				isOpen={activeModal === "leaderboard"}
				onClose={onClose}
				leaderboardData={leaderboardData as unknown[]}
				myRank={myRankData}
				myUserName={myUserName}
				myUserId={myUserId}
			/>
			<PointsHistoryModal
				isOpen={activeModal === "points"}
				onClose={onClose}
				byMatchday={pointsByMatchday}
			/>
			<PredictionsHistoryModal
				isOpen={activeModal === "predictions"}
				onClose={onClose}
				byMatchday={predictionsByMatchday}
				myPredictionsData={myPredictionsData}
				getMatchForHistory={getMatchForHistory}
			/>
			<ParticipationModal
				isOpen={activeModal === "participation"}
				onClose={onClose}
				results={participationResults}
			/>
		</>
	);
}
