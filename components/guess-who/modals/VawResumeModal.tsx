"use client";

import { RefreshCw } from "lucide-react";
import { formatTime } from "@/lib/guessWho/scoring";
import type { SessionSnapshot } from "@/lib/guessWho/storage";

export function VawResumeModal({
	snapshot,
	onResume,
	onDiscard,
}: {
	snapshot: SessionSnapshot;
	onResume: () => void;
	onDiscard: () => void;
}) {
	return (
		<div className="fixed inset-0 z-[9998] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
			<div
				className="relative max-w-md w-full rounded-3xl p-8 border text-center"
				style={{
					background: "rgba(10, 15, 13, 0.95)",
					borderColor: "rgba(0, 194, 177, 0.3)",
					boxShadow: "0 0 40px rgba(0, 194, 177, 0.25)",
				}}
			>
				<RefreshCw
					style={{ width: 48, height: 48, color: "#00C2B1" }}
					className="mx-auto mb-4"
				/>
				<h2 className="font-display-xl text-headline-md uppercase tracking-tight mb-2">
					Lanjutkan?
				</h2>
				<p
					className="font-body-md mb-4"
					style={{ color: "#bbcac6" }}
				>
					Kamu punya sesi Guess Who yang belum selesai di level{" "}
					<span
						className="font-black italic"
						style={{ color: "#00C2B1" }}
					>
						{snapshot.level}
					</span>
					. Lanjutkan dari soal ke-{snapshot.questionIndex + 1}?
				</p>
				<div
					className="rounded-2xl p-3 mb-6 text-xs font-bold"
					style={{
						background: "rgba(0, 194, 177, 0.1)",
						color: "#00C2B1",
						border: "1px solid rgba(0, 194, 177, 0.25)",
					}}
				>
					Score: {snapshot.currentScore} · Sisa waktu:{" "}
					{formatTime(snapshot.timer)}
				</div>
				<div className="flex flex-col gap-2">
					<button
						onClick={onResume}
						className="px-6 py-3 rounded-2xl font-label-bold tracking-widest text-sm uppercase transition-all hover:scale-105"
						style={{
							background:
								"linear-gradient(135deg, #43decc 0%, #0a7c6e 100%)",
							color: "#0a1412",
						}}
					>
						Lanjutkan
					</button>
					<button
						onClick={onDiscard}
						className="px-6 py-3 rounded-2xl font-label-bold tracking-widest text-xs uppercase"
						style={{
							background: "transparent",
							color: "#bbcac6",
						}}
					>
						Mulai Baru
					</button>
				</div>
			</div>
		</div>
	);
}
