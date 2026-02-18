import Link from "next/link";
import Image from "next/image";

import type { PostFeedItem } from "@workspace/shared/blog";

import { getPostDetailRoute } from "@/src/shared/config/routes";

type PostFeedItemProps = {
  item: PostFeedItem;
};

function formatDateKo(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return `${date.getFullYear()}년 ${date.getMonth() + 1}월 ${date.getDate()}일`;
}

export function PostFeedItemCard({ item }: PostFeedItemProps) {
  return (
    <article className="animate-in fade-in border-b border-zinc-200 py-10 duration-300 sm:py-12">
      <Link href={getPostDetailRoute(item.slug)} className="group block">
        {item.thumbnailUrl ? (
          <div className="mb-6 overflow-hidden rounded-xl">
            <Image
              src={item.thumbnailUrl}
              alt={item.title}
              width={1200}
              height={675}
              unoptimized
              className="h-auto max-h-105 w-full object-cover transition-transform duration-300 group-hover:scale-[1.01]"
              loading="lazy"
            />
          </div>
        ) : null}

        <h2 className="mb-4 text-3xl font-bold tracking-tight text-zinc-900 transition-colors group-hover:text-zinc-700 sm:text-[2rem]">
          {item.title}
        </h2>
        <p className="mb-5 text-lg leading-relaxed text-zinc-600 [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2] overflow-hidden">
          {item.summary}
        </p>
        <p className="text-base text-zinc-500">{formatDateKo(item.publishedAt)}</p>
      </Link>
    </article>
  );
}
