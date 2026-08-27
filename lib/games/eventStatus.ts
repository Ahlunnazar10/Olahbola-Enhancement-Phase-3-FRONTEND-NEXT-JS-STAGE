/**
 * Status event Olahbola Teater Bola Dunia Season 1.
 *
 * Flag-flag ini di-hardcode (bukan dari API) supaya admin bisa flip manual
 * saat event berakhir / event baru dimulai tanpa deploy backend.
 *
 * Cara menghidupkan kembali event (atau event baru):
 *   - Set `isEnded: false` pada game yang sesuai.
 *   - Update `endedLabel` bila perlu (mis. "Season 2").
 */

export type GameEventKey = "prediksiSkor" | "quiz" | "teaterBolaAsean" | "bundesliga2026" | "ngolahBola2026";

export interface GameEventStatus {
	isEnded: boolean;
	endedLabel: string;
}

export const EVENT_STATUS: Record<GameEventKey, GameEventStatus> = {
	prediksiSkor: {
		isEnded: true,
		endedLabel: "Event Berakhir",
	},
	quiz: {
		isEnded: true,
		endedLabel: "Event Berakhir",
	},
	teaterBolaAsean: {
		isEnded: false,
		endedLabel: "Event Berakhir",
	},
	bundesliga2026: {
		isEnded: false,
		endedLabel: "Event Berakhir",
	},
	ngolahBola2026: {
		isEnded: false,
		endedLabel: "Event Berakhir",
	},
};

export interface EventEndedNotice {
	title: string;
	message: string;
	contactEmail: string;
	emailSubject: string;
}

export const EVENT_ENDED_NOTICE: EventEndedNotice = {
	title: "Event Telah Berakhir",
	message:
		"Terima kasih sudah ikut serta! Semua pemenang wajib menghubungi admin@olahbola.com untuk mengkonfirmasi klaim hadiah. Kami tunggu konfirmasi Anda paling lambat hari Jumat, 14 Agustus 2026 pukul 23:59 WIB. Setelah itu, hadiah Anda dianggap hangus.",
	contactEmail: "admin@olahbola.com",
	emailSubject: "Klaim Hadiah — Olahbola Teater Bola Dunia Season 1",
};

export const mailtoClaim = `mailto:${EVENT_ENDED_NOTICE.contactEmail}?subject=${encodeURIComponent(
	EVENT_ENDED_NOTICE.emailSubject,
)}`;
