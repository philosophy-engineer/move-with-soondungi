type UploadedImageProps = {
  imageId: string;
  fileKey: string;
  objectKey: string;
  mimeType: string;
  bytes?: ArrayBuffer;
  createdAt: string;
};

export class UploadedImage {
  readonly imageId: string;
  readonly fileKey: string;
  readonly objectKey: string;
  readonly mimeType: string;
  readonly bytes?: ArrayBuffer;
  readonly createdAt: string;

  private constructor(params: UploadedImageProps) {
    this.imageId = params.imageId;
    this.fileKey = params.fileKey;
    this.objectKey = params.objectKey;
    this.mimeType = params.mimeType;
    this.bytes = params.bytes;
    this.createdAt = params.createdAt;
  }

  static create(params: UploadedImageProps): UploadedImage {
    return new UploadedImage(params);
  }

  static rehydrate(params: UploadedImageProps): UploadedImage {
    return new UploadedImage(params);
  }
}
