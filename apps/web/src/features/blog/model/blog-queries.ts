import {
  draftPostRequestSchema,
  publishPostRequestSchema,
  type DraftPostRequest,
  type PublishPostRequest,
} from "@workspace/shared/blog";
import { completeUploadRequestSchema, presignUploadRequestSchema } from "@workspace/shared/upload";

import {
  completeUpload,
  createUploadPresign,
  fetchPosts,
  publishPost,
  saveDraft,
  uploadBlob,
} from "@/src/features/blog/model/blog-client";

export async function fetchPostSummaries() {
  const data = await fetchPosts();
  return data.items;
}

export async function saveDraftPost(payload: DraftPostRequest) {
  const parsedPayload = draftPostRequestSchema.parse(payload);
  return saveDraft(parsedPayload);
}

export async function publishBlogPost(payload: PublishPostRequest) {
  const parsedPayload = publishPostRequestSchema.parse(payload);
  return publishPost(parsedPayload);
}

export async function uploadEditorImage(file: File) {
  const presignPayload = presignUploadRequestSchema.parse({
    filename: file.name,
    mimeType: file.type,
    size: file.size,
  });

  const presign = await createUploadPresign(presignPayload);
  await uploadBlob(presign.uploadUrl, file);

  const completePayload = completeUploadRequestSchema.parse({
    fileKey: presign.fileKey,
    completeToken: presign.completeToken,
  });

  return completeUpload(completePayload);
}
