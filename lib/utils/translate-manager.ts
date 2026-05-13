// src/utils/translate-manager.ts

declare global {
	interface Window {
		google?: {
			translate?: {
				TranslateElement: {
					new (
						options: {
							pageLanguage: string;
							includedLanguages: string;
							layout?: number;
							autoDisplay?: boolean;
						},
						elementId: string,
					): void;
					InlineLayout: {
						SIMPLE: number;
					};
					Instance?: {
						refresh?: () => void;
					};
					refresh?: () => void;
				};
			};
		};
	}
}

type TranslationCallback = (langCode: string) => void;

export class TranslateManager {
	static instance: TranslateManager | null = null;

	currentLanguage = "id";
	isTranslating = false;
	private translationCallbacks: TranslationCallback[] = [];

	private constructor() {}

	static getInstance(): TranslateManager {
		if (!TranslateManager.instance) {
			TranslateManager.instance = new TranslateManager();
		}
		return TranslateManager.instance;
	}

	// Set language preference without triggering translation
	setLanguagePreference(langCode: string): void {
		this.currentLanguage = langCode;
		localStorage.setItem("preferredLanguage", langCode);

		// Set cookie for Google Translate
		const cookieValue = `/id/${langCode}`;
		document.cookie = `googtrans=${cookieValue}; path=/; max-age=${60 * 60 * 24 * 365}`;
	}

	// Get current language preference
	getLanguagePreference(): string {
		const saved = localStorage.getItem("preferredLanguage");
		return saved || "id";
	}

	// Manually trigger translation
	triggerTranslation(langCode: string): Promise<void> {
		if (this.isTranslating || langCode === this.currentLanguage) {
			return Promise.resolve();
		}

		this.isTranslating = true;
		this.currentLanguage = langCode;

		// Update cookie
		const cookieValue = `/id/${langCode}`;
		document.cookie = `googtrans=${cookieValue}; path=/; max-age=${60 * 60 * 24 * 365}`;

		// Update hash
		window.location.hash = `#googtrans(${cookieValue})`;

		// Notify callbacks
		this.notifyCallbacks(langCode);

		return new Promise((resolve) => {
			setTimeout(() => {
				this.isTranslating = false;

				// Try to refresh Google Translate widget
				if (window.google?.translate?.TranslateElement?.refresh) {
					try {
						window.google.translate.TranslateElement.refresh();
					} catch (e) {
						console.warn("Failed to refresh Google Translate:", e);
					}
				}

				resolve();
			}, 1000);
		});
	}

	// Register callback for language change
	onLanguageChange(callback: TranslationCallback): void {
		this.translationCallbacks.push(callback);
	}

	// Unregister callback
	offLanguageChange(callback: TranslationCallback): void {
		const index = this.translationCallbacks.indexOf(callback);
		if (index > -1) {
			this.translationCallbacks.splice(index, 1);
		}
	}

	// Notify all callbacks
	private notifyCallbacks(langCode: string): void {
		this.translationCallbacks.forEach((callback) => {
			try {
				callback(langCode);
			} catch (e) {
				console.error("Translation callback error:", e);
			}
		});
	}

	// Reset to default language
	reset(): void {
		this.currentLanguage = "id";
		localStorage.removeItem("preferredLanguage");
		document.cookie = "googtrans=; path=/; max-age=0";
		document.cookie = "googtrans=/id/id; path=/; max-age=31536000";
		window.location.hash = "";

		if (window.google?.translate?.TranslateElement?.refresh) {
			window.google.translate.TranslateElement.refresh();
		}
	}
}

// Export singleton instance
export const translateManager = TranslateManager.getInstance();