"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { fetchAdminMe } from "@/src/features/auth/model/auth-client";
import { appRoutes } from "@/src/shared/config/routes";

export function useAdminAuthGuard() {
  const router = useRouter();
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    let isMounted = true;

    async function guard() {
      try {
        await fetchAdminMe();

        if (isMounted) {
          setIsCheckingAuth(false);
        }
      } catch {
        router.replace(appRoutes.adminLogin);
      }
    }

    void guard();

    return () => {
      isMounted = false;
    };
  }, [router]);

  return {
    isCheckingAuth,
  };
}
