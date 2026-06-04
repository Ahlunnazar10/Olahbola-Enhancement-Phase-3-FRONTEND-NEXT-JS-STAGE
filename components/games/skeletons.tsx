export function StatsSkeleton({ isDark }: { isDark: boolean }) {
	const surface = isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.06)";

	return (
		<div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
			{Array.from({ length: 4 }).map((_, i) => (
				<div
					key={i}
					className="rounded-2xl p-4 md:p-5 animate-pulse"
					style={{
						background: surface,
						border: `1px solid ${isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"}`,
					}}
				>
					<div
						className="h-3 rounded w-1/2 mb-3"
						style={{ background: surface }}
					/>
					<div
						className="h-6 md:h-7 rounded w-2/3"
						style={{ background: surface }}
					/>
				</div>
			))}
		</div>
	);
}

export function LeaderboardSkeleton({ isDark }: { isDark: boolean }) {
	const surface = isDark ? "rgba(255, 255, 255, 0.06)" : "rgba(0, 0, 0, 0.06)";
	const dimSurface = isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(0, 0, 0, 0.04)";

	return (
		<div className="space-y-6">
			{/* Podium Skeleton — 2 | 1 | 3 */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				{/* Rank 2 */}
				<div
					className="order-2 md:order-1 rounded-3xl p-6 animate-pulse"
					style={{
						background: dimSurface,
						border: `1px solid ${isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"}`,
					}}
				>
					<div
						className="w-20 h-20 rounded-2xl mx-auto mb-4"
						style={{ background: surface }}
					/>
					<div
						className="h-3 rounded w-3/4 mx-auto mb-2"
						style={{ background: surface }}
					/>
					<div
						className="h-4 rounded-full w-16 mx-auto"
						style={{ background: surface }}
					/>
				</div>

				{/* Rank 1 — Champion (taller) */}
				<div
					className="order-1 md:order-2 rounded-3xl p-8 animate-pulse transform md:scale-110"
					style={{
						background: dimSurface,
						border: `1px solid ${isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"}`,
					}}
				>
					<div
						className="w-24 h-24 rounded-2xl mx-auto mb-4"
						style={{ background: surface }}
					/>
					<div
						className="h-4 rounded w-2/3 mx-auto mb-2"
						style={{ background: surface }}
					/>
					<div
						className="h-5 rounded-full w-20 mx-auto"
						style={{ background: surface }}
					/>
				</div>

				{/* Rank 3 */}
				<div
					className="order-3 md:order-3 rounded-3xl p-6 animate-pulse"
					style={{
						background: dimSurface,
						border: `1px solid ${isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"}`,
					}}
				>
					<div
						className="w-20 h-20 rounded-2xl mx-auto mb-4"
						style={{ background: surface }}
					/>
					<div
						className="h-3 rounded w-3/4 mx-auto mb-2"
						style={{ background: surface }}
					/>
					<div
						className="h-4 rounded-full w-16 mx-auto"
						style={{ background: surface }}
					/>
				</div>
			</div>

			{/* Rest Skeleton */}
			<div className="space-y-3">
				{Array.from({ length: 5 }).map((_, i) => (
					<div
						key={i}
						className="flex items-center gap-3 md:gap-4 p-3 md:p-4 rounded-2xl animate-pulse"
						style={{
							background: isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(0, 0, 0, 0.02)",
							border: `1px solid ${isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(0, 0, 0, 0.05)"}`,
						}}
					>
						<div
							className="w-7 h-5 md:w-8 md:h-5 rounded shrink-0"
							style={{ background: surface }}
						/>
						<div
							className="w-9 h-9 md:w-10 md:h-10 rounded-lg shrink-0"
							style={{ background: surface }}
						/>
						<div className="flex-1 space-y-1.5">
							<div
								className="h-3 rounded w-1/2"
								style={{ background: surface }}
							/>
							<div
								className="h-2 rounded w-1/3"
								style={{ background: dimSurface }}
							/>
						</div>
						<div
							className="w-12 h-5 md:h-6 rounded shrink-0"
							style={{ background: surface }}
						/>
					</div>
				))}
			</div>
		</div>
	);
}