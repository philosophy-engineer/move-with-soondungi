import Link from "next/link";
import { Bell, Search } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { appRoutes } from "@/src/shared/config/routes";

export function HomeHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-zinc-200 bg-zinc-100/95 backdrop-blur">
      <div className="mx-auto flex h-16 w-full max-w-[1160px] items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-3">
          <span
            aria-hidden
            className="inline-flex size-8 items-center justify-center rounded-md bg-zinc-900"
          />
          <span className="text-lg font-bold tracking-tight text-zinc-900 sm:text-2xl">
            순둥이 이사
          </span>
        </div>

        <div className="flex items-center gap-1 sm:gap-2">
          <Button aria-label="알림" variant="ghost" size="icon-sm" className="text-zinc-700">
            <Bell />
          </Button>
          <Button aria-label="검색" variant="ghost" size="icon-sm" className="text-zinc-700">
            <Search />
          </Button>
          <Button
            asChild
            variant="default"
            className="h-9 rounded-full bg-zinc-900 px-4 text-sm font-semibold text-white hover:bg-zinc-800"
          >
            <Link href={appRoutes.adminLogin}>로그인</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}
