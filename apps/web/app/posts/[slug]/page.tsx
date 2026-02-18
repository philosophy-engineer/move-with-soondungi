import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";

import { fetchPublicPostDetail } from "@/src/features/posts/model/post-client";
import { PostDetailPage } from "@/src/features/posts/ui/pages/post-detail-page";
import { HttpRequestError } from "@/src/shared/lib/http";

type PostDetailPageParams = {
  slug: string;
};

type PostDetailRouteProps = {
  params: Promise<PostDetailPageParams>;
};

const SITE_NAME = "순둥이 이사";

const getCachedPostDetail = cache(async (slug: string) => {
  return fetchPublicPostDetail(slug);
});

async function getPostDetailOrNotFound(slug: string) {
  if (!slug.trim()) {
    notFound();
  }

  try {
    return await getCachedPostDetail(slug);
  } catch (error) {
    if (error instanceof HttpRequestError && error.status === 404) {
      notFound();
    }

    throw error;
  }
}

export async function generateMetadata({ params }: PostDetailRouteProps): Promise<Metadata> {
  const { slug } = await params;

  try {
    const post = await getCachedPostDetail(slug);

    return {
      title: `${post.title} | ${SITE_NAME}`,
      description: post.summary,
      openGraph: {
        type: "article",
        title: post.title,
        description: post.summary,
        images: post.thumbnailUrl ? [{ url: post.thumbnailUrl }] : undefined,
      },
    };
  } catch (error) {
    if (error instanceof HttpRequestError && error.status === 404) {
      return {
        title: `게시글을 찾을 수 없습니다 | ${SITE_NAME}`,
      };
    }

    throw error;
  }
}

export default async function PostDetailRoutePage({ params }: PostDetailRouteProps) {
  const { slug } = await params;
  const post = await getPostDetailOrNotFound(slug);

  return <PostDetailPage post={post} />;
}
