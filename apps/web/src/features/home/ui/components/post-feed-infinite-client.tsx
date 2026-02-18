"use client";

import type { PostFeedItem } from "@workspace/shared/blog";

import { fetchPublicPosts } from "@/src/features/home/model/home-client";
import { PostFeedItemCard } from "@/src/features/home/ui/components/post-feed-item";
import { InfiniteScrollSentinel, useCursorInfiniteScroll } from "@/src/shared/ui/infinite-scroll";

type PostFeedInfiniteClientProps = {
  initialItems: PostFeedItem[];
  initialNextCursor: string | null;
};

const FEED_PAGE_SIZE = 10;

export function PostFeedInfiniteClient({
  initialItems,
  initialNextCursor,
}: PostFeedInfiniteClientProps) {
  const { items, nextCursor, isLoading, errorMessage, hasItems, sentinelRef } =
    useCursorInfiniteScroll<PostFeedItem>({
      initialItems,
      initialNextCursor,
      pageSize: FEED_PAGE_SIZE,
      fetchPage: ({ cursor, limit }) =>
        fetchPublicPosts({
          cursor: cursor ?? undefined,
          limit,
        }),
      keyExtractor: (item) => item.slug,
      observer: {
        root: null,
        rootMargin: "280px 0px",
        threshold: 0,
      },
    });

  if (!hasItems) {
    return <p className="py-16 text-center text-base text-zinc-500">아직 발행된 글이 없습니다.</p>;
  }

  return (
    <section aria-label="post feed">
      {items.map((item) => (
        <PostFeedItemCard key={item.slug} item={item} />
      ))}

      {errorMessage ? (
        <p className="pt-6 text-center text-sm text-rose-600">{errorMessage}</p>
      ) : null}

      {nextCursor ? (
        <InfiniteScrollSentinel sentinelRef={sentinelRef}>
          {isLoading ? <span className="text-sm text-zinc-500">불러오는 중...</span> : null}
        </InfiniteScrollSentinel>
      ) : null}
    </section>
  );
}
