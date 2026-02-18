import type { PublicPostDetail } from "@workspace/shared/blog";
import { MAIN_CONTAINER_CLASS } from "@/src/shared/config/layout";
import { formatDateKoYmd } from "@/src/shared/lib/date";

type PostDetailPageProps = {
  post: PublicPostDetail;
};

export function PostDetailPage({ post }: PostDetailPageProps) {
  return (
    <main className="min-h-[calc(100svh-4rem)] bg-zinc-100 py-10 sm:py-14">
      <article className={`${MAIN_CONTAINER_CLASS} pb-20`}>
        <header className="mb-12 border-b border-zinc-200 pb-8">
          <h1 className="text-3xl md:text-5xl leading-[1.02] font-semibold tracking-tight text-zinc-900">
            {post.title}
          </h1>
          <div className="mt-6 flex flex-wrap justify-start gap-x-4 gap-y-2 text-left text-sm text-zinc-500">
            <span>발행일 {formatDateKoYmd(post.publishedAt)}</span>
            <span>수정일 {formatDateKoYmd(post.updatedAt)}</span>
          </div>
        </header>

        <section
          className="text-[18px] leading-8 text-zinc-800 [&_h1]:mb-5 [&_h1]:text-4xl [&_h1]:font-bold [&_h2]:mb-4 [&_h2]:text-3xl [&_h2]:font-semibold [&_h3]:mb-3 [&_h3]:text-2xl [&_h3]:font-semibold [&_h4]:mb-3 [&_h4]:text-xl [&_h4]:font-semibold [&_h5]:mb-2 [&_h5]:text-lg [&_h5]:font-semibold [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:my-1 [&_p]:my-3 [&_img]:my-5 [&_img]:max-w-full [&_img]:rounded-2xl"
          dangerouslySetInnerHTML={{ __html: post.contentHtml }}
        />
      </article>
    </main>
  );
}
