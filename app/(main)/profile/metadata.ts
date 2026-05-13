import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Profile",
  description: "Kelola profil dan pengaturan akun kamu di Olahbola. Update data diri, ubah password, dan nikmati pengalaman personalized di Olahbola.",
  keywords: ["profil Olahbola", "akun Olahbola", "pengaturan akun", "profile user", "olahbola"],
  alternates: {
    canonical: "/profile",
  },
  openGraph: {
    title: "Olahbola | Profile",
    description: "Kelola profil dan pengaturan akun kamu di Olahbola. Update data diri, ubah password, dan nikmati pengalaman personalized di Olahbola.",
    url: "https://olahbola.com/profile",
    type: "website",
    locale: "id_ID",
    siteName: "Olahbolacom",
    images: [{ url: "/og-image.png", width: 1200, height: 630, alt: "Profile Olahbola" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Olahbola | Profile",
    description: "Kelola profil dan pengaturan akun kamu di Olahbola. Update data diri, ubah password, dan nikmati pengalaman personalized di Olahbola.",
    images: ["/og-image.png"],
  },
};