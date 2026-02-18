export const appRoutes = {
  home: "/",
  adminBlog: "/admin/blog",
  adminBlogWrite: "/admin/blog/write",
} as const;

export const apiRoutes = {
  mockPosts: "/api/mock/posts",
  mockPostsDraft: "/api/mock/posts/draft",
  mockPostsPublish: "/api/mock/posts/publish",
  uploadsPresign: "/api/uploads/presign",
  uploadsComplete: "/api/uploads/complete",
} as const;
