import { fetchPublicPosts } from "@/src/features/home/model/home-client";
import { HeroPlaceholder } from "@/src/features/home/ui/components/hero-placeholder";
import { HomeHeader } from "@/src/features/home/ui/components/home-header";
import { PostFeed } from "@/src/features/home/ui/components/post-feed";

const FEED_PAGE_SIZE = 10;

export async function HomePage() {
  const initialFeed = await fetchPublicPosts({
    limit: FEED_PAGE_SIZE,
  });

  return (
    <div className="min-h-svh bg-zinc-100">
      <HomeHeader />
      <main className="pb-16">
        <HeroPlaceholder />
        <div className="mx-auto w-full max-w-230 px-4 pt-10 sm:px-6">
          <PostFeed initialItems={initialFeed.items} initialNextCursor={initialFeed.nextCursor} />
        </div>
      </main>
    </div>
  );
}
