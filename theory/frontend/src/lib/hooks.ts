import { useQuery } from "@tanstack/react-query";
import { apiGet } from "@/lib/api";
import type { SiteContent, Stats } from "@/types";

// Settings doc (logo, description, socials) — shared by Navbar and Footer.
export function useSettings() {
  return useQuery({
    queryKey: ["content", "settings"],
    queryFn: () => apiGet<SiteContent>("/content/settings"),
  });
}

export function useStats() {
  return useQuery({
    queryKey: ["stats"],
    queryFn: () => apiGet<Stats>("/stats"),
  });
}
