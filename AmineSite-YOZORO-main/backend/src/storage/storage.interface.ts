export interface ObjectMetadata {
  size: number;
  contentType: string;
  md5Hash?: string;
  crc32c?: string;
  updatedAt: Date;
}

export interface StorageAdapter {
  initiateResumableUpload(
    bucketName: string,
    objectName: string,
    contentType: string,
    metadata?: Record<string, string>,
  ): Promise<{ uploadUrl: string }>;

  verifyObject(bucketName: string, objectName: string): Promise<ObjectMetadata | null>;

  getSignedDownloadUrl(
    bucketName: string,
    objectName: string,
    expiresInSeconds: number,
  ): Promise<string>;

  uploadFile(
    bucketName: string,
    objectName: string,
    localFilePath: string,
    contentType: string,
  ): Promise<void>;

  downloadFile(
    bucketName: string,
    objectName: string,
    destinationPath: string,
  ): Promise<void>;

  deleteObject(bucketName: string, objectName: string): Promise<void>;
}

