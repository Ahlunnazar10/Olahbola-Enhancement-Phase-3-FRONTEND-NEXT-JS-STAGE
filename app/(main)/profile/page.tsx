"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useAuthStore } from "@/stores/authStore";
import { useUIStore } from "@/stores/uiStore";
import ThemeToggle from "@/components/theme-toggle/ThemeToggle";
import {
	useProfile,
	useQuizSummary,
	useUpdateProfileName,
	useUpdateProfileEmail,
	useUpdateProfilePhone,
	useUpdateProfileCity,
	useUpdatePassword,
} from "@/hooks/queries/useProfile";
import { useLogout } from "@/hooks/queries/useAuth";
import { getProfilePictureUrl } from "@/lib/utils";
import toast from "react-hot-toast";
import {
	Badge, BadgeCheck,
	XCircle,
	Edit2,
	Loader2,
	LogOut,
	CheckCircle,
	TrendingUp,
	LayoutDashboard,
	KeyRound,
	MapPin,
} from "lucide-react";

type TabType = "overview" | "edit-profile" | "change-password";

// Avatar color palettes (name -> tailwind color)
const AVATAR_COLORS = [
	{ bg: "bg-purple-500", text: "text-purple-900" },
	{ bg: "bg-blue-500", text: "text-blue-900" },
	{ bg: "bg-cyan-500", text: "text-cyan-900" },
	{ bg: "bg-teal-500", text: "text-teal-900" },
	{ bg: "bg-green-500", text: "text-green-900" },
	{ bg: "bg-yellow-500", text: "text-yellow-900" },
	{ bg: "bg-orange-500", text: "text-orange-900" },
	{ bg: "bg-pink-500", text: "text-pink-900" },
	{ bg: "bg-rose-500", text: "text-rose-900" },
	{ bg: "bg-indigo-500", text: "text-indigo-900" },
];

function getInitials(name: string | undefined): string {
	if (!name) return "?";
	const parts = name.trim().split(/\s+/);
	if (parts.length === 1) {
		return parts[0].substring(0, 2).toUpperCase();
	}
	return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function getAvatarColor(name: string | undefined): {
	bg: string;
	text: string;
} {
	if (!name) return AVATAR_COLORS[0];
	// Use name length as seed for consistent color per user
	const index = name.length % AVATAR_COLORS.length;
	return AVATAR_COLORS[index];
}

export default function ProfilePage() {
	const { user, isAuthenticated } = useAuthStore();
	const { theme } = useUIStore();
	const isDark = theme === "dark";
	const { data: profile, isLoading: profileLoading } = useProfile();
	const { data: quizSummary, isLoading: quizLoading } = useQuizSummary();
	const [activeTab, setActiveTab] = useState<TabType>("overview");
	const logoutMutation = useLogout();

	const displayUser = profile || user;

	if (!isAuthenticated && !displayUser) {
		return (
			<div
				className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${isDark ? "bg-[#0f1412]" : "bg-[#f5f5f5]"}`}
			>
				<div
					className={`text-center ${isDark ? "text-white" : "text-[#1a1a1a]"}`}
				>
					<h1 className="text-2xl font-bold mb-4">Login Required</h1>
					<p className={`mb-6 ${isDark ? "text-white/60" : "text-[#5a5a5a]"}`}>
						Please login to view your profile.
					</p>
					<Link
						href="/login"
						className={`inline-block px-6 py-3 rounded-xl font-headline-md ${isDark ? "bg-primary text-black" : "bg-[#0a7c6e] text-white"}`}
					>
						Login
					</Link>
				</div>
			</div>
		);
	}

	if (profileLoading && !displayUser) {
		return (
			<div
				className={`min-h-screen flex items-center justify-center transition-colors duration-300 ${isDark ? "bg-[#0f1412]" : "bg-[#f5f5f5]"}`}
			>
				<Loader2
					className={`size-10 animate-spin ${isDark ? "text-primary" : "text-[#0a7c6e]"}`}
				/>
			</div>
		);
	}

	const handleLogout = async () => {
		try {
			await logoutMutation.mutateAsync();
			toast.success("Logout berhasil!");
			window.location.href = "/";
		} catch {
			toast.error("Logout gagal");
		}
	};

	return (
		<div className={`min-h-screen ${isDark ? "bg-[#0f1412]" : "bg-[#f5f5f5]"}`}>
			{/* Theme Toggle */}
			<ThemeToggle />

			<div className="relative h-100 w-full overflow-hidden">
				<div
					className={`absolute inset-0 ${isDark ? "bg-linear-to-t from-[#0f1412] via-[#0f1412]/40 to-transparent" : "bg-linear-to-t from-[#f5f5f5] via-[#f5f5f5]/40 to-transparent"} z-10`}
				/>
				<div
					className="absolute inset-0 bg-cover bg-center"
					style={{ backgroundImage: `url('/images/profile/profile-bg.webp')` }}
				/>
			</div>

			<div className="max-w-7xl mx-auto px-4 md:px-8 -mt-96 md:-mt-48 relative z-10 pb-24">
				<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
					<div className="lg:col-span-4 space-y-6">
						{/* Profile Card */}
						<div
							className={`rounded-3xl p-8 text-center flex flex-col items-center ${isDark ? "bg-[#1c211e]/80 backdrop-blur-md" : "bg-white/90 backdrop-blur-md shadow-xl border border-[#0a7c6e]/20"}`}
						>
							<div className="relative mb-6">
								<div
									className={`w-32 h-32 rounded-full border-4 overflow-hidden p-1 ${isDark ? "border-[#00c2b1]/50 shadow-[0_0_40px_rgba(64,220,202,0.5)]" : "border-[#0a7c6e]/50 shadow-[0_0_40px_rgba(10,124,110,0.3)]"}`}
								>
									{displayUser?.profilePicture ? (
										<Image
											src={getProfilePictureUrl(displayUser?.profilePicture)}
											alt={displayUser?.name || "User"}
											width={120}
											height={120}
											className="w-full h-full object-cover rounded-full"
										/>
									) : (
										<div
											className={`w-full h-full rounded-full flex items-center justify-center text-5xl ${isDark ? "bg-[#325d5b]/30 text-[#00c2b1]" : "bg-[#0a7c6e]/20 text-[#0a7c6e]"}`}
										>
											{getInitials(displayUser?.name)}
										</div>
									)}
								</div>
								{displayUser?.isEmailVerified && (
									<div
										className={`absolute bottom-1 right-1 w-8 h-8 rounded-full flex items-center justify-center border-4 shadow-lg ${isDark ? "bg-[#00c2b1] text-black border-[#0f1412]" : "bg-[#0a7c6e] text-white border-white"}`}
									>
										<BadgeCheck className="size-4" fill="currentColor" />
									</div>
								)}
							</div>
							<h1
								className={`font-headline-md mb-1 ${isDark ? "text-white" : "text-[#1a1a1a]"}`}
							>
								{displayUser?.name || "User"}
							</h1>
							<p
								className={`font-body-md mb-4 ${isDark ? "text-white/60" : "text-[#5a5a5a]"}`}
							>
								{displayUser?.email || displayUser?.phone}
							</p>
						</div>

						{/* Navigation Menu */}
						<nav
							className={`rounded-3xl overflow-hidden ${isDark ? "bg-[#1c211e]/80 backdrop-blur-md" : "bg-white/90 backdrop-blur-md shadow-xl border border-[#0a7c6e]/20"}`}
						>
							<button
								onClick={() => setActiveTab("overview")}
								className={`flex items-center gap-4 px-6 py-5 w-full text-left transition-all ${
									activeTab === "overview"
										? `${isDark ? "bg-[#00c2b1]/20 border-l-4 border-[#00c2b1] text-[#00c2b1]" : "bg-[#0a7c6e]/10 border-l-4 border-[#0a7c6e] text-[#0a7c6e]"}`
										: `${isDark ? "text-white/60 hover:bg-white/5" : "text-[#5a5a5a] hover:bg-gray-100"}`
								}`}
							>
								<LayoutDashboard className="size-6" />
								<span className="font-label-bold">Overview</span>
							</button>
							<button
								onClick={() => setActiveTab("edit-profile")}
								className={`flex items-center gap-4 px-6 py-5 w-full text-left transition-all ${
									activeTab === "edit-profile"
										? `${isDark ? "bg-[#00c2b1]/20 border-l-4 border-[#00c2b1] text-[#00c2b1]" : "bg-[#0a7c6e]/10 border-l-4 border-[#0a7c6e] text-[#0a7c6e]"}`
										: `${isDark ? "text-white/60 hover:bg-white/5" : "text-[#5a5a5a] hover:bg-gray-100"}`
								}`}
							>
								<Edit2 className="size-6" />
								<span className="font-label-bold">Edit Profile</span>
							</button>
							<button
								onClick={() => setActiveTab("change-password")}
								className={`flex items-center gap-4 px-6 py-5 w-full text-left transition-all ${
									activeTab === "change-password"
										? `${isDark ? "bg-[#00c2b1]/20 border-l-4 border-[#00c2b1] text-[#00c2b1]" : "bg-[#0a7c6e]/10 border-l-4 border-[#0a7c6e] text-[#0a7c6e]"}`
										: `${isDark ? "text-white/60 hover:bg-white/5" : "text-[#5a5a5a] hover:bg-gray-100"}`
								}`}
							>
								<KeyRound className="size-6" />
								<span className="font-label-bold">Change Password</span>
							</button>
							<button
								onClick={handleLogout}
								disabled={logoutMutation.isPending}
								className={`flex items-center gap-4 px-6 py-5 w-full text-left transition-all mt-4 border-t ${isDark ? "text-red-400 hover:bg-red-400/5 border-white/5" : "text-red-500 hover:bg-red-50 border-gray-200"}`}
							>
								{logoutMutation.isPending ? (
									<Loader2 className="size-6 animate-spin" />
								) : (
									<LogOut className="size-6" />
								)}
								<span className="font-label-bold">Sign Out</span>
							</button>
						</nav>
					</div>

					<div className="lg:col-span-8 space-y-6">
						{activeTab === "overview" && (
							<OverviewTab
								user={displayUser}
								quizSummary={quizSummary}
								isLoading={quizLoading}
								isDark={isDark}
							/>
						)}
						{activeTab === "edit-profile" && (
							<EditProfileTab user={displayUser} isDark={isDark} />
						)}
						{activeTab === "change-password" && (
							<ChangePasswordTab isDark={isDark} />
						)}
					</div>
				</div>
			</div>
		</div>
	);
}

function OverviewTab({
	user,
	quizSummary,
	isLoading,
	isDark,
}: {
	user: any;
	quizSummary: any;
	isLoading: boolean;
	isDark: boolean;
}) {
	const infoItems = [
		{ label: "Full Name", value: user?.name || "-" },
		{ label: "Email Address", value: user?.email || "-" },
		{ label: "Phone Number", value: user?.phone ? `+${user.phone}` : "-" },
		{ label: "Country / Region", value: user?.city || "Indonesia" },
	];

	return (
		<>
			<div
				className={`rounded-4xl p-8 ${isDark ? "bg-[#1c211e]/80 backdrop-blur-md" : "bg-white/90 backdrop-blur-md shadow-xl border border-[#0a7c6e]/20"}`}
			>
				<div className="flex items-center gap-4 mb-8">
					<div
						className={`w-12 h-12 rounded-lg flex items-center justify-center ${isDark ? "bg-[#00c2b1]/20 text-[#00c2b1]" : "bg-[#0a7c6e]/20 text-[#0a7c6e]"}`}
					>
						<Badge className="size-6" />
					</div>
					<h2
						className={`font-headline-md uppercase italic ${isDark ? "text-white" : "text-[#1a1a1a]"}`}
					>
						Informasi Personal
					</h2>
				</div>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					<div className="space-y-6">
						{infoItems.slice(0, 2).map((item) => (
							<div key={item.label} className="space-y-1">
								<label
									className={`text-label-bold uppercase ${isDark ? "text-white/60" : "text-[#5a5a5a]"}`}
								>
									{item.label}
								</label>
								<div
									className={`p-3 rounded-xl border font-body-lg ${isDark ? "bg-black/40 border-white/5 text-white" : "bg-gray-50 border-gray-200 text-[#1a1a1a]"}`}
								>
									{item.value}
								</div>
							</div>
						))}
					</div>
					<div className="space-y-6">
						{infoItems.slice(2).map((item) => (
							<div key={item.label} className="space-y-1">
								<label
									className={`text-label-bold uppercase ${isDark ? "text-white/60" : "text-[#5a5a5a]"}`}
								>
									{item.label}
								</label>
								<div
									className={`p-3 rounded-xl border font-body-lg flex justify-between items-center ${isDark ? "bg-black/40 border-white/5 text-white" : "bg-gray-50 border-gray-200 text-[#1a1a1a]"}`}
								>
									{item.value}
									{item.label === "Country / Region" && (
										<MapPin
											className={`size-6 ${isDark ? "text-primary" : "text-[#0a7c6e]"}`}
										/>
									)}
								</div>
							</div>
						))}
					</div>
				</div>
			</div>

			<div
				className={`rounded-4xl p-8 mt-6 ${isDark ? "bg-[#1c211e]/80 backdrop-blur-md" : "bg-white/90 backdrop-blur-md shadow-xl border border-[#0a7c6e]/20"}`}
			>
				<h2
					className={`font-headline-md uppercase italic mb-6 ${isDark ? "text-white" : "text-[#1a1a1a]"}`}
				>
					Status Verifikasi
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
					<div
						className={`flex items-center gap-4 p-4 rounded-xl border ${isDark ? "bg-black/40 border-white/5" : "bg-gray-50 border-gray-200"}`}
					>
						{user?.isEmailVerified ? (
							<CheckCircle
								className={`size-6 ${isDark ? "text-primary" : "text-[#0a7c6e]"}`}
							/>
						) : (
							<XCircle className="size-6 text-red-400" />
						)}
						<div>
							<p
								className={`font-label-bold ${isDark ? "text-white" : "text-[#1a1a1a]"}`}
							>
								Email
							</p>
							<p
								className={`text-sm ${isDark ? "text-white/60" : "text-[#5a5a5a]"}`}
							>
								{user?.isEmailVerified
									? "Terverifikasi"
									: "Belum Terverifikasi"}
							</p>
						</div>
					</div>
					<div
						className={`flex items-center gap-4 p-4 rounded-xl border ${isDark ? "bg-black/40 border-white/5" : "bg-gray-50 border-gray-200"}`}
					>
						{user?.isPhoneVerified ? (
							<CheckCircle
								className={`size-6 ${isDark ? "text-primary" : "text-[#0a7c6e]"}`}
							/>
						) : (
							<XCircle className="size-6 text-red-400" />
						)}
						<div>
							<p
								className={`font-label-bold ${isDark ? "text-white" : "text-[#1a1a1a]"}`}
							>
								Telepon
							</p>
							<p
								className={`text-sm ${isDark ? "text-white/60" : "text-[#5a5a5a]"}`}
							>
								{user?.isPhoneVerified
									? "Terverifikasi"
									: "Belum Terverifikasi"}
							</p>
						</div>
					</div>
				</div>
			</div>
		</>
	);
}

function EditProfileTab({ user, isDark }: { user: any; isDark: boolean }) {
	return (
		<div className="space-y-6">
			<EditNameForm user={user} isDark={isDark} />
			<EditEmailForm user={user} isDark={isDark} />
			<EditPhoneForm user={user} isDark={isDark} />
			<EditCityForm user={user} isDark={isDark} />
		</div>
	);
}

function EditNameForm({ user, isDark }: { user: any; isDark: boolean }) {
	const [name, setName] = useState(user?.name || "");
	const [isEditing, setIsEditing] = useState(false);
	const updateNameMutation = useUpdateProfileName();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await updateNameMutation.mutateAsync({ name });
			setIsEditing(false);
			toast.success("Nama berhasil diperbarui!");
		} catch {
			toast.error("Gagal memperbarui nama");
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className={`rounded-3xl p-6 ${isDark ? "bg-[#1c211e]/80 backdrop-blur-md" : "bg-white/90 backdrop-blur-md shadow-xl border border-[#0a7c6e]/20"}`}
		>
			<div className="flex items-center justify-between mb-4">
				<h3
					className={`font-headline-md ${isDark ? "text-white" : "text-[#1a1a1a]"}`}
				>
					Nama
				</h3>
				<button
					type="button"
					onClick={() => setIsEditing(!isEditing)}
					className={`text-sm flex items-center gap-1 ${isDark ? "text-primary hover:text-[#00c2b1]" : "text-[#0a7c6e] hover:text-[#095a50]"}`}
				>
					<Edit2 className="size-4" />
					{isEditing ? "Batal" : "Edit"}
				</button>
			</div>
			{isEditing ? (
				<div className="flex gap-3">
					<input
						type="text"
						value={name}
						onChange={(e) => setName(e.target.value)}
						className={`flex-1 p-4 rounded-xl border font-body-lg ${isDark ? "bg-black/40 border-white/5 text-white" : "bg-gray-50 border-gray-200 text-[#1a1a1a]"}`}
					/>
					<button
						type="submit"
						disabled={updateNameMutation.isPending}
						className={`px-6 py-4 rounded-xl text-base font-bold uppercase disabled:opacity-50 ${isDark ? "bg-[#00c2b1] text-black shadow-[0_0_25px_rgba(64,220,202,0.4)]" : "bg-[#0a7c6e] text-white hover:bg-[#095a50]"}`}
					>
						{updateNameMutation.isPending ? (
							<Loader2 className="size-5 animate-spin" />
						) : (
							"Simpan"
						)}
					</button>
				</div>
			) : (
				<p className={isDark ? "text-white/60" : "text-[#5a5a5a]"}>
					{user?.name || "-"}
				</p>
			)}
		</form>
	);
}

function EditEmailForm({ user, isDark }: { user: any; isDark: boolean }) {
	const [email, setEmail] = useState(user?.email || "");
	const [isEditing, setIsEditing] = useState(false);
	const updateEmailMutation = useUpdateProfileEmail();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await updateEmailMutation.mutateAsync({ email });
			setIsEditing(false);
			toast.success("Email berhasil diperbarui!");
		} catch {
			toast.error("Gagal memperbarui email");
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className={`rounded-3xl p-6 ${isDark ? "bg-[#1c211e]/80 backdrop-blur-md" : "bg-white/90 backdrop-blur-md shadow-xl border border-[#0a7c6e]/20"}`}
		>
			<div className="flex items-center justify-between mb-4">
				<div>
					<h3
						className={`font-headline-md ${isDark ? "text-white" : "text-[#1a1a1a]"}`}
					>
						Email
					</h3>
					{user?.isEmailVerified && (
						<span
							className={`text-xs flex items-center gap-1 mt-1 ${isDark ? "text-primary" : "text-[#0a7c6e]"}`}
						>
							<CheckCircle className="size-3" /> Terverifikasi
						</span>
					)}
				</div>
				<button
					type="button"
					onClick={() => setIsEditing(!isEditing)}
					className={`text-sm flex items-center gap-1 ${isDark ? "text-primary hover:text-[#00c2b1]" : "text-[#0a7c6e] hover:text-[#095a50]"}`}
				>
					<Edit2 className="size-4" />
					{isEditing ? "Batal" : "Edit"}
				</button>
			</div>
			{isEditing ? (
				<div className="flex gap-3">
					<input
						type="email"
						value={email}
						onChange={(e) => setEmail(e.target.value)}
						className={`flex-1 p-4 rounded-xl border font-body-lg ${isDark ? "bg-black/40 border-white/5 text-white" : "bg-gray-50 border-gray-200 text-[#1a1a1a]"}`}
					/>
					<button
						type="submit"
						disabled={updateEmailMutation.isPending}
						className={`px-6 py-4 rounded-xl text-base font-bold uppercase disabled:opacity-50 ${isDark ? "bg-[#00c2b1] text-black shadow-[0_0_25px_rgba(64,220,202,0.4)]" : "bg-[#0a7c6e] text-white hover:bg-[#095a50]"}`}
					>
						{updateEmailMutation.isPending ? (
							<Loader2 className="size-5 animate-spin" />
						) : (
							"Simpan"
						)}
					</button>
				</div>
			) : (
				<p className={isDark ? "text-white/60" : "text-[#5a5a5a]"}>
					{user?.email || "-"}
				</p>
			)}
		</form>
	);
}

function EditPhoneForm({ user, isDark }: { user: any; isDark: boolean }) {
	const [phone, setPhone] = useState(user?.phone || "");
	const [isEditing, setIsEditing] = useState(false);
	const updatePhoneMutation = useUpdateProfilePhone();

	const formatPhone = (value: string): string => {
		if (!value) return "";
		let cleaned = value.replace(/\D/g, "");
		if (cleaned.startsWith("62")) {
			cleaned = "0" + cleaned.substring(2);
		}
		return cleaned;
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			const formattedPhone = phone.startsWith("0")
				? "62" + phone.substring(1)
				: phone;
			await updatePhoneMutation.mutateAsync({ phone: formattedPhone });
			setIsEditing(false);
			toast.success("Nomor telepon berhasil diperbarui!");
		} catch {
			toast.error("Gagal memperbarui nomor telepon");
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className={`rounded-3xl p-6 ${isDark ? "bg-[#1c211e]/80 backdrop-blur-md" : "bg-white/90 backdrop-blur-md shadow-xl border border-[#0a7c6e]/20"}`}
		>
			<div className="flex items-center justify-between mb-4">
				<div>
					<h3
						className={`font-headline-md ${isDark ? "text-white" : "text-[#1a1a1a]"}`}
					>
						Nomor Telepon
					</h3>
					{user?.isPhoneVerified && (
						<span
							className={`text-xs flex items-center gap-1 mt-1 ${isDark ? "text-primary" : "text-[#0a7c6e]"}`}
						>
							<CheckCircle className="size-3" /> Terverifikasi
						</span>
					)}
				</div>
				<button
					type="button"
					onClick={() => setIsEditing(!isEditing)}
					className={`text-sm flex items-center gap-1 ${isDark ? "text-primary hover:text-[#00c2b1]" : "text-[#0a7c6e] hover:text-[#095a50]"}`}
				>
					<Edit2 className="size-4" />
					{isEditing ? "Batal" : "Edit"}
				</button>
			</div>
			{isEditing ? (
				<div className="flex gap-3">
					<input
						type="tel"
						value={formatPhone(phone)}
						onChange={(e) => setPhone(e.target.value)}
						placeholder="08xxxxxxxxxx"
						className={`flex-1 p-4 rounded-xl border font-body-lg ${isDark ? "bg-black/40 border-white/5 text-white" : "bg-gray-50 border-gray-200 text-[#1a1a1a]"}`}
					/>
					<button
						type="submit"
						disabled={updatePhoneMutation.isPending}
						className={`px-6 py-4 rounded-xl text-base font-bold uppercase disabled:opacity-50 ${isDark ? "bg-[#00c2b1] text-black shadow-[0_0_25px_rgba(64,220,202,0.4)]" : "bg-[#0a7c6e] text-white hover:bg-[#095a50]"}`}
					>
						{updatePhoneMutation.isPending ? (
							<Loader2 className="size-5 animate-spin" />
						) : (
							"Simpan"
						)}
					</button>
				</div>
			) : (
				<p className={isDark ? "text-white/60" : "text-[#5a5a5a]"}>
					{user?.phone ? formatPhone(user.phone) : "-"}
				</p>
			)}
		</form>
	);
}

function EditCityForm({ user, isDark }: { user: any; isDark: boolean }) {
	const [city, setCity] = useState(user?.city || "");
	const [isEditing, setIsEditing] = useState(false);
	const updateCityMutation = useUpdateProfileCity();

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		try {
			await updateCityMutation.mutateAsync({ city });
			setIsEditing(false);
			toast.success("Kota berhasil diperbarui!");
		} catch {
			toast.error("Gagal memperbarui kota");
		}
	};

	return (
		<form
			onSubmit={handleSubmit}
			className={`rounded-3xl p-6 ${isDark ? "bg-[#1c211e]/80 backdrop-blur-md" : "bg-white/90 backdrop-blur-md shadow-xl border border-[#0a7c6e]/20"}`}
		>
			<div className="flex items-center justify-between mb-4">
				<h3
					className={`font-headline-md ${isDark ? "text-white" : "text-[#1a1a1a]"}`}
				>
					Kota
				</h3>
				<button
					type="button"
					onClick={() => setIsEditing(!isEditing)}
					className={`text-sm flex items-center gap-1 ${isDark ? "text-primary hover:text-[#00c2b1]" : "text-[#0a7c6e] hover:text-[#095a50]"}`}
				>
					<Edit2 className="size-4" />
					{isEditing ? "Batal" : "Edit"}
				</button>
			</div>
			{isEditing ? (
				<div className="flex gap-3">
					<input
						type="text"
						value={city}
						onChange={(e) => setCity(e.target.value)}
						className={`flex-1 p-4 rounded-xl border font-body-lg ${isDark ? "bg-black/40 border-white/5 text-white" : "bg-gray-50 border-gray-200 text-[#1a1a1a]"}`}
					/>
					<button
						type="submit"
						disabled={updateCityMutation.isPending}
						className={`px-6 py-4 rounded-xl text-base font-bold uppercase disabled:opacity-50 ${isDark ? "bg-[#00c2b1] text-black shadow-[0_0_25px_rgba(64,220,202,0.4)]" : "bg-[#0a7c6e] text-white hover:bg-[#095a50]"}`}
					>
						{updateCityMutation.isPending ? (
							<Loader2 className="size-5 animate-spin" />
						) : (
							"Simpan"
						)}
					</button>
				</div>
			) : (
				<p className={isDark ? "text-white/60" : "text-[#5a5a5a]"}>
					{user?.city || "-"}
				</p>
			)}
		</form>
	);
}

function ChangePasswordTab({ isDark }: { isDark: boolean }) {
	const [currentPassword, setCurrentPassword] = useState("");
	const [newPassword, setNewPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showCurrent, setShowCurrent] = useState(false);
	const [showNew, setShowNew] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);
	const updatePasswordMutation = useUpdatePassword();

	const isValid =
		newPassword.length >= 6 &&
		newPassword === confirmPassword &&
		currentPassword.length > 0;

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (newPassword !== confirmPassword) {
			toast.error("Password tidak cocok");
			return;
		}
		try {
			await updatePasswordMutation.mutateAsync({
				current_password: currentPassword,
				password: newPassword,
				password_confirmation: confirmPassword,
			});
			setCurrentPassword("");
			setNewPassword("");
			setConfirmPassword("");
			toast.success("Password berhasil diubah!");
		} catch {
			toast.error("Gagal mengubah password");
		}
	};

	return (
		<div className={`rounded-4xl p-8 ${isDark ? "bg-[#1c211e]/80 backdrop-blur-md shadow-2xl border border-white/10" : "bg-white/90 backdrop-blur-md shadow-xl border border-[#0a7c6e]/20"}`}>
			<h2
				className={`font-headline-md uppercase italic neon-glow-text mb-8 ${isDark ? "text-white" : "text-[#1a1a1a]"}`}
			>
				Ubah Password
			</h2>
			<form onSubmit={handleSubmit} className="max-w-lg space-y-6">
				<div className="space-y-2">
					<label className={`text-label-bold uppercase ${isDark ? "text-white/60" : "text-[#5a5a5a]"}`}>
						Password Saat Ini
					</label>
					<div className="relative">
						<input
							type={showCurrent ? "text" : "password"}
							value={currentPassword}
							onChange={(e) => setCurrentPassword(e.target.value)}
							className={`w-full p-4 rounded-xl border pr-12 ${isDark ? "bg-black/40 border-white/5 text-white" : "bg-gray-50 border-gray-200 text-[#1a1a1a]"}`}
							required
						/>
						<button
							type="button"
							onClick={() => setShowCurrent(!showCurrent)}
							className={`absolute right-4 top-1/2 -translate-y-1/2 ${isDark ? "text-white/60 hover:text-white" : "text-[#5a5a5a] hover:text-[#1a1a1a]"}`}
						>
							{showCurrent ? (
								<XCircle className="size-5" />
							) : (
								<CheckCircle className="size-5" />
							)}
						</button>
					</div>
				</div>

				<div className="space-y-2">
					<label className={`text-label-bold uppercase ${isDark ? "text-white/60" : "text-[#5a5a5a]"}`}>
						Password Baru
					</label>
					<div className="relative">
						<input
							type={showNew ? "text" : "password"}
							value={newPassword}
							onChange={(e) => setNewPassword(e.target.value)}
							className={`w-full p-4 rounded-xl border pr-12 ${isDark ? "bg-black/40 border-white/5 text-white" : "bg-gray-50 border-gray-200 text-[#1a1a1a]"}`}
							minLength={6}
							required
						/>
						<button
							type="button"
							onClick={() => setShowNew(!showNew)}
							className={`absolute right-4 top-1/2 -translate-y-1/2 ${isDark ? "text-white/60 hover:text-white" : "text-[#5a5a5a] hover:text-[#1a1a1a]"}`}
						>
							{showNew ? (
								<XCircle className="size-5" />
							) : (
								<CheckCircle className="size-5" />
							)}
						</button>
					</div>
					{newPassword && (
						<p
							className={`text-xs ${newPassword.length >= 6 ? (isDark ? "text-[#00c2b1]" : "text-[#0a7c6e]") : "text-yellow-500"}`}
						>
							Minimal 6 karakter ({newPassword.length}/6)
						</p>
					)}
				</div>

				<div className="space-y-2">
					<label className={`text-label-bold uppercase ${isDark ? "text-white/60" : "text-[#5a5a5a]"}`}>
						Konfirmasi Password
					</label>
					<div className="relative">
						<input
							type={showConfirm ? "text" : "password"}
							value={confirmPassword}
							onChange={(e) => setConfirmPassword(e.target.value)}
							className={`w-full p-4 rounded-xl border pr-12 ${isDark ? "bg-black/40 border-white/5 text-white" : "bg-gray-50 border-gray-200 text-[#1a1a1a]"}`}
							required
						/>
						<button
							type="button"
							onClick={() => setShowConfirm(!showConfirm)}
							className={`absolute right-4 top-1/2 -translate-y-1/2 ${isDark ? "text-white/60 hover:text-white" : "text-[#5a5a5a] hover:text-[#1a1a1a]"}`}
						>
							{showConfirm ? (
								<XCircle className="size-5" />
							) : (
								<CheckCircle className="size-5" />
							)}
						</button>
					</div>
					{confirmPassword && (
						<p
							className={`text-xs ${newPassword === confirmPassword ? (isDark ? "text-[#00c2b1]" : "text-[#0a7c6e]") : "text-red-500"}`}
						>
							{newPassword === confirmPassword
								? "Password cocok"
								: "Password tidak cocok"}
						</p>
					)}
				</div>

				<button
					type="submit"
					disabled={!isValid || updatePasswordMutation.isPending}
					className={`w-full py-4 rounded-xl text-base font-bold uppercase tracking-widest transition-all duration-300 disabled:opacity-50 hover:scale-[1.02] ${isDark ? "bg-[#00c2b1] text-black shadow-[0_0_25px_rgba(64,220,202,0.4)]" : "bg-[#0a7c6e] text-white hover:bg-[#095a50] shadow-lg"}`}
				>
					{updatePasswordMutation.isPending ? (
						<span className="flex items-center justify-center gap-2">
							<Loader2 className="size-5 animate-spin" />
							Memproses...
						</span>
					) : (
						"Ubah Password"
					)}
				</button>
			</form>
		</div>
	);
}
