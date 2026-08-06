"use client";

import Link from "next/link";
import { Crown, X } from "lucide-react";

export function VawLoginModal({ onClose }: { onClose: () => void }) {
	return (
		<div
			className="fixed inset-0 z-9998 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
			onClick={onClose}
		>
			<div
				className="relative max-w-md w-full rounded-3xl p-8 border"
				style={{
					background: "rgba(10, 15, 13, 0.95)",
					borderColor: "rgba(0, 194, 177, 0.3)",
					boxShadow: "0 0 40px rgba(0, 194, 177, 0.25)",
				}}
				onClick={(e) => e.stopPropagation()}
			>
				<button
					onClick={onClose}
					className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors"
					aria-label="Tutup"
				>
					<X style={{ width: 20, height: 20 }} />
				</button>
				<div className="text-center space-y-4">
					<div
						className="inline-flex items-center justify-center w-16 h-16 rounded-full mb-2"
						style={{
							background: "rgba(0, 194, 177, 0.15)",
							border: "1px solid rgba(0, 194, 177, 0.4)",
						}}
					>
						<Crown style={{ width: 32, height: 32, color: "#00C2B1" }} />
					</div>
					<h2 className="text-2xl font-bold uppercase">
						Mau Skor Masuk
						<br />
						<span style={{ color: "#00C2B1" }}>Leaderboard?</span>
					</h2>
					<p
						className="font-body-md text-sm leading-relaxed"
						style={{ color: "#bbcac6" }}
					>
						Daftar atau login dulu untuk menyimpan skor dan bertanding di
						klasemen.
					</p>
					<div className="flex flex-col gap-2 pt-2">
						<Link
							href="/login"
							className="px-6 py-3 rounded-2xl font-label-bold tracking-widest text-sm uppercase text-center transition-all hover:scale-105"
							style={{
								background: "linear-gradient(135deg, #43decc 0%, #0a7c6e 100%)",
								color: "#0a1412",
							}}
						>
							Login / Daftar
						</Link>
						<button
							onClick={onClose}
							className="px-6 py-3 rounded-2xl font-label-bold tracking-widest text-xs uppercase transition-all"
							style={{
								background: "transparent",
								color: "#bbcac6",
							}}
						>
							Nanti Aja
						</button>
					</div>
				</div>
			</div>
		</div>
	);
}
