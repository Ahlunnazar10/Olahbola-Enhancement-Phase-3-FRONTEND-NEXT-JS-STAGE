import type { DuelPhase, DuelPlayScenario, Tactic } from "@/types/ngolahBola";

// Decision contexts that trigger extra coach-level panels during match
export interface CoachDecision {
	id: string;
	label: string;
	hook: string; // when this fires (e.g. "goal_conceded_30_min")
	description: string;
	choices: Array<{
		key: string;
		label: string;
		description: string;
		tacticalEffect?: Partial<Record<Tactic, number>>;
		risk: 'low' | 'medium' | 'high';
	}>;
}

export const allScenarios: Record<DuelPhase, DuelPlayScenario[]> = {
	attack: [
		{
			phase: "attack",
			prompt: "Anda punya peluang di kotak penalti lawan. Apa yang dilakukan?",
			choices: [
				{ key: "shoot",   label: "Tembak!",        description: "Tembak langsung ke gawang",       baseScore: 85 },
				{ key: "pass",    label: "Umpan",           description: "Umpan ke rekan yang posisi lebih baik", baseScore: 70 },
				{ key: "dribble", label: "Dribble",         description: "Giring bola mendekat gawang",     baseScore: 78 },
			],
		},
		{
			phase: "attack",
			prompt: "Serangan balik cepat! Anda membawa bola menuju area berbahaya.",
			choices: [
				{ key: "shoot",   label: "Tembak Jarak Jauh", description: "Tembak dari luar kotak penalti", baseScore: 65 },
				{ key: "pass",    label: "Umpan Silang",      description: "Umpan silang ke pemain teman",       baseScore: 80 },
				{ key: "dribble", label: "Maju Sendiri",       description: "Giring sendiri ke depan",            baseScore: 72 },
			],
		},
	],
	midfield: [
		{
			phase: "midfield",
			prompt: "Pergantian bola di tengah lapangan. Bagaimana respons Anda?",
			choices: [
				{ key: "distribute", label: "Distribusi Cepat", description: "Bagikan bola secepatnya ke sayap", baseScore: 80 },
				{ key: "press",      label: "Press Tinggi",     description: "Tekan lawan seketika untuk rebut bola", baseScore: 60 },
				{ key: "retain",     label: "Pertahankan",      description: "Jaga penguasaan bola dan cari ruang", baseScore: 85 },
			],
		},
		{
			phase: "midfield",
			prompt: "Lawan menekan tinggi. Anda terima bola di tengah lapangan.",
			choices: [
				{ key: "distribute", label: "Umpan Panjang",   description: "Umpan panjang ke pemain terbuka", baseScore: 75 },
				{ key: "press",      label: "Tekan Balik",     description: "Coba tekan balik segera",          baseScore: 55 },
				{ key: "retain",     label: "Putar Bola",      description: "Putar bola untuk cari celah",      baseScore: 82 },
			],
		},
	],
	defense: [
		{
			phase: "defense",
			prompt: "Lawan menyerang! Anda posisi bertahan di lini defensif.",
			choices: [
				{ key: "mark",     label: "Bekap Ketat",       description: "Ikuti pemain lawan tanpa lepaskan", baseScore: 78 },
				{ key: "intercept",label: "Intersep",           description: "Potong umpan lawan di tengah",        baseScore: 90 },
				{ key: "clear",    label: "Bersihkan Bola",     description: "Singkirkan bola aman dari area bahaya", baseScore: 60 },
			],
		},
		{
			phase: "defense",
			prompt: "Serangan balasan lawan lewat sayap. Anda bek sayap.",
			choices: [
				{ key: "mark",     label: "Bekap",            description: "Ikuti pemain sayap lawan ketat",  baseScore: 75 },
				{ key: "intercept",label: "Potong Umpan",      description: "Baca dan potong jalur umpan",       baseScore: 88 },
				{ key: "clear",    label: "Head Clear",        description: "Kepalkan bola keluar zona bahaya",  baseScore: 58 },
			],
		},
	],
};

const PHASE_ORDER: DuelPhase[] = ["attack", "midfield", "defense"];

// ─── Coach Decision Scenarios (extra decision panels during match) ───
export const coachDecisions: CoachDecision[] = [
	{
		id: "goal_conceded_early",
		label: "Kehabisan gol awal!",
		hook: "goal_conceded_lt_25min",
		description: "Anda kebobolan di menit <25. Perlu ubah strategi?",
		choices: [
			{ key: "aggressive_push", label: "Tekan Tinggi Seketika", description: "Risque — bisa kebobolan lagi tapi tekan balik lawan", risk: "high", tacticalEffect: { highPress: 1 } },
			{ key: "稳定_defense", label: "Pertahankan Formasi", description: "Tetap solid, tunggu kesempatancounter", risk: "low" },
			{ key: "subs_attacking", label: "Ganti Pemain Serang", description: "Masukkan striker cadangan untuk tekanan ekstra", risk: "medium" },
		],
	},
	{
		id: "leading_late_pressure",
		label: "Lawan Desak Akhir-akhir Ini",
		hook: "leading_75min_opponent_pressure",
		description: "Anda unggul di menit >75 tapi lawan press tinggi.",
		choices: [
			{ key: "low_block_hold", label: "Turun Bertahan (Low Block)", description: "Tutup ruang, tahan sampai akhir", risk: "low", tacticalEffect: { lowBlock: 1 } },
			{ key: "counter_threat", label: "Biarkan Counter Attack", description: "Tetap serangan balik, lawan buka ruang", risk: "medium" },
			{ key: "time_waste", label: "Kelola Waktu", description: "Pertahankan bola, habiskan waktu", risk: "high", tacticalEffect: { possessionPlay: 1 } },
		],
	},
	{
		id: "trailing_need_goal",
		label: "Butuh Gol — Menit 60+",
		hook: "trailing_60min",
		description: "Anda kalah atau seri di menit 60+. Solusi?",
		choices: [
			{ key: "all_out_attack", label: "Semua Pemain Serang", description: "Corongkan semua pemain ke depan", risk: "high" },
			{ key: "set_piece_focus", label: "Fokus Bola Mati", description: "Taktik bola diam — aman tapi terbatas", risk: "medium" },
			{ key: "high_press_reclaim", label: "High Press Rebut Bola", description: "Tekan lawan di area mereka, rebut kembali", risk: "medium", tacticalEffect: { highPress: 1 } },
		],
	},
	{
		id: "equalizer_midgame",
		label: "Skor Seri di Tengah Pertandingan",
		hook: "draw_45min",
		description: "1-1 di babak pertama. Lanjutkan atau ubah?",
		choices: [
			{ key: "possession_control", label: "Kontrol Penguasaan", description: "Tiki-taka, pelankan irama, cari celah", risk: "low", tacticalEffect: { possessionPlay: 1 } },
			{ key: "expand_width", label: "Lebarkan Sayap", description: "Manfaatkan lebar lapangan untuk umpan silang", risk: "medium" },
			{ key: "direct_balls", label: "Umpan Langsung ke Depan", description: "Langsung ke lini kedua, risiko tinggi", risk: "high" },
		],
	},
	{
		id: "red_card_absent",
		label: "Pemain Kartu Merah!",
		hook: "red_card",
		description: "Pemain Anda dapat kartu merah. 10 orang vs 11.",
		choices: [
			{ key: "drop_deep_block", label: "Bertahan Sangat Dalam", description: "Semua mundur, tutup kotak penalti", risk: "medium", tacticalEffect: { lowBlock: 1 } },
			{ key: "swap_wingback", label: "Ganti SB → CB", description: "Ubah bek sayap jadi center back", risk: "low" },
			{ key: "hit_on_counter", label: "Targetkan Counter", description: "Tinggalkan sayap, fokus serangan balik cepat", risk: "high" },
		],
	},
	{
		id: "fatigue_crisis",
		label: "Pemain Lelah — Substitusi?",
		hook: "70min_fatigue",
		description: "Menit 70+. Pemain tengah lelah, performa turun.",
		choices: [
			{ key: "fresh_legs_cm", label: "Substitusi Gelandang", description: "Masukkan gelandang segar, pertahankan ritme", risk: "low" },
			{ key: "push_wingers", label: "Dorong Sayap Depan", description: "Sayap maju, tekan lawan di setengah lapangan mereka", risk: "medium", tacticalEffect: { highPress: 1 } },
			{ key: "park_bus", label: "Kunci Pertahanan", description: "Tarik semua garis, lawan tidak punya ruang", risk: "high", tacticalEffect: { lowBlock: 1 } },
		],
	},
];

export function getRandomScenario(phase: DuelPhase): DuelPlayScenario {
	const pool = allScenarios[phase];
	return pool[Math.floor(Math.random() * pool.length)];
}

export function getPhaseOrder(): DuelPhase[] {
	return PHASE_ORDER;
}

// Returns coach decisions matching a hook (call this when an event fires)
export function getCoachDecisionByHook(hook: string): CoachDecision | null {
	return coachDecisions.find((d) => d.hook === hook) ?? null;
}
