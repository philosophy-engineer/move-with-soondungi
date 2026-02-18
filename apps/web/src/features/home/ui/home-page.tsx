import { fetchPublicPosts } from "@/src/features/home/model/home-client";
import { HeroPlaceholder } from "@/src/features/home/ui/components/hero-placeholder";
import { PostFeed } from "@/src/features/home/ui/components/post-feed";

const FEED_PAGE_SIZE = 10;

export async function HomePage() {
  const initialFeed = await fetchPublicPosts({
    limit: FEED_PAGE_SIZE,
  });

  return (
    <div className="min-h-[calc(100svh-4rem)] bg-zinc-100">
      <main className="mx-auto w-full max-w-190 px-4 pb-16 pt-8 sm:px-6">
        <HeroPlaceholder />
        <div className="mx-auto w-full max-w-230 px-4 pt-10 sm:px-6">
          <PostFeed initialItems={initialFeed.items} initialNextCursor={initialFeed.nextCursor} />
        </div>
      </main>
    </div>
  );
}
