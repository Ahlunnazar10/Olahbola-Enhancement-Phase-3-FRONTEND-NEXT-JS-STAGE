"use client";

import { useState, useEffect, useCallback } from "react";
import { cleanupGoogleTranslate } from "@/lib/utils/translate-cleanup";
import { translateManager } from "@/lib/utils/translate-manager";

interface Language {
	code: string;
	name: string;
}

const languagesList: Language[] = [
	{ code: "id", name: "Indonesia" },
	{ code: "en", name: "English" },
];

interface GoogleTranslateProps {
	showDropdown?: boolean;
	className?: string;
}

export function GoogleTranslate({ showDropdown = true, className = "" }: GoogleTranslateProps) {
	const [selectedLanguage, setSelectedLanguage] = useState("id");
	const [isInitialized, setIsInitialized] = useState(false);
	const [shouldTriggerTranslation, setShouldTriggerTranslation] = useState(false);
	const [isOpen, setIsOpen] = useState(false);

	// Load Google Translate script
	const loadGoogleTranslateScript = useCallback(function(): Promise<void> {
		return new Promise(function(resolve, reject) {
			// Check if script is already loaded
			if (document.querySelector('script[src*="translate.google.com"]')) {
				resolve();
				return;
			}

			const script = document.createElement("script");
			script.type = "text/javascript";
			script.src =
				"https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
			script.async = true;

			(window as Window & { googleTranslateElementInit?: () => void }).googleTranslateElementInit =
				function() {
					setTimeout(function() {
						resolve();
					}, 500);
				};

			script.onerror = function(error) {
				console.warn("Google Translate script unavailable, falling back to default language");
				resolve(); // Resolve instead of reject so the app continues to work
			};

			document.head.appendChild(script);
		});
	}, []);

	// Initialize Google Translate widget
	const initializeGoogleTranslate = useCallback(function() {
		const win = window as Window & {
			google?: {
				translate?: {
					TranslateElement?: {
						new (
							options: { pageLanguage: string; includedLanguages: string; layout?: number; autoDisplay?: boolean },
							elementId: string,
						): void;
						InlineLayout?: { SIMPLE: number };
						Instance?: { refresh?: () => void };
						refresh?: () => void;
					};
				};
			};
		};

		if (!win.google?.translate?.TranslateElement) {
			console.warn("Google Translate not available yet");
			return;
		}

		try {
			const existingWidget = document.getElementById("google_translate_element");
			if (existingWidget && existingWidget.children.length > 0) {
				return;
			}

			new win.google.translate.TranslateElement(
				{
					pageLanguage: "id",
					includedLanguages: "id,en",
					layout: win.google.translate.TranslateElement.InlineLayout?.SIMPLE || 0,
					autoDisplay: false,
				},
				"google_translate_element",
			);
		} catch (error) {
			console.warn("Error initializing Google Translate widget:", error);
		}
	}, []);

	// Switch language without auto-trigger
	const switchLanguage = useCallback(async function(langCode: string) {
		if (langCode === selectedLanguage && !shouldTriggerTranslation) {
			return;
		}

		try {
			// Set cookie for Google Translate
			const cookieValue = "/id/" + langCode;
			document.cookie = "googtrans=" + cookieValue + "; path=/; max-age=" + (60 * 60 * 24 * 365);

			// Update hash
			window.location.hash = "#googtrans(" + cookieValue + ")";

			// Refresh widget if initialized
			const win = window as Window & {
				google?: {
					translate?: {
						TranslateElement?: {
							Instance?: { refresh?: () => void };
							refresh?: () => void;
						};
					};
				};
			};
			if (win.google?.translate?.TranslateElement) {
				// Try clicking the iframe menu option
				const iframe = document.querySelector<HTMLIFrameElement>("iframe.goog-te-menu-frame");
				if (iframe?.contentDocument) {
					const links = iframe.contentDocument.querySelectorAll<HTMLAnchorElement>("a");
					links.forEach(function(link) {
						const langName = languagesList.find(function(l) { return l.code === langCode; })?.name;
						if (link.textContent?.includes(langName || "")) {
							link.click();
						}
					});
				}

				// Try to refresh widget
				setTimeout(function() {
					const te = win.google?.translate?.TranslateElement;
					if (te?.Instance?.refresh) {
						te.Instance.refresh();
					} else if (te?.refresh) {
						te.refresh();
					}
				}, 100);
			}

			// Update HTML lang attribute
			document.documentElement.lang = langCode;

			// Reset trigger flag
			setShouldTriggerTranslation(false);
		} catch (error) {
			console.warn("Error switching language:", error);
		}
	}, [selectedLanguage, shouldTriggerTranslation]);

	// Handle language selection from dropdown
	const handleSelect = function(langCode: string) {
		setShouldTriggerTranslation(true);
		setSelectedLanguage(langCode);
		translateManager.triggerTranslation(langCode);
	};

	// Initialize on mount
	useEffect(function() {
		const savedLang = localStorage.getItem("preferredLanguage");
		if (savedLang) {
			setSelectedLanguage(savedLang);
		}

		const initTranslate = async function() {
			try {
				await loadGoogleTranslateScript();
				await new Promise(function(resolve) { setTimeout(resolve, 1000); });
				initializeGoogleTranslate();
				setIsInitialized(true);

				if (savedLang && savedLang !== "id") {
					setShouldTriggerTranslation(true);
					await switchLanguage(savedLang);
				}
			} catch (error) {
				console.warn("Google Translate unavailable:", error);
			}
		};

		initTranslate();

		// Cleanup on unmount
		return function() {
			// Don't cleanup on every unmount - only on page refresh handled by TranslateManager
		};
	}, [loadGoogleTranslateScript, initializeGoogleTranslate, switchLanguage]);

	// Toggle dropdown
	const toggleDropdown = function() {
		setIsOpen(!isOpen);
	};

	const getButtonLabel = function() {
		const lang = languagesList.find(function(l) { return l.code === selectedLanguage; });
		return lang ? lang.name : "Pilih Bahasa";
	};

	return (
		<div className={"relative " + className}>
			{/* Hidden Google Translate element */}
			<div id="google_translate_element" className="hidden" />

			{/* Custom dropdown for select language */}
			{showDropdown && (
				<div className="relative">
					<button
						type="button"
						onClick={toggleDropdown}
						className="flex items-center gap-2 px-3 py-2 text-sm text-white border border-white/30 rounded-lg hover:bg-white/10 transition-colors"
						aria-expanded={isOpen}
						aria-haspopup="listbox"
					>
						<svg
							className="w-4 h-4"
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129"
							/>
						</svg>
						<span>{getButtonLabel()}</span>
						<svg
							className={"w-4 h-4 transition-transform " + (isOpen ? "rotate-180" : "")}
							fill="none"
							stroke="currentColor"
							viewBox="0 0 24 24"
						>
							<path
								strokeLinecap="round"
								strokeLinejoin="round"
								strokeWidth={2}
								d="M19 9l-7 7-7-7"
							/>
						</svg>
					</button>

					{isOpen && (
						<>
							{/* Backdrop */}
							<div
								className="fixed inset-0 z-40"
								onClick={function() { setIsOpen(false); }}
							/>

							{/* Dropdown */}
							<div className="absolute right-0 mt-2 w-40 bg-[#0D645F] rounded-lg shadow-lg overflow-hidden z-50">
								<ul className="py-1">
									{languagesList.map(function(lang) {
										return (
											<li key={lang.code}>
												<button
													type="button"
													onClick={function() {
														handleSelect(lang.code);
														setIsOpen(false);
													}}
													className={"w-full px-4 py-2 text-left text-white hover:bg-[#065f5c] transition-colors " +
														(selectedLanguage === lang.code ? "bg-[#08726C] font-semibold" : "")}
												>
													{lang.name}
												</button>
											</li>
										);
									})}
								</ul>
							</div>
						</>
					)}
				</div>
			)}
		</div>
	);
}

export default GoogleTranslate;