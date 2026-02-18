"use client"

import { useRef, useState } from "react"

import Color from "@tiptap/extension-color"
import Image from "@tiptap/extension-image"
import TextAlign from "@tiptap/extension-text-align"
import { TextStyle } from "@tiptap/extension-text-style"
import Underline from "@tiptap/extension-underline"
import StarterKit from "@tiptap/starter-kit"
import { EditorContent, useEditor } from "@tiptap/react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"

import { Button } from "@workspace/ui/components/button"

import { Toolbar } from "@/components/blog-editor/toolbar"
import {
  ALLOWED_IMAGE_MIME_TYPES,
  type AllowedImageMimeType,
  hasMeaningfulBody,
  MAX_IMAGE_SIZE_BYTES,
  type CompleteUploadResponse,
  type PostSaveResponse,
  type PresignUploadResponse,
} from "@/lib/blog-types"
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@workspace/ui/components/card"
import { Input } from "@workspace/ui/components/input"

async function parseErrorMessage(response: Response) {
  try {
    const data = (await response.json()) as { message?: string }
    if (data.message) {
      return data.message
    }
  } catch {
    // no-op
  }

  return "요청 처리 중 오류가 발생했습니다."
}

async function postJson<TResponse>(
  url: string,
  payload: Record<string, unknown>
): Promise<TResponse> {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(await parseErrorMessage(response))
  }

  return (await response.json()) as TResponse
}

function toReadableDate(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date)
}

export function EditorClient() {
  const router = useRouter()
  const imageInputRef = useRef<HTMLInputElement | null>(null)

  const [title, setTitle] = useState("")
  const [postId, setPostId] = useState<string | null>(null)
  const [isUploadingImage, setIsUploadingImage] = useState(false)
  const [isSavingDraft, setIsSavingDraft] = useState(false)
  const [isPublishing, setIsPublishing] = useState(false)
  const [, setEditorRefreshKey] = useState(0)
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null)

  const editor = useEditor({
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3, 4, 5],
        },
      }),
      Underline,
      TextStyle,
      Color,
      TextAlign.configure({
        types: ["heading", "paragraph"],
      }),
      Image.configure({
        inline: false,
      }),
    ],
    content: "<p></p>",
    onSelectionUpdate: () => {
      setEditorRefreshKey((prev) => prev + 1)
    },
    onUpdate: () => {
      setEditorRefreshKey((prev) => prev + 1)
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[420px] px-5 py-4 text-[16px] leading-8 text-slate-900 outline-none [&_h1]:mb-5 [&_h1]:text-4xl [&_h1]:font-bold [&_h2]:mb-4 [&_h2]:text-3xl [&_h2]:font-semibold [&_h3]:mb-3 [&_h3]:text-2xl [&_h3]:font-semibold [&_h4]:mb-3 [&_h4]:text-xl [&_h4]:font-semibold [&_h5]:mb-2 [&_h5]:text-lg [&_h5]:font-semibold [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:my-1 [&_p]:my-2 [&_img]:my-5 [&_img]:max-w-full [&_img]:rounded-xl [&_img]:border [&_img]:border-slate-200",
      },
    },
  })

  const handleImagePick = () => {
    imageInputRef.current?.click()
  }

  const handleImageUpload = async (file: File) => {
    if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type as AllowedImageMimeType)) {
      toast.error("jpg/png/webp 형식만 업로드할 수 있습니다.")
      return
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast.error("이미지 용량은 10MB 이하여야 합니다.")
      return
    }

    try {
      setIsUploadingImage(true)

      const presign = await postJson<PresignUploadResponse>(
        "/api/mock/uploads/presign",
        {
          filename: file.name,
          mimeType: file.type,
          size: file.size,
        }
      )

      const uploadResponse = await fetch(presign.uploadUrl, {
        method: "PUT",
        headers: {
          "content-type": file.type,
        },
        body: file,
      })

      if (!uploadResponse.ok) {
        throw new Error(await parseErrorMessage(uploadResponse))
      }

      const complete = await postJson<CompleteUploadResponse>(
        "/api/mock/uploads/complete",
        {
          fileKey: presign.fileKey,
          completeToken: presign.completeToken,
        }
      )

      editor?.chain().focus().setImage({ src: complete.url, alt: file.name }).run()
      toast.success("이미지가 추가되었습니다.")
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "이미지 업로드 중 오류가 발생했습니다."
      toast.error(message)
    } finally {
      setIsUploadingImage(false)
      if (imageInputRef.current) {
        imageInputRef.current.value = ""
      }
    }
  }

  const submitPost = async (mode: "draft" | "publish") => {
    if (!editor) {
      return
    }

    const trimmedTitle = title.trim()
    const contentHtml = editor.getHTML()
    const contentJson = editor.getJSON()

    if (!trimmedTitle) {
      toast.error("제목을 입력해주세요.")
      return
    }

    if (mode === "publish" && !hasMeaningfulBody(contentHtml, contentJson)) {
      toast.error("발행하려면 본문 내용을 입력해주세요.")
      return
    }

    try {
      if (mode === "draft") {
        setIsSavingDraft(true)
      } else {
        setIsPublishing(true)
      }

      const endpoint =
        mode === "draft" ? "/api/mock/posts/draft" : "/api/mock/posts/publish"

      const result = await postJson<PostSaveResponse>(endpoint, {
        postId: postId ?? undefined,
        title: trimmedTitle,
        contentHtml,
        contentJson,
      })

      setPostId(result.postId)
      setLastSavedAt(new Date())

      toast.success(mode === "draft" ? "초안을 저장했습니다." : "게시글을 발행했습니다.")

      router.push("/admin/blog")
      router.refresh()
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "저장 처리 중 오류가 발생했습니다."
      toast.error(message)
    } finally {
      if (mode === "draft") {
        setIsSavingDraft(false)
      } else {
        setIsPublishing(false)
      }
    }
  }

  const isBusy = isSavingDraft || isPublishing || isUploadingImage

  return (
    <main className="min-h-svh bg-gradient-to-b from-white via-slate-50 to-slate-100">
      {/* TODO: auth 도입 시 /admin/blog/* 경로는 JWT 쿠키 + me 체크 후 미로그인 시 /admin 리다이렉트 */}
      <div className="mx-auto w-full max-w-5xl px-4 pb-28 pt-12 sm:px-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">블로그 글 작성</CardTitle>
            <CardDescription>
              제목과 본문을 작성하고 하단에서 임시저장 또는 발행을 진행하세요.
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-5">
            <div className="space-y-2">
              <p className="text-sm font-medium text-slate-700">제목</p>
              <Input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="제목을 입력하세요"
                className="h-12 text-base"
              />
            </div>

            <Toolbar
              editor={editor}
              onPickImage={handleImagePick}
              isUploadingImage={isUploadingImage}
            />

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
              <EditorContent editor={editor} />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="fixed inset-x-0 bottom-0 border-t border-slate-200 bg-white/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
          <p className="text-sm text-slate-500">
            {lastSavedAt
              ? `마지막 저장: ${toReadableDate(lastSavedAt)}`
              : "아직 저장되지 않았습니다."}
          </p>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={isBusy}
              onClick={() => submitPost("draft")}
            >
              {isSavingDraft ? "저장 중..." : "임시저장"}
            </Button>
            <Button
              type="button"
              disabled={isBusy}
              onClick={() => submitPost("publish")}
            >
              {isPublishing ? "발행 중..." : "발행하기"}
            </Button>
          </div>
        </div>
      </div>

      <input
        ref={imageInputRef}
        type="file"
        accept={ALLOWED_IMAGE_MIME_TYPES.join(",")}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) {
            void handleImageUpload(file)
          }
        }}
      />
    </main>
  )
}
