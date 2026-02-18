"use client";

import { type FormEvent, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { authLoginRequestSchema } from "@workspace/shared/auth";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";

import { fetchAdminMe, loginAdmin } from "@/src/features/auth/model/auth-client";
import { appRoutes } from "@/src/shared/config/routes";
import { toErrorMessage } from "@/src/shared/lib/response";

export function AdminLoginPage() {
  const router = useRouter();

  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let isMounted = true;

    async function checkMe() {
      try {
        await fetchAdminMe();

        if (isMounted) {
          router.replace(appRoutes.adminBlog);
          return;
        }
      } catch {
        // no-op
      }

      if (isMounted) {
        setIsCheckingAuth(false);
      }
    }

    void checkMe();

    return () => {
      isMounted = false;
    };
  }, [router]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    const parsed = authLoginRequestSchema.safeParse({
      email,
      password,
    });

    if (!parsed.success) {
      toast.error("이메일과 비밀번호를 확인해 주세요.");
      return;
    }

    try {
      setIsSubmitting(true);
      await loginAdmin(parsed.data);
      router.replace(appRoutes.adminBlog);
      router.refresh();
    } catch (error) {
      toast.error(toErrorMessage(error, "로그인에 실패했습니다."));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-[calc(100svh-4rem)] bg-linear-to-b from-white via-slate-50 to-slate-100">
      <div className="mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-md items-center px-4 py-12 sm:px-6">
        <Card className="w-full">
          <CardHeader className="space-y-2">
            <CardTitle className="text-2xl">관리자 로그인</CardTitle>
            <CardDescription>
              관리자 기능을 사용하려면 이메일과 비밀번호를 입력해 주세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isCheckingAuth ? (
              <p className="py-4 text-sm text-slate-500">인증 상태를 확인하는 중...</p>
            ) : (
              <form className="space-y-4" onSubmit={handleSubmit}>
                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium text-slate-700">
                    이메일
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    autoComplete="email"
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="admin@example.com"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium text-slate-700">
                    비밀번호
                  </label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    autoComplete="current-password"
                    onChange={(event) => setPassword(event.target.value)}
                    placeholder="비밀번호를 입력하세요"
                  />
                </div>

                <Button type="submit" className="h-11 w-full" disabled={isSubmitting}>
                  {isSubmitting ? "로그인 중..." : "로그인"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
