import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format season display (e.g., "2024-2025")
export function formatSeason(season: string): string {
  return season;
}

// Calculate age from birth year
export function calculateAge(birthYear: number): number {
  const currentYear = new Date().getFullYear();
  return currentYear - birthYear;
}

// Format player height (cm to m)
export function formatHeight(cm: number): string {
  return `${(cm / 100).toFixed(2)}m`;
}

// Position labels
export const POSITION_LABELS: Record<string, string> = {
  PG: "Meneur",
  SG: "Arrière",
  SF: "Ailier",
  PF: "Ailier Fort",
  C: "Pivot",
};

// Level labels
export const LEVEL_LABELS: Record<string, string> = {
  N1: "National 1",
  N2: "National 2",
  N3: "National 3",
};

// Gender labels
export const GENDER_LABELS: Record<string, string> = {
  M: "Homme",
  F: "Femme",
};
