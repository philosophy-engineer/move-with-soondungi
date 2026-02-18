export const appRoutes = {
  home: "/",
  posts: "/posts",
  admin: "/admin",
  adminLogin: "/admin/login",
  adminBlog: "/admin/blog",
  adminBlogWrite: "/admin/blog/write",
} as const;

export function getPostDetailRoute(slug: string): string {
  return `${appRoutes.posts}/${encodeURIComponent(slug)}`;
}

export const apiRoutes = {
  posts: "/api/posts",
  postDetail: (slug: string) => `/api/posts/${encodeURIComponent(slug)}`,
  authLogin: "/api/auth/login",
  authMe: "/api/auth/me",
  authLogout: "/api/auth/logout",
  mockPosts: "/api/mock/posts",
  mockPostsDraft: "/api/mock/posts/draft",
  mockPostsPublish: "/api/mock/posts/publish",
  uploadsPresign: "/api/uploads/presign",
  uploadsComplete: "/api/uploads/complete",
} as const;
