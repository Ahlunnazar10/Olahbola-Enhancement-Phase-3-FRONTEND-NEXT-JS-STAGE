import Link from "next/link";
import React from "react";

const footerLinks = {
	main: [
		{ href: "/", label: "Kickoff" },
		{ href: "/journey", label: "Journey" },
		{ href: "/artikel", label: "Artikel" },
		{ href: "/interview", label: "Interview" },
		{ href: "/kolaborasi", label: "Kolaborasi" },
		// { href: "/games", label: "Games" },
		{ href: "/sapa", label: "Sapa" },
	],
	legal: [
		{ href: "/kebijakan-privasi", label: "Kebijakan Privasi" },
		{
			href: "/syarat-dan-ketentuan-penggunaan",
			label: "Syarat dan Ketentuan Penggunaan",
		},
		{
			href: "/syarat-dan-ketentuan-periklanan-partnership",
			label: "Syarat dan Ketentuan Periklanan & Partnership",
		},
		{ href: "/kebijakan-hak-cipta", label: "Kebijakan Hak Cipta" },
		{ href: "/media-spotlight", label: "Media Spotlight" },
	],
	social: [
		{
			href: "https://www.tiktok.com/@olahbolacom?_t=ZS-8x6sr3eOBDZ&_r=1",
			label: "@olahbolacom",
			icon: "tiktok",
		},
		{
			href: "https://www.instagram.com/olahbolacom?igsh=bnNueDdiejdleDA0",
			label: "olahbolacom",
			icon: "instagram",
		},
		{
			href: "https://x.com/Olahbolacom?t=aGIIQAZ_m84I2lUCDKuT7A&s=09",
			label: "Olahbolacom",
			icon: "twitter",
		},
		{
			href: "https://www.youtube.com/@olahbolacom",
			label: "@olahbolacom",
			icon: "youtube",
		},
		{
			href: "https://www.facebook.com/olahbolacom",
			label: "OlahBola",
			icon: "facebook",
		},
		{
			href: "https://sck.io/u/@olahbola.com/dsnKtxg6",
			label: "OlahBola",
			icon: "snackvideo",
		},
	],
	contact: [
		{
			href: "https://maps.app.goo.gl/AkKY1A3vhQbE6Loy5",
			label: "Gedung STC LT.4 Ruang 80 Jakarta",
			icon: "location",
		},
		{
			href: "https://wa.link/2lxpzd",
			label: "+6287777487925",
			icon: "whatsapp",
		},
		{
			href: "mailto:admin@olahbola.com?subject=Halo%20Olahbola!",
			label: "admin@olahbola.com",
			icon: "email",
		},
	],
};

const SocialIcon = ({ type }: { type: string }) => {
	const iconMap: Record<string, React.ReactNode> = {
		tiktok: (
			<svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
				<path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
			</svg>
		),
		instagram: (
			<svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
				<path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
			</svg>
		),
		twitter: (
			<svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
				<path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
			</svg>
		),
		youtube: (
			<svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
				<path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
			</svg>
		),
		facebook: (
			<svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
				<path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
			</svg>
		),
		snackvideo: (
			<svg
				className="size-5"
				viewBox="0 0 48 48"
				fill="none"
				stroke="currentColor"
				strokeWidth="3"
				strokeLinecap="round"
				strokeLinejoin="round"
			>
				<path d="M3.125 29.166A21.6 21.6 0 0 1 2.5 24C2.5 12.126 12.126 2.5 24 2.5S45.5 12.126 45.5 24S35.874 45.5 24 45.5c-7.116 0-13.425-3.457-17.338-8.784" />
				<path d="M6.506 11.5c-2.814 4.21.634 6.678.97 8.696S.16 30.963 2.5 35.28s9.575-1.85 11.594.505s2.55 5.608 5.691 5.58s5.285-.809 7.57 1.29s4.036 1.806 6.06.68" />
				<path d="M36.407 24.384a2.12 2.12 0 0 0 .002-3.133a32.7 32.7 0 0 0-5.743-4.202a33.3 33.3 0 0 0-6.52-2.873a2.12 2.12 0 0 0-2.704 1.566a32.7 32.7 0 0 0-.767 7.076a33.3 33.3 0 0 0 .772 7.085a2.115 2.115 0 0 0 2.697 1.56a32.7 32.7 0 0 0 6.522-2.877a33.3 33.3 0 0 0 5.74-4.202Z" />
				<path d="M33.698 26.397c.523-.477.524-1.3 0-1.778a18.5 18.5 0 0 0-3.258-2.384a19 19 0 0 0-3.699-1.63a1.2 1.2 0 0 0-1.534.888a18.5 18.5 0 0 0-.436 4.015c.002 1.546.194 2.909.438 4.02a1.2 1.2 0 0 0 1.53.886a18.5 18.5 0 0 0 3.701-1.633a19 19 0 0 0 3.258-2.384" />
			</svg>
		),
		location: (
			<svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
				<path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
			</svg>
		),
		whatsapp: (
			<svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
				<path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
			</svg>
		),
		email: (
			<svg className="size-5" viewBox="0 0 24 24" fill="currentColor">
				<path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
			</svg>
		),
	};

	return iconMap[type] || null;
};

export function Footer() {
	const currentYear = new Date().getFullYear();

	return (
		<section className="bg-[#032e2c] h-full w-full z-50">
			<div className="container-custom flex flex-col lg:flex-row px-6 md:px-14 lg:px-28 py-20 justify-between items-start lg:items-center text-[16px] md:text-[22px] lg:text-[16px]">
				{/* Logo and tagline */}
				<div className="flex flex-col mb-10">
					<img
						loading="lazy"
						className="w-47.5 md:w-65 lg:w-47.5"
						src="/images/logo/olahbola-logo.png"
						alt="Olahbola Logo"
					/>
					<p className="notranslate">
						From fans, by fans, for sport lovers everywhere
					</p>
				</div>

				<div className="flex flex-col lg:flex-row gap-6 md:gap-10 lg:gap-20">
					{/* Main Navigation */}
					<div className="flex flex-col gap-3">
						{footerLinks.main.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								className="notranslate hover:text-[#1fe6da] transition-colors"
							>
								{link.label}
							</Link>
						))}
					</div>

					{/* Legal Links */}
					<div className="flex flex-col gap-3">
						{footerLinks.legal.map((link) => (
							<Link
								key={link.href}
								href={link.href}
								className="hover:text-[#1fe6da] transition-colors"
							>
								{link.label}
							</Link>
						))}
					</div>

					{/* Social Links */}
					<div className="flex flex-col gap-3">
						{footerLinks.social.map((link) => (
							<a
								key={link.href}
								href={link.href}
								target="_blank"
								rel="noopener noreferrer"
								className="flex flex-row gap-2 items-center hover:text-[#1fe6da] transition-colors"
							>
								<SocialIcon type={link.icon} />
								<span>{link.label}</span>
							</a>
						))}
					</div>

					{/* Contact Info */}
					<div className="flex flex-col gap-3">
						{footerLinks.contact.map((link) => (
							<a
								key={link.href}
								href={link.href}
								target="_blank"
								rel="noopener noreferrer"
								className="flex flex-row gap-2 items-center hover:text-[#1fe6da] transition-colors"
							>
								<SocialIcon type={link.icon} />
								<span>{link.label}</span>
							</a>
						))}
					</div>
				</div>
			</div>

			<div className="w-full h-[0.1px] bg-[#0a514d]"></div>
			<p className="text-white text-center py-4 notranslate">
				Copyright {currentYear} olahbola.com. All Rights Reserved.
			</p>
		</section>
	);
}
