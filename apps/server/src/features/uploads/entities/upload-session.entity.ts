type UploadSessionEntityParams = {
  fileKey: string;
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
  readonly filename: string;
  readonly mimeType: string;
  readonly size: number;
  readonly completeToken: string;
  readonly expiresAtMs: number;
  readonly uploadedData?: ArrayBuffer;
  readonly uploadedMimeType?: string;

  constructor(params: UploadSessionEntityParams) {
    this.fileKey = params.fileKey;
    this.filename = params.filename;
    this.mimeType = params.mimeType;
    this.size = params.size;
    this.completeToken = params.completeToken;
    this.expiresAtMs = params.expiresAtMs;
    this.uploadedData = params.uploadedData;
    this.uploadedMimeType = params.uploadedMimeType;
  }
}
