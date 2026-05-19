"use client";

import useSWR from "swr";
import { getProfile } from "@/services/authService";
import type { Profile } from "@/types";

export function useAuth() {
  const { data, error, isLoading, mutate } = useSWR<Profile | null>(
    "profile",
    getProfile,
    { revalidateOnFocus: true }
  );

  return {
    profile: data ?? null,
    isLoading,
    isError: !!error,
    refresh: mutate,
  };
}
