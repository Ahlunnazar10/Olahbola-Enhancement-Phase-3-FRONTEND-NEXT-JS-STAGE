"use client";

import { useEffect, useState } from "react";

export function LoadingOverlay({
	message = "Memuat Guess Who...",
}: {
	message?: string;
}) {
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		setProgress(0);
		const start = Date.now();
		const VIRTUAL_TOTAL_MS = 3500;
		const id = setInterval(() => {
			const elapsed = Date.now() - start;
			const ratio = Math.min(elapsed / VIRTUAL_TOTAL_MS, 1);
			const eased = 1 - Math.pow(1 - ratio, 3);
			setProgress(Math.floor(eased * 100));
			if (ratio >= 1) clearInterval(id);
		}, 80);
		return () => clearInterval(id);
	}, []);

	return (
		<div
			className="fixed inset-0 z-9999 flex items-center justify-center bg-black/70 backdrop-blur-md transition-opacity duration-300"
			role="status"
			aria-live="polite"
		>
			<div
				className="rounded-3xl p-10 flex flex-col items-center gap-6 max-w-sm w-full mx-4 border"
				style={{
					background: "rgba(10, 15, 13, 0.85)",
					borderColor: "rgba(0, 194, 177, 0.3)",
					boxShadow: "0 0 50px rgba(0, 194, 177, 0.25)",
				}}
			>
				<div className="relative w-32 h-32 flex items-center justify-center">
					<svg
						className="absolute inset-0 -rotate-90"
						viewBox="0 0 120 120"
						aria-hidden="true"
					>
						<circle
							cx="60"
							cy="60"
							r="52"
							fill="none"
							stroke="rgba(0, 194, 177, 0.2)"
							strokeWidth="8"
						/>
						<circle
							cx="60"
							cy="60"
							r="52"
							fill="none"
							stroke="#00C2B1"
							strokeWidth="8"
							strokeLinecap="round"
							strokeDasharray={2 * Math.PI * 52}
							strokeDashoffset={2 * Math.PI * 52 * (1 - progress / 100)}
							style={{
								filter: "drop-shadow(0 0 6px rgba(0, 194, 177, 0.6))",
							}}
							className="transition-[stroke-dashoffset] duration-100 ease-out"
						/>
					</svg>
					<span className="relative text-xl italic text-primary ">
						{progress}%
					</span>
				</div>
				<div className="text-center space-y-1">
					<p className="text-xl font-bold" style={{ color: "#e5e2e1" }}>
						{message}
					</p>
					<p className=" text-sm" style={{ color: "#bbcac6" }}>
						Sambil nunggu, bayangin kamu berhasil bawa pulang jersey utama...
					</p>
				</div>
			</div>
		</div>
	);
}
