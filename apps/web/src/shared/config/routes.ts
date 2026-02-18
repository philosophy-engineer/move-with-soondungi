export const appRoutes = {
  home: "/",
  adminBlog: "/admin/blog",
  adminBlogWrite: "/admin/blog/write",
} as const;

export const apiRoutes = {
  mockPosts: "/api/mock/posts",
  mockPostsDraft: "/api/mock/posts/draft",
  mockPostsPublish: "/api/mock/posts/publish",
  mockUploadsPresign: "/api/mock/uploads/presign",
  mockUploadsComplete: "/api/mock/uploads/complete",
} as const;
