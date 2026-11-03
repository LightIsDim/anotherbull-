import { useQuery } from "@tanstack/react-query";
import { apiGet, apiPost } from "@/lib/api";
import { queryClient } from "@/lib/queryClient";

// Mirror of models.tkj.AdminUser. The session itself rides the httpOnly cookie —
// no token is ever stored or attached in the frontend.
export interface AdminUser {
  id: string;
  username: string;
}

// "me" is null when logged out — /auth/me answers 200 + null so public visitors see no 401 noise.
export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      try {
        return await apiGet<AdminUser | null>("/auth/me");
      } catch {
        return null;
      }
    },
    staleTime: 60_000,
    retry: false,
  });
}

// After login/signup: refresh every query now that the cookie exists.
export async function beginSession() {
  await queryClient.invalidateQueries();
}

// The ONLY way to sign out — clears the react-query cache so the next login
// on this browser cannot see the previous account's data.
export async function endSession() {
  try {
    await apiPost("/auth/logout");
  } finally {
    queryClient.clear();
  }
}
