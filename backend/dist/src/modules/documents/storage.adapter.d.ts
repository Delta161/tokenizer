import { Readable } from 'stream';
/**
 * Interface for storage adapters
 * This allows for future implementations with different storage providers
 */
export interface StorageAdapter {
    /**
     * Upload a file to storage
     * @param file - The file to upload
     * @returns Promise resolving to the storage path or URL
     */
    upload(file: Express.Multer.File): Promise<string>;
    /**
     * Download a file from storage
     * @param path - The storage path or URL
     * @returns Readable stream of the file
     */
    download(path: string): Readable;
    /**
     * Delete a file from storage
     * @param path - The storage path or URL
     * @returns Promise resolving when deletion is complete
     */
    delete(path: string): Promise<void>;
}
/**
 * Local file system storage adapter implementation
 */
export declare class LocalStorageAdapter implements StorageAdapter {
    private uploadDir;
    /**
     * Create a new LocalStorageAdapter
     * @param uploadDir - The directory to store files in (default: 'uploads/documents')
     */
    constructor(uploadDir?: string);
    /**
     * Upload a file to local storage
     * @param file - The file to upload
     * @returns Promise resolving to the storage path
     */
    upload(file: Express.Multer.File): Promise<string>;
    /**
     * Get a readable stream for a file
     * @param filePath - The path to the file
     * @returns Readable stream of the file
     * @throws Error if file does not exist
     */
    download(filePath: string): Readable;
    /**
     * Delete a file from local storage
     * @param filePath - The path to the file
     * @returns Promise resolving when deletion is complete
     */
    delete(filePath: string): Promise<void>;
}
//# sourceMappingURL=storage.adapter.d.ts.map