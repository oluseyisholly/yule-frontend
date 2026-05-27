"use client";

import { useMutation } from "@tanstack/react-query";
import { signIn } from "@/features/auth/service";

export function useSignInMutation() {
  return useMutation({
    mutationKey: ["auth", "signin"],
    mutationFn: signIn,
  });
}
