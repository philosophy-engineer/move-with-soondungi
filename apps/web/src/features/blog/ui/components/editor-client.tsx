"use client";

import { useRef, useState } from "react";

import Color from "@tiptap/extension-color";
import Image from "@tiptap/extension-image";
import TextAlign from "@tiptap/extension-text-align";
import { TextStyle } from "@tiptap/extension-text-style";
import Underline from "@tiptap/extension-underline";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import {
  ALLOWED_IMAGE_MIME_TYPES,
  type AllowedImageMimeType,
  draftPostRequestSchema,
  hasMeaningfulBody,
  MAX_IMAGE_SIZE_BYTES,
  publishPostRequestSchema,
  type JsonContent,
} from "@workspace/shared/blog";
import { Button } from "@workspace/ui/components/button";
import { Input } from "@workspace/ui/components/input";

import {
  publishBlogPost,
  saveDraftPost,
  uploadEditorImage,
} from "@/src/features/blog/model/blog-queries";
import { Toolbar } from "@/src/features/blog/ui/components/toolbar";
import { appRoutes } from "@/src/shared/config/routes";
import { toErrorMessage } from "@/src/shared/lib/response";

function toReadableDate(date: Date) {
  return new Intl.DateTimeFormat("ko-KR", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

export function EditorClient() {
  const router = useRouter();
  const imageInputRef = useRef<HTMLInputElement | null>(null);

  const [title, setTitle] = useState("");
  const [postId, setPostId] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isSavingDraft, setIsSavingDraft] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [, setEditorRefreshKey] = useState(0);
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);

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
      setEditorRefreshKey((prev) => prev + 1);
    },
    onUpdate: () => {
      setEditorRefreshKey((prev) => prev + 1);
    },
    editorProps: {
      attributes: {
        class:
          "min-h-[460px] px-0 py-6 text-[18px] leading-8 text-slate-900 outline-none [&_h1]:mb-5 [&_h1]:text-4xl [&_h1]:font-bold [&_h2]:mb-4 [&_h2]:text-3xl [&_h2]:font-semibold [&_h3]:mb-3 [&_h3]:text-2xl [&_h3]:font-semibold [&_h4]:mb-3 [&_h4]:text-xl [&_h4]:font-semibold [&_h5]:mb-2 [&_h5]:text-lg [&_h5]:font-semibold [&_ol]:my-3 [&_ol]:list-decimal [&_ol]:pl-6 [&_ul]:my-3 [&_ul]:list-disc [&_ul]:pl-6 [&_li]:my-1 [&_p]:my-3 [&_img]:my-5 [&_img]:max-w-full [&_img]:rounded-2xl",
      },
    },
  });

  const handleImagePick = () => {
    imageInputRef.current?.click();
  };

  const handleImageUpload = async (file: File) => {
    if (!ALLOWED_IMAGE_MIME_TYPES.includes(file.type as AllowedImageMimeType)) {
      toast.error("jpg/png/webp 형식만 업로드할 수 있습니다.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      toast.error("이미지 용량은 10MB 이하여야 합니다.");
      return;
    }

    try {
      setIsUploadingImage(true);

      const complete = await uploadEditorImage(file);

      editor?.chain().focus().setImage({ src: complete.url, alt: file.name }).run();
      toast.success("이미지가 추가되었습니다.");
    } catch (error) {
      toast.error(toErrorMessage(error, "이미지 업로드 중 오류가 발생했습니다."));
    } finally {
      setIsUploadingImage(false);
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    }
  };

  const submitPost = async (mode: "draft" | "publish") => {
    if (!editor) {
      return;
    }

    const trimmedTitle = title.trim();
    const contentHtml = editor.getHTML();
    const contentJson = editor.getJSON() as JsonContent;

    if (!trimmedTitle) {
      toast.error("제목을 입력해주세요.");
      return;
    }

    if (mode === "publish" && !hasMeaningfulBody(contentHtml, contentJson)) {
      toast.error("발행하려면 본문 내용을 입력해주세요.");
      return;
    }

    try {
      if (mode === "draft") {
        setIsSavingDraft(true);
        const payload = draftPostRequestSchema.parse({
          postId: postId ?? undefined,
          title: trimmedTitle,
          contentHtml,
          contentJson,
        });
        const result = await saveDraftPost(payload);
        setPostId(result.postId);
      } else {
        setIsPublishing(true);
        const payload = publishPostRequestSchema.parse({
          postId: postId ?? undefined,
          title: trimmedTitle,
          contentHtml,
          contentJson,
        });
        const result = await publishBlogPost(payload);
        setPostId(result.postId);
      }

      setLastSavedAt(new Date());

      toast.success(mode === "draft" ? "초안을 저장했습니다." : "게시글을 발행했습니다.");

      router.push(appRoutes.adminBlog);
      router.refresh();
    } catch (error) {
      toast.error(toErrorMessage(error, "저장 처리 중 오류가 발생했습니다."));
    } finally {
      if (mode === "draft") {
        setIsSavingDraft(false);
      } else {
        setIsPublishing(false);
      }
    }
  };

  const isBusy = isSavingDraft || isPublishing || isUploadingImage;
  const isEditorEmpty = editor?.isEmpty ?? true;

  return (
    <main className="h-svh overflow-hidden bg-linear-to-b from-white via-slate-50 to-slate-100">
      {/* TODO: auth 도입 시 /admin/blog/* 경로는 JWT 쿠키 + me 체크 후 미로그인 시 /admin 리다이렉트 */}
      <div className="mx-auto flex h-full w-full max-w-5xl flex-col px-4 pt-8 sm:px-6">
        <section className="flex min-h-0 flex-1 flex-col gap-6 pb-8">
          <div className="border-b border-slate-200 pb-4">
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="제목을 입력하세요"
              className="h-16 md:h-20 border-0 bg-transparent px-0 text-3xl md:text-5xl leading-[1.02] font-semibold tracking-tight text-slate-900 shadow-none placeholder:text-slate-300 focus-visible:border-transparent focus-visible:ring-0"
            />
          </div>

          <Toolbar
            editor={editor}
            onPickImage={handleImagePick}
            isUploadingImage={isUploadingImage}
          />

          <div className="relative min-h-0 flex-1 overflow-y-auto pr-1">
            {isEditorEmpty ? (
              <p className="pointer-events-none absolute left-0 top-9 text-lg text-slate-400">
                여기를 클릭해서 글을 작성해 주세요
              </p>
            ) : null}
            <EditorContent editor={editor} />
          </div>

          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              {lastSavedAt
                ? `마지막 저장: ${toReadableDate(lastSavedAt)}`
                : "아직 저장되지 않았습니다."}
            </p>

            <div className="flex items-center gap-3">
              <Button
                type="button"
                variant="outline"
                disabled={isBusy}
                className="h-11 px-6 text-base"
                onClick={() => submitPost("draft")}
              >
                {isSavingDraft ? "저장 중..." : "임시저장"}
              </Button>
              <Button
                type="button"
                disabled={isBusy}
                className="h-11 px-6 text-base"
                onClick={() => submitPost("publish")}
              >
                {isPublishing ? "발행 중..." : "발행하기"}
              </Button>
            </div>
          </div>
        </section>
      </div>

      <input
        ref={imageInputRef}
        type="file"
        accept={ALLOWED_IMAGE_MIME_TYPES.join(",")}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void handleImageUpload(file);
          }
        }}
      />
    </main>
  );
}
