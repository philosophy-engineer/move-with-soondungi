"use client"

import Link from "next/link"
import { useEffect, useState } from "react"

import { Plus } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { Badge } from "@workspace/ui/components/badge"
import { cn } from "@workspace/ui/lib/utils"

import type { PostSummary } from "@/lib/blog-types"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@workspace/ui/components/card"

function formatDate(dateString: string) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(dateString))
}

export default function AdminBlogPage() {
  const [items, setItems] = useState<PostSummary[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    async function fetchPosts() {
      try {
        const response = await fetch("/api/mock/posts", {
          method: "GET",
        })

        if (!response.ok) {
          throw new Error("목록 조회에 실패했습니다.")
        }

        const data = (await response.json()) as { items: PostSummary[] }

        if (isMounted) {
          setItems(data.items)
        }
      } catch {
        if (isMounted) {
          setItems([])
        }
      } finally {
        if (isMounted) {
          setIsLoading(false)
        }
      }
    }

    void fetchPosts()

    return () => {
      isMounted = false
    }
  }, [])

  return (
    <main className="min-h-svh bg-linear-to-b from-white via-slate-50 to-slate-100">
      {/* TODO: auth 도입 시 /admin/blog/* 경로는 JWT 쿠키 + me 체크 후 미로그인 시 /admin 리다이렉트 */}
      <div className="mx-auto w-full max-w-5xl px-4 py-12 sm:px-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">블로그 관리</h1>
            <p className="mt-1 text-sm text-slate-500">
              저장된 글 목록을 확인하고 새 글을 작성하세요.
            </p>
          </div>

          <Button asChild>
            <Link href="/admin/blog/write" className="gap-1.5">
              <Plus className="size-4" />
              <span>새 글 작성</span>
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>게시글 목록</CardTitle>
            <CardDescription>
              상태와 수정 시간을 기준으로 최신 글부터 표시됩니다.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {isLoading ? (
              <p className="py-8 text-center text-sm text-slate-500">목록을 불러오는 중...</p>
            ) : items.length === 0 ? (
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 py-10 text-center text-sm text-slate-500">
                아직 작성된 글이 없습니다.
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-slate-200">
                <table className="min-w-full divide-y divide-slate-200 text-sm">
                  <thead className="bg-slate-50 text-left text-slate-600">
                    <tr>
                      <th className="px-4 py-3 font-medium">제목</th>
                      <th className="px-4 py-3 font-medium">상태</th>
                      <th className="px-4 py-3 font-medium">수정일</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {items.map((item) => (
                      <tr key={item.postId}>
                        <td className="px-4 py-3 text-slate-800">{item.title}</td>
                        <td className="px-4 py-3">
                          <Badge
                            variant="secondary"
                            className={cn(
                              item.status === "PUBLISHED"
                                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                                : "bg-amber-100 text-amber-700 hover:bg-amber-100"
                            )}
                          >
                            {item.status === "PUBLISHED" ? "발행" : "초안"}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-slate-600">
                          {formatDate(item.updatedAt)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
