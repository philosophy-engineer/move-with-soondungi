import type { JsonContent } from "./types.js";

export function hasNodeType(node: unknown, type: string): boolean {
  if (typeof node !== "object" || node === null) {
    return false;
  }

  const typedNode = node as {
    type?: unknown;
    content?: unknown;
  };

  if (typedNode.type === type) {
    return true;
  }

  if (!Array.isArray(typedNode.content)) {
    return false;
  }

  return typedNode.content.some((child) => hasNodeType(child, type));
}

export function hasMeaningfulBody(contentHtml: string, contentJson: JsonContent): boolean {
  const text = contentHtml
    .replace(/<[^>]*>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();

  return text.length > 0 || hasNodeType(contentJson, "image");
}
