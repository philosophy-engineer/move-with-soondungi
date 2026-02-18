"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { Plus } from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { Badge } from "@workspace/ui/components/badge";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@workspace/ui/components/card";
import { cn } from "@workspace/ui/lib/utils";

import { useAdminAuthGuard } from "@/src/features/auth/model/use-admin-auth-guard";
import { fetchPostSummaries } from "@/src/features/blog/model/blog-queries";
import {
  formatDateKo,
  getPostStatusClassName,
  getPostStatusLabel,
} from "@/src/features/blog/model/blog-mappers";
import { MAIN_CONTAINER_CLASS } from "@/src/shared/config/layout";
import { appRoutes } from "@/src/shared/config/routes";

import type { PostSummary } from "@workspace/shared/blog";

export function AdminBlogPage() {
  const { isCheckingAuth } = useAdminAuthGuard();
  const [items, setItems] = useState<PostSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (isCheckingAuth) {
      return;
    }

    let isMounted = true;

    async function load() {
      try {
        const summaries = await fetchPostSummaries();

        if (isMounted) {
          setItems(summaries);
        }
      } catch {
        if (isMounted) {
          setItems([]);
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void load();

    return () => {
      isMounted = false;
    };
  }, [isCheckingAuth]);

  if (isCheckingAuth) {
    return (
      <main className="min-h-[calc(100svh-4rem)] bg-linear-to-b from-white via-slate-50 to-slate-100">
        <div className={`${MAIN_CONTAINER_CLASS} py-12 text-sm text-slate-500`}>
          인증 상태를 확인하는 중...
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-[calc(100svh-4rem)] bg-linear-to-b from-white via-slate-50 to-slate-100">
      <div className={`${MAIN_CONTAINER_CLASS} py-12`}>
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">블로그 관리</h1>
            <p className="mt-1 text-sm text-slate-500">
              저장된 글 목록을 확인하고 새 글을 작성하세요.
            </p>
          </div>

          <Button asChild>
            <Link href={appRoutes.adminBlogWrite} className="gap-1.5">
              <Plus className="size-4" />
              <span>새 글 작성</span>
            </Link>
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>게시글 목록</CardTitle>
            <CardDescription>상태와 수정 시간을 기준으로 최신 글부터 표시됩니다.</CardDescription>
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
                            className={cn(getPostStatusClassName(item.status))}
                          >
                            {getPostStatusLabel(item.status)}
                          </Badge>
                        </td>
                        <td className="px-4 py-3 text-slate-600">{formatDateKo(item.updatedAt)}</td>
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
  );
}
