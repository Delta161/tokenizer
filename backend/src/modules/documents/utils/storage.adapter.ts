import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';
import { logger } from '@utils/logger';

/**
 * Interface for storage adapters that handle document storage
 */
export interface StorageAdapter {
  /**
   * Upload a file to storage
   * @param filePath - The path to the file to upload
   * @param destinationPath - The destination path in storage
   * @returns The path to the uploaded file
   */
  upload(filePath: string, destinationPath: string): Promise<string>;

  /**
   * Download a file from storage
   * @param filePath - The path to the file in storage
   * @returns A readable stream of the file
   */
  download(filePath: string): Readable;

  /**
   * Delete a file from storage
   * @param filePath - The path to the file in storage
   */
  delete(filePath: string): Promise<void>;
}

/**
 * Storage adapter that uses the local file system
 */
export class LocalStorageAdapter implements StorageAdapter {
  private uploadDir: string;

  constructor(uploadDir?: string) {
    this.uploadDir = uploadDir || path.join(process.cwd(), 'uploads');
    this.ensureUploadDirExists();
  }

  /**
   * Ensure the upload directory exists
   */
  private ensureUploadDirExists(): void {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
      logger.info(`Created upload directory: ${this.uploadDir}`);
    }
  }

  /**
   * Upload a file to local storage
   * @param filePath - The path to the file to upload
   * @param destinationPath - The destination path in storage
   * @returns The path to the uploaded file
   */
  async upload(filePath: string, destinationPath: string): Promise<string> {
    // For local storage, the file is already in place after multer processing
    // This method is included for compatibility with the StorageAdapter interface
    return filePath;
  }

  /**
   * Download a file from local storage
   * @param filePath - The path to the file in storage
   * @returns A readable stream of the file
   */
  download(filePath: string): Readable {
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    return fs.createReadStream(filePath);
  }

  /**
   * Delete a file from local storage
   * @param filePath - The path to the file in storage
   */
  async delete(filePath: string): Promise<void> {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      logger.info(`Deleted file: ${filePath}`);
    } else {
      logger.warn(`File not found for deletion: ${filePath}`);
    }
  }
}