export function LogoutOverlay() {
	return (
		<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm transition-opacity duration-300">
			<div className="flex flex-col items-center gap-4">
				<div className="w-12 h-12 border-4 border-teal-400/30 border-t-teal-400 rounded-full animate-spin" />
				<p className="text-white text-lg font-medium">Sedang keluar...</p>
			</div>
		</div>
	);
}
