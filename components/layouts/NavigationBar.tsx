"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Menu, X, LogOut, Search } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useLogout } from "@/hooks/queries/useAuth";
import { useUIStore } from "@/stores/uiStore";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { LogoutOverlay } from "@/components/layouts/LogoutOverlay";
import { SearchPanel } from "@/components/search/SearchPanel";

const navLinks = [
	{ href: "/", label: "Kickoff" },
	{ href: "/artikel", label: "Artikel" },
	{ href: "/games", label: "Games" },
	// { href: "/olahflix", label: "OlahFlix" },
	{ href: "/media-spotlight", label: "Media Spotlight" },
];

export function NavigationBar() {
	const pathname = usePathname();
	const router = useRouter();
	const { user, isAuthenticated } = useAuthStore();
	const logoutMutation = useLogout();
	const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu, theme } =
		useUIStore();
	const isDark = theme === "dark";
	const [isScrolled, setIsScrolled] = useState(false);
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const mobileMenuRef = useRef<HTMLDivElement>(null);

	const handleScroll = useCallback(() => {
		setIsScrolled(window.scrollY > 0);
	}, []);

	useEffect(() => {
		window.addEventListener("scroll", handleScroll);
		return () => window.removeEventListener("scroll", handleScroll);
	}, [handleScroll]);

	// Close mobile menu on route change
	useEffect(() => {
		closeMobileMenu();
		setIsSearchOpen(false);
	}, [pathname, closeMobileMenu]);

	// Close mobile menu + search on outside click
	useEffect(() => {
		if (!isMobileMenuOpen && !isSearchOpen) return;
		const handler = (e: MouseEvent | TouchEvent) => {
			if (
				mobileMenuRef.current &&
				!mobileMenuRef.current.contains(e.target as Node)
			) {
				closeMobileMenu();
				setIsSearchOpen(false);
			}
		};
		document.addEventListener("mousedown", handler, true);
		document.addEventListener("touchstart", handler, true);
		return () => {
			document.removeEventListener("mousedown", handler, true);
			document.removeEventListener("touchstart", handler, true);
		};
	}, [isMobileMenuOpen, isSearchOpen, closeMobileMenu]);

	const handleLogout = async () => {
		try {
			await logoutMutation.mutateAsync();
		} finally {
			router.push(pathname);
		}
	};

	const isLoggingOut = logoutMutation.isPending;

	const getProfilePicture = () => {
		if (!user?.profilePicture) return "/icons/user-circle.svg";
		return user.isOauth
			? user.profilePicture
			: `${process.env.NEXT_PUBLIC_API_URL}${user.profilePicture}`;
	};

	return (
		<>
			{isLoggingOut && <LogoutOverlay />}

			{/* Backdrop overlay saat menu mobile open */}
			{(isMobileMenuOpen || isSearchOpen) && (
				<div
					className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
					onClick={() => {
						closeMobileMenu();
						setIsSearchOpen(false);
					}}
				/>
			)}

			{/* ─── MOBILE NAVBAR ���── */}
			<div
				ref={mobileMenuRef}
				className={cn(
					"lg:hidden fixed inset-x-0 z-50 bg-black/95 backdrop-blur-sm",
					pathname === "/artikel" ? "top-12" : "top-0",
				)}
			>
				{/* Top bar: logo + search + hamburger */}
				<div className="w-full flex items-center justify-between h-16 px-4">
					<Link href="/">
						<Image
							src="/images/logo/olahbola-logo.png"
							alt="Olahbola Logo"
							width={130}
							height={32}
							loading="eager"
							fetchPriority="high"
							sizes="130px"
						/>
					</Link>

					<div className="flex items-center gap-1">
						<button
							onClick={() => setIsSearchOpen((v) => !v)}
							className={cn(
								"p-2 rounded-lg transition-colors cursor-pointer",
								isSearchOpen
									? "bg-primary/20 text-primary"
									: "text-white/60 hover:text-white hover:bg-white/10",
							)}
							aria-label="Cari"
						>
							{isSearchOpen ? (
								<X className="size-5" />
							) : (
								<Search className="size-5" />
							)}
						</button>

						<button
							onClick={toggleMobileMenu}
							className={cn(
								"p-2 rounded-lg transition-colors cursor-pointer",
								isMobileMenuOpen ? "bg-white/10" : "hover:bg-white/10",
							)}
							aria-label="Toggle menu"
						>
							{isMobileMenuOpen ? (
								<X className="size-5 text-white" />
							) : (
								<Menu className="size-5 text-white" />
							)}
						</button>
					</div>
				</div>

				{/* Search Panel */}
				{isSearchOpen && <SearchPanel onClose={() => setIsSearchOpen(false)} />}

				{/* Dropdown menu from top */}
				<div
					className={cn(
						"overflow-hidden transition-all duration-300 ease-in-out bg-black/95 backdrop-blur-sm",
						isMobileMenuOpen
							? "max-h-[calc(100dvh-4rem)] opacity-100"
							: "max-h-0 opacity-0",
					)}
				>
					<div
						className="px-3 py-2 overflow-y-auto"
						style={{ maxHeight: "calc(100dvh - 4rem)" }}
					>
						{/* Nav links */}
						<ul className="flex flex-col gap-0.5">
							{navLinks.map((link) => (
								<li key={link.href}>
									<Link
										href={link.href}
										className={cn(
											"block px-4 py-3 rounded-xl text-[15px] font-medium transition-colors",
											pathname === link.href
												? "bg-primary/15 text-primary"
												: "text-white/60 hover:text-white hover:bg-white/5",
										)}
									>
										{link.label}
									</Link>
								</li>
							))}

							{!isAuthenticated && (
								<li>
									<Link
										href="/login"
										className={cn(
											"block px-4 py-3 rounded-xl text-[15px] font-medium transition-colors",
											pathname === "/login"
												? "bg-primary/15 text-primary"
												: "text-white/60 hover:text-white hover:bg-white/5",
										)}
									>
										Login
									</Link>
								</li>
							)}
						</ul>

						{/* Divider */}
						<div className="my-2 h-px bg-white/10" />

						{/* CTA buttons */}
						<div className="flex flex-col gap-1.5">
							<Link
								href="https://www.mainhero.id"
								target="_blank"
								rel="noopener noreferrer"
								className="flex items-center justify-center px-4 py-3 bg-[#ffaa00] text-black font-bold rounded-xl text-[13px] hover:bg-[#ffb727] transition-colors"
							>
								Main City Battle
							</Link>
							<Link
								href="/games"
								className="flex items-center justify-center px-4 py-3 bg-primary text-black font-bold rounded-xl text-[13px] hover:bg-[#1ac9bf] transition-colors"
							>
								Prediksi Skor
							</Link>
						</div>

						{/* Authed user section */}
						{isAuthenticated && user && (
							<>
								<div className="my-2 h-px bg-white/10" />
								<Link
									href="/profile"
									className="flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-white/5 transition-colors"
								>
									<img
										className="w-9 h-9 rounded-full border-2 border-primary/40"
										src={getProfilePicture()}
										alt="User"
										width={36}
										height={36}
									/>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-semibold text-white truncate">
											{user.name}
										</p>
										<p className="text-xs text-white/30">Lihat Profil</p>
									</div>
								</Link>
								<button
									onClick={handleLogout}
									className="flex items-center gap-2 w-full px-4 py-3 rounded-xl text-[13px] text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors cursor-pointer"
									disabled={logoutMutation.isPending}
								>
									{logoutMutation.isPending ? (
										<span className="loading loading-bars loading-xs" />
									) : (
										<LogOut className="size-4" />
									)}
									Keluar
								</button>
							</>
						)}
					</div>
				</div>
			</div>

			{/* ─── DESKTOP NAVBAR ─── */}
			<div className="hidden lg:block">
				<div
					className={cn(
						"fixed inset-x-0 shadow-sm transition-all duration-300 z-50",
						pathname === "/artikel" ? "top-12" : "top-0",
						isScrolled
							? isDark
								? "backdrop-blur-sm bg-black/40"
								: "backdrop-blur-sm bg-white/80 shadow-md"
							: isDark
								? "bg-black/70 backdrop-blur-xs"
								: "bg-white/90 backdrop-blur-xs shadow-sm",
					)}
				>
					<div className="w-full flex items-center justify-between h-18.75 px-4 md:px-6 lg:px-14">
						{/* Logo */}
						<Link href="/">
							<Image
								src={
									isDark
										? "/images/logo/olahbola-logo.png"
										: "/images/logo/olahbola-logo-dark.png"
								}
								alt="Olahbola Logo"
								width={150}
								height={35}
								loading="eager"
								fetchPriority="high"
								sizes="150px"
							/>
						</Link>

						{/* Desktop Navigation */}
						<nav className="hidden lg:flex flex-1 items-center justify-center">
							<ul
								className={cn(
									"flex gap-6 items-center",
									isDark ? "text-white" : "text-[#1a1a1a]",
								)}
							>
								{navLinks.map((link) => (
									<li key={link.href}>
										<Link
											href={link.href}
											className={cn(
												`text-[16px] ${isDark ? "hover:text-green" : "hover:text-[#076156]"}  transition-colors notranslate font-medium`,
												pathname === link.href
													? isDark
														? `text-green font-semibold`
														: "text-[#0a7c6e] font-semibold"
													: isDark
														? "text-white"
														: "text-[#1a1a1a] hover:text-[#1a1a1a]/70",
											)}
										>
											{link.label}
										</Link>
									</li>
								))}

								{/* User Icon - Desktop */}
								{isAuthenticated && (
									<Link
										href="/profile"
										className={cn(
											"transition-transform rounded-full overflow-hidden ring-2",
											isDark
												? "ring-green/40 hover:ring-green/70"
												: "ring-[#0a7c6e]/40 hover:ring-[#0a7c6e]/70",
										)}
									>
										<img
											src={getProfilePicture()}
											alt="User profile"
											width={32}
											height={32}
											className="w-8 h-8 object-cover rounded-full"
										/>
									</Link>
								)}

								{/* Logout - Desktop */}
								{isAuthenticated && (
									<button
										onClick={handleLogout}
										className="text-[16px] text-red-400 flex flex-row items-center justify-center cursor-pointer hover:text-red-300"
										disabled={logoutMutation.isPending}
									>
										{logoutMutation.isPending ? (
											<span className="loading loading-bars loading-xs me-2" />
										) : (
											<LogOut className="size-4 me-1" />
										)}
										Keluar
									</button>
								)}
							</ul>
						</nav>

						{/* Right Section */}
						<div className="hidden lg:flex ">
							<div className="flex flex-row gap-8 items-center">
								<button
									onClick={() => setIsSearchOpen((v) => !v)}
									className={cn(
										"p-1 rounded-lg transition-colors cursor-pointer",
										isSearchOpen
											? "bg-primary/15"
											: isDark
												? "hover:bg-white/10"
												: "hover:bg-black/5",
									)}
									aria-label="Cari"
								>
									{isSearchOpen ? (
										<X className="size-6 text-primary" />
									) : (
										<Search className="size-6 text-primary" />
									)}
								</button>

								{/* CTA Buttons - Desktop */}
								<div className="flex items-center gap-2">
									<Link
										href="http://mainhero.id"
										rel="noopener noreferrer"
										target="_blank"
										className={cn(
											"group relative overflow-hidden px-4 py-2.5 rounded-lg text-xs font-bold tracking-wide transition-all duration-300",
											"bg-linear-to-r from-[#ffaa00] to-[#ff9500] text-black",
											"shadow-[0_0_20px_rgba(255,170,0,0.4)] hover:shadow-[0_0_35px_rgba(255,170,0,0.7)]",
											"hover:scale-105 active:scale-95",
											isDark
												? "border border-[#ffaa00]/30"
												: "border border-[#e69500]/30",
										)}
									>
										<span className="relative z-10 flex items-center gap-2">
											Main City Battle
										</span>
										<div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-linear-to-r from-transparent via-white/30 to-transparent" />
									</Link>

									<Link
										href="/games"
										rel="noopener noreferrer"
										className={cn(
											"group relative overflow-hidden px-4 py-2.5 rounded-lg text-xs font-bold tracking-wide transition-all duration-300",
											"bg-linear-to-r from-primary to-[#9FE8E2] text-black",
											"shadow-[0_0_20px_rgba(159,232,226,0.4)] hover:shadow-[0_0_35px_rgba(159,232,226,0.7)]",
											"hover:scale-105 active:scale-95",
											isDark
												? "border border-primary/30"
												: "border border-[#e69500]/30",
										)}
									>
										<span className="relative z-10 flex items-center gap-2">
											Prediksi Skor
										</span>
										<div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-linear-to-r from-transparent via-white/30 to-transparent" />
									</Link>

									{!isAuthenticated && (
										<Link
											href="/login"
											rel="noopener noreferrer"
											className={cn(
												"group relative overflow-hidden px-4 py-2.5 rounded-lg text-xs font-bold tracking-wide transition-all duration-300",
												"bg-transparent text-primary border-2 border-primary",
												"shadow-[0_0_20px_rgba(159,232,226,0.4)] hover:shadow-[0_0_35px_rgba(159,232,226,0.7)]",
												"hover:scale-105 active:scale-95",
											)}
										>
											<span className="relative z-10 flex items-center gap-2">
												Masuk
											</span>
											<div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-linear-to-r from-transparent via-white/30 to-transparent" />
										</Link>
									)}
								</div>
							</div>
						</div>
						{isSearchOpen && (
							<SearchPanel onClose={() => setIsSearchOpen(false)} />
						)}
					</div>
				</div>
			</div>
		</>
	);
}
