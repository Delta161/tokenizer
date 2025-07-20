import fs from 'fs';
import path from 'path';
/**
 * Local file system storage adapter implementation
 */
export class LocalStorageAdapter {
    uploadDir;
    /**
     * Create a new LocalStorageAdapter
     * @param uploadDir - The directory to store files in (default: 'uploads/documents')
     */
    constructor(uploadDir = path.join(process.cwd(), 'uploads', 'documents')) {
        this.uploadDir = uploadDir;
        // Ensure upload directory exists
        if (!fs.existsSync(this.uploadDir)) {
            fs.mkdirSync(this.uploadDir, { recursive: true });
        }
    }
    /**
     * Upload a file to local storage
     * @param file - The file to upload
     * @returns Promise resolving to the storage path
     */
    async upload(file) {
        // File is already saved by multer, just return the path
        return file.path;
    }
    /**
     * Get a readable stream for a file
     * @param filePath - The path to the file
     * @returns Readable stream of the file
     * @throws Error if file does not exist
     */
    download(filePath) {
        // Validate that the file exists
        if (!fs.existsSync(filePath)) {
            throw new Error('File not found');
        }
        // Create and return a readable stream
        return fs.createReadStream(filePath);
    }
    /**
     * Delete a file from local storage
     * @param filePath - The path to the file
     * @returns Promise resolving when deletion is complete
     */
    async delete(filePath) {
        // Check if file exists before attempting to delete
        if (fs.existsSync(filePath)) {
            await fs.promises.unlink(filePath);
        }
    }
}
//# sourceMappingURL=storage.adapter.js.map