"use client";

import { cn } from "@/lib/utils";

type Rarity = "bronze" | "silver" | "gold" | "legend";

interface PlayerCardProps {
  player_name: string;
  overall_rating: number;
  rarity: Rarity;
  position_primary: string;
  position_slot?: string;
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  className?: string;
}

const RARITY_STYLES: Record<
  Rarity,
  { border: string; glow: string; ratingBg: string; frame: string }
> = {
  bronze: {
    border: "border-amber-700/50",
    glow: "shadow-amber-700/20",
    ratingBg: "bg-gradient-to-br from-amber-600 to-amber-800",
    frame: "from-amber-900/30 to-transparent",
  },
  silver: {
    border: "border-slate-300/50",
    glow: "shadow-slate-300/20",
    ratingBg: "bg-gradient-to-br from-slate-300 to-slate-500",
    frame: "from-slate-400/20 to-transparent",
  },
  gold: {
    border: "border-yellow-400/60",
    glow: "shadow-yellow-400/30",
    ratingBg: "bg-gradient-to-br from-yellow-400 to-amber-500",
    frame: "from-yellow-400/20 to-transparent",
  },
  legend: {
    border: "border-violet-400/60",
    glow: "shadow-violet-400/40",
    ratingBg: "bg-gradient-to-br from-violet-400 to-fuchsia-500",
    frame: "from-violet-400/20 to-transparent",
  },
};

const SIZE_CLASSES = {
  sm: { card: "w-14 h-20 text-[9px]", name: "text-[8px]", rating: "text-base", pos: "text-[7px]" },
  md: { card: "w-18 h-24 text-xs", name: "text-[10px]", rating: "text-xl", pos: "text-[8px]" },
  lg: { card: "w-24 h-32 text-sm", name: "text-xs", rating: "text-2xl", pos: "text-[9px]" },
};

export function PlayerCard({
  player_name,
  overall_rating,
  rarity,
  position_primary,
  position_slot,
  size = "md",
  onClick,
  className,
}: PlayerCardProps) {
  const style = RARITY_STYLES[rarity];
  const sz = SIZE_CLASSES[size];
  const slotLabel = position_slot || position_primary;

  return (
    <button
      onClick={onClick}
      type="button"
      className={cn(
        "relative rounded-xl border-2 overflow-hidden transition-all duration-200 hover:scale-105 active:scale-95 flex flex-col items-center justify-between py-1.5 gap-0.5",
        style.border,
        style.glow,
        onClick ? "cursor-pointer" : "cursor-default",
        sz.card,
        className,
      )}
    >
      {/* Gradient overlay */}
      <div
        className={cn(
          "absolute inset-0 bg-gradient-to-br opacity-60",
          style.frame,
        )}
      />

      {/* Rating badge */}
      <div
        className={cn(
          "z-10 w-6 h-6 sm:w-7 sm:h-7 rounded-lg flex items-center justify-center font-black text-black shadow-lg",
          style.ratingBg,
          sz.rating,
        )}
      >
        {overall_rating}
      </div>

      {/* Player name (truncated) */}
      <p
        className={cn(
          "z-10 font-black uppercase text-center leading-tight px-0.5 truncate w-full",
          sz.name,
        )}
        title={player_name}
      >
        {player_name.length > 10
          ? player_name.slice(0, 9) + "…"
          : player_name}
      </p>

      {/* Position badge */}
      <div
        className={cn(
          "z-10 w-5 h-5 rounded-md bg-white/10 flex items-center justify-center font-black uppercase",
          sz.pos,
        )}
      >
        {slotLabel}
      </div>
    </button>
  );
}

export function PlayerCardList({
  players,
  size = "sm",
  onCardClick,
}: {
  players: Array<{
    slot: string;
    card_id: string;
    player_name: string;
    position_primary: string;
    overall_rating: number;
    rarity: Rarity;
  }>;
  size?: "sm" | "md" | "lg";
  onCardClick?: (card_id: string, slot: string) => void;
}) {
  return (
    <div className="grid grid-cols-5 gap-1.5 sm:gap-2">
      {players.map((p) => (
        <PlayerCard
          key={p.card_id}
          player_name={p.player_name}
          overall_rating={p.overall_rating}
          rarity={p.rarity}
          position_primary={p.position_primary}
          position_slot={p.slot}
          size={size}
          onClick={() => onCardClick?.(p.card_id, p.slot)}
        />
      ))}
    </div>
  );
}
