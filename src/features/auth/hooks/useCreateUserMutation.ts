"use client";

import { useMutation } from "@tanstack/react-query";
import { createUser } from "@/features/auth/service";

export function useCreateUserMutation() {
  return useMutation({
    mutationKey: ["auth", "create-user"],
    mutationFn: createUser,
  });
}
