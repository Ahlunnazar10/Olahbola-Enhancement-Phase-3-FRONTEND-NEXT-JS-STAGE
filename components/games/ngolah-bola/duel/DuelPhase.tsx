"use client";

import { Zap, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import type { DuelPhase as PhaseType, DuelPlayScenario } from "@/types/ngolahBola";
import { formatTime } from "@/lib/guessWho/scoring";

const PHASE_LABELS: Record<PhaseType, string> = {
	attack: "SERANG",
	midfield: "TENGAH LAPANGAN",
	defense: "PERTAHANAN",
};

const PHASE_COLORS: Record<PhaseType, string> = {
	attack: "from-rose-500 to-orange-500",
	midfield: "from-blue-500 to-indigo-500",
	defense: "from-green-500 to-teal-500",
};

const PHASE_ICONS: Record<PhaseType, string> = {
	attack: "⚔️",
	midfield: "🎯",
	defense: "🛡️",
};

export function DuelPhase({
	phase,
	scenario,
	timeLeft,
	onChoice,
	disabled,
}: {
	phase: PhaseType;
	scenario: DuelPlayScenario;
	timeLeft: number;
	onChoice: (choiceKey: string, elapsedMs: number) => void;
	disabled: boolean;
}) {
	const handleClick = (key: string) => {
		if (disabled) return;
		onChoice(key, (15 - timeLeft) * 1000);
	};

	return (
		<div className="space-y-4">
			{/* Phase header */}
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<span className="text-2xl">{PHASE_ICONS[phase]}</span>
					<div>
						<p className="text-[10px] font-black uppercase tracking-widest text-white/40">
							Fase {["attack", "midfield", "defense"].indexOf(phase) + 1}/3
						</p>
						<h3 className={cn(
							"font-black italic uppercase text-sm",
							phase === "attack" ? "text-rose-400" :
							phase === "midfield" ? "text-blue-400" : "text-teal-400",
						)}>
							{PHASE_LABELS[phase]}
						</h3>
					</div>
				</div>

				{/* Circular timer */}
				<div className="relative inline-flex items-center justify-center">
					<svg width="56" height="56" className="-rotate-90" aria-hidden="true">
						<circle
							cx="28" cy="28" r="24"
							fill="none"
							stroke="rgba(255,255,255,0.1)"
							strokeWidth="4"
						/>
						<circle
							cx="28" cy="28" r="24"
							fill="none"
							stroke={timeLeft <= 5 ? "#ef4444" : timeLeft <= 10 ? "#fbbf24" : "#22c55e"}
							strokeWidth="4"
							strokeLinecap="round"
							strokeDasharray={2 * Math.PI * 24}
							strokeDashoffset={2 * Math.PI * 24 * (1 - timeLeft / 15)}
							style={{ transition: "stroke-dashoffset 1s linear" }}
						/>
					</svg>
					<span className={cn(
						"absolute font-black tabular-nums text-sm",
						timeLeft <= 5 ? "text-red-400" : "text-white",
					)}>
						{formatTime(timeLeft)}
					</span>
				</div>
			</div>

			{/* Prompt */}
			<div className="glass-card rounded-2xl p-4">
				<p className="text-sm font-bold text-white/80 leading-relaxed">
					{scenario.prompt}
				</p>
			</div>

			{/* Choice cards */}
			<div className="space-y-2">
				{scenario.choices.map((choice) => (
					<button
						key={choice.key}
						onClick={() => handleClick(choice.key)}
						disabled={disabled}
						className={cn(
							"w-full flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left",
							disabled
								? "border-white/5 bg-white/5 opacity-50 cursor-not-allowed"
								: cn(
									"border-white/10 bg-white/5 hover:border-white/20 hover:bg-white/10 cursor-pointer active:scale-[0.98]",
									`hover:${PHASE_COLORS[phase].replace("from-", "bg-gradient-to-r ")}`,
								),
						)}
					>
						<div className={cn(
							"w-10 h-10 rounded-xl flex items-center justify-center shrink-0",
							phase === "attack" ? "bg-rose-500/20" :
							phase === "midfield" ? "bg-blue-500/20" : "bg-teal-500/20",
						)}>
							<Zap className={cn(
								"w-5 h-5",
								phase === "attack" ? "text-rose-400" :
								phase === "midfield" ? "text-blue-400" : "text-teal-400",
							)} />
						</div>
						<div className="flex-1 min-w-0">
							<p className="text-sm font-black uppercase text-white">{choice.label}</p>
							<p className="text-[11px] text-white/40 mt-0.5">{choice.description}</p>
						</div>
						<ArrowRight className="w-4 h-4 text-white/20 shrink-0" />
					</button>
				))}
			</div>
		</div>
	);
}
