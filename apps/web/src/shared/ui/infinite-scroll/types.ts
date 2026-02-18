export type CursorPageResult<TItem> = {
  items: TItem[];
  nextCursor: string | null;
};

export type CursorFetcher<TItem> = (params: {
  cursor: string | null;
  limit: number;
}) => Promise<CursorPageResult<TItem>>;

export type InfiniteObserverOptions = {
  root?: Element | Document | null;
  rootMargin?: string;
  threshold?: number;
};
