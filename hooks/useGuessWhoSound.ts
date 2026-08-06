'use client';

/* ================================================================== */
/*  Singleton audio manager for Guess Who                             */
/* ================================================================== */

type BacksoundKey = 'backsound-1' | 'backsound-2';
type SfxKey =
	| 'benar'
	| 'salah'
	| 'ambil-sendiri-pialanya'
	| 'tumben-bener'
	| 'yah-kocak-oke-lanjut'
	| 'bisa-main-gak-sih'
	| 'buruan-udah-mau-abis';

const BACKSOUND_URLS: Record<BacksoundKey, string> = {
	'backsound-1': '/sounds/backsound-1.mpeg',
	'backsound-2': '/sounds/backsound-2.mpeg',
};

const SFX_URLS: Record<SfxKey, string> = {
	benar: '/sounds/effect/benar.mp3',
	salah: '/sounds/effect/salah.mp3',
	'ambil-sendiri-pialanya': '/sounds/effect/ambil-sendiri-pialanya.mp3',
	'tumben-bener': '/sounds/effect/tumben-bener.mp3',
	'yah-kocak-oke-lanjut': '/sounds/effect/yah-kocak-oke-lanjut.mp3',
	'bisa-main-gak-sih': '/sounds/effect/bisa-main-gak-sih.mp3',
	'buruan-udah-mau-abis': '/sounds/effect/buruan-udah-mau-abis.mp3',
};

class SoundManager {
	private backsoundEl: HTMLAudioElement | null = null;
	private currentBacksoundKey: BacksoundKey | null = null;
	private muted = false;
	private backsoundVolume = 0.08;

	/** Play or switch backsound (looping, low volume). Idempotent — won't reload if same key. */
	playBacksound(key: BacksoundKey) {
		if (this.muted) return;
		const url = BACKSOUND_URLS[key];
		if (!url) return;
		// If same key already playing, do nothing
		if (this.backsoundEl && this.currentBacksoundKey === key) return;
		if (this.backsoundEl) {
			this.backsoundEl.pause();
			this.backsoundEl = null;
		}
		const el = new Audio(url);
		el.loop = true;
		el.volume = this.backsoundVolume;
		el.play().catch(() => {
			// Autoplay blocked — will retry on next user gesture
		});
		this.backsoundEl = el;
		this.currentBacksoundKey = key;
	}

	stopBacksound() {
		if (this.backsoundEl) {
			this.backsoundEl.pause();
			this.backsoundEl = null;
		}
		this.currentBacksoundKey = null;
	}

	/** Play one-shot SFX */
	playSFX(key: SfxKey) {
		if (this.muted) return;
		const url = SFX_URLS[key];
		if (!url) return;
		const el = new Audio(url);
		el.volume = 1.0;
		el.play().catch(() => {});
	}

	mute() {
		this.muted = true;
		this.stopBacksound();
	}

	unmute() {
		this.muted = false;
	}
}

const manager = new SoundManager();

export function useGuessWhoSound() {
	return {
		playBacksound: (key: BacksoundKey) => manager.playBacksound(key),
		stopBacksound: () => manager.stopBacksound(),
		playSFX: (key: SfxKey) => manager.playSFX(key),
		mute: () => manager.mute(),
		unmute: () => manager.unmute(),
	};
}
