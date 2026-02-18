"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import type { PostFeedItem } from "@workspace/shared/blog";

import { fetchPublicPosts } from "@/src/features/home/model/home-client";
import { PostFeedItemCard } from "@/src/features/home/ui/components/post-feed-item";

type InfiniteFeedClientProps = {
  initialItems: PostFeedItem[];
  initialNextCursor: string | null;
};

const FEED_PAGE_SIZE = 10;

export function InfiniteFeedClient({ initialItems, initialNextCursor }: InfiniteFeedClientProps) {
  const [items, setItems] = useState<PostFeedItem[]>(initialItems);
  const [nextCursor, setNextCursor] = useState<string | null>(initialNextCursor);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const hasItems = items.length > 0;

  const mergeBySlug = useCallback((current: PostFeedItem[], incoming: PostFeedItem[]) => {
    const map = new Map<string, PostFeedItem>();

    for (const item of current) {
      map.set(item.slug, item);
    }

    for (const item of incoming) {
      map.set(item.slug, item);
    }

    return [...map.values()];
  }, []);

  const loadMore = useCallback(async () => {
    if (!nextCursor || isLoading) {
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    try {
      const response = await fetchPublicPosts({
        cursor: nextCursor,
        limit: FEED_PAGE_SIZE,
      });

      setItems((previous) => mergeBySlug(previous, response.items));
      setNextCursor(response.nextCursor);
    } catch (error) {
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("피드를 불러오는 중 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, mergeBySlug, nextCursor]);

  useEffect(() => {
    if (!nextCursor) {
      return;
    }

    const target = sentinelRef.current;
    if (!target) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (entry?.isIntersecting) {
          void loadMore();
        }
      },
      {
        root: null,
        rootMargin: "280px 0px",
        threshold: 0,
      },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, [loadMore, nextCursor]);

  const list = useMemo(() => items, [items]);

  if (!hasItems) {
    return <p className="py-16 text-center text-base text-zinc-500">아직 발행된 글이 없습니다.</p>;
  }

  return (
    <section aria-label="post feed">
      {list.map((item) => (
        <PostFeedItemCard key={item.slug} item={item} />
      ))}

      {errorMessage ? (
        <p className="pt-6 text-center text-sm text-rose-600">{errorMessage}</p>
      ) : null}

      {nextCursor ? (
        <div ref={sentinelRef} className="flex justify-center py-6">
          {isLoading ? <span className="text-sm text-zinc-500">불러오는 중...</span> : null}
        </div>
      ) : null}
    </section>
  );
}
