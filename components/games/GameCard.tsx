"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Lock } from "lucide-react";

type EventState = "live" | "coming-soon" | "ended";

export interface CardEndedNotice {
	title: string;
	message: string;
	contactEmail: string;
	emailSubject: string;
}

interface GameCardProps {
	title: string;
	subtitle: string;
	description: string;
	href: string;
	isActive: boolean;
	eventState?: EventState;
	iconSrc?: string;
	bgImage?: string;
	accentColor: string;
	isDark: boolean;
	tags?: string[];
	endedNotice?: CardEndedNotice;
}

export function GameCard({
	title,
	subtitle,
	description,
	href,
	isActive,
	eventState = "live",
	iconSrc,
	bgImage,
	accentColor,
	isDark,
	tags = [],
	endedNotice,
}: GameCardProps) {
	const isEnded = eventState === "ended";
	const notice = endedNotice ?? null;
	const clickable = isActive;

	const cardStyle: React.CSSProperties = {
		backdropFilter: "blur(40px)",
		border: clickable
			? isEnded
				? `1px solid ${isDark ? "rgba(255, 215, 0, 0.3)" : "rgba(180, 83, 9, 0.25)"}`
				: `1px solid ${isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(10, 124, 110, 0.35)"}`
			: `1px dashed ${isDark ? "rgba(255, 255, 255, 0.2)" : "rgba(0, 0, 0, 0.15)"}`,
		transition: "all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275)",
	};

	const cardContent = (
		<div
			className={`relative overflow-hidden group h-full rounded-4xl p-8 ${!clickable ? "opacity-80" : ""}`}
			style={cardStyle}
		>
			{bgImage && (
				<div
					className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat transition-transform duration-500 group-hover:scale-110"
					style={{
						backgroundImage: clickable
							? isEnded
								? `linear-gradient(rgba(40, 30, 0, 0.75), rgba(20, 15, 0, 0.9)), url("${bgImage}")`
								: isDark
									? `linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.8)), url("${bgImage}")`
									: `linear-gradient(rgba(10, 50, 45, 0.75), rgba(10, 50, 45, 0.9)), url("${bgImage}")`
							: `linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.9)), url("${bgImage}")`,
					}}
				/>
			)}
			{!bgImage && (
				<div
					className="absolute inset-0 z-0"
					style={{
						background: clickable
							? isEnded
								? isDark
									? "rgba(255, 215, 0, 0.03)"
									: "rgba(180, 83, 9, 0.04)"
								: isDark
									? "rgba(255, 255, 255, 0.03)"
									: "rgba(255, 255, 255, 0.6)"
							: isDark
								? "rgba(255, 255, 255, 0.02)"
								: "rgba(255, 255, 255, 0.4)",
					}}
				/>
			)}

			<div className="absolute top-6 right-6 flex items-center gap-2 z-10">
				{clickable && !isEnded ? (
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
				) : isEnded ? (
					<span></span>
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

			<h3
				className="text-xs font-black tracking-widest uppercase mb-2 relative z-10 mt-7 md:mt-2"
				style={{
					color: isEnded ? (isDark ? "#FFD700" : "#B45309") : accentColor,
				}}
			>
				{subtitle}
			</h3>

			<h2
				className={`${isEnded ? "text-2xl md:text-3xl" : "text-3xl md:text-4xl"} font-black italic tracking-tighter uppercase mb-3 relative z-10`}
				style={{
					color: clickable
						? "#ffffff"
						: isDark
							? "rgba(255, 255, 255, 0.4)"
							: "rgba(26, 26, 26, 0.45)",
				}}
			>
				{title}
			</h2>

			{!isEnded && (
				<p
					className="text-sm leading-relaxed max-w-88 mb-8 relative z-10"
					style={{
						color: clickable
							? "rgba(255, 255, 255, 0.85)"
							: isDark
								? "rgba(255, 255, 255, 0.3)"
								: "rgba(26, 26, 26, 0.4)",
					}}
				>
					{description}
				</p>
			)}

			<div className={`mt-${isEnded ? "4" : "12"} relative z-10`}>
				<button
					className="flex items-center gap-2 font-black italic tracking-widest uppercase text-sm group-hover:translate-x-2 transition-transform"
					style={{
						color: clickable
							? isEnded
								? isDark
									? "#FFD700"
									: "#B45309"
								: accentColor
							: isDark
								? "rgba(255, 255, 255, 0.3)"
								: "rgba(26, 26, 26, 0.35)",
						cursor: clickable ? "pointer" : "not-allowed",
					}}
					disabled={!clickable}
				>
					<span>
						{clickable
							? isEnded
								? "Lihat Klasemen Akhir"
								: "Cetak Gol Sekarang!"
							: "Segera Hadir!"}
					</span>
					{clickable && !isEnded ? (
						<ArrowRight className="w-4 h-4" />
					) : !clickable ? (
						<Lock className="w-4 h-4" />
					) : null}
					{isEnded ? <ArrowRight className="w-4 h-4" /> : null}
				</button>
			</div>

			<div
				className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full pointer-events-none z-0"
				style={{
					background:
						clickable && !isEnded
							? `radial-gradient(circle, ${accentColor}1a 0%, transparent 70%)`
							: isEnded
								? `radial-gradient(circle, ${isDark ? "rgba(255, 215, 0, 0.1)" : "rgba(180, 83, 9, 0.08)"} 0%, transparent 70%)`
								: "transparent",
					filter: "blur(80px)",
					opacity: clickable ? (isEnded ? 0.35 : 0.5) : 0,
				}}
			/>
		</div>
	);

	if (!clickable) {
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
