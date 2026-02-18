import {
  listPublicPostsQuerySchema,
  listPublicPostsResponseSchema,
  type ListPublicPostsQuery,
} from "@workspace/shared/blog";

import { apiRoutes } from "@/src/shared/config/routes";
import { getJson } from "@/src/shared/lib/http";

function buildPublicPostsPath(query: ListPublicPostsQuery): string {
  const searchParams = new URLSearchParams();

  searchParams.set("limit", String(query.limit));

  if (query.cursor) {
    searchParams.set("cursor", query.cursor);
  }

  return `${apiRoutes.posts}?${searchParams.toString()}`;
}

export async function fetchPublicPosts(queryInput: Partial<ListPublicPostsQuery> = {}) {
  const query = listPublicPostsQuerySchema.parse(queryInput);
  const path = buildPublicPostsPath(query);

  return getJson(path, listPublicPostsResponseSchema, {
    cache: "no-store",
  });
}
