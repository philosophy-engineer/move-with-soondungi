import type { PostFeedItem } from "@workspace/shared/blog";

import { InfiniteFeedClient } from "@/src/features/home/ui/components/infinite-feed-client";

type PostFeedProps = {
  initialItems: PostFeedItem[];
  initialNextCursor: string | null;
};

export function PostFeed({ initialItems, initialNextCursor }: PostFeedProps) {
  return <InfiniteFeedClient initialItems={initialItems} initialNextCursor={initialNextCursor} />;
}
