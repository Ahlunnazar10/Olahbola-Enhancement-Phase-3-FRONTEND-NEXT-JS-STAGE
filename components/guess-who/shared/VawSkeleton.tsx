import { cn } from "@/lib/utils";

export function VawSkeleton({
	className,
	...props
}: React.HTMLAttributes<HTMLDivElement>) {
	return (
		<div
			className={cn("animate-pulse rounded-xl bg-white/5", className)}
			{...props}
		/>
	);
}

export function VawLeaderboardSkeleton() {
	return (
		<div className="glass-panel rounded-3xl p-6 flex flex-col gap-4">
			<VawSkeleton className="h-5 w-32" />
			<div className="space-y-3 flex-1">
				{[1, 2, 3, 4, 5].map((i) => (
					<div key={i} className="flex items-center gap-4 p-3">
						<VawSkeleton className="h-5 w-6 flex-shrink-0" />
						<div className="flex-1 flex flex-col gap-2">
							<VawSkeleton className="h-4 w-3/4" />
							<VawSkeleton className="h-3 w-1/2" />
						</div>
					</div>
				))}
			</div>
			<VawSkeleton className="h-10 w-full" />
		</div>
	);
}

export function VawQuickStatsSkeleton() {
	return (
		<div className="glass-panel rounded-3xl p-6 space-y-6">
			<div className="flex items-center gap-4">
				<VawSkeleton className="w-14 h-14 rounded-full flex-shrink-0" />
				<div className="flex-1 space-y-2">
					<VawSkeleton className="h-5 w-3/4" />
					<VawSkeleton className="h-4 w-1/2" />
				</div>
			</div>
			<div className="grid grid-cols-2 gap-4">
				<VawSkeleton className="h-16 w-full rounded-xl" />
				<VawSkeleton className="h-16 w-full rounded-xl" />
			</div>
		</div>
	);
}

export function VawLevelCardSkeleton() {
	return (
		<div className="glass-panel rounded-3xl p-6 flex flex-col gap-6">
			<div className="space-y-3">
				<VawSkeleton className="h-12 w-20" />
				<VawSkeleton className="h-5 w-3/4" />
				<VawSkeleton className="h-3 w-1/2" />
			</div>
			<div className="space-y-3">
				<VawSkeleton className="h-4 w-16" />
				<VawSkeleton className="h-10 w-full rounded-xl" />
			</div>
		</div>
	);
}
