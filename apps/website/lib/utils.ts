import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDateTime(value?: string | null) {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function formatRelativeDate(value?: string | null) {
  if (!value) return "N/A";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  const diffMs = date.getTime() - Date.now();
  const diffMinutes = Math.round(diffMs / 60000);
  const ranges = [
    { limit: 60, unit: "minute" },
    { limit: 24 * 60, unit: "hour" },
    { limit: 7 * 24 * 60, unit: "day" },
  ] as const;

  for (const range of ranges) {
    if (Math.abs(diffMinutes) < range.limit) {
      const divisor =
        range.unit === "minute" ? 1 : range.unit === "hour" ? 60 : 1440;
      return new Intl.RelativeTimeFormat("en", { numeric: "auto" }).format(
        Math.round(diffMinutes / divisor),
        range.unit,
      );
    }
  }

  return new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(date);
}

export function formatDurationMs(value?: number | null) {
  if (!value || value < 0) return "N/A";
  const totalSeconds = Math.floor(value / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
  if (minutes > 0) return `${minutes}m ${seconds}s`;
  return `${seconds}s`;
}

export function truncateText(value: string, max = 140) {
  if (value.length <= max) return value;
  return `${value.slice(0, max - 1)}...`;
}
