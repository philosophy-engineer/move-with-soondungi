type UploadSessionProps = {
  fileKey: string;
  objectKey: string;
  filename: string;
  mimeType: string;
  size: number;
  completeToken: string;
  expiresAtMs: number;
  uploadedData?: ArrayBuffer;
  uploadedMimeType?: string;
};

export class UploadSession {
  readonly fileKey: string;
  readonly objectKey: string;
  readonly filename: string;
  readonly mimeType: string;
  readonly size: number;
  readonly completeToken: string;
  readonly expiresAtMs: number;
  readonly uploadedData?: ArrayBuffer;
  readonly uploadedMimeType?: string;

  private constructor(params: UploadSessionProps) {
    this.fileKey = params.fileKey;
    this.objectKey = params.objectKey;
    this.filename = params.filename;
    this.mimeType = params.mimeType;
    this.size = params.size;
    this.completeToken = params.completeToken;
    this.expiresAtMs = params.expiresAtMs;
    this.uploadedData = params.uploadedData;
    this.uploadedMimeType = params.uploadedMimeType;
  }

  static create(params: UploadSessionProps): UploadSession {
    return new UploadSession(params);
  }

  static rehydrate(params: UploadSessionProps): UploadSession {
    return new UploadSession(params);
  }
}
