"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Lock } from "lucide-react";

interface GameCardProps {
	title: string;
	subtitle: string;
	description: string;
	href: string;
	isActive: boolean;
	iconSrc?: string;
	bgImage?: string;
	accentColor: string;
	isDark: boolean;
	tags?: string[];
}

export function GameCard({
	title,
	subtitle,
	description,
	href,
	isActive,
	iconSrc,
	bgImage,
	accentColor,
	isDark,
	tags = [],
}: GameCardProps) {
	// Sesuai sample: glass-card dengan hover effect + background image dengan overlay
	const cardStyle: React.CSSProperties = {
		backdropFilter: "blur(40px)",
		border: isActive
			? `1px solid ${isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(10, 124, 110, 0.15)"}`
			: `1px dashed ${isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.15)"}`,
		transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
	};

	const cardContent = (
		<div
			className={`relative overflow-hidden group h-full rounded-4xl p-8 ${
				!isActive ? "opacity-80" : ""
			}`}
			style={cardStyle}
		>
			{/* Background image dengan overlay shadow (sesuai sample) */}
			{bgImage && (
				<div
					className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-110"
					style={{
						backgroundImage: isActive
							? `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.8)), url("${bgImage}")`
							: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.9)), url("${bgImage}")`,
					}}
				/>
			)}
			{/* Fallback glass background (jika tidak ada bgImage) */}
			{!bgImage && (
				<div
					className="absolute inset-0 z-0"
					style={{
						background: isActive
							? isDark
								? "rgba(255, 255, 255, 0.03)"
								: "rgba(255, 255, 255, 0.6)"
							: isDark
								? "rgba(255, 255, 255, 0.02)"
								: "rgba(255, 255, 255, 0.4)",
					}}
				/>
			)}

			{/* Status badge - Live Now / Coming Soon */}
			<div className="absolute top-6 right-6 flex items-center gap-2 z-10">
				{isActive ? (
					<>
						<span className="relative flex h-3 w-3">
							<span
								className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75"
								style={{ background: accentColor }}
							/>
							<span
								className="relative inline-flex rounded-full h-3 w-3"
								style={{ background: accentColor }}
							/>
						</span>
						<span
							className="text-[10px] font-black tracking-widest uppercase"
							style={{ color: accentColor }}
						>
							Live Now
						</span>
					</>
				) : (
					<span
						className="text-[10px] font-black tracking-widest uppercase px-3 py-1 rounded-full"
						style={{
							border: `1px solid ${isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(0, 0, 0, 0.12)"}`,
							color: isDark
								? "rgba(255, 255, 255, 0.3)"
								: "rgba(26, 26, 26, 0.4)",
						}}
					>
						Segera Hadir
					</span>
				)}
			</div>

			{/* Subtitle */}
			<h3
				className="text-xs font-black tracking-widest uppercase mb-2 relative z-10"
				style={{ color: accentColor }}
			>
				{subtitle}
			</h3>

			{/* Title */}
			<h2
				className="text-4xl font-black italic tracking-tighter uppercase mb-3 relative z-10"
				style={{
					color: isActive
						? isDark
							? "#ffffff"
							: "#1a1a1a"
						: isDark
							? "rgba(255, 255, 255, 0.4)"
							: "rgba(26, 26, 26, 0.45)",
				}}
			>
				{title}
			</h2>

			{/* Description */}
			<p
				className="text-sm leading-relaxed max-w-88 mb-8 relative z-10"
				style={{
					color: isActive
						? isDark
							? "rgba(255, 255, 255, 0.6)"
							: "rgba(26, 26, 26, 0.65)"
						: isDark
							? "rgba(255, 255, 255, 0.3)"
							: "rgba(26, 26, 26, 0.4)",
				}}
			>
				{description}
			</p>

			{/* CTA - Score Now / Challenge Accepted */}
			<div className="mt-12 relative z-10">
				<button
					className="flex items-center gap-2 font-black italic tracking-widest uppercase text-sm group-hover:translate-x-2 transition-transform"
					style={{
						color: isActive
							? accentColor
							: isDark
								? "rgba(255, 255, 255, 0.3)"
								: "rgba(26, 26, 26, 0.35)",
						cursor: isActive ? "pointer" : "not-allowed",
					}}
					disabled={!isActive}
				>
					<span>{isActive ? "Cetak Gol Sekarang!" : "Segera Hadir!"}</span>
					{isActive ? (
						<ArrowRight className="w-4 h-4" />
					) : (
						<Lock className="w-4 h-4" />
					)}
				</button>
			</div>

			{/* Decorative bottom-right glow - hanya untuk card aktif */}
			<div
				className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full pointer-events-none z-0"
				style={{
					background: isActive
						? `radial-gradient(circle, ${accentColor}1a 0%, transparent 70%)`
						: "transparent",
					filter: "blur(80px)",
					opacity: isActive ? 0.5 : 0,
				}}
			/>
		</div>
	);

	if (!isActive) {
		return (
			<div className="cursor-not-allowed h-full" aria-disabled>
				{cardContent}
			</div>
		);
	}

	return (
		<Link href={href} className="block h-full">
			{cardContent}
		</Link>
	);
}
