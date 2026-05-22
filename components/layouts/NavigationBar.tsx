"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, LogOut, CircleUserRound } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useLogout } from "@/hooks/queries/useAuth";
import { useUIStore } from "@/stores/uiStore";
import { GoogleTranslate } from "@/components/GoogleTranslate/GoogleTranslate";
import { cn } from "@/lib/utils";

const navLinks = [
	{ href: "/", label: "Kickoff" },
	{ href: "/journey", label: "Journey" },
	{ href: "/artikel", label: "Artikel" },
	{ href: "/interview", label: "Interview" },
	{ href: "/kolaborasi", label: "Kolaborasi" },
	// { href: "/quiz", label: "Quiz" },
	{ href: "/media-spotlight", label: "Media Spotlight" },
];

export function NavigationBar() {
	const pathname = usePathname();
	const { user, isAuthenticated } = useAuthStore();
	const logoutMutation = useLogout();
	const { isMobileMenuOpen, toggleMobileMenu, closeMobileMenu, theme } =
		useUIStore();
	const isDark = theme === "dark";
	const [isScrolled, setIsScrolled] = useState(false);

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
	}, [pathname, closeMobileMenu]);

	const handleLogout = async () => {
		try {
			await logoutMutation.mutateAsync();
		} finally {
			window.location.href = "/";
		}
	};

	const getProfilePicture = () => {
		if (!user?.profilePicture) return "/icons/user-circle.svg";
		return user.isOauth
			? user.profilePicture
			: `${process.env.NEXT_PUBLIC_API_URL}${user.profilePicture}`;
	};

	return (
		<>
			{/* Navbar */}
			<div
				className={cn(
					"fixed top-0 inset-x-0 shadow-sm transition-all duration-300 z-50",
					isScrolled
						? isDark
							? "backdrop-blur-sm bg-black/40"
							: "backdrop-blur-sm bg-white/80 shadow-md"
						: isDark
							? "bg-black/70 backdrop-blur-xs"
							: "bg-white/90 backdrop-blur-xs shadow-sm",
				)}
			>
				<div className="w-full flex items-center justify-between h-21 px-4 md:px-6 lg:px-8">
					{/* Logo - Left */}
					<Link href="/">
						<img
							width={150}
							height={35}
							src="/images/logo/olahbola-logo.png"
							alt="Olahbola Logo"
							loading="eager"
							fetchPriority="high"
						/>
					</Link>

					{/* Hamburger for mobile */}
					<button
						onClick={toggleMobileMenu}
						className={cn(
							"lg:hidden p-2",
							isDark ? "text-white" : "text-[#1a1a1a]",
						)}
						aria-label="Toggle menu"
					>
						{isMobileMenuOpen ? (
							<X className="size-6" />
						) : (
							<Menu className="size-6" />
						)}
					</button>

					{/* Desktop Navigation - Center */}
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
											`text-[16px] ${isDark ? "hover:text-[#1fe6da]" : "hover:text-[#076156]"}  transition-colors notranslate font-medium`,
											pathname === link.href
												? isDark
													? `text-[#1fe6da] font-semibold`
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
							<Link
								href={isAuthenticated ? "/profile" : "/login"}
								className={cn(
									"transition-colors rounded-full",
									isDark ? "text-[#1fe6da]" : "text-[#0a7c6e]",
									isDark ? "hover:text-[#1bc7bb]" : "hover:text-[#095a50]",
								)}
							>
								<CircleUserRound className="size-8" />
							</Link>

							{/* Logout Button - Only show when authenticated */}
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

					{/* Right Section - User + CTA Buttons */}
					<div className="hidden lg:flex items-center gap-4">
						{/* CTA Buttons - Desktop */}
						<div className="flex items-center gap-3">
							{/* Main Hero Button */}
							<a
								data-gtm-cta="Main City Battle!"
								href="https://www.mainhero.id"
								target="_blank"
								rel="noopener noreferrer"
								className={cn(
									"group relative overflow-hidden px-5 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-300",
									"bg-linear-to-r from-[#00c2b1] to-[#00a89a] text-black",
									"shadow-[0_0_20px_rgba(0,194,177,0.4)] hover:shadow-[0_0_35px_rgba(0,194,177,0.7)]",
									"hover:scale-105 active:scale-95",
									isDark
										? "border border-[#00c2b1]/30"
										: "border border-[#0a7c6e]/30",
								)}
							>
								<span className="relative z-10 flex items-center gap-2">
									<svg
										className="w-4 h-4"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M13 10V3L4 14h7v7l9-11h-7z"
										/>
									</svg>
									Main City Battle!
								</span>
								{/* Shine effect */}
								<div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-linear-to-r from-transparent via-white/30 to-transparent" />
							</a>

							{/* Berlangganan Button */}
							<a
								data-gtm-cta="Berlangganan!"
								href="https://heroplay.igvault.id/subscription"
								target="_blank"
								rel="noopener noreferrer"
								className={cn(
									"group relative overflow-hidden px-5 py-2.5 rounded-xl text-sm font-bold tracking-wide transition-all duration-300",
									"bg-linear-to-r from-[#ffaa00] to-[#ff9500] text-black",
									"shadow-[0_0_20px_rgba(255,170,0,0.4)] hover:shadow-[0_0_35px_rgba(255,170,0,0.7)]",
									"hover:scale-105 active:scale-95",
									isDark
										? "border border-[#ffaa00]/30"
										: "border border-[#e69500]/30",
								)}
							>
								<span className="relative z-10 flex items-center gap-2">
									<svg
										className="w-4 h-4"
										fill="none"
										stroke="currentColor"
										viewBox="0 0 24 24"
									>
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
										/>
									</svg>
									Berlangganan!
								</span>
								{/* Shine effect */}
								<div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-700 bg-linear-to-r from-transparent via-white/30 to-transparent" />
							</a>
						</div>
					</div>
				</div>
			</div>

			{/* Mobile Sidebar Overlay */}
			{isMobileMenuOpen && (
				<div
					className="fixed inset-0 bg-black/60 z-9998 lg:hidden"
					onClick={toggleMobileMenu}
				/>
			)}

			{/* Mobile Sidebar */}
			<div
				className={cn(
					"fixed top-0 left-0 w-64 md:w-80 h-full bg-[#0D645F] text-white p-4 transform z-9999 transition-transform duration-300 lg:hidden overflow-y-auto",
					isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
				)}
			>
				<div className="flex flex-col h-full">
					{/* Logo */}
					<img
						className="w-37.5 md:w-52.5 h-8.75 md:h-11.25 mt-2 mb-5"
						src="/images/logo/olahbola-logo.png"
						alt="Olahbola Logo"
					/>

					{/* Navigation Links */}
					<ul className="flex flex-col gap-4 mb-5">
						{navLinks.map((link) => (
							<li key={link.href}>
								<Link
									href={link.href}
									className={cn(
										"text-[16px] md:text-xl hover:text-[#1fe6da] transition-colors",
										pathname === link.href
											? "text-[#1fe6da] font-semibold"
											: "text-white",
									)}
								>
									{link.label}
								</Link>
							</li>
						))}

						{/* Login Link for non-authenticated users */}
						{!isAuthenticated && (
							<li>
								<Link
									href="/login"
									className={cn(
										"text-[16px] md:text-xl transition-colors notranslate",
										pathname === "/login"
											? "text-[#1fe6da] font-semibold"
											: "text-white hover:text-[#1fe6da]",
									)}
								>
									Login
								</Link>
							</li>
						)}
					</ul>

					{/* CTA Buttons - Mobile */}
					<div className="flex flex-col gap-2 mb-4">
						{/* Main City Battle Button */}
						<a
							href="https://www.mainhero.id"
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#00c2b1] text-black font-bold rounded-lg text-xs hover:bg-[#00d4c7] transition-colors"
						>
							<svg
								className="w-3 h-3"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M13 10V3L4 14h7v7l9-11h-7z"
								/>
							</svg>
							Main City Battle!
						</a>

						{/* Berlangganan Button */}
						<a
							href="https://heroplay.igvault.id/subscription"
							target="_blank"
							rel="noopener noreferrer"
							className="flex items-center justify-center gap-1.5 px-3 py-2 bg-[#ffaa00] text-black font-bold rounded-lg text-xs hover:bg-[#ffb727] transition-colors"
						>
							<svg
								className="w-3 h-3"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
								/>
							</svg>
							Berlangganan!
						</a>
					</div>

					{/* User Profile for authenticated users */}
					{isAuthenticated && user && (
						<Link
							href="/profile"
							className="flex flex-row gap-3 items-center mb-5"
						>
							<img
								className="w-8 h-8 rounded-full border-2 border-white flex md:hidden"
								src={getProfilePicture()}
								alt="User Circle"
							/>
							<span className="text-[16px] md:text-xl notranslate">
								{user.name}
							</span>
						</Link>
					)}

					{/* Google Translate
					<div className="mt-4 mb-6 relative z-10000">
						<GoogleTranslate showDropdown />
					</div> */}

					{/* Banner Image */}
					<img
						className="w-75 md:w-125 mt-auto"
						src="/images/home/banner-1.webp"
						alt="Banner 1"
					/>

					{/* Logout Button */}
					{isAuthenticated && (
						<button
							onClick={handleLogout}
							className="text-[16px] md:text-xl text-red-300 flex flex-row items-center gap-1 justify-center cursor-pointer hover:text-red-200 mt-4"
							disabled={logoutMutation.isPending}
						>
							{logoutMutation.isPending ? (
								<span className="loading loading-bars loading-xs me-2" />
							) : (
								<LogOut className="size-6 md:size-7 me-1" />
							)}
							Keluar
						</button>
					)}
				</div>
			</div>
		</>
	);
}
