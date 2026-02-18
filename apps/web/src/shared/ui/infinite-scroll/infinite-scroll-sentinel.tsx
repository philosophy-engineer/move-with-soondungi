import type { ReactNode, RefObject } from "react";

import { cn } from "@workspace/ui/lib/utils";

type InfiniteScrollSentinelProps = {
  sentinelRef: RefObject<HTMLDivElement | null>;
  className?: string;
  children?: ReactNode;
};

export function InfiniteScrollSentinel({
  sentinelRef,
  className,
  children,
}: InfiniteScrollSentinelProps) {
  return (
    <div ref={sentinelRef} className={cn("flex justify-center py-6", className)}>
      {children}
    </div>
  );
}
