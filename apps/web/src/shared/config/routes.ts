export const appRoutes = {
  home: "/",
  posts: "/posts",
  adminBlog: "/admin/blog",
  adminBlogWrite: "/admin/blog/write",
} as const;

export function getPostDetailRoute(slug: string): string {
  return `${appRoutes.posts}/${encodeURIComponent(slug)}`;
}

export const apiRoutes = {
  posts: "/api/posts",
  mockPosts: "/api/mock/posts",
  mockPostsDraft: "/api/mock/posts/draft",
  mockPostsPublish: "/api/mock/posts/publish",
  uploadsPresign: "/api/uploads/presign",
  uploadsComplete: "/api/uploads/complete",
} as const;
