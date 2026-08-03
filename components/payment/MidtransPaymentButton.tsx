import { useState } from "react";
import { ShieldCheck, Loader2 } from "lucide-react";
import { useMidtransSnap } from "@/hooks/useMidtransSnap";

interface MidtransPaymentButtonProps {
	onSuccess?: () => void;
	onCancel?: () => void;
	className?: string;
	children?: React.ReactNode;
}

export function MidtransPaymentButton({
	onSuccess,
	onCancel,
	className = "",
	children,
}: MidtransPaymentButtonProps) {
	const { pay, loading } = useMidtransSnap();
	const [buttonLoading, setButtonLoading] = useState(false);

	const handleClick = async () => {
		setButtonLoading(true);
		try {
			await pay("world_cup_full", {
				onSuccess: () => {
					setButtonLoading(false);
					onSuccess?.();
				},
				onClose: () => {
					setButtonLoading(false);
					onCancel?.();
				},
			});
		} catch {
			setButtonLoading(false);
		}
	};

	return (
		<button
			onClick={handleClick}
			disabled={loading || buttonLoading}
			className={`inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-base font-bold uppercase tracking-widest transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-[0.98] ${className}`}
		>
			{loading || buttonLoading ? (
				<>
					<Loader2 className="w-5 h-5 animate-spin" />
					Memproses...
				</>
			) : (
				<>
					<ShieldCheck className="w-5 h-5" />
					{children ?? "Bayar Sekarang"}
				</>
			)}
		</button>
	);
}
