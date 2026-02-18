import type { PostFeedItem } from "@workspace/shared/blog";

import { PostFeedInfiniteClient } from "@/src/features/home/ui/components/post-feed-infinite-client";

type PostFeedProps = {
  initialItems: PostFeedItem[];
  initialNextCursor: string | null;
};

export function PostFeed({ initialItems, initialNextCursor }: PostFeedProps) {
  return (
    <PostFeedInfiniteClient initialItems={initialItems} initialNextCursor={initialNextCursor} />
  );
}
