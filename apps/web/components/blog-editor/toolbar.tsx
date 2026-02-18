"use client"

import { useState, type ComponentProps } from "react"

import type { Editor } from "@tiptap/react"
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  ImagePlus,
  Italic,
  List,
  ListOrdered,
  Palette,
  Underline,
} from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import { cn } from "@workspace/ui/lib/utils"

import { Separator } from "@/components/ui/separator"

const COLOR_PRESETS = [
  "#0f172a",
  "#1e293b",
  "#334155",
  "#0369a1",
  "#0f766e",
  "#15803d",
  "#b45309",
  "#b91c1c",
  "#7c3aed",
  "#db2777",
]

const HEADING_LEVELS = [1, 2, 3, 4, 5] as const

function ToolButton({
  active,
  className,
  ...props
}: ComponentProps<typeof Button> & { active?: boolean }) {
  return (
    <Button
      type="button"
      variant={active ? "secondary" : "outline"}
      size="sm"
      className={cn("h-8 px-2.5 text-xs", className)}
      {...props}
    />
  )
}

interface ToolbarProps {
  editor: Editor | null
  onPickImage: () => void
  isUploadingImage: boolean
}

export function Toolbar({ editor, onPickImage, isUploadingImage }: ToolbarProps) {
  const [isColorMenuOpen, setIsColorMenuOpen] = useState(false)
  const currentColor = editor?.getAttributes("textStyle").color as
    | string
    | undefined

  if (!editor) {
    return null
  }

  return (
    <div className="space-y-3 rounded-xl border border-slate-200 bg-slate-50/80 p-3">
      <div className="flex flex-wrap items-center gap-2">
        {HEADING_LEVELS.map((level) => (
          <ToolButton
            key={`h-${level}`}
            active={editor.isActive("heading", { level })}
            onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
          >
            H{level}
          </ToolButton>
        ))}

        <Separator orientation="vertical" className="mx-1 hidden h-6 md:block" />

        <ToolButton
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="size-3.5" />
        </ToolButton>

        <ToolButton
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="size-3.5" />
        </ToolButton>

        <ToolButton
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <Underline className="size-3.5" />
        </ToolButton>

        <Separator orientation="vertical" className="mx-1 hidden h-6 md:block" />

        <ToolButton
          active={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <AlignLeft className="size-3.5" />
        </ToolButton>

        <ToolButton
          active={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <AlignCenter className="size-3.5" />
        </ToolButton>

        <ToolButton
          active={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <AlignRight className="size-3.5" />
        </ToolButton>

        <Separator orientation="vertical" className="mx-1 hidden h-6 md:block" />

        <ToolButton
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="size-3.5" />
        </ToolButton>

        <ToolButton
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="size-3.5" />
        </ToolButton>

        <Separator orientation="vertical" className="mx-1 hidden h-6 md:block" />

        <ToolButton
          active={isColorMenuOpen}
          className="gap-1.5"
          onClick={() => setIsColorMenuOpen((prev) => !prev)}
        >
          <Palette className="size-3.5" />
          <span>색상</span>
          <span
            className="ml-0.5 inline-block size-3 rounded-full border border-slate-300"
            style={{ backgroundColor: currentColor ?? "#0f172a" }}
          />
        </ToolButton>

        <ToolButton
          className="gap-1.5"
          disabled={isUploadingImage}
          onClick={onPickImage}
        >
          <ImagePlus className="size-3.5" />
          <span>{isUploadingImage ? "업로드 중" : "이미지"}</span>
        </ToolButton>
      </div>

      {isColorMenuOpen ? (
        <div className="flex flex-wrap items-center gap-2 rounded-lg border border-slate-200 bg-white p-2.5">
          {COLOR_PRESETS.map((color) => (
            <button
              key={color}
              type="button"
              aria-label={`텍스트 색상 ${color}`}
              className={cn(
                "size-7 rounded-full border transition",
                currentColor === color
                  ? "scale-105 border-slate-900"
                  : "border-slate-300 hover:scale-105"
              )}
              style={{ backgroundColor: color }}
              onClick={() => editor.chain().focus().setColor(color).run()}
            />
          ))}

          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 text-xs"
            onClick={() => editor.chain().focus().unsetColor().run()}
          >
            기본색 복구
          </Button>
        </div>
      ) : null}
    </div>
  )
}
