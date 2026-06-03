interface MedalsBadgeProps {
	rank: number;
	size?: "sm" | "md" | "lg";
	isDark: boolean;
}

export function MedalsBadge({ rank, size = "md", isDark }: MedalsBadgeProps) {
	if (rank > 3) {
		return (
			<div
				className={`flex items-center justify-center font-bold ${
					size === "lg"
						? "w-12 h-12 text-lg"
						: size === "sm"
							? "w-8 h-8 text-sm"
							: "w-10 h-10 text-base"
				} rounded-full`}
				style={{
					background: isDark
						? "rgba(67, 222, 204, 0.15)"
						: "rgba(10, 124, 110, 0.1)",
					color: isDark ? "#43decc" : "#0a7c6e",
				}}
			>
				#{rank}
			</div>
		);
	}

	const medalConfig = {
		1: { gradient: "linear-gradient(135deg, #FFD700 0%, #FFA500 100%)", text: "🥇" },
		2: {
			gradient: "linear-gradient(135deg, #E5E5E5 0%, #A0A0A0 100%)",
			text: "🥈",
		},
		3: {
			gradient: "linear-gradient(135deg, #CD7F32 0%, #A0522D 100%)",
			text: "🥉",
		},
	};

	const config = medalConfig[rank as 1 | 2 | 3];

	return (
		<div
			className={`flex items-center justify-center font-black ${
				size === "lg"
					? "w-12 h-12 text-2xl"
					: size === "sm"
						? "w-8 h-8 text-base"
						: "w-10 h-10 text-xl"
			} rounded-full shadow-lg`}
			style={{
				background: config.gradient,
				boxShadow:
					rank === 1
						? "0 0 20px rgba(255, 215, 0, 0.6)"
						: rank === 2
							? "0 0 15px rgba(192, 192, 192, 0.5)"
							: "0 0 15px rgba(205, 127, 50, 0.4)",
			}}
		>
			{config.text}
		</div>
	);
}
