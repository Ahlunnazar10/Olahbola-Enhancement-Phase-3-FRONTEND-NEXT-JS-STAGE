"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Info, AlertCircle, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import { apiClient } from "@/lib/api/client";

type VerificationStatus =
	| "verifying"
	| "success"
	| "error"
	| "already_verified";

function VerifyEmailContent() {
	const router = useRouter();
	const searchParams = useSearchParams();

	const [status, setStatus] = useState<VerificationStatus>("verifying");
	const [message, setMessage] = useState("");
	const [countdown, setCountdown] = useState(15);
	const [isLoading, setIsLoading] = useState(false);

	const directStatus = searchParams.get("status");
	const directMessage = searchParams.get("message");

	useEffect(() => {
		if (directStatus === "success") {
			setStatus("success");
			setMessage(directMessage || "Email berhasil diverifikasi!");
			startCountdown();
			return;
		}

		if (directStatus === "error") {
			setStatus("error");
			setMessage(directMessage || "Verifikasi email gagal");
			return;
		}

		const token = searchParams.get("token");
		if (token) {
			verifyEmail(token);
		} else {
			setStatus("error");
			setMessage("Token verifikasi tidak ditemukan");
		}
	}, [directStatus, directMessage, searchParams]);

	useEffect(() => {
		if (countdown <= 0) {
			router.push("/login");
			return;
		}

		const timer = setInterval(() => {
			setCountdown((prev) => prev - 1);
		}, 1000);

		return () => clearInterval(timer);
	}, [countdown, router]);

	const startCountdown = () => {
		setCountdown(15);
	};

	const stopCountdown = () => {
		setCountdown(-1);
	};

	const verifyEmail = async (token: string) => {
		if (!token) {
			setStatus("error");
			setMessage("Token tidak valid");
			return;
		}

		setIsLoading(true);
		setStatus("verifying");

		try {
			const response = await apiClient.get(
				"/api/v1/auth/api-verify-email/" + token,
			);

			if (response.data.status === "success") {
				if (response.data.data?.already_verified) {
					setStatus("already_verified");
					setMessage("Email sudah terverifikasi sebelumnya");
					toast.success("Email Anda sudah terverifikasi. Silakan login.");
				} else {
					setStatus("success");
					setMessage("Email berhasil diverifikasi!");
					toast.success("Email berhasil diverifikasi! Silakan login.");
				}
				startCountdown();
			}
		} catch (error: unknown) {
			console.error("Verification error:", error);

			const err = error as {
				response?: { status?: number; data?: { message?: string } };
			};

			if (err.response?.status === 400) {
				setMessage(
					err.response.data?.message ||
						"Token tidak valid atau sudah kadaluarsa",
				);
			} else if (err.response?.status === 500) {
				setMessage("Terjadi kesalahan server. Silakan coba lagi.");
			} else {
				setMessage(err.response?.data?.message || "Verifikasi email gagal");
			}

			setStatus("error");
			toast.error(message);
		} finally {
			setIsLoading(false);
		}
	};

	const handleResendVerification = async () => {
		setIsLoading(true);
		try {
			toast.success("Fitur kirim ulang verifikasi akan segera tersedia");
		} catch {
			toast.error("Gagal mengirim ulang email verifikasi");
		} finally {
			setIsLoading(false);
		}
	};

	const formattedCountdown = countdown.toString().padStart(2, "0");

	return (
		<div className="w-120 h-fit flex flex-col bg-black/50 backdrop-blur-[5px] p-10 rounded-2xl text-center">
			<img
				src="/images/logo/olahbola-logo.png"
				alt="OlahBola Logo"
				className="w-52 mx-auto mb-6"
			/>

			<h1 className="text-2xl font-bold mb-6 text-white">Verifikasi Email</h1>

			{status === "verifying" && (
				<div className="flex flex-col items-center py-8">
					<Loader2 className="size-10 animate-spin text-[#0D645F] mb-4" />
					<p className="text-gray-200">Memverifikasi email Anda...</p>
				</div>
			)}

			{status === "success" && (
				<div>
					<div className="text-green-400 mb-4">
						<CheckCircle className="size-20 mx-auto" />
					</div>
					<p className="text-lg font-semibold text-green-400 mb-2">
						Verifikasi Berhasil!
					</p>
					<p className="text-gray-200 mb-6">{message}</p>

					{countdown > 0 && (
						<div className="mb-6">
							<p className="text-sm text-gray-200 mb-2">
								Mengarahkan ke halaman login dalam:
							</p>
							<div className="flex justify-center items-center gap-1">
								<div className="bg-gray-500 text-white rounded-lg px-1.5 py-0.5 text-xl font-bold">
									{formattedCountdown}
								</div>
								<span className="text-gray-200">detik</span>
							</div>
						</div>
					)}

					<div className="mt-6 space-y-3">
						<Link
							href="/login"
							className="btn bg-[#0D645F] border border-[#C3BDBD] hover:bg-[#0a514d] w-full text-white block"
						>
							Login Sekarang
						</Link>
						<button
							onClick={stopCountdown}
							className="btn btn-ghost w-full text-sm text-gray-400"
						>
							Batalkan Auto Redirect
						</button>
					</div>
				</div>
			)}

			{status === "already_verified" && (
				<div>
					<div className="text-blue-400 mb-4">
						<Info className="size-20 mx-auto" />
					</div>
					<p className="text-lg font-semibold text-blue-400 mb-2">
						Email Sudah Terverifikasi
					</p>
					<p className="text-gray-200 mb-6">{message}</p>

					{countdown > 0 && (
						<div className="mb-6">
							<p className="text-sm text-gray-200 mb-2">
								Mengarahkan ke halaman login dalam:
							</p>
							<div className="flex justify-center items-center gap-2">
								<div className="bg-gray-500 text-white rounded-lg px-1.5 py-0.5 text-xl font-bold">
									{formattedCountdown}
								</div>
								<span className="text-gray-200">detik</span>
							</div>
						</div>
					)}

					<div className="mt-6 space-y-3">
						<Link
							href="/login"
							className="btn bg-[#0D645F] border border-[#C3BDBD] hover:bg-[#0a514d] w-full text-white block"
						>
							Login Sekarang
						</Link>
						<button
							onClick={stopCountdown}
							className="btn btn-ghost w-full text-sm text-gray-400"
						>
							Batalkan Auto Redirect
						</button>
					</div>
				</div>
			)}

			{status === "error" && (
				<div>
					<div className="text-red-400 mb-4">
						<AlertCircle className="size-20 mx-auto" />
					</div>
					<p className="text-lg font-semibold text-red-400 mb-2">
						Verifikasi Gagal
					</p>
					<p className="text-gray-200 mb-6">{message}</p>

					<div className="space-y-3">
						<Link
							href="/login"
							className="btn bg-[#0D645F] border border-[#C3BDBD] hover:bg-[#0a514d] w-full text-white block"
						>
							Kembali ke Login
						</Link>
						<Link href="/register" className="btn btn-outline w-full block">
							Daftar Ulang
						</Link>
						<button
							onClick={handleResendVerification}
							disabled={isLoading}
							className="btn btn-ghost w-full text-sm"
						>
							{isLoading ? "Mengirim..." : "Kirim Ulang Email Verifikasi"}
						</button>
					</div>
				</div>
			)}
		</div>
	);
}

export default function VerifyEmailPage() {
	return (
		<div className="min-h-screen">
			<div className="bg-black w-full h-20" />

			<section
				className="h-screen w-full bg-cover bg-center relative"
				style={{ backgroundImage: "url('/images/auth/auth-bg.webp')" }}
			>
				<div className="absolute inset-0 bg-[#0D645F80] backdrop-blur-[5px]" />

				<div className="relative z-10 flex justify-center py-10">
					<Suspense
						fallback={
							<div className="w-120 h-fit flex flex-col bg-black/50 backdrop-blur-[5px] p-10 rounded-2xl text-center">
								<Loader2 className="size-10 animate-spin text-[#0D645F] mx-auto mb-4" />
								<p className="text-gray-200">Memuat...</p>
							</div>
						}
					>
						<VerifyEmailContent />
					</Suspense>
				</div>
			</section>
		</div>
	);
}
