export type PostStatus = "DRAFT" | "PUBLISHED";

type PostProps = {
  postId?: string;
  slug?: string;
  title: string;
  summary?: string;
  thumbnailUrl?: string;
  contentHtml: string;
  contentJson: unknown;
  status: PostStatus;
  createdAt: string;
  updatedAt: string;
  publishedAt?: string;
};

export class Post {
  readonly postId?: string;
  readonly slug?: string;
  readonly title: string;
  readonly summary?: string;
  readonly thumbnailUrl?: string;
  readonly contentHtml: string;
  readonly contentJson: unknown;
  readonly status: PostStatus;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly publishedAt?: string;

  private constructor(params: PostProps) {
    this.postId = params.postId;
    this.slug = params.slug;
    this.title = params.title;
    this.summary = params.summary;
    this.thumbnailUrl = params.thumbnailUrl;
    this.contentHtml = params.contentHtml;
    this.contentJson = params.contentJson;
    this.status = params.status;
    this.createdAt = params.createdAt;
    this.updatedAt = params.updatedAt;
    this.publishedAt = params.publishedAt;
  }

  static create(params: PostProps): Post {
    return new Post(params);
  }

  static rehydrate(params: PostProps): Post {
    return new Post(params);
  }
}
