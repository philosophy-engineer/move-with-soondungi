"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@workspace/ui/components/button";
import { fetchAdminMe, logoutAdmin } from "@/src/features/auth/model/auth-client";
import { SITE_NAME } from "@/src/shared/config/branding";
import { appRoutes } from "@/src/shared/config/routes";
import { toErrorMessage } from "@/src/shared/lib/response";

export function HomeHeader() {
  const pathname = usePathname();
  const router = useRouter();
  const [authStatus, setAuthStatus] = useState<"checking" | "authenticated" | "guest">("checking");

  useEffect(() => {
    let isMounted = true;

    async function checkAuthStatus() {
      try {
        await fetchAdminMe();

        if (isMounted) {
          setAuthStatus("authenticated");
        }
      } catch {
        if (isMounted) {
          setAuthStatus("guest");
        }
      }
    }

    void checkAuthStatus();

    return () => {
      isMounted = false;
    };
  }, [pathname]);

  const handleLogout = async () => {
    try {
      await logoutAdmin();
      setAuthStatus("guest");
      router.replace(appRoutes.adminLogin);
      router.refresh();
    } catch (error) {
      toast.error(toErrorMessage(error, "로그아웃에 실패했습니다."));
    }
  };

  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-zinc-100/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-290 items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <Link href={appRoutes.home} className="flex items-center gap-3">
            <span
              aria-hidden
              className="inline-flex size-8 items-center justify-center rounded-md bg-zinc-900"
            />
            <span className="text-lg font-bold tracking-tight text-zinc-900 sm:text-2xl">
              {SITE_NAME}
            </span>
          </Link>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <Button aria-label="알림" variant="ghost" size="icon-sm" className="text-zinc-700">
            <Bell />
          </Button>
          <Button aria-label="검색" variant="ghost" size="icon-sm" className="text-zinc-700">
            <Search />
          </Button>
          {authStatus === "authenticated" ? (
            <>
              <Button
                asChild
                variant="default"
                className="h-9 rounded-full bg-zinc-900 px-4 text-sm font-semibold text-white hover:bg-zinc-800"
              >
                <Link href={appRoutes.adminBlog}>관리자 페이지</Link>
              </Button>
              <Button variant="outline" className="h-9 px-4 text-sm" onClick={handleLogout}>
                로그아웃
              </Button>
            </>
          ) : authStatus === "guest" ? (
            <Button
              asChild
              variant="default"
              className="h-9 rounded-full bg-zinc-900 px-4 text-sm font-semibold text-white hover:bg-zinc-800"
            >
              <Link href={appRoutes.adminLogin}>로그인</Link>
            </Button>
          ) : (
            <Button variant="outline" className="h-9 px-4 text-sm" disabled>
              확인 중...
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
