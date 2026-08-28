const CONTACT_EMAIL = process.env.NEXT_PUBLIC_CONTACT_EMAIL ?? "admin.olahbola@gmail.com";

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

export interface EventEndedNotice {
	title: string;
	message: string;
	contactEmail: string;
	emailSubject: string;
}

export interface GameEventStatus {
	/** Flag manual — admin bisa flip kapan saja tanpa deploy */
	isEnded: boolean;
	endedLabel: string;
	endedNotice: EventEndedNotice;
	/**
	 * Deadline event dalam ISO 8601 (UTC).
	 * Event otomatis dianggap ended setelah tanggal ini dilewati,
	 * TETAPI `isEnded: true` manual tetap.override.
	 * Set null untuk tidak ada deadline (hanya kontrol manual).
	 */
	deadline?: string | null;
}

export const EVENT_STATUS: Record<GameEventKey, GameEventStatus> = {
	prediksiSkor: {
		isEnded: true,
		endedLabel: "Event Berakhir",
		endedNotice: {
			title: "Event Telah Berakhir",
			message:
				`Terima kasih sudah ikut serta! Semua pemenang wajib menghubungi ${CONTACT_EMAIL} untuk mengkonfirmasi klaim hadiah. Kami tunggu konfirmasi Anda paling lambat hari Jumat, 14 Agustus 2026 pukul 23:59 WIB. Setelah itu, hadiah Anda dianggap hangus.`,
			contactEmail: CONTACT_EMAIL,
			emailSubject: "Klaim Hadiah — Teater Bola Dunia",
		},
	},
	quiz: {
		isEnded: true,
		endedLabel: "Event Berakhir",
		endedNotice: {
			title: "Event Telah Berakhir",
			message:
				`Terima kasih sudah ikut serta! Semua pemenang wajib menghubungi ${CONTACT_EMAIL} untuk mengkonfirmasi klaim hadiah. Kami tunggu konfirmasi Anda paling lambat hari Jumat, 14 Agustus 2026 pukul 23:59 WIB. Setelah itu, hadiah Anda dianggap hangus.`,
			contactEmail: CONTACT_EMAIL,
			emailSubject: "Klaim Hadiah — Quiz Teater Bola Dunia",
		},
	},
	teaterBolaAsean: {
		isEnded: true,
		endedLabel: "Event Berakhir",
		endedNotice: {
			title: "Event Telah Berakhir",
			message: `Terima kasih sudah ikut serta! Semua pemenang wajib menghubungi ${CONTACT_EMAIL} untuk mengkonfirmasi klaim hadiah. Kami tunggu konfirmasi Anda paling lambat hari Jumat, 11 September 2026 pukul 23:59 WIB. Setelah itu, hadiah Anda dianggap hangus.`,
			contactEmail: CONTACT_EMAIL,
			emailSubject: "Klaim Hadiah — Teater Bola Asean 2026",
		},
	},
	bundesliga2026: {
		isEnded: false,
		endedLabel: "Event Berakhir",
		endedNotice: {
			title: "",
			message: "",
			contactEmail: "",
			emailSubject: "",
		},
	},
	ngolahBola2026: {
		isEnded: false,
		endedLabel: "Event Berakhir",
		endedNotice: {
			title: "",
			message: "",
			contactEmail: "",
			emailSubject: "",
		},
	},
};

/**
 * Ambil status ended terbaru untuk sebuah event key.
 * Menggabungkan flag manual (`isEnded`) DAN deadline otomatis.
 * Flag manual (`true`) selalu override deadline.
 */
export function getEventEndedStatus(key: GameEventKey): boolean {
	const event = EVENT_STATUS[key];
	if (event.isEnded) return true;
	if (!event.deadline) return false;
	return new Date(event.deadline) < new Date();
}

/** @deprecated — gunakan `getEventEndedStatus(key)` atau `EVENT_STATUS[key].endedNotice` */
export const EVENT_ENDED_NOTICE: EventEndedNotice = EVENT_STATUS.prediksiSkor.endedNotice;
/** @deprecated — gunakan `mailto:${EVENT_STATUS[key].endedNotice.contactEmail}?subject=...` */
export const mailtoClaim = `mailto:${EVENT_ENDED_NOTICE.contactEmail}?subject=${encodeURIComponent(EVENT_ENDED_NOTICE.emailSubject)}`;
