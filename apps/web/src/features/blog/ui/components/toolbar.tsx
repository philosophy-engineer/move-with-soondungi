"use client";

import { useState, type ComponentProps, type ReactNode } from "react";

import type { Editor } from "@tiptap/react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  Bold,
  Check,
  ImagePlus,
  Italic,
  List,
  ListOrdered,
  Palette,
  Underline,
} from "lucide-react";

import { Button } from "@workspace/ui/components/button";
import { ButtonGroup } from "@workspace/ui/components/button-group";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@workspace/ui/components/tooltip";
import { cn } from "@workspace/ui/lib/utils";

const COLOR_PRESETS = [
  { value: "#0f172a", label: "슬레이트 900" },
  { value: "#334155", label: "슬레이트 700" },
  { value: "#0369a1", label: "스카이 700" },
  { value: "#0f766e", label: "틸 700" },
  { value: "#15803d", label: "그린 700" },
  { value: "#b45309", label: "앰버 700" },
  { value: "#b91c1c", label: "레드 700" },
  { value: "#7c3aed", label: "바이올렛 700" },
  { value: "#db2777", label: "핑크 600" },
  { value: "#000000", label: "블랙" },
] as const;

const HEADING_LEVELS = [1, 2, 3, 4, 5] as const;

function ToolButton({
  active,
  className,
  ...props
}: ComponentProps<typeof Button> & { active?: boolean }) {
  return (
    <Button
      type="button"
      variant={active ? "secondary" : "ghost"}
      size="sm"
      className={cn("h-8 px-2 text-xs", className)}
      {...props}
    />
  );
}

function ToolbarTooltip({ label, children }: { label: string; children: ReactNode }) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent sideOffset={8}>{label}</TooltipContent>
    </Tooltip>
  );
}

interface ToolbarProps {
  editor: Editor | null;
  onPickImage: () => void;
  isUploadingImage: boolean;
}

export function Toolbar({ editor, onPickImage, isUploadingImage }: ToolbarProps) {
  const [isColorMenuOpen, setIsColorMenuOpen] = useState(false);

  if (!editor) {
    return null;
  }

  const currentColor = editor.getAttributes("textStyle").color as string | undefined;

  return (
    <TooltipProvider delayDuration={120}>
      <div className="w-full overflow-x-auto py-1">
        <div className="flex min-w-max justify-center px-2">
          <div className="inline-flex rounded-2xl bg-white/95 p-1.5 shadow-sm ring-1 ring-slate-300/90">
            <ButtonGroup className="items-center gap-0">
              {HEADING_LEVELS.map((level) => (
                <ToolbarTooltip key={`h-${level}`} label={`제목 ${level}`}>
                  <ToolButton
                    active={editor.isActive("heading", { level })}
                    onClick={() => editor.chain().focus().toggleHeading({ level }).run()}
                  >
                    H{level}
                  </ToolButton>
                </ToolbarTooltip>
              ))}

              <span aria-hidden className="mx-1 my-1 h-6 w-px shrink-0 bg-slate-400" />

              <ToolbarTooltip label="볼드">
                <ToolButton
                  active={editor.isActive("bold")}
                  onClick={() => editor.chain().focus().toggleBold().run()}
                  aria-label="볼드"
                >
                  <Bold className="size-3.5" />
                </ToolButton>
              </ToolbarTooltip>

              <ToolbarTooltip label="이탤릭">
                <ToolButton
                  active={editor.isActive("italic")}
                  onClick={() => editor.chain().focus().toggleItalic().run()}
                  aria-label="이탤릭"
                >
                  <Italic className="size-3.5" />
                </ToolButton>
              </ToolbarTooltip>

              <ToolbarTooltip label="밑줄">
                <ToolButton
                  active={editor.isActive("underline")}
                  onClick={() => editor.chain().focus().toggleUnderline().run()}
                  aria-label="밑줄"
                >
                  <Underline className="size-3.5" />
                </ToolButton>
              </ToolbarTooltip>

              <span aria-hidden className="mx-1 my-1 h-6 w-px shrink-0 bg-slate-400" />

              <ToolbarTooltip label="왼쪽 정렬">
                <ToolButton
                  active={editor.isActive({ textAlign: "left" })}
                  onClick={() => editor.chain().focus().setTextAlign("left").run()}
                  aria-label="왼쪽 정렬"
                >
                  <AlignLeft className="size-3.5" />
                </ToolButton>
              </ToolbarTooltip>

              <ToolbarTooltip label="가운데 정렬">
                <ToolButton
                  active={editor.isActive({ textAlign: "center" })}
                  onClick={() => editor.chain().focus().setTextAlign("center").run()}
                  aria-label="가운데 정렬"
                >
                  <AlignCenter className="size-3.5" />
                </ToolButton>
              </ToolbarTooltip>

              <ToolbarTooltip label="오른쪽 정렬">
                <ToolButton
                  active={editor.isActive({ textAlign: "right" })}
                  onClick={() => editor.chain().focus().setTextAlign("right").run()}
                  aria-label="오른쪽 정렬"
                >
                  <AlignRight className="size-3.5" />
                </ToolButton>
              </ToolbarTooltip>

              <span aria-hidden className="mx-1 my-1 h-6 w-px shrink-0 bg-slate-400" />

              <ToolbarTooltip label="순서 리스트">
                <ToolButton
                  active={editor.isActive("orderedList")}
                  onClick={() => editor.chain().focus().toggleOrderedList().run()}
                  aria-label="순서 리스트"
                >
                  <ListOrdered className="size-3.5" />
                </ToolButton>
              </ToolbarTooltip>

              <ToolbarTooltip label="불릿 리스트">
                <ToolButton
                  active={editor.isActive("bulletList")}
                  onClick={() => editor.chain().focus().toggleBulletList().run()}
                  aria-label="불릿 리스트"
                >
                  <List className="size-3.5" />
                </ToolButton>
              </ToolbarTooltip>

              <span aria-hidden className="mx-1 my-1 h-6 w-px shrink-0 bg-slate-400" />

              <DropdownMenu onOpenChange={setIsColorMenuOpen}>
                <ToolbarTooltip label="텍스트 색상">
                  <DropdownMenuTrigger asChild>
                    <ToolButton
                      active={isColorMenuOpen}
                      className="gap-1.5"
                      aria-label="텍스트 색상"
                    >
                      <Palette className="size-3.5" />
                      <span
                        className="inline-block size-3 rounded-full border border-slate-300"
                        style={{ backgroundColor: currentColor ?? "#0f172a" }}
                      />
                    </ToolButton>
                  </DropdownMenuTrigger>
                </ToolbarTooltip>

                <DropdownMenuContent align="start" className="w-52!">
                  {COLOR_PRESETS.map((color) => (
                    <DropdownMenuItem
                      key={color.value}
                      onSelect={() => editor.chain().focus().setColor(color.value).run()}
                      className="gap-2"
                    >
                      <span
                        className="size-3.5 rounded-full border border-slate-300"
                        style={{ backgroundColor: color.value }}
                      />
                      <span>{color.label}</span>
                      {currentColor === color.value ? <Check className="ml-auto size-3.5" /> : null}
                    </DropdownMenuItem>
                  ))}

                  <DropdownMenuSeparator />

                  <DropdownMenuItem onSelect={() => editor.chain().focus().unsetColor().run()}>
                    기본색 복구
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <span aria-hidden className="mx-1 my-1 h-6 w-px shrink-0 bg-slate-400" />

              <ToolbarTooltip label="이미지 추가">
                <ToolButton
                  disabled={isUploadingImage}
                  onClick={onPickImage}
                  className="px-2"
                  aria-label="이미지 추가"
                >
                  <ImagePlus className="size-3.5" />
                </ToolButton>
              </ToolbarTooltip>
            </ButtonGroup>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}
