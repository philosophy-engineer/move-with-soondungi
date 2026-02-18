import { HeadObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

import { ENV_KEYS, type AppEnv } from "../../../common/config/env.types.js";

type CreatePutObjectPresignedUrlParams = {
  objectKey: string;
  contentType: string;
  expiresInSeconds: number;
};

@Injectable()
export class UploadsS3Repository {
  private readonly s3Client: S3Client;
  private readonly bucket: string;
  private readonly publicBaseUrl: string;

  constructor(private readonly configService: ConfigService<AppEnv, true>) {
    this.bucket = this.configService.getOrThrow<string>(ENV_KEYS.S3_BUCKET);
    this.publicBaseUrl = this.configService
      .getOrThrow<string>(ENV_KEYS.S3_PUBLIC_BASE_URL)
      .replace(/\/+$/, "");

    this.s3Client = new S3Client({
      region: this.configService.getOrThrow<string>(ENV_KEYS.S3_REGION),
      endpoint: this.configService.getOrThrow<string>(ENV_KEYS.S3_ENDPOINT_URL),
      forcePathStyle: this.configService.getOrThrow<boolean>(ENV_KEYS.S3_FORCE_PATH_STYLE),
      credentials: {
        accessKeyId: this.configService.getOrThrow<string>(ENV_KEYS.S3_ACCESS_KEY_ID),
        secretAccessKey: this.configService.getOrThrow<string>(ENV_KEYS.S3_SECRET_ACCESS_KEY),
      },
    });
  }

  async createPutObjectPresignedUrl({
    objectKey,
    contentType,
    expiresInSeconds,
  }: CreatePutObjectPresignedUrlParams): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: objectKey,
      ContentType: contentType,
    });

    return getSignedUrl(this.s3Client, command, {
      expiresIn: expiresInSeconds,
    });
  }

  async headObject(objectKey: string): Promise<boolean> {
    try {
      await this.s3Client.send(
        new HeadObjectCommand({
          Bucket: this.bucket,
          Key: objectKey,
        }),
      );
      return true;
    } catch (error) {
      if (typeof error === "object" && error !== null) {
        const awsError = error as { name?: string; $metadata?: { httpStatusCode?: number } };
        const status = awsError.$metadata?.httpStatusCode;
        if (status === 404 || awsError.name === "NotFound" || awsError.name === "NoSuchKey") {
          return false;
        }
      }

      throw error;
    }
  }

  buildPublicObjectUrl(objectKey: string): string {
    const encodedKey = objectKey
      .split("/")
      .map((segment) => encodeURIComponent(segment))
      .join("/");

    return `${this.publicBaseUrl}/${encodedKey}`;
  }
}
