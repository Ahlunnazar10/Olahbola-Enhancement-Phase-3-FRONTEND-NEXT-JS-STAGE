// ============================================
// Ngolah Bola — TypeScript Interfaces
// Semua tipe berasal dari dokumentasi API Part 1–9
// ============================================

// ─── Auth ───────────────────────────────────

export interface LoginCredentials {
	email: string;
	password: string;
}

export interface RegisterCredentials {
	name: string;
	email: string;
	password: string;
	register_via?: string;
}

export interface AuthUser {
	id: string;
	name: string;
	email: string;
	city?: string | null;
	email_verified_at?: string | null;
}

// ─── Profile & HUD ──────────────────────────

export interface PityCounters {
	rating_70: number;
	rating_85: number;
}

export interface NgolahBolaProfile {
	total_gems: number;
	points_balance: number;
	free_bronze_opens: number;
	free_silver_opens: number;
	free_opens_remaining: number; // total (bronze + silver) for display
	pity_counters: PityCounters;
	last_opened_at?: string | null;
	inventory_count: number;
	daily_login_streak?: number;
	hard_currency_balance?: number;
	soft_currency_balance?: number;
	energy?: number;
	energy_max?: number;
	duels_played?: number;
	duels_won?: number;
	duels_lost?: number;
	has_shared_first_time?: boolean;
}

export interface EnergyData {
	energy: number;
	energy_max: number;
	duels_played: number;
	duels_won: number;
	duels_lost: number;
	win_rate: number;
}

export interface PointsBalance {
	points_balance: number;
	hard_currency_balance: number;
	soft_currency_balance: number;
	exchange_rate: number;
}

export interface FullHUDData {
	id: string;
	name: string;
	email: string;
	total_gems: number;
	points_balance: number;
	hard_currency_balance: number;
	soft_currency_balance: number;
	energy: number;
	energy_max: number;
	daily_login_streak: number;
	duels_played: number;
	duels_won: number;
	duels_lost: number;
	has_shared_first_time: boolean;
	pity_counters: PityCounters;
}

// ─── Pack & Cards ───────────────────────────

export type Rarity = 'bronze' | 'silver' | 'gold' | 'legend';

export interface PackCatalog {
	id: string;
	pack_name: string;
	cost_in_gems: number;
	cards_per_pack: number;
	available_rarities: Rarity[];
	pity_rating_70_threshold: number;
	pity_rating_85_threshold: number;
	is_active: boolean;
	drop_rates: Record<Rarity, number>;
}

export interface PackOpenResult {
	card_id: string;
	player_name: string;
	rarity: Rarity;
	overall_rating: number;
	boosted_attributes?: Record<string, number>;
	guaranteed: boolean;
}

export interface PackOpenResponse {
	pack_name: string;
	results: PackOpenResult[];
	gems_remaining: number;
	free_bronze_opens: number;
	free_silver_opens: number;
	free_opens_remaining: number; // total (bronze + silver) for display
	is_free: boolean;
	pity_counters: PityCounters;
	pity_applied: boolean;
	next_guarantee_at: PityCounters;
}

// ─── Inventory ──────────────────────────────

export interface InventoryItem {
	id: string;
	card_id: string;
	player_name: string;
	rarity: Rarity;
	overall_rating: number;
	boosted_attributes?: Record<string, number>;
	position_primary: string;
	obtained_at: string;
	source_pack_id?: string;
}

// ─── Reference Data ─────────────────────────

export interface League {
	_id: string;
	name: string;
	country: string;
	logo_url?: string;
	is_active: boolean;
	clubs_count?: number;
}

export interface Club {
	_id: string;
	name: string;
	short_code: string;
	country_code: string;
	is_active: boolean;
	league?: League;
}

export interface Player {
	_id: string;
	full_name: string;
	known_as: string;
	position_primary: string;
	position_alternatives?: string[];
	base_rating: number;
	archetype_code?: string;
	traits?: string[];
	base_attributes?: PlayerAttributes;
	is_active: boolean;
	club?: Club;
	league?: League;
}

export interface PlayerAttributes {
	pace: number;
	shooting: number;
	passing: number;
	dribbling: number;
	defending: number;
	physical: number;
}

export type FormationCode =
	| '4-3-3'
	| '4-4-2'
	| '3-5-2'
	| '4-2-3-1'
	| '4-3-2-1'
	| '3-4-3'
	| '5-3-2'
	| '4-1-4-1'
	| '3-6-1'
	| '4-2-4'
	| '4-5-1'
	| '3-4-2-1';

export type SlotCode =
	| 'GK'
	| 'LB'
	| 'CB'
	| 'RB'
	| 'LWB'
	| 'RWB'
	| 'CDM'
	| 'CM'
	| 'CAM'
	| 'LM'
	| 'RM'
	| 'LW'
	| 'RW'
	| 'ST';

export interface FormationsResponse {
	data: Record<FormationCode, SlotCode[]>;
	meta: { description: string };
}

// ─── Squad ──────────────────────────────────

export interface SquadPlayer {
	slot: string;
	slot_display: string;
	card_id: string;
	player_name: string;
	position_primary: string;
	overall_rating: number;
	rarity: Rarity;
	traits?: string[];
	archetype?: string | null;
}

export interface Squad {
	id: string;
	name: string;
	formation: FormationCode;
	budget_cap: number;
	budget_used?: number;
	budget_remaining?: number;
	chemistry?: number;
	slots?: string[];
	filled_slots?: number;
	players?: SquadPlayer[];
	created_at: string;
}

export interface SquadCreateData {
	name?: string;
	formation?: FormationCode;
	budget_cap?: number;
}

export interface AddPlayerData {
	card_id: string;
	slot: string;
}

export interface SquadPlayerResponse {
	slot: string;
	position_slot: string;
	card_id: string;
	player_name: string;
	position_primary: string;
	overall_rating: number;
	rarity: Rarity;
	traits?: string[];
	archetype?: string | null;
}

export interface SquadChemistryData {
	total: number;
	synergies: Array<{
		card_a: string;
		card_b: string;
		points: number;
	}>;
	breakdown: Array<{
		card_id: string;
		traits: string[];
		position: string;
		rating: number;
	}>;
}

export interface ValidateDuelResult {
	ready: boolean;
	errors: Record<string, string>;
	player_count: number;
}

// ─── Duel ───────────────────────────────────

export type Tactic =
	| 'attacking'
	| 'defensive'
	| 'counter'
	| 'highPress'
	| 'possessionPlay'
	| 'lowBlock';

export interface DuelChallengeRequest {
	squad_id: string;
	tactic: Tactic;
	idempotency_key: string;
}

export interface DuelScoreBreakdown {
	attack: { my: number; opponent: number };
	midfield: { my: number; opponent: number };
	defense: { my: number; opponent: number };
}

export interface DuelEnergyResult {
	spent: number;
	refunded: number;
	remaining: number;
	max: number;
}

export interface DuelReward {
	gems_won: number;
	points_earned?: number;
	total_gems: number;
}

export interface DuelRecord {
	played: number;
	won: number;
	lost: number;
}

export interface DuelResult {
	duel_id: string;
	result: 'win' | 'lose' | 'draw';
	my_score: number;
	opponent_score: number;
	tactical_advantage: string;
	score_breakdown: DuelScoreBreakdown;
	energy: DuelEnergyResult;
	reward: DuelReward;
	duel_record: DuelRecord;
	is_bot_match?: boolean;
}

export interface DuelHistoryEntry {
	id: string;
	opponent_id: string;
	formation: FormationCode;
	my_tactic: Tactic;
	opponent_tactic: Tactic;
	result: 'win' | 'lose' | 'draw';
	score_breakdown: DuelScoreBreakdown;
	gems_won: number;
	points_earned: number;
	created_at: string;
	ended_at: string;
}

// ─── Duel Play (Interactive) ─────────────────────────────────────────────

export type DuelPhase = 'attack' | 'midfield' | 'defense';

export interface DuelPlayChoice {
	phase: DuelPhase;
	choice: string;
	score: number;
	selected_at_ms: number;
}

export interface DuelPlayScenarioChoice {
	key: string;
	label: string;
	description: string;
	baseScore: number;
}

export interface DuelPlayScenario {
	phase: DuelPhase;
	prompt: string;
	choices: DuelPlayScenarioChoice[];
}

export interface DuelPlaySessionSnapshot {
	session_id: string;
	squad_id: string;
	tactic: Tactic;
	mode: 'bot' | 'real';
	phase_index: number;
	choices: DuelPlayChoice[];
	phase_scores: Record<DuelPhase, number>;
	total_score: number;
	started_at: number;
}

export interface DuelPlaySubmitData {
	squad_id: string;
	tactic: Tactic;
	choices: DuelPlayChoice[];
	total_score: number;
	started_at: number;
}

export interface DuelPlayResult extends DuelResult {
	play_breakdown: DuelPlayChoice[];
	is_bot_match: true;
}

export interface RefillEnergyRequest {
	amount?: number;
}

export interface RefillEnergyResult {
	energy_added: number;
	energy_before: number;
	energy_after: number;
	gems_spent: number;
	gems_remaining: number;
}

// ─── Daily Reward ���──────────────────────────

export interface DailyRewardInfo {
	soft_currency: number;
	hard_currency: number;
	points: number;
	pack_type: string | null;
}

export interface DailyRewardStatus {
	daily_login_streak: number;
	has_claimed_today: boolean;
	next_reward_day: number;
	next_reward: DailyRewardInfo;
}

export interface DailyRewardClaimRequest {
	idempotency_key: string;
}

export interface DailyRewardClaimResult {
	streak_day: number;
	streak: number;
	reward: DailyRewardInfo;
	soft_currency_balance: number;
	hard_currency_balance: number;
	points_balance: number;
}

// ─── Share ──────────────────────────────────

export type SharedTo = 'instagram' | 'twitter' | 'whatsapp' | 'facebook' | 'tiktok';

export interface SharePosition {
	slot: SlotCode;
	card_id: string;
	player_name: string;
	known_as: string;
	overall_rating: number;
	rarity: Rarity;
	card_frame_style: string;
	is_holographic: boolean;
	collector_badge_id: string | null;
}

export interface ShareData {
	formation_code: FormationCode;
	squad_name: string;
	positions: SharePosition[];
}

export interface ShareLogRequest {
	share_asset_url: string;
	shared_to: SharedTo;
}

export interface ShareLogResult {
	bonus_awarded: boolean;
	bonus_soft_currency: number;
	bonus_awarded_first_share: boolean;
	first_share_hard_currency: number;
	soft_currency_balance: number;
	hard_currency_balance: number;
}

// ─── Points Exchange ────────────────────────

export interface ExchangePointsRequest {
	points_amount: number;
	idempotency_key: string;
}

export interface ExchangePointsResult {
	success: boolean;
	points_spent: number;
	gems_received: number;
	new_points_balance: number;
	new_gems_balance: number;
}

// ─── API Response Wrappers ──────────────────

export interface ApiSuccess<T> {
	success: true;
	data: T;
	message?: string;
}

export interface ApiError {
	success: false;
	message: string;
	errors?: Record<string, string[]>;
}

export type ApiResponse<T> = ApiSuccess<T> | ApiError;
