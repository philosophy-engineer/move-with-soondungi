type UploadedImageEntityParams = {
  imageId: string;
  fileKey: string;
  mimeType: string;
  bytes: ArrayBuffer;
  createdAt: string;
};

export class UploadedImage {
  readonly imageId: string;
  readonly fileKey: string;
  readonly mimeType: string;
  readonly bytes: ArrayBuffer;
  readonly createdAt: string;

  constructor(params: UploadedImageEntityParams) {
    this.imageId = params.imageId;
    this.fileKey = params.fileKey;
    this.mimeType = params.mimeType;
    this.bytes = params.bytes;
    this.createdAt = params.createdAt;
  }
}
