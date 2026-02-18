"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { RefObject } from "react";

import type {
  CursorFetcher,
  CursorPageResult,
  InfiniteObserverOptions,
} from "@/src/shared/ui/infinite-scroll/types";

type UseCursorInfiniteScrollOptions<TItem> = {
  initialItems: TItem[];
  initialNextCursor: string | null;
  pageSize: number;
  fetchPage: CursorFetcher<TItem>;
  keyExtractor: (item: TItem) => string;
  observer?: InfiniteObserverOptions;
};

type UseCursorInfiniteScrollResult<TItem> = CursorPageResult<TItem> & {
  isLoading: boolean;
  errorMessage: string | null;
  hasMore: boolean;
  hasItems: boolean;
  sentinelRef: RefObject<HTMLDivElement | null>;
  loadMore: () => Promise<void>;
};

const DEFAULT_OBSERVER_OPTIONS: Required<InfiniteObserverOptions> = {
  root: null,
  rootMargin: "280px 0px",
  threshold: 0,
};

const DEFAULT_ERROR_MESSAGE = "피드를 불러오는 중 오류가 발생했습니다.";

export function useCursorInfiniteScroll<TItem>({
  initialItems,
  initialNextCursor,
  pageSize,
  fetchPage,
  keyExtractor,
  observer,
}: UseCursorInfiniteScrollOptions<TItem>): UseCursorInfiniteScrollResult<TItem> {
  const [items, setItems] = useState<TItem[]>(initialItems);
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const hasMore = nextCursor !== null;
  const hasItems = items.length > 0;

  const mergeByKey = useCallback(
    (current: TItem[], incoming: TItem[]) => {
      const map = new Map<string, TItem>();

      for (const item of current) {
        map.set(keyExtractor(item), item);
      }

      for (const item of incoming) {
        map.set(keyExtractor(item), item);
      }

      return [...map.values()];
    },
    [keyExtractor],
  );

  const loadMore = useCallback(async () => {
    if (!nextCursor || isLoading) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetchPage({
        cursor: nextCursor,
        limit: pageSize,
      });

      setItems((previous) => mergeByKey(previous, response.items));
      setNextCursor(response.nextCursor);
    } catch (error) {
      if (error instanceof Error && error.message) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage(DEFAULT_ERROR_MESSAGE);
      }
    } finally {
      setIsLoading(false);
    }
  }, [fetchPage, isLoading, mergeByKey, nextCursor, pageSize]);

  const observerOptions = useMemo(
    () => ({
      ...DEFAULT_OBSERVER_OPTIONS,
      ...observer,
    }),
    [observer],
  );

  useEffect(() => {
    if (!hasMore) {
      return;
    }

    const target = sentinelRef.current;
    if (!target) {
      return;
    }

    const intersectionObserver = new IntersectionObserver((entries) => {
      const entry = entries[0];

      if (entry?.isIntersecting) {
        void loadMore();
      }
    }, observerOptions);

    intersectionObserver.observe(target);

    return () => {
      intersectionObserver.disconnect();
    };
  }, [hasMore, loadMore, observerOptions]);

  return {
    items,
    nextCursor,
    isLoading,
    errorMessage,
    hasMore,
    hasItems,
    sentinelRef,
    loadMore,
  };
}
