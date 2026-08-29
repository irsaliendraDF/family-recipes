import type { ReactNode } from "react";
import type { PantryItem } from "../types";

export function PageHeading({ children, sub }: { children: ReactNode; sub?: string }) {
  return (
    <div className="mb-5 text-center">
      <h1 className="script-royal text-4xl leading-tight sm:text-5xl">{children}</h1>
      {sub && <p className="mt-1 font-display text-sm italic text-plum-soft">{sub}</p>}
    </div>
  );
}

/** A swirled gold flourish with a wee diamond at its heart. */
export function FlourishDivider() {
  return (
    <div className="mx-auto mt-2 w-56 text-gold" aria-hidden>
      <svg viewBox="0 0 224 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M8 12 C 40 12, 60 4, 92 12" opacity="0.7" />
        <path d="M216 12 C 184 12, 164 4, 132 12" opacity="0.7" />
        <circle cx="8" cy="12" r="1.5" fill="currentColor" stroke="none" />
        <circle cx="216" cy="12" r="1.5" fill="currentColor" stroke="none" />
        <path d="M112 4 L 118 12 L 112 20 L 106 12 Z" fill="currentColor" stroke="none" />
        <path d="M97 12 l 4 0 M 123 12 l 4 0" opacity="0.8" />
      </svg>
    </div>
  );
}

export function Tiara({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 28" className={className} fill="currentColor" aria-hidden>
      <path d="M6 24 L10 8 L20 18 L32 2 L44 18 L54 8 L58 24 Z" opacity="0.9" />
      <circle cx="32" cy="2" r="2.4" />
      <circle cx="10" cy="7" r="1.8" />
      <circle cx="54" cy="7" r="1.8" />
      <rect x="6" y="24" width="52" height="2.5" rx="1.25" />
    </svg>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`royal-card p-4 ${className}`}>{children}</div>;
}

export function Badge({ children, tone = "lavender" }: { children: ReactNode; tone?: "lavender" | "rose" | "gold" | "plain" }) {
  const tones = {
    lavender: "bg-lavender-soft text-lavender",
    rose: "bg-blush text-rose-deep",
    gold: "bg-gold-soft text-gold",
    plain: "bg-parchment text-plum-soft",
  };
  return <span className={`inline-block rounded-full px-2.5 py-0.5 text-xs font-bold ${tones[tone]}`}>{children}</span>;
}

/** Every shown price carries its provenance: source and age, or "price needed". */
export function PriceProvenance({ item }: { item: PantryItem }) {
  if (item.priceCad === null) return <Badge tone="rose">price needed</Badge>;
  if (item.priceSource === "sample") return <Badge tone="plain">sample price, not real</Badge>;
  const label = item.priceSource === "irene" ? "entered by you" : "walmart.ca";
  return (
    <span className="text-xs text-plum-soft">
      {label}
      {item.lastChecked ? `, checked ${item.lastChecked}` : ""}
    </span>
  );
}

export const buttonPrimary =
  "rounded-full bg-gradient-to-r from-rose to-lavender px-5 py-2.5 font-bold text-white shadow-[0_3px_14px_rgba(212,105,154,0.45)] ring-1 ring-white/50 active:scale-95 transition-transform";
export const buttonSecondary =
  "rounded-full border border-gold-soft bg-white/80 px-5 py-2.5 font-bold text-rose-deep shadow-sm active:scale-95 transition-transform";
export const inputClass =
  "w-full rounded-xl border border-gold-soft px-3 py-2.5 text-plum focus:border-lavender focus:outline-none";
