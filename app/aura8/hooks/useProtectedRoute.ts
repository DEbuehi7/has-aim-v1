"use client";
import { useEffect, useState } from "react";

export interface AuthState {
  status: "loading" | "verified" | "unverified";
  email: string | null;
}

export function useProtectedRoute(): AuthState {
  const [state, setState] = useState<AuthState>({ status: "loading", email: null });

  useEffect(() => {
    fetch("/api/aura8/auth/check-verified", { credentials: "include" })
      .then(res => res.json())
      .then(data => {
        if (data.verified) {
          setState({ status: "verified", email: data.email ?? null });
        } else {
          setState({ status: "unverified", email: null });
          window.location.href = "/aura8/verify";
        }
      })
      .catch(() => {
        setState({ status: "unverified", email: null });
        window.location.href = "/aura8/verify";
      });
  }, []);

  return state;
}
