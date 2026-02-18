import type { PostStatus } from "@workspace/shared/blog"

export function formatDateKo(dateString: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateString))
}

export function getPostStatusLabel(status: PostStatus) {
  return status === "PUBLISHED" ? "발행" : "초안"
}

export function getPostStatusClassName(status: PostStatus) {
  if (status === "PUBLISHED") {
    return "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
  }

  return "bg-amber-100 text-amber-700 hover:bg-amber-100"
}
