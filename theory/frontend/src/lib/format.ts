import { format } from "date-fns";
import { id as localeID } from "date-fns/locale";

// "2026-01-18" / ISO datetime -> "18 Januari 2026". Bad input passes through untouched.
export function formatDate(iso?: string | null): string {
  if (!iso) return "-";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return format(d, "d MMMM yyyy", { locale: localeID });
}

// "siswa a b" -> "SA" — initials for avatar fallback.
export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}
