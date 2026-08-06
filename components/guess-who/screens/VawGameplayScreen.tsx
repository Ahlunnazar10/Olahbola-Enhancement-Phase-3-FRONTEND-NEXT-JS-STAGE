"use client";

import { useState, useEffect } from "react";
import { ArrowLeft, Clock, Lightbulb, Lock, Send } from "lucide-react";
import type { GuessWhoSession } from "@/types";
import {
	useGuessWhoGameplay,
	type ResumedSnapshot,
} from "@/hooks/useGuessWhoGameplay";
import { formatTime, type TierBreakdown } from "@/lib/guessWho/scoring";
import { JerseyDisplay } from "@/components/guess-who/shared/JerseyDisplay";
import { CircularTimer } from "@/components/guess-who/shared/CircularTimer";
import { TierBadge } from "@/components/guess-who/shared/TierBadge";
import { useGuessWhoSound } from "@/hooks/useGuessWhoSound";

export function VawGameplayScreen({
	level,
	initialSession,
	resumedSnapshot,
	onExit,
	onFinish,
}: {
	level: number;
	initialSession: GuessWhoSession;
	resumedSnapshot: ResumedSnapshot | null;
	onExit: () => void;
	onFinish: (score: number, breakdown: TierBreakdown, level: number) => void;
}) {
	const [input, setInput] = useState("");
	const [exiting, setExiting] = useState(false);
	const [soundReady, setSoundReady] = useState(false);

	const {
		session,
		questionIndex,
		currentQuestion,
		score,
		timer,
		cluesRemaining,
		revealedClue,
		submitting,
		answered,
		lastResult,
		handleRequestClue,
		handleSubmit,
		questionHistory,
	} = useGuessWhoGameplay(initialSession, resumedSnapshot, onFinish);

	const { playBacksound, stopBacksound, playSFX } = useGuessWhoSound();

	// Play backsound once on mount, then keep playing until cleanup
	const backsoundRef = { current: "" };
	useEffect(() => {
		const key = level % 2 === 0 ? "backsound-2" : "backsound-1";
		backsoundRef.current = key;
		playBacksound(key);
		setSoundReady(true);
		return () => {
			stopBacksound();
		};
		// Only run once on mount
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	// SFX on answer
	useEffect(() => {
		if (!lastResult || !answered) return;
		const history = questionHistory.current;
		const last = history[history.length - 1];
		if (!last) return;

		const tier = last.tier;
		const correct =
			tier === "perfect" || tier === "partial" || tier === "typo";

		if (correct) {
			if (tier === "perfect") {
				const recent = history.slice(-2);
				const twoStreak =
					recent.length === 2 && recent.every((h) => h.correct);
				if (twoStreak) {
					playSFX("ambil-sendiri-pialanya");
				} else {
					playSFX("benar");
				}
			} else if (tier === "typo") {
				playSFX("yah-kocak-oke-lanjut");
			} else {
				playSFX("benar");
			}
		} else {
			const recent = history.slice(-2);
			const twoStreak =
				recent.length === 2 && recent.every((h) => !h.correct);
			if (twoStreak) {
				playSFX("bisa-main-gak-sih");
			} else {
				playSFX("salah");
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [answered, lastResult]);

	// Countdown SFX (timer < 10)
	useEffect(() => {
		if (timer > 10) return;
		const id = setTimeout(() => playSFX("buruan-udah-mau-abis"), 100);
		return () => clearTimeout(id);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [timer]);

	const handleExit = () => {
		stopBacksound();
		setExiting(true);
		onExit();
	};

	if (!currentQuestion) {
		return (
			<div className="text-center py-20">
				<p className="font-body-lg">Soal tidak ditemukan.</p>
				<button
					onClick={onExit}
					className="mt-4 px-6 py-2 rounded-xl font-label-bold uppercase tracking-widest text-sm"
					style={{
						background: "rgba(0, 194, 177, 0.15)",
						color: "#00C2B1",
					}}
				>
					Kembali
				</button>
			</div>
		);
	}

	const progressPct = ((questionIndex + 1) / session.questions.length) * 100;

	return (
		<section className="max-w-7xl mx-auto py-6 animate-fade-up">
			<div className="flex items-center justify-between mb-4 gap-3">
				<button
					onClick={handleExit}
					className="flex items-center gap-2 font-label-bold uppercase tracking-widest text-sm hover:opacity-80"
					style={{ color: "#00C2B1" }}
					disabled={exiting}
				>
					<ArrowLeft style={{ width: 16, height: 16 }} />
					Keluar
				</button>
				<div className="flex-1 px-4">
					<div
						className="text-[10px] font-black tracking-widest uppercase mb-1 text-center"
						style={{ color: "#00C2B1" }}
					>
						Level {session.level} · {session.level_name}
					</div>
					<div
						className="w-full h-1 rounded-full overflow-hidden"
						style={{ background: "rgba(0, 194, 177, 0.15)" }}
					>
						<div
							className="h-full transition-all duration-500"
							style={{
								width: `${progressPct}%`,
								background: "linear-gradient(90deg, #43decc 0%, #0a7c6e 100%)",
							}}
						/>
					</div>
					<div
						className="text-[10px] font-bold mt-1 text-center"
						style={{ color: "#bbcac6" }}
					>
						Soal {questionIndex + 1} / {session.questions.length}
					</div>
				</div>
				<div className="flex items-center gap-2">
					<CircularTimer
						seconds={timer}
						totalSeconds={session.duration_seconds}
					/>
					<div
						className="text-xs font-black italic tabular-nums"
						style={{ color: "#00C2B1" }}
					>
						{score}
					</div>
				</div>
			</div>

			<div className="grid lg:grid-cols-2 gap-4">
				<div className="flex flex-col gap-4">
					<div className="glass-panel rounded-3xl p-6 flex items-center justify-center">
						<JerseyDisplay
							imageUrl={currentQuestion.image_url}
							jerseyNumber={currentQuestion.jersey_number}
						/>
					</div>
					<div className="glass-panel rounded-3xl p-6">
						<span
							className="text-[10px] font-black tracking-widest uppercase mb-2 block"
							style={{ color: "#00C2B1" }}
						>
							Deskripsi
						</span>
						<p
							className="font-body-md text-base leading-relaxed"
							style={{ color: "rgba(255, 255, 255, 0.85)" }}
						>
							{currentQuestion.description}
						</p>
					</div>
				</div>

				<div className="flex flex-col gap-4">
					<div className="glass-panel rounded-3xl p-6">
						<div className="flex items-center justify-between mb-4">
							<span
								className="text-[10px] font-black tracking-widest uppercase"
								style={{ color: "#00C2B1" }}
							>
								Petunjuk
							</span>
							<span className="text-xs font-bold" style={{ color: "#bbcac6" }}>
								Sisa: {cluesRemaining} / 2
							</span>
						</div>

						<div className="space-y-3">
							{revealedClue && (
								<div
									className="p-4 rounded-xl"
									style={{
										background: "rgba(0, 194, 177, 0.1)",
										border: "1px solid rgba(0, 194, 177, 0.3)",
									}}
								>
									<div className="flex items-center gap-2 mb-1">
										<Lightbulb
											style={{ width: 16, height: 16, color: "#00C2B1" }}
										/>
										<span
											className="text-[10px] font-black tracking-widest uppercase"
											style={{ color: "#00C2B1" }}
										>
											Petunjuk Terbuka
										</span>
									</div>
									<p
										className="font-body-md font-bold italic"
										style={{ color: "#fff" }}
									>
										{revealedClue}
									</p>
								</div>
							)}

							<button
								onClick={handleRequestClue}
								disabled={!!revealedClue || cluesRemaining <= 0}
								className="w-full px-4 py-3 rounded-xl font-label-bold tracking-widest text-xs uppercase flex items-center justify-center gap-2 disabled:opacity-40 transition-all hover:scale-105"
								style={{
									background:
										cluesRemaining > 0
											? "rgba(0, 194, 177, 0.15)"
											: "rgba(255, 255, 255, 0.05)",
									color: "#00C2B1",
									border: "1px solid rgba(0, 194, 177, 0.3)",
								}}
							>
								{cluesRemaining <= 0 ? (
									<>
										<Lock style={{ width: 16, height: 16 }} />
										Petunjuk Habis
									</>
								) : (
									<>
										<Lightbulb style={{ width: 16, height: 16 }} />
										Buka Petunjuk
									</>
								)}
							</button>
						</div>
					</div>

					<div className="glass-panel rounded-3xl p-6 flex-1 flex flex-col">
						<span
							className="text-[10px] font-black tracking-widest uppercase mb-3 block"
							style={{ color: "#00C2B1" }}
						>
							Jawabanmu
						</span>
						{answered && lastResult ? (
							<div className="space-y-3">
								<TierBadge
									tier={lastResult.tier}
									points={lastResult.points_earned}
								/>
								{lastResult.matched_name && (
									<p
										className="font-body-md text-base font-bold italic"
										style={{ color: "#bbcac6" }}
									>
										{lastResult.matched_name}
									</p>
								)}
							</div>
						) : (
							<div className="flex flex-col sm:flex-row gap-2 mt-auto">
								<input
									type="text"
									value={input}
									onChange={(e) => setInput(e.target.value)}
									onKeyDown={(e) => {
										if (
											e.key === "Enter" &&
											!submitting &&
											!answered &&
											input.trim()
										)
											handleSubmit(input);
									}}
									placeholder="Ketik nama pemain..."
									disabled={submitting || answered}
									className="flex-1 px-4 py-3 rounded-xl bg-black/30 outline-none font-body-md text-base font-bold italic disabled:opacity-50"
									style={{
										border: "1px solid rgba(0, 194, 177, 0.3)",
										color: "#fff",
									}}
								/>
								<button
									onClick={() => handleSubmit(input)}
									disabled={submitting || answered || !input.trim()}
									className="px-6 py-3 rounded-xl font-label-bold tracking-widest text-xs uppercase disabled:opacity-30 transition-all"
									style={{
										background:
											"linear-gradient(135deg, #43decc 0%, #0a7c6e 100%)",
										color: "#0a1412",
									}}
								>
									<Send className="inline w-3 h-3 mr-1" />
									Kirim
								</button>
							</div>
						)}
					</div>
				</div>
			</div>

			{answered && (
				<div className="text-center mt-4 text-xs">
					<span style={{ color: "#bbcac6" }}>
						Menuju soal berikutnya dalam 1.5 detik... ·{" "}
						<Clock className="inline" style={{ width: 12, height: 12 }} />{" "}
						{formatTime(timer)}
					</span>
				</div>
			)}
		</section>
	);
}
