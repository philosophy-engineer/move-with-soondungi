import { fetchPublicPosts } from "@/src/features/home/model/home-client";
import { HeroPlaceholder } from "@/src/features/home/ui/components/hero-placeholder";
import { PostFeed } from "@/src/features/home/ui/components/post-feed";
import { MAIN_CONTAINER_CLASS } from "@/src/shared/config/layout";

const FEED_PAGE_SIZE = 10;

export async function HomePage() {
  const initialFeed = await fetchPublicPosts({
    limit: FEED_PAGE_SIZE,
  });

  return (
    <div className="min-h-svh bg-zinc-100">
      <main className="pb-16">
        <HeroPlaceholder />
        <div className={`${MAIN_CONTAINER_CLASS} pt-10`}>
          <PostFeed initialItems={initialFeed.items} initialNextCursor={initialFeed.nextCursor} />
        </div>
      </main>
    </div>
  );
}
