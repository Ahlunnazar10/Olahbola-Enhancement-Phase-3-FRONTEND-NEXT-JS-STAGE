"use client";

import { useRouter } from "next/navigation";
import { Plus, Swords, Building2, Trash2 } from "lucide-react";
import { useSquads, useCreateSquad } from "@/hooks/queries/useNgolahBola";
import { toast } from "sonner";
import { useState } from "react";

export default function SquadPage() {
	const router = useRouter();
	const { data: squads, isLoading } = useSquads();
	const { mutate: createSquad, isPending } = useCreateSquad();
	const [showForm, setShowForm] = useState(false);
	const [formName, setFormName] = useState("");
	const [formFormation, setFormFormation] = useState("4-3-3");

	const handleCreate = () => {
		if (!formName.trim()) {
			toast.error("Nama skuad wajib diisi.");
			return;
		}
		createSquad(
			{ name: formName.trim(), formation: formFormation as any },
			{
				onSuccess: (data) => {
					setShowForm(false);
					setFormName("");
					router.push(`/ngolah-bola/squad/${data.id}`);
				},
				onError: (err: any) => {
					toast.error(err?.response?.data?.message || "Gagal membuat skuad.");
				},
			},
		);
	};

	const handleDelete = (id: string) => {
		if (!confirm("Hapus skuad ini?")) return;
		// Note: delete squad endpoint exists but not yet hooked up
		toast.info("Fitur hapus skuad segera hadir.");
	};

	if (isLoading) return <SquadSkeleton />;

	return (
		<div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
			<div className="flex items-center justify-between">
				<div className="flex items-center gap-3">
					<div className="w-10 h-10 rounded-xl bg-rose-500/20 flex items-center justify-center">
						<Swords className="w-5 h-5 text-rose-400" />
					</div>
					<div>
						<h1 className="text-xl font-black italic uppercase tracking-tight text-white">
							Squad
						</h1>
						<p className="text-xs text-white/40">
							{(squads?.length ?? 0)}/5 skuad terpakai
						</p>
					</div>
				</div>
				<button
					onClick={() => setShowForm(!showForm)}
					className="flex items-center gap-2 px-4 py-2.5 bg-teal-500 text-black font-black uppercase text-xs tracking-wider rounded-xl hover:bg-teal-400 transition-colors"
				>
					<Plus className="w-4 h-4" />
					Buat Baru
				</button>
			</div>

			{/* Create form */}
			{showForm && (
				<div className="glass-card rounded-2xl p-5 space-y-4">
					<h3 className="font-black uppercase text-white text-sm">Skuad Baru</h3>
					<input
						type="text"
						placeholder="Nama skuad..."
						value={formName}
						onChange={(e) => setFormName(e.target.value)}
						className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-teal-500/50"
						onKeyDown={(e) => e.key === "Enter" && handleCreate()}
					/>
					<select
						value={formFormation}
						onChange={(e) => setFormFormation(e.target.value)}
						className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-teal-500/50 appearance-none"
					>
						<option value="4-3-3" className="bg-[#111817]">4-3-3</option>
						<option value="4-4-2" className="bg-[#111817]">4-4-2</option>
						<option value="3-5-2" className="bg-[#111817]">3-5-2</option>
						<option value="4-2-3-1" className="bg-[#111817]">4-2-3-1</option>
						<option value="4-3-2-1" className="bg-[#111817]">4-3-2-1</option>
						<option value="3-4-3" className="bg-[#111817]">3-4-3</option>
						<option value="5-3-2" className="bg-[#111817]">5-3-2</option>
						<option value="4-1-4-1" className="bg-[#111817]">4-1-4-1</option>
						<option value="3-6-1" className="bg-[#111817]">3-6-1</option>
						<option value="4-2-4" className="bg-[#111817]">4-2-4</option>
						<option value="4-5-1" className="bg-[#111817]">4-5-1</option>
						<option value="3-4-2-1" className="bg-[#111817]">3-4-2-1</option>
					</select>
					<div className="flex gap-2">
						<button
							onClick={handleCreate}
							disabled={isPending}
							className="flex-1 py-3 bg-teal-500 text-black font-black uppercase text-xs tracking-wider rounded-xl hover:bg-teal-400 transition-colors disabled:opacity-50"
						>
							{isPending ? "Membuat..." : "Buat Squad"}
						</button>
						<button
							onClick={() => setShowForm(false)}
							className="px-4 py-3 bg-white/5 text-white/50 font-bold uppercase text-xs tracking-wider rounded-xl hover:bg-white/10 transition-colors"
						>
							Batal
						</button>
					</div>
				</div>
			)}

			{/* Squad list */}
			{(!squads || squads.length === 0) ? (
				<EmptySquads onAdd={() => setShowForm(true)} />
			) : (
				<div className="space-y-3">
					{squads.map((squad) => (
						<SquadCard
							key={squad.id}
							squad={squad}
							onEdit={() => router.push(`/ngolah-bola/squad/${squad.id}`)}
							onDelete={() => handleDelete(squad.id)}
						/>
					))}
				</div>
			)}
		</div>
	);
}

function SquadCard({
	squad,
	onEdit,
	onDelete,
}: {
	squad: { id: string; name: string; formation: string; budget_cap: number; filled_slots?: number; created_at: string };
	onEdit: () => void;
	onDelete: () => void;
}) {
	return (
		<div className="glass-card rounded-2xl p-4 flex items-center gap-4 hover:border-teal-500/20 transition-all group">
			<div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500/30 to-rose-700/10 flex items-center justify-center shrink-0">
				<Building2 className="w-6 h-6 text-rose-400" />
			</div>
			<div className="flex-1 min-w-0">
				<h3 className="font-black uppercase text-white text-sm truncate">{squad.name}</h3>
				<div className="flex items-center gap-3 mt-1 text-[10px] text-white/40">
					<span className="uppercase font-bold">{squad.formation}</span>
					<span>Budget: {squad.budget_cap}</span>
					<span>{squad.filled_slots ?? 0}/11 pemain</span>
				</div>
			</div>
			<div className="flex items-center gap-2">
				<button
					onClick={onDelete}
					className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500/20"
				>
					<Trash2 className="w-3.5 h-3.5 text-red-400" />
				</button>
				<button
					onClick={onEdit}
					className="px-4 py-2 bg-teal-500/20 text-teal-400 font-black uppercase text-[10px] tracking-wider rounded-xl hover:bg-teal-500/30 transition-colors"
				>
					Edit
				</button>
			</div>
		</div>
	);
}

function EmptySquads({ onAdd }: { onAdd: () => void }) {
	return (
		<div className="text-center py-16 space-y-4">
			<Swords className="w-12 h-12 text-white/10 mx-auto" />
			<h3 className="text-lg font-black uppercase text-white/30">Belum ada squad</h3>
			<p className="text-sm text-white/20 max-w-xs mx-auto">
				Buat squad pertamamu dan mulai tempatkan kartu favorit!
			</p>
			<button
				onClick={onAdd}
				className="inline-flex items-center gap-2 px-6 py-3 bg-teal-500 text-black font-black uppercase text-sm tracking-wider rounded-xl hover:bg-teal-400 transition-colors"
			>
				<Plus className="w-4 h-4" />
				Buat Squad
			</button>
		</div>
	);
}

function SquadSkeleton() {
	return (
		<div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
			{[1, 2, 3].map((i) => (
				<div key={i} className="glass-card rounded-2xl p-4 flex items-center gap-4 animate-pulse">
					<div className="w-12 h-12 rounded-xl bg-white/5" />
					<div className="flex-1 space-y-2">
						<div className="h-4 w-32 bg-white/5 rounded" />
						<div className="h-3 w-24 bg-white/5 rounded" />
					</div>
				</div>
			))}
		</div>
	);
}
