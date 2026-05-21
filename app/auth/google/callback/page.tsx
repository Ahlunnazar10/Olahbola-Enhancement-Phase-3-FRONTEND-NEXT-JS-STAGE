"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2, Check, X } from "lucide-react";
import toast from "react-hot-toast";
import { useAuthStore } from "@/stores/authStore";

function GoogleCallbackContent() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { login } = useAuthStore();
	const [status, setStatus] = useState<"loading" | "success" | "error">(
		"loading",
	);
	const [errorMessage, setErrorMessage] = useState("");

	useEffect(() => {
		const handleCallback = async () => {
			try {
				const code = searchParams.get("code");
				const error = searchParams.get("error");

				if (error) {
					setStatus("error");
					setErrorMessage(
						error === "access_denied"
							? "Anda menolak akses Google. Silakan coba lagi."
							: `Error: ${error}`,
					);
					toast.error("Login dengan Google dibatalkan");
					setTimeout(() => router.push("/login"), 3000);
					return;
				}

				if (!code) {
					setStatus("error");
					setErrorMessage("Tidak ada kode otorisasi dari Google");
					toast.error("Kode otorisasi tidak ditemukan");
					setTimeout(() => router.push("/login"), 3000);
					return;
				}

				console.log("[Google Callback] Received code, processing...");

				// Call Next.js API route which handles CSRF
				const response = await fetch("/api/auth/google/callback", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					body: JSON.stringify({ code }),
				});

				const data = await response.json();
				console.log("[Google Callback] Response:", data);

				if (!response.ok) {
					throw new Error(data.message || "Login gagal");
				}

				if (data.status === "success") {
					const token = data.access_token || data.token;

					// Store token and user data
					login(data.user, token);
					if (token && typeof window !== "undefined") {
						localStorage.setItem("auth_token", token);
					}

					setStatus("success");
					toast.success("Login dengan Google berhasil!");
					setTimeout(() => router.push("/"), 1500);
				} else {
					throw new Error(data.message || "Login gagal");
				}
			} catch (error) {
				setStatus("error");
				const err = error as { message?: string };
				const message =
					err.message || "Terjadi kesalahan saat login dengan Google";
				setErrorMessage(message);
				toast.error(message);
				setTimeout(() => router.push("/login"), 3000);
			}
		};

		handleCallback();
	}, [searchParams, router, login]);

	return (
		<div className="min-h-screen flex items-center justify-center bg-[#050505]">
			<div className="glass-card p-8 rounded-2xl text-center max-w-md">
				{status === "loading" && (
					<>
						<Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
						<h2 className="text-xl font-semibold text-white mb-2">
							Memproses Login Google...
						</h2>
						<p className="text-[#bbcac6]">
							Mohon tunggu, kami sedang menghubungkan akun Google Anda.
						</p>
					</>
				)}

				{status === "success" && (
					<>
						<div className="w-12 h-12 rounded-full bg-green-500 mx-auto mb-4 flex items-center justify-center">
							<Check className="text-white size-6" />
						</div>
						<h2 className="text-xl font-semibold text-white mb-2">
							Login Berhasil!
						</h2>
						<p className="text-[#bbcac6]">
							Mengalihkan ke halaman utama...
						</p>
					</>
				)}

				{status === "error" && (
					<>
						<div className="w-12 h-12 rounded-full bg-red-500 mx-auto mb-4 flex items-center justify-center">
							<X className="text-white size-6" />
						</div>
						<h2 className="text-xl font-semibold text-white mb-2">
							Login Gagal
						</h2>
						<p className="text-[#bbcac6] mb-4">{errorMessage}</p>
						<p className="text-sm text-[#bbcac6]">
							Mengalihkan ke halaman login...
						</p>
					</>
				)}
			</div>
		</div>
	);
}

// Wrap with Suspense for useSearchParams
export default function GoogleCallbackPage() {
	return (
		<Suspense
			fallback={
				<div className="min-h-screen flex items-center justify-center bg-[#050505]">
					<Loader2 className="w-12 h-12 animate-spin text-primary" />
				</div>
			}
		>
			<GoogleCallbackContent />
		</Suspense>
	);
}