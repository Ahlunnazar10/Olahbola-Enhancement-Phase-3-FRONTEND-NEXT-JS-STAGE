"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
	ArrowLeft,
	ChevronRight,
	Lightbulb,
	Lock,
	Send,
	Trophy,
} from "lucide-react";
import { useGuessWhoDemo } from "@/hooks/queries/useGuessWho";
import { LoadingOverlay } from "@/components/guess-who/shared/LoadingOverlay";
import { JerseyDisplay } from "@/components/guess-who/shared/JerseyDisplay";
import { TierBadge } from "@/components/guess-who/shared/TierBadge";
import {
	EMPTY_BREAKDOWN,
	scoreDemoAnswer,
	scoreDemoInitials,
	type Tier,
	type TierBreakdown,
} from "@/lib/guessWho/scoring";
import { useGuessWhoSound } from "@/hooks/useGuessWhoSound";

export function VawDemoScreen({
	onBack,
	onShowLogin,
	onFinished,
	showLoginButton = true,
}: {
	onBack: () => void;
	onShowLogin: () => void;
	onFinished?: () => void;
	showLoginButton?: boolean;
}) {
	const { data: questions, isLoading } = useGuessWhoDemo();
	const [index, setIndex] = useState(0);
	const [input, setInput] = useState("");
	const [revealed, setRevealed] = useState(false);
	const [clueRevealed, setClueRevealed] = useState(false);
	const [cluesUsed, setCluesUsed] = useState(0);
	const [result, setResult] = useState<{ tier: Tier; points: number } | null>(
		null,
	);
	const [totalPoints, setTotalPoints] = useState(0);
	const [breakdown, setBreakdown] = useState<TierBreakdown>(EMPTY_BREAKDOWN);
	const [finished, setFinished] = useState(false);
	const [answerHistory, setAnswerHistory] = useState<
		Array<{ tier: Tier; correct: boolean }>
	>([]);

	const { playBacksound, stopBacksound, playSFX } = useGuessWhoSound();

	// Demo selalu pakai backsound-2
	useEffect(() => {
		playBacksound("backsound-2");
		return () => stopBacksound();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	const handleSubmit = () => {
		if (!current || !input.trim()) return;
		const hasCorrectAnswer =
			current.correct_answer && current.correct_answer.trim() !== "";
		const r = hasCorrectAnswer
			? scoreDemoAnswer(input, current.correct_answer)
			: scoreDemoInitials(input, current.clue_initials);
		const correct = r.tier !== "wrong";
		setResult({ tier: r.tier, points: r.points });
		setTotalPoints((p) => p + r.points);
		setBreakdown((b) => ({ ...b, [r.tier]: b[r.tier] + 1 }));
		setRevealed(true);
		setAnswerHistory((h) => [...h, { tier: r.tier, correct }]);

		// Play SFX
		if (correct) {
			if (r.tier === "perfect") {
				const recent = [...answerHistory, { tier: r.tier, correct }].slice(-2);
				const twoStreak = recent.length === 2 && recent.every((h) => h.correct);
				if (twoStreak) {
					playSFX("ambil-sendiri-pialanya");
				} else {
					playSFX("benar");
				}
			} else if (r.tier === "typo") {
				playSFX("yah-kocak-oke-lanjut");
			}
		} else {
			const recent = [...answerHistory, { tier: r.tier, correct }].slice(-2);
			const twoStreak = recent.length === 2 && recent.every((h) => !h.correct);
			if (twoStreak) {
				playSFX("bisa-main-gak-sih");
			} else {
				playSFX("salah");
			}
		}
	};

	const handleRevealClue = () => {
		if (cluesUsed >= 2 || clueRevealed) return;
		setClueRevealed(true);
		setCluesUsed((c) => c + 1);
	};

	const handleNext = () => {
		if (!questions) return;
		if (index + 1 >= questions.length) {
			setFinished(true);
		} else {
			setIndex((i) => i + 1);
			setInput("");
			setRevealed(false);
			setClueRevealed(false);
			setResult(null);
		}
	};

	if (isLoading) return <LoadingOverlay message="Memuat soal demo..." />;

	if (!questions || questions.length === 0) {
		return (
			<div className="text-center py-20">
				<p className="font-body-lg">Soal demo belum tersedia.</p>
				<button
					onClick={onBack}
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

	if (finished) {
		return (
			<section className="max-w-xl mx-auto py-12 animate-fade-up">
				<div
					className="glass-panel rounded-3xl p-8 text-center"
					style={{
						boxShadow: "0 0 40px rgba(0, 194, 177, 0.25)",
					}}
				>
					<h2 className="font-display-xl text-headline-lg uppercase mb-2">
						Demo Selesai!
					</h2>
					<p className="font-body-lg mb-6" style={{ color: "#bbcac6" }}>
						Total Poin Demo:{" "}
						<span
							className="font-display-xl text-3xl italic"
							style={{ color: "#00C2B1" }}
						>
							{totalPoints}
						</span>
					</p>
					<div className="flex flex-col gap-3">
						{onFinished && (
							<button
								onClick={onFinished}
								className="px-6 py-3 rounded-2xl font-label-bold tracking-widest text-sm uppercase text-center transition-all hover:scale-105"
								style={{
									background:
										"linear-gradient(135deg, #43decc 0%, #0a7c6e 100%)",
									color: "#0a1412",
								}}
							>
								Main Lagi
							</button>
						)}
						{showLoginButton && (
							<button
								onClick={onShowLogin}
								className="px-6 py-3 rounded-2xl font-label-bold tracking-widest text-sm uppercase text-center transition-all hover:scale-105"
								style={{
									background: "transparent",
									color: "#bbcac6",
									border: "1px solid rgba(0, 194, 177, 0.3)",
								}}
							>
								Login untuk Main Penuh
							</button>
						)}
						<button
							onClick={onBack}
							className="px-6 py-3 rounded-2xl font-label-bold tracking-widest text-xs uppercase"
							style={{
								background: "transparent",
								color: "#bbcac6",
							}}
						>
							Kembali ke Halaman Utama
						</button>
					</div>
				</div>
			</section>
		);
	}

	const current = questions?.[index];
	if (!current) return null;

	return (
		<section className="max-w-3xl mx-auto animate-fade-up">
			<div className="flex items-center justify-between mb-6">
				<button
					onClick={onBack}
					className="flex items-center gap-2 font-label-bold uppercase tracking-widest text-sm hover:opacity-80"
					style={{ color: "#00C2B1" }}
				>
					<ArrowLeft style={{ width: 16, height: 16 }} />
					Kembali
				</button>
				<span
					className="text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full"
					style={{
						background: "rgba(0, 194, 177, 0.1)",
						color: "#00C2B1",
						border: "1px solid rgba(0, 194, 177, 0.3)",
					}}
				>
					DEMO MODE
				</span>
				<span
					className="text-sm font-black italic tabular-nums"
					style={{ color: "#00C2B1" }}
				>
					{index + 1} / {questions.length}
				</span>
			</div>

			<div className="grid grid-cols-2 gap-2 md:gap-6 mb-6">
				<div className="glass-panel rounded-3xl p-0 md:p-6 flex items-center justify-center">
					<JerseyDisplay
						imageUrl={current.image_url}
						jerseyNumber={current.jersey_number}
					/>
				</div>
				<div className="glass-panel rounded-3xl p-4 md:p-6 flex flex-col justify-center gap-4">
					<div className="mb-2 md:mb-4">
						<span
							className="text-[10px] font-black tracking-widest uppercase mb-2 block"
							style={{ color: "#00C2B1" }}
						>
							Deskripsi Pemain
						</span>
						<p
							className="font-medium md:font-semibold text-sm md:text-base leading-relaxed"
							style={{ color: "rgba(255, 255, 255, 0.85)" }}
						>
							{current.description}
						</p>
					</div>

					<div
						className="p-4 rounded-xl"
						style={{
							background: "rgba(0, 194, 177, 0.05)",
							border: "1px solid rgba(0, 194, 177, 0.15)",
						}}
					>
						<div className="flex items-center justify-between mb-2">
							<span
								className="text-[10px] font-black tracking-widest uppercase"
								style={{ color: "#00C2B1" }}
							>
								Petunjuk
							</span>
							<span
								className="text-[10px] font-bold"
								style={{ color: "#bbcac6" }}
							>
								{cluesUsed} / 2
							</span>
						</div>

						{clueRevealed ? (
							<div>
								<p
									className="text-[10px] font-black tracking-widest uppercase mb-1"
									style={{ color: "#00C2B1" }}
								>
									Inisial Pemain
								</p>
								<p
									className="text-xl font-black italic"
									style={{ color: "#FFD700" }}
								>
									{current.clue_initials}
								</p>
							</div>
						) : (
							<button
								onClick={handleRevealClue}
								disabled={cluesUsed >= 2}
								className="w-full px-4 py-3 rounded-xl font-label-bold tracking-widest text-xs uppercase flex items-center justify-center gap-2 disabled:opacity-40 transition-all hover:scale-105"
								style={{
									background:
										cluesUsed < 2
											? "rgba(0, 194, 177, 0.15)"
											: "rgba(255, 255, 255, 0.05)",
									color: "#00C2B1",
									border: "1px solid rgba(0, 194, 177, 0.3)",
								}}
							>
								{cluesUsed >= 2 ? (
									<>
										<Lock style={{ width: 16, height: 16 }} />
										<span className="text-[10px] font-black tracking-widest uppercase hidden md:block">
											Petunjuk Habis
										</span>
									</>
								) : (
									<>
										<Lightbulb style={{ width: 16, height: 16 }} />
										<span className="text-[10px] font-black tracking-widest uppercase hidden md:block">
											Buka Petunjuk
										</span>
									</>
								)}
							</button>
						)}
					</div>

					{revealed && result?.tier === "perfect" && (
						<div className="pt-2 border-t border-white/10">
							<span
								className="text-[10px] font-black tracking-widest uppercase"
								style={{ color: "#00C2B1" }}
							>
								Jawaban Benar
							</span>
						</div>
					)}
				</div>
			</div>

			<div className="glass-panel rounded-3xl p-6">
				{!revealed ? (
					<div className="flex flex-col sm:flex-row gap-2">
						<input
							type="text"
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter") handleSubmit();
							}}
							placeholder="Ketik nama pemain..."
							className="flex-1 px-4 py-3 rounded-xl bg-black/30 outline-none font-body-md text-base font-bold italic"
							style={{
								border: "1px solid rgba(0, 194, 177, 0.3)",
								color: "#fff",
							}}
						/>
						<button
							onClick={handleSubmit}
							disabled={!input.trim()}
							className="px-6 py-3 rounded-xl font-label-bold tracking-widest text-xs uppercase disabled:opacity-30 transition-all hover:scale-105"
							style={{
								background: "linear-gradient(135deg, #43decc 0%, #0a7c6e 100%)",
								color: "#0a1412",
							}}
						>
							<Send className=" w-3 h-3 mr-1 hidden md:inline" />
							Submit
						</button>
					</div>
				) : (
					<div className="flex items-center justify-between gap-4">
						{result && <TierBadge tier={result.tier} points={result.points} />}
						<button
							onClick={handleNext}
							className="px-6 py-3 rounded-xl font-label-bold tracking-widest text-xs uppercase transition-all hover:scale-105"
							style={{
								background: "linear-gradient(135deg, #43decc 0%, #0a7c6e 100%)",
								color: "#0a1412",
							}}
						>
							{index + 1 >= questions.length ? "Selesai" : "Lanjut"}
							<ChevronRight className=" w-3 h-3 ml-1 hidden md:inline" />
						</button>
					</div>
				)}
			</div>
		</section>
	);
}
