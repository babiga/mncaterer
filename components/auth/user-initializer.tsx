"use client";

import { useEffect } from "react";
import { useUserStore } from "@/lib/store/use-user-store";

export function UserInitializer() {
  const fetchUser = useUserStore((state) => state.fetchUser);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  return null;
}
