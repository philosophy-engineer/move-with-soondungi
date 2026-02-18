import { getPublicPostDetailResponseSchema } from "@workspace/shared/blog";

import { apiRoutes } from "@/src/shared/config/routes";
import { getJson } from "@/src/shared/lib/http";

export async function fetchPublicPostDetail(slug: string) {
  return getJson(apiRoutes.postDetail(slug), getPublicPostDetailResponseSchema, {
    next: {
      revalidate: 60,
    },
  });
}
