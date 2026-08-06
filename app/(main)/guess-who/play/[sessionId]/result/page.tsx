"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { VawResultScreen } from "@/components/guess-who/screens/VawResultScreen";
import { useGuessWhoStart } from "@/hooks/queries/useGuessWho";
import { clearSessionState } from "@/lib/guessWho/storage";
import { EMPTY_BREAKDOWN, type TierBreakdown } from "@/lib/guessWho/scoring";

export default function GuessWhoResultPage({
	params,
}: {
	params: { sessionId: string } | Promise<{ sessionId: string }>;
}) {
	const [resolvedParams, setResolvedParams] = useState<{ sessionId: string } | null>(
		null,
	);

	useEffect(() => {
		Promise.resolve(params).then((p) => setResolvedParams(p));
	}, [params]);

	const router = useRouter();
	const searchParams = useSearchParams();
	const qc = useQueryClient();
	const startMutation = useGuessWhoStart();
	const [restarting, setRestarting] = useState(false);

	const scoreFromQuery = Number(searchParams.get("score")) || 0;
	const levelFromQuery = Number(searchParams.get("level")) || 1;

	let breakdownFromQuery: TierBreakdown | null = null;
	const breakdownStr = searchParams.get("breakdown");
	if (breakdownStr) {
		try {
			breakdownFromQuery = JSON.parse(breakdownStr) as TierBreakdown;
		} catch {
			breakdownFromQuery = null;
		}
	}

	if (!resolvedParams) {
		return (
			<div className="min-h-screen flex items-center justify-center">
				<div className="text-white/60 text-sm">Memuat...</div>
			</div>
		);
	}

	const level = levelFromQuery;
	const score = scoreFromQuery;
	const tierBreakdown = breakdownFromQuery ?? EMPTY_BREAKDOWN;

	const invalidateProgress = () => {
		qc.invalidateQueries({ queryKey: ["guess-who", "session"] });
		qc.invalidateQueries({ queryKey: ["guess-who", "level-progress"] });
		qc.invalidateQueries({ queryKey: ["guess-who", "my-sessions"] });
		qc.invalidateQueries({ queryKey: ["guess-who", "leaderboard"] });
		qc.invalidateQueries({ queryKey: ["guess-who", "my-rank"] });
	};

	const handleRematch = async () => {
		if (restarting) return;
		setRestarting(true);
		try {
			clearSessionState();
			invalidateProgress();
			const fresh = await startMutation.mutateAsync(level);
			if (fresh?.session_id) {
				router.push(`/guess-who/play/${fresh.session_id}`);
			} else {
				router.push("/guess-who");
			}
		} catch (err) {
			console.error("Restart session failed:", err);
			router.push("/guess-who");
		} finally {
			setRestarting(false);
		}
	};

	const handleClose = () => {
		clearSessionState();
		invalidateProgress();
		router.push("/guess-who");
	};

	return (
		<div className="min-h-screen p-4">
			<VawResultScreen
				score={score}
				tierBreakdown={tierBreakdown}
				level={level}
				onRematch={handleRematch}
				onClose={handleClose}
			/>
		</div>
	);
}